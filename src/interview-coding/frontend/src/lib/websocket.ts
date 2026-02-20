import {
  ClientEvent,
  ServerEvent,
  ConnectionStatus,
  ConnectionState,
  WebSocketConfig,
  EventHandler,
} from './types';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private connectionState: ConnectionState;
  private eventHandlers: Map<string, Set<EventHandler<ServerEvent>>> = new Map();
  private messageQueue: ClientEvent[] = [];
  private shouldReconnect: boolean = true;

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || this.getDefaultWebSocketUrl(),
      reconnectAttempts: config.reconnectAttempts ?? 5,
      reconnectInterval: config.reconnectInterval ?? 3000,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
    };

    this.connectionState = {
      status: ConnectionStatus.DISCONNECTED,
      reconnectAttempts: 0,
    };
  }

  private getDefaultWebSocketUrl(): string {
    if (typeof window === 'undefined') {
      return 'ws://localhost:8000/ws';
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_WS_URL || window.location.host;
    return `${protocol}//${host}/ws`;
  }

  public connect(sessionId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.shouldReconnect = true;
    this.updateConnectionState({ status: ConnectionStatus.CONNECTING });

    try {
      const wsUrl = `${this.config.url}/${sessionId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => this.handleOpen();
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onerror = (error) => this.handleError(error);
      this.ws.onclose = (event) => this.handleClose(event);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.updateConnectionState({
        status: ConnectionStatus.ERROR,
        error: error instanceof Error ? error.message : 'Connection failed',
      });
      this.attemptReconnect(sessionId);
    }
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.updateConnectionState({ status: ConnectionStatus.DISCONNECTED });
  }

  public send(event: ClientEvent): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(event));
      } catch (error) {
        console.error('Failed to send message:', error);
        this.messageQueue.push(event);
      }
    } else {
      console.warn('WebSocket not connected, queueing message');
      this.messageQueue.push(event);
    }
  }

  public on(eventType: string, handler: EventHandler<ServerEvent>): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  public getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  private handleOpen(): void {
    console.log('WebSocket connected');
    this.updateConnectionState({
      status: ConnectionStatus.CONNECTED,
      lastConnected: new Date().toISOString(),
      reconnectAttempts: 0,
      error: undefined,
    });

    // Send queued messages
    while (this.messageQueue.length > 0) {
      const event = this.messageQueue.shift();
      if (event) {
        this.send(event);
      }
    }

    // Start heartbeat
    this.startHeartbeat();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const serverEvent: ServerEvent = JSON.parse(event.data);
      this.emitEvent(serverEvent);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.updateConnectionState({
      status: ConnectionStatus.ERROR,
      error: 'Connection error occurred',
    });
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket closed:', event.code, event.reason);
    this.clearTimers();

    if (this.shouldReconnect && event.code !== 1000) {
      this.attemptReconnect();
    } else {
      this.updateConnectionState({ status: ConnectionStatus.DISCONNECTED });
    }
  }

  private attemptReconnect(sessionId?: string): void {
    if (
      this.connectionState.reconnectAttempts >= this.config.reconnectAttempts
    ) {
      console.error('Max reconnection attempts reached');
      this.updateConnectionState({
        status: ConnectionStatus.ERROR,
        error: 'Failed to reconnect after maximum attempts',
      });
      return;
    }

    this.updateConnectionState({
      status: ConnectionStatus.RECONNECTING,
      reconnectAttempts: this.connectionState.reconnectAttempts + 1,
    });

    const delay =
      this.config.reconnectInterval *
      Math.pow(1.5, this.connectionState.reconnectAttempts);

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.connectionState.reconnectAttempts + 1}/${this.config.reconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      if (sessionId) {
        this.connect(sessionId);
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.clearHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send({
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
      });
    }, this.config.heartbeatInterval);
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearTimers(): void {
    this.clearHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private updateConnectionState(updates: Partial<ConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };
    this.emitEvent({
      type: 'connection_state_changed',
      state: this.connectionState,
    } as unknown as ServerEvent);
  }

  private emitEvent(event: ServerEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }

    // Also emit to wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in wildcard event handler:', error);
        }
      });
    }
  }
}

// Singleton instance for easy access
let wsClientInstance: WebSocketClient | null = null;

export function getWebSocketClient(config?: Partial<WebSocketConfig>): WebSocketClient {
  if (!wsClientInstance) {
    wsClientInstance = new WebSocketClient(config);
  }
  return wsClientInstance;
}

export function resetWebSocketClient(): void {
  if (wsClientInstance) {
    wsClientInstance.disconnect();
    wsClientInstance = null;
  }
}
