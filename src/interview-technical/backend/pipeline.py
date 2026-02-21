"""DSPy-style evaluation pipeline: parallel Sonnet (diagram critique) + Haiku (routing)."""

import json
import re

from schemas import (
    CritiqueResponse,
    DesignAspect,
    InterviewEvaluation,
    MinimaxEmotion,
    RouterResponse,
)
from bedrock_client import (
    get_bedrock_runtime,
    invoke_claude_with_image,
    HAIKU_ID,
    SONNET_ID,
)

CRITIQUE_PROMPT = """You are a senior system design interviewer. Analyze the candidate's diagram and verbal explanation.

Transcript:
{transcript}

Respond with a single JSON object (no markdown, no code block) with exactly these keys:
- "design_aspects": list of objects with "component", "score" (0-1), "feedback", "issues" (list of strings)
- "diagram_score": number 0-1 (visual design quality)
- "verbal_score": number 0-1 (explanation clarity)
- "overall_score": number 0-1 (weighted final)
- "follow_up": one short probing question string, or null
"""

ROUTER_PROMPT = """You are routing the interview conversation. Based on transcript and previous state, output JSON only (no markdown) with:
- "emotion": one of skeptical, encouraging, concerned, approving, curious, neutral
- "should_interrupt": boolean
- "response": short feedback text to speak to the candidate

Previous state: {previous_state}

Transcript: {transcript}
"""


def _strip_json_block(raw: str) -> str:
    raw = raw.strip()
    if "```" in raw:
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
    return raw


def _parse_critique(raw: str) -> CritiqueResponse:
    """Extract and validate critique JSON from model response."""
    data = json.loads(_strip_json_block(raw))
    return CritiqueResponse.model_validate(data)


def _parse_router(raw: str) -> RouterResponse:
    """Extract and validate router JSON from model response."""
    data = json.loads(_strip_json_block(raw))
    return RouterResponse.model_validate(data)


def _safe_emotion(s: str) -> MinimaxEmotion:
    try:
        return MinimaxEmotion(s.lower().strip())
    except ValueError:
        return MinimaxEmotion.neutral


def _design_aspects_from_critique(c: CritiqueResponse) -> list[DesignAspect]:
    return [
        DesignAspect(
            component=a.component,
            score=a.score,
            feedback=a.feedback,
            issues=a.issues,
        )
        for a in c.design_aspects
    ]


async def run_evaluation_pipeline(
    transcript: str,
    diagram_base64: str,
    previous_state: str = "",
) -> InterviewEvaluation:
    """Run Sonnet (critique) and Haiku (router) in parallel, merge and validate."""
    import asyncio

    client = get_bedrock_runtime()

    def run_sonnet() -> str:
        prompt = CRITIQUE_PROMPT.format(transcript=transcript)
        return invoke_claude_with_image(
            client, SONNET_ID, prompt, image_base64=diagram_base64 or None, max_tokens=2048
        )

    def run_haiku() -> str:
        prompt = ROUTER_PROMPT.format(previous_state=previous_state or "none", transcript=transcript)
        return invoke_claude_with_image(client, HAIKU_ID, prompt, max_tokens=1024)

    critique_raw, router_raw = await asyncio.gather(
        asyncio.get_event_loop().run_in_executor(None, run_sonnet),
        asyncio.get_event_loop().run_in_executor(None, run_haiku),
    )

    c = _parse_critique(critique_raw)
    r = _parse_router(router_raw)

    design_aspects = _design_aspects_from_critique(c)
    follow_up = c.follow_up.strip() or None if c.follow_up else None

    return InterviewEvaluation(
        transcript=transcript,
        diagram_score=c.diagram_score,
        verbal_score=c.verbal_score,
        overall_score=c.overall_score,
        design_aspects=design_aspects,
        minimax_emotion=_safe_emotion(r.emotion),
        verbal_feedback=r.response,
        follow_up_question=follow_up,
        should_interrupt=r.should_interrupt,
    )
