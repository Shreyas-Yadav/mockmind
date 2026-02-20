# Interview Coding Agent - Implementation Tasks

## Project Scope
Building the **coding interview agent** component of MockMind platform in `/src/interview-coding/` directory. This agent handles technical coding interviews with AI-powered interviewer, code execution sandbox, and voice interaction.

## Updated Project Structure (Interview Coding Agent Only)

```
src/interview-coding/
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing — create session, pick difficulty
│   │   └── interview/[sessionId]/page.tsx  # Main interview UI
│   ├── components/
│   │   ├── CodeEditor.tsx              # Monaco Editor
│   │   ├── ChatPanel.tsx               # Interviewer messages + user input
│   │   ├── VoiceControls.tsx           # Mic button, TTS playback
│   │   ├── FeedbackPanel.tsx           # Slide-in drawer for feedback results
│   │   └── QuestionDisplay.tsx         # Problem statement
│   ├── hooks/
│   │   ├── useInterviewSession.ts      # WebSocket connection + event dispatch
│   │   └── useVoice.ts                 # Mic recording via Web Speech API
│   └── lib/
│       ├── api.ts                      # HTTP client wrappers
│       ├── websocket.ts                # WS client with reconnect
│       └── types.ts                    # Shared TypeScript types
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                         # FastAPI app entry
│   ├── config.py                       # Pydantic Settings from env vars
│   ├── api/
│   │   ├── sessions.py                 # POST/GET /api/sessions
│   │   ├── websocket.py                # WS /ws/{session_id}
│   │   └── voice.py                    # POST /api/voice/tts
│   ├── agents/
│   │   ├── interviewer_agent.py        # Main coding interview agent
│   │   ├── feedback_agent.py           # Code feedback agent
│   │   └── tools/
│   │       ├── tool_registry.py        # Bedrock tool schemas
│   │       ├── question_bank_tool.py   # Coding problems (3 hardcoded)
│   │       ├── code_runner_tool.py     # Code execution tool
│   │       ├── hint_tool.py            # Progressive hints
│   │       └── assess_tool.py          # Solution assessment
│   ├── services/
│   │   ├── bedrock_service.py          # AWS Bedrock integration
│   │   ├── polly_service.py            # Text-to-speech
│   │   └── sandbox_service.py          # Code execution service
│   ├── models/
│   │   ├── session.py                  # Session, AgentState, AgentPhase
│   │   ├── question.py                 # Question, TestCase, Difficulty
│   │   └── events.py                   # WebSocket event schemas
│   └── store/
│       └── memory_store.py             # In-memory session storage
├── sandbox/
│   ├── Dockerfile                      # Python execution environment
│   └── runner.py                       # Code execution server
├── docker-compose.yml                  # Local development setup
├── .env.example                        # Environment variables template
└── README.md                           # Setup and usage instructions
```

## Implementation Tasks

- [-] 1. Frontend Foundation Setup
  - Set up Next.js project in src/interview-coding/frontend/
  - Install dependencies and configure TypeScript
  - Create project structure and shared types

- [x] 1.1 Initialize Next.js project
  - Create Next.js 15 project with TypeScript in src/interview-coding/frontend/
  - Install core dependencies: @monaco-editor/react, shadcn/ui, lucide-react, @types/node
  - Set up next.config.js with proper configuration
  - Create basic folder structure: components/, hooks/, lib/, app/
  - _Requirements: Modern React framework with TypeScript support_

- [x] 1.2 Create shared TypeScript definitions
  - Implement lib/types.ts with all interface definitions
  - Define WebSocket event types (ClientEvent, ServerEvent)
  - Define session, message, question, and agent state models
  - Add proper TypeScript configurations and exports
  - _Requirements: Type-safe communication between frontend and backend_

- [x] 1.3 Build core UI components with mock data
  - Create CodeEditor.tsx using Monaco Editor with Python syntax highlighting
  - Build ChatPanel.tsx with message display and input field (use mock interview data)
  - Implement QuestionDisplay.tsx for coding problem presentation
  - Add basic styling with Tailwind CSS and shadcn/ui components
  - _Requirements: Interactive coding interface for technical interviews_

- [x] 1.4 Create application pages and routing
  - Build app/page.tsx as landing page with session creation and difficulty selection
  - Implement app/interview/[sessionId]/page.tsx as main interview interface
  - Add proper Next.js routing and navigation between pages
  - Integrate all components into cohesive user interface
  - _Requirements: Complete user flow from session creation to interview completion_

- [ ] 2. Interactive Frontend Features
  - Add real-time communication and voice capabilities

- [ ] 2.1 Implement WebSocket client infrastructure
  - Create lib/websocket.ts with connection management and auto-reconnection
  - Build useInterviewSession.ts hook for WebSocket state management
  - Add event handling for all interview-related WebSocket events
  - Implement mock response system for frontend development
  - _Requirements: Real-time bidirectional communication with backend_

- [ ] 2.2 Add voice interaction capabilities
  - Implement useVoice.ts hook using Web Speech API for speech-to-text
  - Create VoiceControls.tsx with microphone button and audio playback controls
  - Add browser compatibility detection and graceful fallbacks
  - Integrate voice controls with chat panel and WebSocket communication
  - _Requirements: Natural voice interaction for interview experience_

- [ ] 3. Backend Core Infrastructure
  - Set up FastAPI backend with AWS integrations

- [ ] 3.1 Initialize FastAPI project structure
  - Create backend directory structure in src/interview-coding/backend/
  - Set up main.py with FastAPI application and CORS configuration
  - Implement config.py using Pydantic Settings for environment management
  - Create all data models in models/ directory (session.py, events.py, question.py)
  - Add requirements.txt with all necessary dependencies including aioboto3
  - _Requirements: Scalable Python backend with proper configuration management_

- [ ] 3.2 Implement session management system
  - Create store/memory_store.py with thread-safe in-memory storage using asyncio.Lock
  - Build api/sessions.py with REST endpoints for session CRUD operations
  - Add session lifecycle management (creation, active state, completion)
  - Implement proper error handling and validation
  - _Requirements: Persistent session state throughout interview process_

- [ ] 3.3 Set up WebSocket communication hub
  - Implement api/websocket.py with ConnectionManager for multiple concurrent sessions
  - Add WebSocket event routing and message broadcasting
  - Create heartbeat mechanism for connection health monitoring
  - Add proper error handling and connection cleanup
  - _Requirements: Reliable real-time communication for interview interactions_

- [ ] 3.4 Configure AWS services integration
  - Set up services/bedrock_service.py with aioboto3 async client for Claude models
  - Implement services/polly_service.py for text-to-speech conversion
  - Add proper AWS credential management and region configuration
  - Test basic connectivity to Bedrock and Polly services
  - _Requirements: AI-powered interview agent and voice synthesis capabilities_

- [ ] 4. AI Agent Implementation
  - Build the core interviewer agent with autonomous capabilities

- [ ] 4.1 Create agent tool system
  - Implement agents/tools/tool_registry.py with Bedrock-compatible tool schemas
  - Build agents/tools/question_bank_tool.py with 3 hardcoded coding problems (easy/medium/hard)
  - Create agents/tools/hint_tool.py for progressive hint generation (3 levels)
  - Add agents/tools/assess_tool.py for solution evaluation and scoring
  - _Requirements: Comprehensive tool ecosystem for interview management_

- [ ] 4.2 Build autonomous interviewer agent
  - Implement agents/interviewer_agent.py with main agentic conversation loop
  - Add Bedrock converse API integration with tool use capabilities
  - Create dynamic agent phase management (GREETING → CLARIFYING → OBSERVING → NUDGING → REVIEWING → WRAPPING_UP)
  - Wire agent into WebSocket event handlers for real-time interaction
  - Add proper error handling and fallback mechanisms
  - _Requirements: Intelligent interview conductor that adapts to candidate responses_

- [ ] 5. Code Execution System
  - Add secure code execution and testing capabilities

- [ ] 5.1 Build secure code sandbox
  - Create sandbox/runner.py with Python HTTP server for code execution
  - Implement sandbox/Dockerfile with security isolation (non-root user, resource limits)
  - Add timeout controls and memory/CPU restrictions
  - Set up HTTP API for receiving code execution requests
  - _Requirements: Safe execution environment for candidate code submissions_

- [ ] 5.2 Integrate sandbox with agent system
  - Implement agents/tools/code_runner_tool.py for sandbox communication
  - Create services/sandbox_service.py as HTTP client wrapper
  - Wire code execution into agent tool system with proper error handling
  - Add test case validation and result processing
  - _Requirements: Automated code testing and immediate feedback_

- [ ] 6. Advanced Features and Polish
  - Add feedback system and deployment configuration

- [ ] 6.1 Implement intelligent feedback system
  - Create agents/feedback_agent.py as separate specialized agent
  - Build components/FeedbackPanel.tsx as slide-in panel for detailed feedback
  - Add async feedback generation that doesn't block main interview flow
  - Implement feedback tools: complexity analysis, edge case detection, improvement suggestions
  - _Requirements: Comprehensive code analysis and constructive feedback_

- [ ] 6.2 Final integration and deployment setup
  - Create docker-compose.yml for local development with all services
  - Set up .env.example with all required environment variables
  - Add health check endpoints for service monitoring
  - Create README.md with setup instructions and API documentation
  - Perform end-to-end testing of complete interview workflow
  - _Requirements: Production-ready deployment and comprehensive documentation_

- [ ] 7. Testing and Verification
  - Ensure all components work together seamlessly

## Development Notes

**Working Directory**: All development happens in `/src/interview-coding/`

**Key Dependencies:**
- Frontend: Next.js 15, Monaco Editor, shadcn/ui, Tailwind CSS
- Backend: FastAPI, aioboto3 (not boto3), Pydantic v2
- AWS: Bedrock (Claude 3.5 Sonnet/Haiku), Polly TTS
- Infrastructure: Docker, docker-compose

**Critical Implementation Details:**
- Use aioboto3 for proper async AWS operations (boto3 won't work with FastAPI async)
- Web Speech API handles STT in browser (no server-side transcription needed)
- Agent phases drive dynamic system prompts for contextual interview responses
- All agent and sandbox operations use asyncio.create_task to prevent blocking
- Sandbox uses Docker isolation with resource limits for security

**AWS Requirements:**
- Enable Bedrock model access for Claude 3.5 Sonnet and Haiku in us-east-1
- Configure IAM permissions: bedrock:Converse, polly:SynthesizeSpeech
- Verify exact model IDs from Bedrock console after access is granted

**Team Coordination:**
- This agent focuses specifically on coding interviews
- Other team members working on different interview types in parallel
- Shared types and interfaces should be coordinated across agents