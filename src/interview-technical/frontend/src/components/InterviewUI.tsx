"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { createPayloadDispatcher } from "@/lib/payload-dispatcher";
import { evaluate } from "@/lib/api";
import { useInterviewStore } from "@/lib/state-manager";
import Whiteboard, { type WhiteboardRef } from "@/components/Whiteboard";
import SpeechListener from "@/components/SpeechListener";
import AudioPlayer from "@/components/AudioPlayer";

export default function InterviewUI() {
  const whiteboardRef = useRef<WhiteboardRef | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  } = useInterviewStore();

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
        System design interview
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

        {/* Right: dialogue / chat */}
        <div className="flex flex-col min-h-0 border-2 border-[#3f3f3f] rounded-sm p-3 bg-[#2a2530]">
          <h2 className="text-sm font-bold text-[#e5e5e5] mb-2" style={{ fontFamily: "Calibri, sans-serif" }}>
            Conversation
          </h2>
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
        </div>
      </div>
    </div>
  );
}
