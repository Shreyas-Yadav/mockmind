"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { createPayloadDispatcher } from "@/lib/payload-dispatcher";
import { evaluate } from "@/lib/api";
import { useInterviewStore } from "@/lib/state-manager";
import Whiteboard, { type WhiteboardRef } from "@/components/Whiteboard";
import SpeechListener from "@/components/SpeechListener";
import AudioPlayer from "@/components/AudioPlayer";

const STARTER_PROBLEMS: string[] = [
  "Explain a binary search tree and how you would implement search.",
  "Explain how you would find the maximum subarray sum in an array (e.g. Kadane's algorithm or brute force).",
  "What is supervised fine-tuning (SFT) in the context of large language models?",
  "Explain linear regression: what it models and how parameters are typically learned.",
  "Explain the difference between a stack and a queue with one use case for each.",
  "What is overfitting in machine learning and how can you try to reduce it?",
  "Explain how a hash map works and what average-time operations it supports.",
];

function pickStarterProblem(): string {
  return STARTER_PROBLEMS[Math.floor(Math.random() * STARTER_PROBLEMS.length)];
}

export default function InterviewUI() {
  const whiteboardRef = useRef<WhiteboardRef | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialProblem, setInitialProblem] = useState<string | null>(null);

  useEffect(() => {
    setInitialProblem(pickStarterProblem());
  }, []);

  const {
    transcript,
    setTranscript,
    previousState,
    setPreviousState,
    evaluation,
    setEvaluation,
    isEvaluating,
    setEvaluating,
    addMessage,
    setAutoPlayEvaluation,
    messages,
    interviewStarted,
    setInterviewStarted,
    setInitialGreetingText,
  } = useInterviewStore();

  const handleStartInterview = useCallback(() => {
    const problem = initialProblem ?? STARTER_PROBLEMS[0];
    const greeting =
      "Hi, welcome to the technical interview. Let's start with something straightforward. " +
      problem;
    addMessage("agent", greeting);
    setPreviousState(greeting);
    setInterviewStarted(true);
    setInitialGreetingText(greeting);
  }, [initialProblem, addMessage, setPreviousState, setInterviewStarted, setInitialGreetingText]);

  const runEvaluate = useCallback(
    async (transcriptText: string) => {
      setError(null);
      setEvaluating(true);
      const text = transcriptText.trim() || "(no transcript)";
      try {
        const diagramBase64 = await whiteboardRef.current?.getDiagramBase64?.() ?? "";
        const result = await evaluate({
          transcript: text,
          diagram_base64: diagramBase64,
          previous_state: previousState,
        });
        const agentText =
          result.follow_up_question?.trim() || result.verbal_feedback?.trim() || "";
        addMessage("user", text);
        if (agentText) addMessage("agent", agentText);
        setEvaluation(result);
        setPreviousState(agentText);
        setTranscript("");
        if (agentText) setAutoPlayEvaluation(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Evaluate failed");
      } finally {
        setEvaluating(false);
      }
    },
    [
      previousState,
      setEvaluation,
      setEvaluating,
      setPreviousState,
      setTranscript,
      addMessage,
      setAutoPlayEvaluation,
    ]
  );

  useEffect(() => {
    const getTranscript = () => useInterviewStore.getState().transcript;
    const dispatcher = createPayloadDispatcher((t) => {
      runEvaluate(t);
    }, getTranscript);

    let prevTranscript = getTranscript();
    const unsub = useInterviewStore.subscribe(() => {
      const next = getTranscript();
      if (next !== prevTranscript) {
        prevTranscript = next;
        dispatcher.onTranscriptUpdate();
      }
    });

    return () => {
      unsub();
      dispatcher.cancel();
    };
  }, [runEvaluate]);

  return (
    <div className="h-screen flex flex-col p-4 text-[#e5e5e5] font-bold">
      <h1 className="text-xl font-bold mb-2" style={{ fontFamily: "Calibri, sans-serif" }}>
        Technical interview
      </h1>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-4 min-h-0">
        {/* Left: whiteboard + mic */}
        <div className="flex flex-col min-h-0 border-2 border-[#3f3f3f] rounded-sm p-3 bg-[#2a2530]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="text-sm font-bold text-[#e5e5e5]">Whiteboard</label>
            <SpeechListener onTranscriptUpdate={() => {}} />
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <Whiteboard whiteboardRef={whiteboardRef} />
          </div>
        </div>

        {/* Right: dialogue / chat or startup */}
        <div className="flex flex-col min-h-0 border-2 border-[#3f3f3f] rounded-sm p-3 bg-[#2a2530]">
          <h2 className="text-sm font-bold text-[#e5e5e5] mb-2" style={{ fontFamily: "Calibri, sans-serif" }}>
            Conversation
          </h2>
          {!interviewStarted ? (
            <div className="flex-1 flex flex-col justify-center min-h-0">
              <p className="text-sm font-bold text-[#e5e5e5] mb-4">
                Welcome. We will start with an easy question to get going.
              </p>
              <p className="text-sm text-[#c4b5d0] mb-2">First question:</p>
              <p className="text-sm font-bold text-[#e5e5e5] mb-6 px-3 py-2 bg-[#3f3f3f] rounded-sm border-l-4 border-[#941870] min-h-[4rem]">
                {initialProblem ?? "Choosing your first question…"}
              </p>
              <button
                type="button"
                onClick={handleStartInterview}
                disabled={!initialProblem}
                className="w-full py-2.5 px-4 rounded-sm font-bold text-[#e5e5e5] bg-[#941870] hover:bg-[#b01d8a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ fontFamily: "Calibri, sans-serif" }}
              >
                Start interview
              </button>
            </div>
          ) : (
            <>
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-0">
            {messages.length === 0 && !transcript && (
              <p className="text-sm font-bold text-[#e5e5e5]">
                Start mic and speak. After a short pause, the agent will respond with voice.
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`px-3 py-2 text-sm font-bold rounded-sm text-[#e5e5e5] ${
                  msg.role === "user"
                    ? "bg-[#941870]/20 border-l-4 border-[#3f3f3f] ml-4"
                    : "bg-[#3f3f3f] border-l-4 border-[#3f3f3f] mr-4"
                }`}
              >
                <span className="text-xs uppercase text-[#e5e5e5]">
                  {msg.role === "user" ? "You" : "Interviewer"}
                </span>
                <p className="mt-0.5 whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))}
            {transcript && (
              <div className="px-3 py-2 text-sm font-bold rounded-sm bg-[#941870]/15 border-l-4 border-[#3f3f3f] text-[#e5e5e5]">
                <span className="text-xs uppercase">You (live)</span>
                <p className="mt-0.5">{transcript}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <AudioPlayer />
            {isEvaluating && (
              <span className="text-xs font-bold text-[#e5e5e5]">Evaluating...</span>
            )}
          </div>
          {error && (
            <p className="text-xs font-bold text-[#f87171] mt-2">{error}</p>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
