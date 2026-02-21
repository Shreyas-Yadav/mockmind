"""Minimax TTS client (speech-02-hd). Returns PCM audio stream."""

import json
import logging
import os
from typing import AsyncIterator

import httpx

from schemas import MinimaxEmotion

MINIMAX_TTS_URL = "https://api.minimax.io/v1/t2a_v2"
MODEL_TTS = "speech-02-hd"


def get_minimax_api_key() -> str:
    key = os.getenv("MINIMAX_API_KEY")
    if not key:
        raise ValueError("MINIMAX_API_KEY not set")
    return key


def _emotion_to_minimax(emotion: MinimaxEmotion) -> str:
    return emotion.value


# Default voice and voice_setting (English_Trustworth_Man, speed 1.15, pitch 0, vol 2.99)
DEFAULT_VOICE_ID = "English_Trustworth_Man"
DEFAULT_VOICE_SETTING = {
    "voice_id": DEFAULT_VOICE_ID,
    "speed": 1.15,
    "pitch": 0,
    "vol": 2.99,
}


async def tts_stream(
    text: str,
    emotion: MinimaxEmotion,
    *,
    voice_id: str = DEFAULT_VOICE_ID,
    speed: float = 1.15,
    pitch: int = 0,
    vol: float = 2.99,
) -> AsyncIterator[bytes]:
    """
    Stream PCM audio from Minimax TTS. Yields raw PCM chunks.
    Uses voice_setting for voice_id, speed, pitch, vol.
    """
    api_key = get_minimax_api_key()
    logging.info("[TTS] Calling Minimax URL=%s voice_id=%s emotion=%s text_len=%d", MINIMAX_TTS_URL, voice_id, emotion.value, len(text))
    payload = {
        "model": MODEL_TTS,
        "text": text,
        "stream": True,
        "output_format": "hex",
        "stream_options": {"exclude_aggregated_audio": True},
        "emotion": _emotion_to_minimax(emotion),
        "voice_setting": {
            "voice_id": voice_id,
            "speed": speed,
            "pitch": pitch,
            "vol": vol,
        },
        "audio_setting": {
            "sample_rate": 24000,
            "format": "pcm",
            "channel": 1,
        },
    }
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            async with client.stream("POST", MINIMAX_TTS_URL, json=payload, headers=headers) as resp:
                logging.info("[TTS] Minimax response status=%d content_type=%s", resp.status_code, resp.headers.get("content-type"))
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    line = line.strip()
                    if not line:
                        continue
                    raw = line
                    if raw.startswith("data:"):
                        raw = raw[5:].strip()
                    try:
                        obj = json.loads(raw)
                    except json.JSONDecodeError:
                        continue
                    items = obj if isinstance(obj, list) else [obj]
                    for item in items:
                        data = item.get("data") if isinstance(item.get("data"), dict) else None
                        if not data:
                            continue
                        status = data.get("status")
                        if status == 2:
                            continue
                        audio_hex = data.get("audio")
                        if not audio_hex or not isinstance(audio_hex, str):
                            continue
                        try:
                            decoded = bytes.fromhex(audio_hex)
                        except ValueError:
                            continue
                        if decoded:
                            yield decoded
    except Exception as e:
        logging.exception("[TTS] Minimax request failed: %s", e)
        raise
