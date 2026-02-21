"""Pydantic schemas for the interview evaluation API (strict validation)."""

from enum import Enum
from typing import Annotated, Literal

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field


class MinimaxEmotion(str, Enum):
    skeptical = "skeptical"
    encouraging = "encouraging"
    concerned = "concerned"
    approving = "approving"
    curious = "curious"
    neutral = "neutral"


class DesignAspect(BaseModel):
    model_config = ConfigDict(strict=True)

    component: str
    score: float = Field(ge=0, le=1)
    feedback: str
    issues: list[str] = Field(default_factory=list)


class InterviewEvaluation(BaseModel):
    model_config = ConfigDict(strict=True)

    transcript: str
    diagram_score: float = Field(ge=0, le=1)
    verbal_score: float = Field(ge=0, le=1)
    overall_score: float = Field(ge=0, le=1)
    design_aspects: list[DesignAspect]
    minimax_emotion: MinimaxEmotion
    verbal_feedback: str
    follow_up_question: str | None = None
    should_interrupt: bool = False


class EvaluateRequest(BaseModel):
    model_config = ConfigDict(strict=True)

    transcript: str
    diagram_base64: str
    previous_state: str = ""


def _coerce_emotion(v: str | MinimaxEmotion) -> MinimaxEmotion:
    if isinstance(v, MinimaxEmotion):
        return v
    s = (v or "").strip().lower()
    for e in MinimaxEmotion:
        if e.value == s:
            return e
    return MinimaxEmotion.neutral


class TTSStreamRequest(BaseModel):
    model_config = ConfigDict(strict=True)

    text: str
    emotion: Annotated[MinimaxEmotion, BeforeValidator(_coerce_emotion)] = MinimaxEmotion.neutral


# API response and WebSocket message models
class HealthResponse(BaseModel):
    model_config = ConfigDict(strict=True)

    status: Literal["ok"] = "ok"


class TranscriptMessage(BaseModel):
    model_config = ConfigDict(strict=True)

    transcript: str


class ErrorMessage(BaseModel):
    model_config = ConfigDict(strict=True)

    error: str


# Internal: LLM JSON shapes (pipeline parsing, strict validation)
class CritiqueDesignAspect(BaseModel):
    model_config = ConfigDict(strict=True)

    component: str
    score: float = Field(ge=0, le=1)
    feedback: str
    issues: list[str] = Field(default_factory=list)


class CritiqueResponse(BaseModel):
    model_config = ConfigDict(strict=True)

    design_aspects: list[CritiqueDesignAspect]
    diagram_score: float = Field(ge=0, le=1)
    verbal_score: float = Field(ge=0, le=1)
    overall_score: float = Field(ge=0, le=1)
    follow_up: str | None = None


class RouterResponse(BaseModel):
    model_config = ConfigDict(strict=True)

    emotion: str
    should_interrupt: bool
    response: str
