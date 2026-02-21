const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface DesignAspect {
  component: string;
  score: number;
  feedback: string;
  issues: string[];
}

export type MinimaxEmotion =
  | "skeptical"
  | "encouraging"
  | "concerned"
  | "approving"
  | "curious"
  | "neutral";

export interface InterviewEvaluation {
  transcript: string;
  diagram_score: number;
  verbal_score: number;
  overall_score: number;
  design_aspects: DesignAspect[];
  minimax_emotion: MinimaxEmotion;
  verbal_feedback: string;
  follow_up_question: string | null;
  should_interrupt: boolean;
}

export interface EvaluatePayload {
  transcript: string;
  diagram_base64: string;
  previous_state: string;
}

export async function evaluate(payload: EvaluatePayload): Promise<InterviewEvaluation> {
  const res = await fetch(`${API_URL}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchTTSStream(
  text: string,
  emotion: MinimaxEmotion = "neutral"
): Promise<Response> {
  const res = await fetch(`${API_URL}/tts/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, emotion }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res;
}
