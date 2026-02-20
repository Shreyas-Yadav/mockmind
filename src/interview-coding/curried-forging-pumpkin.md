# MockMind — Implementation Plan

## Context
Building a greenfield agentic mock interview platform for a hackathon. The repo is empty (just a readme). Requirements: technical coding interviews, AWS Bedrock (Claude) for AI agents, Amazon Polly (TTS) for voice output, Datadog APM for observability, Docker sandbox for code execution, Python backend (FastAPI), Next.js frontend.

> **Note**: Amazon Transcribe was evaluated for STT but is **not suitable** here — the batch API requires polling (too slow for interactive use), and the streaming Python SDK (`amazon-transcribe`) is deprecated. STT uses **Web Speech API** (browser-native) instead, which is zero-latency and free.

---

## Project Structure

```
mockmind/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                         # FastAPI app entry, ddtrace-run CMD
│   ├── config.py                       # Pydantic Settings from env vars
│   ├── api/
│   │   ├── router.py
│   │   ├── sessions.py                 # POST/GET /api/sessions
│   │   ├── websocket.py                # WS /ws/{session_id} — main real-time hub
│   │   ├── voice.py                    # POST /api/voice/tts (STT is browser-side only)
│   │   └── code.py                     # POST /api/code/run
│   ├── agents/
│   │   ├── interviewer_agent.py        # Agentic loop using Bedrock converse + tool use
│   │   ├── feedback_agent.py           # On-demand feedback agent
│   │   └── tools/
│   │       ├── tool_registry.py        # Bedrock tool schemas (JSON)
│   │       ├── question_bank_tool.py   # get_question tool impl (hardcoded 3 problems)
│   │       ├── code_runner_tool.py     # run_code tool impl (calls sandbox)
│   │       ├── hint_tool.py            # get_hint tool impl
│   │       └── assess_tool.py          # assess_solution tool impl
│   ├── services/
│   │   ├── bedrock_service.py          # boto3 async wrapper, traces every call
│   │   └── polly_service.py            # TTS → base64 audio (STT handled by browser Web Speech API)
│   ├── models/
│   │   ├── session.py                  # Session, Message, AgentState, AgentPhase
│   │   ├── question.py                 # Question, TestCase, Difficulty
│   │   └── events.py                   # ClientEvent, ServerEvent schemas
│   ├── store/
│   │   └── memory_store.py             # Dict-based in-memory store with asyncio.Lock
│   └── observability/
│       └── datadog.py                  # DogStatsD init, helper decorators
├── frontend/
│   ├── Dockerfile
│   ├── package.json
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
├── sandbox/
│   ├── Dockerfile                      # python:3.12-alpine, non-root user
│   └── runner.py                       # stdlib HTTP server, exec() with timeout + resource limits
└── infra/
    └── aws-setup.md                    # Step-by-step Bedrock + Polly setup guide
```

---

## Core Architecture Decisions

### 1. Interviewer Agent Loop (`backend/agents/interviewer_agent.py`)
Uses **Bedrock `converse` API with tool use** — not a simple chatbot. The agent autonomously decides when to call tools.

**Tools available to interviewer:**
- `get_question` — selects a coding problem at interview start
- `run_code` — executes candidate's code in sandbox
- `get_hint` — generates progressive hints (level 1/2/3)
- `assess_solution` — final verdict after submission

**Agent loop design:**
```
run_interviewer_turn(session, user_input, ws_send):
  1. Append user message to history
  2. Build dynamic system prompt based on AgentPhase
  3. Send AGENT_THINKING event to frontend
  4. Loop (max 5 iterations):
     a. Call bedrock.converse(messages, system, tools)
     b. If text block → stream to frontend + fire TTS task
     c. If stop_reason == "tool_use":
        → Execute tool(s) via dispatch_tool()
        → Send AGENT_THINKING {tool: "run_code", status: "running"}
        → Append tool results as "user" role turn (Bedrock convention)
        → Continue loop
     d. If stop_reason == "end_turn" → break
  5. Update AgentPhase based on conversation state
```

**AgentPhase drives system prompt content:**
- `GREETING` → introduce, call `get_question`, present problem
- `CLARIFYING` → answer questions, don't give algorithm
- `OBSERVING` → monitor, check-in after silence
- `NUDGING` → escalate hint level
- `REVIEWING` → call `run_code` + `assess_solution`
- `WRAPPING_UP` → final holistic summary

### 2. Feedback Agent (`backend/agents/feedback_agent.py`)
- Separate from interviewer — own conversation thread, own tools
- Triggered on-demand (button click → `REQUEST_FEEDBACK` WebSocket event)
- Runs in `asyncio.create_task` — does NOT block the interview
- Tools: `analyze_complexity`, `check_edge_cases`, `suggest_improvements`
- Uses `claude-3-5-haiku` (faster/cheaper than Sonnet)
- Returns structured `FeedbackResult` JSON → rendered in `FeedbackPanel`

### 3. WebSocket Hub (`backend/api/websocket.py`)
- `ConnectionManager` — dict of `session_id → WebSocket` with `asyncio.Lock`
- All agent/sandbox calls dispatched as `asyncio.create_task` (non-blocking)
- Event contract: `ClientEvent` → server, `ServerEvent` → client (Pydantic models)
- Heartbeat mechanism to detect stale connections

### 4. Code Sandbox (`sandbox/runner.py`)
- Stdlib-only Python HTTP server (no FastAPI, no pip packages)
- Receives `{ code, test_cases, timeout_s }`
- Uses `exec()` in restricted namespace + `multiprocessing` with timeout
- `resource.setrlimit` for memory cap
- Docker container: no-new-privileges, mem_limit=128m, tmpfs only, NO network

### 5. Voice
- **TTS**: Amazon Polly → `polly.synthesize_speech(Text=..., VoiceId="Joanna", OutputFormat="mp3", Engine="neural")` → `response['AudioStream'].read()` → base64 encode → `VOICE_AUDIO` WS event → browser `new Audio(...)` plays it
- **STT**: **Web Speech API only** (browser `SpeechRecognition` / `webkitSpeechRecognition`). Sends transcript as `send_voice` WS event. Amazon Transcribe dropped — batch API is too slow for interactive use; streaming SDK is deprecated.
- TTS fired as `asyncio.create_task` — does not block agent text response

---

## Data Models

### Session & AgentState (`models/session.py`)
```python
class AgentPhase(Enum): GREETING | CLARIFYING | OBSERVING | NUDGING | REVIEWING | WRAPPING_UP
class AgentState: phase, question_id, hint_level, last_user_activity, turns, tool_calls_log
class Session: id, status, created_at, messages: list[Message], agent_state, code_history
```

### WebSocket Events (`models/events.py`)
```
Client→Server: start_interview | send_message | send_voice | run_code | request_feedback | heartbeat
Server→Client: session_ready | interviewer_msg | voice_audio | code_result | feedback_result
              | agent_thinking | agent_phase_change | error | heartbeat_ack
```

---

## Datadog Observability Points

| Location | Type | What's Traced |
|---|---|---|
| `bedrock_service.converse` | APM Span + Histogram | Latency, model_id, stop_reason, token counts |
| `interviewer_agent.run_turn` | APM Span | Session ID, phase, turns, tool_calls per turn |
| `feedback_agent.run` | APM Span + Gauge | Score, session ID |
| `agent tool dispatch` | DogStatsD counter | `mockmind.agent.tool_calls` by tool name + phase |
| `sandbox_service.run` | DogStatsD histogram | Execution time, pass/fail, language |
| `sessions.create/complete` | DogStatsD counter | `mockmind.sessions.created/completed` |
| `websocket.connect/disconnect` | DogStatsD gauge | Active connections |

**Setup**: `ddtrace-run uvicorn ...` in Dockerfile CMD auto-instruments FastAPI, httpx, boto3. Custom metrics via `datadog.statsd`. `DD_LOGS_INJECTION=true` correlates logs with traces.

---

## AWS Setup (Builder Account)

1. **Enable Bedrock model access**: Console → Bedrock → Model access → Enable Claude 3.5 Sonnet + Claude 3.5 Haiku (us-east-1). After access is granted, check the **exact model ID** shown in the console (may include a version suffix like `-v2:0`).
2. **IAM policy**: Allow `bedrock:Converse`, `bedrock:InvokeModel`, `polly:SynthesizeSpeech`
3. **Credentials**: `aws configure` → produces `~/.aws/credentials` → mounted or set as env vars in docker-compose
4. **Region**: `us-east-1` — widest Claude model availability

Models to use (verify exact IDs from Bedrock console after access granted):
- Interviewer: `anthropic.claude-3-5-sonnet-20241022-v2:0` (or as shown in console)
- Feedback: `anthropic.claude-3-5-haiku-20241022-v1:0` (or as shown in console)

**Datadog Agent Docker image**: `gcr.io/datadoghq/agent:7` (confirmed from official Datadog docs)

---

## Verified API Contracts (from live docs)

### Bedrock `converse()` — confirmed from boto3 docs
```python
response = bedrock_client.converse(
    modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[
        {"role": "user", "content": [{"text": "hello"}]},
        # Tool result goes back as role="user":
        {"role": "user", "content": [{"toolResult": {"toolUseId": "...", "content": [{"text": "result"}]}}]}
    ],
    system=[{"text": "You are an interviewer..."}],
    toolConfig={
        "tools": [{"toolSpec": {"name": "get_question", "description": "...", "inputSchema": {"json": {...}}}}],
        "toolChoice": {"auto": {}}
    },
    inferenceConfig={"maxTokens": 2048, "temperature": 0.7}
)
# Response:
response["stopReason"]                        # "end_turn" | "tool_use" | "max_tokens" | "stop_sequence" | "content_filtered"
response["output"]["message"]["content"]      # list of {"text": "..."} or {"toolUse": {"toolUseId": "...", "name": "...", "input": {...}}}
response["usage"]["inputTokens"]              # for Datadog metrics
response["usage"]["outputTokens"]
```

### Amazon Polly `synthesize_speech()` — confirmed from boto3 docs
```python
response = polly_client.synthesize_speech(
    Text="Hello candidate",
    VoiceId="Joanna",        # or "Matthew", "Amy", etc.
    OutputFormat="mp3",
    Engine="neural"          # use "neural" for best quality
)
audio_bytes = response["AudioStream"].read()   # StreamingBody → bytes
audio_b64 = base64.b64encode(audio_bytes).decode()
```

### FastAPI WebSocket — confirmed from Starlette docs
```python
from fastapi import WebSocket, WebSocketDisconnect

@router.websocket("/ws/{session_id}")
async def ws_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        async for raw in websocket.iter_text():   # iter_text() confirmed valid
            event = ClientEvent.model_validate_json(raw)
            # dispatch...
    except WebSocketDisconnect:
        # handle disconnect
```

### Datadog Tracing — confirmed
```python
from ddtrace import tracer
from datadog import statsd   # separate 'datadog' package for DogStatsD

@tracer.wrap(name="bedrock.converse", service="mockmind-backend")
async def converse(...):
    span = tracer.current_span()
    span.set_tag("model_id", model_id)
    span.set_metric("latency_ms", elapsed)
    statsd.histogram("mockmind.bedrock.latency_ms", elapsed, tags=[f"model:{model_id}"])
    statsd.increment("mockmind.bedrock.calls", tags=[f"stop_reason:{stop_reason}"])
```

Dockerfile CMD (confirmed): `CMD ["ddtrace-run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`

### Web Speech API (STT — browser side)
```typescript
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
recognition.continuous = false
recognition.lang = "en-US"
recognition.onresult = (e) => {
  const transcript = e.results[0][0].transcript
  ws.send(JSON.stringify({ type: "send_message", payload: { text: transcript } }))
}
recognition.start()
// Note: works in Chrome/Edge; not supported in Firefox
```

---

## Build Order (Hackathon Sequence)

**Phase 1 — Backend Core (2h)**
1. `config.py`, `models/`, `store/memory_store.py`
2. `services/bedrock_service.py` — test converse call works
3. `api/sessions.py`, basic `api/websocket.py`, `main.py`

**Phase 2 — Agents (2h)**
4. `agents/tools/tool_registry.py` + `question_bank_tool.py` (hardcode 3 problems)
5. `agents/interviewer_agent.py` — full agentic loop
6. Wire into WebSocket handlers

**Phase 3 — Sandbox + Voice (1.5h)**
7. `sandbox/runner.py` + `sandbox/Dockerfile`
8. `services/sandbox_service.py` + `agents/tools/code_runner_tool.py`
9. `services/polly_service.py` + `api/voice.py` (TTS only; STT is browser-side Web Speech API)

**Phase 4 — Feedback Agent + Frontend (2h)**
10. `agents/feedback_agent.py`
11. Next.js: `CodeEditor`, `ChatPanel`, `FeedbackPanel`, `useInterviewSession` hook
12. `docker-compose.yml` wire-up

**Phase 5 — Observability + Polish (0.5h)**
13. `observability/datadog.py` + `@tracer.wrap` on key functions
14. End-to-end demo run

---

## Key Dependencies

**`backend/requirements.txt`**
```
fastapi==0.115.0
uvicorn[standard]==0.30.6
pydantic==2.7.4
pydantic-settings==2.3.4
boto3==1.35.0
ddtrace==2.11.0
datadog==0.49.1
httpx==0.27.0
python-multipart==0.0.9
```

**Frontend**: Next.js 15, Monaco Editor (`@monaco-editor/react`), shadcn/ui

---

## Verification
1. `docker compose up` — all 4 services start (backend, frontend, sandbox, datadog-agent)
2. `GET /api/health` → `{"bedrock": "ok", "sandbox": "ok"}`
3. Create session → open WS → `start_interview` → agent greets + presents problem (Bedrock call works)
4. Type a message → agent responds with follow-up (agent loop cycles correctly)
5. Submit code → sandbox runs it → `CODE_RESULT` event received
6. Click "Get Feedback" → `FEEDBACK_RESULT` rendered in panel
7. Datadog APM → Service Map shows `mockmind-backend → bedrock.converse`
8. Datadog Metrics → `mockmind.agent.tool_calls` graph populated
