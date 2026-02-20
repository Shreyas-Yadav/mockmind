import { useState, useEffect, useCallback, useRef } from 'react';
import {
  InterviewSession,
  Message,
  MessageType,
  ConnectionState,
  ConnectionStatus,
  UseInterviewSessionReturn,
  ServerEvent,
  SessionJoinedEvent,
  MessageReceivedEvent,
  CodeExecutedEvent,
  HintProvidedEvent,
  SessionUpdatedEvent,
  ErrorEvent,
  MessageSender,
  AgentPhase,
  SessionStatus,
  Difficulty,
} from '../lib/types';
import { WebSocketClient, getWebSocketClient } from '../lib/websocket';

// Mock data for development
const MOCK_SESSION: InterviewSession = {
  id: 'mock-session-123',
  difficulty: Difficulty.MEDIUM,
  status: SessionStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  agentState: {
    phase: AgentPhase.GREETING,
    context: {},
    conversationHistory: [],
    hintsGiven: 0,
    lastActivity: new Date().toISOString(),
  },
};

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    type: MessageType.TEXT,
    content: "Hello! I'm your coding interview assistant. I'll be guiding you through a coding problem today. Are you ready to begin?",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    sender: MessageSender.AGENT,
  },
];

interface UseInterviewSessionOptions {
  sessionId?: string;
  useMockData?: boolean;
  autoConnect?: boolean;
}

export function useInterviewSession(
  options: UseInterviewSessionOptions = {}
): UseInterviewSessionReturn {
  const { sessionId, useMockData = false, autoConnect = true } = options;

  const [session, setSession] = useState<InterviewSession | null>(
    useMockData ? MOCK_SESSION : null
  );
  const [messages, setMessages] = useState<Message[]>(
    useMockData ? MOCK_MESSAGES : []
  );
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: ConnectionStatus.DISCONNECTED,
    reconnectAttempts: 0,
  });

  const wsClientRef = useRef<WebSocketClient | null>(null);
  const mockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket client
  useEffect(() => {
    if (!useMockData) {
      wsClientRef.current = getWebSocketClient();
    }

    return () => {
      if (mockTimeoutRef.current) {
        clearTimeout(mockTimeoutRef.current);
      }
    };
  }, [useMockData]);

  // Auto-connect to session
  useEffect(() => {
    if (sessionId && autoConnect && !useMockData && wsClientRef.current) {
      wsClientRef.current.connect(sessionId);
      wsClientRef.current.send({
        type: 'join_session',
        sessionId,
      });
    }

    return () => {
      if (wsClientRef.current && !useMockData) {
        wsClientRef.current.disconnect();
      }
    };
  }, [sessionId, autoConnect, useMockData]);

  // Set up event handlers
  useEffect(() => {
    if (!wsClientRef.current || useMockData) return;

    const unsubscribers: (() => void)[] = [];

    // Connection state changes
    unsubscribers.push(
      wsClientRef.current.on('connection_state_changed', (event: ServerEvent) => {
        const stateEvent = event as unknown as { type: string; state: ConnectionState };
        setConnectionState(stateEvent.state);
      })
    );

    // Session joined
    unsubscribers.push(
      wsClientRef.current.on('session_joined', (event: ServerEvent) => {
        const joinedEvent = event as SessionJoinedEvent;
        if (joinedEvent.success) {
          setSession(joinedEvent.session);
          console.log('Successfully joined session:', joinedEvent.session.id);
        }
      })
    );

    // Message received
    unsubscribers.push(
      wsClientRef.current.on('message_received', (event: ServerEvent) => {
        const messageEvent = event as MessageReceivedEvent;
        setMessages((prev) => [...prev, messageEvent.message]);
      })
    );

    // Code executed
    unsubscribers.push(
      wsClientRef.current.on('code_executed', (event: ServerEvent) => {
        const codeEvent = event as CodeExecutedEvent;
        const resultMessage: Message = {
          id: `result-${Date.now()}`,
          type: MessageType.SYSTEM,
          content: codeEvent.result.success
            ? `Code executed successfully!\n${codeEvent.result.output || ''}`
            : `Execution failed: ${codeEvent.result.error || 'Unknown error'}`,
          timestamp: new Date().toISOString(),
          sender: MessageSender.SYSTEM,
          metadata: {
            executionResult: codeEvent.result,
          },
        };
        setMessages((prev) => [...prev, resultMessage]);

        if (codeEvent.feedback) {
          const feedbackMessage: Message = {
            id: `feedback-${Date.now()}`,
            type: MessageType.FEEDBACK,
            content: codeEvent.feedback,
            timestamp: new Date().toISOString(),
            sender: MessageSender.AGENT,
          };
          setMessages((prev) => [...prev, feedbackMessage]);
        }
      })
    );

    // Hint provided
    unsubscribers.push(
      wsClientRef.current.on('hint_provided', (event: ServerEvent) => {
        const hintEvent = event as HintProvidedEvent;
        const hintMessage: Message = {
          id: `hint-${Date.now()}`,
          type: MessageType.HINT,
          content: hintEvent.hint.content,
          timestamp: new Date().toISOString(),
          sender: MessageSender.AGENT,
          metadata: {
            hintLevel: hintEvent.hint.level,
          },
        };
        setMessages((prev) => [...prev, hintMessage]);
      })
    );

    // Session updated
    unsubscribers.push(
      wsClientRef.current.on('session_updated', (event: ServerEvent) => {
        const updateEvent = event as SessionUpdatedEvent;
        setSession(updateEvent.session);
      })
    );

    // Error handling
    unsubscribers.push(
      wsClientRef.current.on('error', (event: ServerEvent) => {
        const errorEvent = event as ErrorEvent;
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: MessageType.SYSTEM,
          content: `Error: ${errorEvent.message}`,
          timestamp: new Date().toISOString(),
          sender: MessageSender.SYSTEM,
        };
        setMessages((prev) => [...prev, errorMessage]);
        console.error('WebSocket error:', errorEvent);
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [useMockData]);

  // Mock response system for development
  const sendMockResponse = useCallback(() => {
    mockTimeoutRef.current = setTimeout(() => {
      const responses = [
        "That's an interesting approach! Can you explain your thought process?",
        "Good thinking! Have you considered the edge cases?",
        "Let me help you with that. What's your current understanding of the problem?",
        "Great question! Let's break this down step by step.",
        "I see what you're trying to do. Would you like a hint?",
      ];

      const mockResponse: Message = {
        id: `mock-${Date.now()}`,
        type: MessageType.TEXT,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        sender: MessageSender.AGENT,
      };

      setMessages((prev) => [...prev, mockResponse]);
    }, 1000 + Math.random() * 1000);
  }, []);

  const joinSession = useCallback(
    (sessionId: string) => {
      if (useMockData) {
        console.log('Mock mode: Simulating session join');
        return;
      }

      if (!wsClientRef.current) {
        console.error('WebSocket client not initialized');
        return;
      }

      wsClientRef.current.connect(sessionId);
      wsClientRef.current.send({
        type: 'join_session',
        sessionId,
      });
    },
    [useMockData]
  );

  const sendMessage = useCallback(
    (content: string, type: MessageType = MessageType.TEXT) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type,
        content,
        timestamp: new Date().toISOString(),
        sender: MessageSender.USER,
      };

      setMessages((prev) => [...prev, userMessage]);

      if (useMockData) {
        sendMockResponse();
      } else if (wsClientRef.current) {
        wsClientRef.current.send({
          type: 'send_message',
          content,
          messageType: type,
        });
      }
    },
    [useMockData, sendMockResponse]
  );

  const submitCode = useCallback(
    (code: string, language: string, runTests: boolean = true) => {
      if (useMockData) {
        console.log('Mock mode: Simulating code submission');
        const mockResult: Message = {
          id: `result-${Date.now()}`,
          type: MessageType.SYSTEM,
          content: 'Code executed successfully!\nAll test cases passed.',
          timestamp: new Date().toISOString(),
          sender: MessageSender.SYSTEM,
          metadata: {
            executionResult: {
              success: true,
              output: 'Test case 1: Passed\nTest case 2: Passed',
              executionTime: 45,
              memoryUsed: 1024,
            },
          },
        };
        setTimeout(() => {
          setMessages((prev) => [...prev, mockResult]);
        }, 1500);
      } else if (wsClientRef.current) {
        wsClientRef.current.send({
          type: 'submit_code',
          code,
          language,
          runTests,
        });
      }
    },
    [useMockData]
  );

  const requestHint = useCallback(() => {
    if (!session?.currentQuestionId) {
      console.warn('No active question to request hint for');
      return;
    }

    if (useMockData) {
      console.log('Mock mode: Simulating hint request');
      const mockHint: Message = {
        id: `hint-${Date.now()}`,
        type: MessageType.HINT,
        content: 'Try thinking about using a hash map to store the values you\'ve seen.',
        timestamp: new Date().toISOString(),
        sender: MessageSender.AGENT,
        metadata: {
          hintLevel: (session.agentState.hintsGiven || 0) + 1,
        },
      };
      setTimeout(() => {
        setMessages((prev) => [...prev, mockHint]);
        if (session) {
          setSession({
            ...session,
            agentState: {
              ...session.agentState,
              hintsGiven: session.agentState.hintsGiven + 1,
            },
          });
        }
      }, 800);
    } else if (wsClientRef.current) {
      wsClientRef.current.send({
        type: 'request_hint',
        questionId: session.currentQuestionId,
        currentLevel: session.agentState.hintsGiven,
      });
    }
  }, [session, useMockData]);

  const disconnect = useCallback(() => {
    if (wsClientRef.current && !useMockData) {
      wsClientRef.current.disconnect();
    }
    setConnectionState({
      status: ConnectionStatus.DISCONNECTED,
      reconnectAttempts: 0,
    });
  }, [useMockData]);

  return {
    session,
    messages,
    connectionState,
    sendMessage,
    submitCode,
    requestHint,
    joinSession,
    disconnect,
  };
}
