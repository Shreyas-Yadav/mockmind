# Interview Technical Backend

FastAPI backend for the multimodal AI technical interviewer. See `../opencode docs/plans/interview-technical-plan.md` for the full plan.

## Setup

```bash
uv sync
```

## Run

```bash
uv run uvicorn main:app --reload --port 8000
```

## Environment

Create `.env` with:

- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` (Bedrock)
- `MINIMAX_API_KEY` (TTS)
