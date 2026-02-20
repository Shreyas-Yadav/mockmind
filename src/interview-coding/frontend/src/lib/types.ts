// Session Management Types
export interface InterviewSession {
  id: string;
  difficulty: Difficulty;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  currentQuestionId?: string;
  agentState: AgentState;
}

export enum SessionStatus {
  CREATED = 'created',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// Agent State Management
export interface AgentState {
  phase: AgentPhase;
  context: Record<string, any>;
  conversationHistory: Message[];
  currentQuestion?: Question;
  hintsGiven: number;
  lastActivity: string;
}

export enum AgentPhase {
  GREETING = 'greeting',
  CLARIFYING = 'clarifying',
  OBSERVING = 'observing',
  NUDGING = 'nudging',
  REVIEWING = 'reviewing',
  WRAPPING_UP = 'wrapping_up'
}

// Message Types
export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: string;
  sender: MessageSender;
  metadata?: MessageMetadata;
}

export enum MessageType {
  TEXT = 'text',
  CODE = 'code',
  SYSTEM = 'system',
  HINT = 'hint',
  FEEDBACK = 'feedback'
}

export enum MessageSender {
  USER = 'user',
  AGENT = 'agent',
  SYSTEM = 'system'
}

export interface MessageMetadata {
  codeLanguage?: string;
  executionResult?: CodeExecutionResult;
  hintLevel?: number;
  feedbackType?: string;
}

// Question and Problem Types
export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  constraints: string[];
  examples: Example[];
  testCases: TestCase[];
  hints: Hint[];
  timeLimit?: number;
  memoryLimit?: number;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  weight?: number;
}

export interface Hint {
  level: number;
  content: string;
  type: HintType;
}

export enum HintType {
  APPROACH = 'approach',
  IMPLEMENTATION = 'implementation',
  OPTIMIZATION = 'optimization',
  DEBUG = 'debug'
}

// Code Execution Types
export interface CodeExecutionRequest {
  code: string;
  language: string;
  testCases?: TestCase[];
  timeLimit?: number;
  memoryLimit?: number;
}

export interface CodeExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
  memoryUsed?: number;
  testResults?: TestResult[];
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput?: string;
  expectedOutput: string;
  executionTime?: number;
  error?: string;
}

// WebSocket Event Types
export type ClientEvent = 
  | JoinSessionEvent
  | SendMessageEvent
  | SubmitCodeEvent
  | RequestHintEvent
  | HeartbeatEvent;

export type ServerEvent = 
  | SessionJoinedEvent
  | MessageReceivedEvent
  | CodeExecutedEvent
  | HintProvidedEvent
  | SessionUpdatedEvent
  | ErrorEvent
  | HeartbeatEvent;

// Client Events
export interface JoinSessionEvent {
  type: 'join_session';
  sessionId: string;
  userId?: string;
}

export interface SendMessageEvent {
  type: 'send_message';
  content: string;
  messageType: MessageType;
}

export interface SubmitCodeEvent {
  type: 'submit_code';
  code: string;
  language: string;
  runTests?: boolean;
}

export interface RequestHintEvent {
  type: 'request_hint';
  questionId: string;
  currentLevel: number;
}

export interface HeartbeatEvent {
  type: 'heartbeat';
  timestamp: string;
}

// Server Events
export interface SessionJoinedEvent {
  type: 'session_joined';
  session: InterviewSession;
  success: boolean;
}

export interface MessageReceivedEvent {
  type: 'message_received';
  message: Message;
}

export interface CodeExecutedEvent {
  type: 'code_executed';
  result: CodeExecutionResult;
  feedback?: string;
}

export interface HintProvidedEvent {
  type: 'hint_provided';
  hint: Hint;
  remainingHints: number;
}

export interface SessionUpdatedEvent {
  type: 'session_updated';
  session: InterviewSession;
}

export interface ErrorEvent {
  type: 'error';
  message: string;
  code?: string;
  details?: any;
}

// Voice and Audio Types
export interface VoiceSettings {
  enabled: boolean;
  autoPlay: boolean;
  voice?: SpeechSynthesisVoice;
  rate: number;
  pitch: number;
  volume: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// UI Component Types
export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: string;
  readOnly?: boolean;
  height?: string;
  options?: any;
}

export interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string, type: MessageType) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export interface VoiceControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayAudio: (text: string) => void;
  settings: VoiceSettings;
  onSettingsChange: (settings: VoiceSettings) => void;
}

export interface QuestionDisplayProps {
  question: Question;
  showHints?: boolean;
  hintsRevealed?: number;
  onRequestHint?: () => void;
}

export interface FeedbackPanelProps {
  isOpen: boolean;
  onClose: () => void;
  feedback?: CodeFeedback;
  isLoading?: boolean;
}

// Feedback Types
export interface CodeFeedback {
  overall: FeedbackSection;
  correctness: FeedbackSection;
  efficiency: FeedbackSection;
  style: FeedbackSection;
  suggestions: string[];
  score?: number;
}

export interface FeedbackSection {
  score: number;
  comments: string[];
  improvements: string[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateSessionRequest {
  difficulty: Difficulty;
  userId?: string;
}

export interface CreateSessionResponse {
  session: InterviewSession;
}

// WebSocket Connection Types
export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectInterval: number;
  heartbeatInterval: number;
}

export interface ConnectionState {
  status: ConnectionStatus;
  lastConnected?: string;
  reconnectAttempts: number;
  error?: string;
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// Hook Return Types
export interface UseInterviewSessionReturn {
  session: InterviewSession | null;
  messages: Message[];
  connectionState: ConnectionState;
  sendMessage: (content: string, type: MessageType) => void;
  submitCode: (code: string, language: string, runTests?: boolean) => void;
  requestHint: () => void;
  joinSession: (sessionId: string) => void;
  disconnect: () => void;
}

export interface UseVoiceReturn {
  isRecording: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  playText: (text: string) => Promise<void>;
  settings: VoiceSettings;
  updateSettings: (settings: Partial<VoiceSettings>) => void;
}

// Utility Types
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// Constants
export const DEFAULT_CODE_EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on' as const,
  roundedSelection: false,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 4,
  insertSpaces: true,
  wordWrap: 'on' as const,
  theme: 'vs-dark'
};

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: true,
  autoPlay: false,
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8
};

export const WEBSOCKET_EVENTS = {
  CLIENT: {
    JOIN_SESSION: 'join_session',
    SEND_MESSAGE: 'send_message',
    SUBMIT_CODE: 'submit_code',
    REQUEST_HINT: 'request_hint',
    HEARTBEAT: 'heartbeat'
  },
  SERVER: {
    SESSION_JOINED: 'session_joined',
    MESSAGE_RECEIVED: 'message_received',
    CODE_EXECUTED: 'code_executed',
    HINT_PROVIDED: 'hint_provided',
    SESSION_UPDATED: 'session_updated',
    ERROR: 'error',
    HEARTBEAT: 'heartbeat'
  }
} as const;