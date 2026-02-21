"use client";

import { useState } from "react";
import { evaluate } from "@/lib/api";
import { useInterviewStore } from "@/lib/state-manager";

export default function InterviewPanel() {
  const {
    transcript,
    setTranscript,
    previousState,
    setPreviousState,
    evaluation,
    setEvaluation,
    isEvaluating,
    setEvaluating,
  } = useInterviewStore();

  const [error, setError] = useState<string | null>(null);

  async function handleEvaluate() {
    setError(null);
    setEvaluating(true);
    try {
      const result = await evaluate({
        transcript: transcript.trim() || "(no transcript)",
        diagram_base64: "",
        previous_state: previousState,
      });
      setEvaluation(result);
      setPreviousState(result.verbal_feedback);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluate failed");
    } finally {
      setEvaluating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Interview (no canvas)</h1>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transcript
        </label>
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2 min-h-[120px] text-sm"
          placeholder="Paste or type what you said (e.g. We use a load balancer and two API servers...)"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Previous state (optional)
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Last feedback from interviewer"
          value={previousState}
          onChange={(e) => setPreviousState(e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={handleEvaluate}
        disabled={isEvaluating}
        className="px-4 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50"
      >
        {isEvaluating ? "Evaluating..." : "Evaluate"}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          {error}
        </div>
      )}

      {evaluation && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Result</h2>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Overall</span>
              <div className="font-medium">{evaluation.overall_score.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-gray-500">Diagram</span>
              <div className="font-medium">{evaluation.diagram_score.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-gray-500">Verbal</span>
              <div className="font-medium">{evaluation.verbal_score.toFixed(2)}</div>
            </div>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Feedback</span>
            <p className="mt-1 text-gray-900">{evaluation.verbal_feedback}</p>
          </div>
          {evaluation.follow_up_question && (
            <div>
              <span className="text-gray-500 text-sm">Follow-up</span>
              <p className="mt-1 text-gray-900">{evaluation.follow_up_question}</p>
            </div>
          )}
          {evaluation.design_aspects.length > 0 && (
            <div>
              <span className="text-gray-500 text-sm">Aspects</span>
              <ul className="mt-1 list-disc list-inside text-sm text-gray-800">
                {evaluation.design_aspects.map((a, i) => (
                  <li key={i}>
                    {a.component}: {a.score.toFixed(2)} – {a.feedback}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
