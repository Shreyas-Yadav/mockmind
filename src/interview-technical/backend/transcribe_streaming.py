"""
AWS Transcribe Streaming via WebSocket. Uses same AWS credentials as Bedrock.
Audio: PCM 16-bit 16kHz mono. Sends transcript chunks back as they arrive.
"""

import asyncio
import logging
import os
from typing import AsyncIterator

from amazon_transcribe.client import TranscribeStreamingClient
from amazon_transcribe.handlers import TranscriptResultStreamHandler
from amazon_transcribe.model import TranscriptEvent


def get_region() -> str:
    return os.getenv("AWS_REGION", "us-west-2")


async def transcribe_audio_stream(
    audio_chunks: AsyncIterator[bytes],
    transcript_queue: asyncio.Queue[str],
) -> None:
    """Consume audio chunks, send to Transcribe, push transcript text to queue."""
    region = get_region()
    logging.info("[STT] Transcribe stream starting region=%s", region)
    client = TranscribeStreamingClient(region=region)

    stream = await client.start_stream_transcription(
        language_code="en-US",
        media_sample_rate_hz=16000,
        media_encoding="pcm",
    )
    logging.info("[STT] Transcribe stream connected")

    class QueueHandler(TranscriptResultStreamHandler):
        async def handle_transcript_event(self, transcript_event: TranscriptEvent):
            for result in transcript_event.transcript.results:
                if not result.alternatives:
                    continue
                text = result.alternatives[0].transcript
                if text and text.strip():
                    logging.info("[STT] Transcribe result: %r", text[:60] + "..." if len(text) > 60 else text)
                    await transcript_queue.put(text.strip())

    handler = QueueHandler(stream.output_stream)

    async def write_audio():
        try:
            chunk_count = 0
            async for chunk in audio_chunks:
                if chunk:
                    chunk_count += 1
                    await stream.input_stream.send_audio_event(audio_chunk=chunk)
            logging.info("[STT] sent %d audio chunks to Transcribe", chunk_count)
        finally:
            await stream.input_stream.end_stream()

    await asyncio.gather(write_audio(), handler.handle_events())
