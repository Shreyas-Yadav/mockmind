"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { fetchTTSStream } from "@/lib/api";
import type { MinimaxEmotion } from "@/lib/api";
import { useInterviewStore } from "@/lib/state-manager";

const SAMPLE_RATE = 24000;

function decodePCMToFloat32(bytes: ArrayBuffer): Float32Array {
  const view = new DataView(bytes);
  const len = bytes.byteLength / 2;
  const float32 = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const s = view.getInt16(i * 2, true);
    float32[i] = s / (s < 0 ? 0x8000 : 0x7fff);
  }
  return float32;
}

export default function AudioPlayer() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const evaluation = useInterviewStore((s) => s.evaluation);
  const setPlayingAudio = useInterviewStore((s) => s.setPlayingAudio);
  const isPlayingAudio = useInterviewStore((s) => s.isPlayingAudio);
  const autoPlayEvaluation = useInterviewStore((s) => s.autoPlayEvaluation);
  const setAutoPlayEvaluation = useInterviewStore((s) => s.setAutoPlayEvaluation);
  const [error, setError] = useState<string | null>(null);

  const dialogueText =
    evaluation?.follow_up_question?.trim() || evaluation?.verbal_feedback?.trim() || "";

  const playFeedback = useCallback(async () => {
    if (!dialogueText || !evaluation) return;

    setError(null);
    setPlayingAudio(true);
    try {
      const res = await fetchTTSStream(
        dialogueText,
        evaluation.minimax_emotion as MinimaxEmotion
      );
      const buf = await res.arrayBuffer();
      if (buf.byteLength === 0) {
        setError("No audio received");
        setPlayingAudio(false);
        return;
      }

      const ctx = audioContextRef.current ?? new AudioContext({ sampleRate: SAMPLE_RATE });
      if (!audioContextRef.current) audioContextRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      const float32 = decodePCMToFloat32(buf);
      const audioBuffer = ctx.createBuffer(1, float32.length, SAMPLE_RATE);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setPlayingAudio(false);
      source.start(0);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Playback failed";
      setError(message);
      setPlayingAudio(false);
    }
  }, [dialogueText, evaluation, setPlayingAudio]);

  useEffect(() => {
    if (!autoPlayEvaluation || !evaluation || !dialogueText) return;
    setAutoPlayEvaluation(false);
    playFeedback();
  }, [autoPlayEvaluation, evaluation, dialogueText, setAutoPlayEvaluation, playFeedback]);

  return (
    <span className="flex items-center gap-2 font-bold" style={{ fontFamily: "Calibri, sans-serif" }}>
      {isPlayingAudio && (
        <span className="text-xs text-[#e5e5e5]">Agent speaking...</span>
      )}
      {error && (
        <span className="text-xs text-[#f87171]" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
