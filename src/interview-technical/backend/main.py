"""FastAPI app for the multimodal technical interviewer."""

import asyncio
import logging

from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from schemas import (
    ErrorMessage,
    EvaluateRequest,
    HealthResponse,
    InterviewEvaluation,
    TranscriptMessage,
    TTSStreamRequest,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: optional init (e.g. DSPy compile)
    yield
    # Shutdown
    pass


app = FastAPI(
    title="Interview Technical API",
    description="Evaluate system design interview (diagram + transcript)",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse()


@app.post("/evaluate", response_model=InterviewEvaluation)
async def evaluate(req: EvaluateRequest) -> InterviewEvaluation:
    """Run DSPy pipeline and return evaluation; TTS via POST /tts/stream."""
    from pipeline import run_evaluation_pipeline

    return await run_evaluation_pipeline(
        transcript=req.transcript,
        diagram_base64=req.diagram_base64,
        previous_state=req.previous_state,
    )


@app.post("/tts/stream")
async def tts_stream_endpoint(body: TTSStreamRequest):
    """Stream PCM audio from Minimax TTS (speech-02-hd)."""
    logging.info("[TTS] request text_len=%d emotion=%s", len(body.text), body.emotion.value)

    async def logged_stream():
        from minimax_client import tts_stream as minimax_stream

        try:
            chunk_count = 0
            async for chunk in minimax_stream(body.text, body.emotion):
                chunk_count += 1
                if chunk_count == 1:
                    logging.info("[TTS] first chunk received len=%d", len(chunk))
                yield chunk
            logging.info("[TTS] stream done chunks=%d", chunk_count)
        except Exception as e:
            logging.exception("[TTS] stream failed: %s", e)
            raise

    return StreamingResponse(
        logged_stream(),
        media_type="audio/raw",
        headers={"Content-Type": "audio/raw; rate=24000"},
    )


@app.websocket("/ws/transcribe")
async def ws_transcribe(websocket: WebSocket):
    """
    Accept PCM 16kHz 16-bit mono audio as binary frames.
    Send transcript chunks as JSON: {"transcript": "..."}.
    Uses AWS Transcribe Streaming (same credentials as Bedrock).
    """
    await websocket.accept()
    logging.info("[STT] WebSocket connected")
    audio_queue: asyncio.Queue[bytes | None] = asyncio.Queue()
    transcript_queue: asyncio.Queue[str] = asyncio.Queue()

    async def audio_chunks():
        while True:
            chunk = await audio_queue.get()
            if chunk is None:
                break
            yield chunk

    async def receive_audio():
        try:
            frame_count = 0
            while True:
                data = await websocket.receive_bytes()
                frame_count += 1
                if frame_count == 1:
                    logging.info("[STT] first audio frame received len=%d", len(data))
                await audio_queue.put(data)
        except WebSocketDisconnect:
            logging.info("[STT] WebSocket disconnected (client closed)")
        finally:
            await audio_queue.put(None)

    async def run_transcribe():
        try:
            from transcribe_streaming import transcribe_audio_stream
            await transcribe_audio_stream(audio_chunks(), transcript_queue)
            logging.info("[STT] Transcribe stream ended normally")
        except Exception as e:
            logging.exception("[STT] Transcribe failed: %s", e)
            await websocket.send_text(ErrorMessage(error=str(e)).model_dump_json())
        finally:
            await transcript_queue.put(None)

    async def send_transcripts():
        try:
            count = 0
            while True:
                text = await transcript_queue.get()
                if text is None:
                    break
                count += 1
                logging.info("[STT] sent transcript #%d: %r", count, text[:80] + "..." if len(text) > 80 else text)
                await websocket.send_text(TranscriptMessage(transcript=text).model_dump_json())
        except Exception as e:
            logging.exception("[STT] send_transcripts error: %s", e)

    try:
        await asyncio.gather(
            receive_audio(),
            run_transcribe(),
            send_transcripts(),
        )
    except WebSocketDisconnect:
        logging.info("[STT] WebSocket disconnected")
    finally:
        await audio_queue.put(None)
