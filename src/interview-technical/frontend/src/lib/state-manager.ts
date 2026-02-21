import { create } from "zustand";
import type { InterviewEvaluation } from "./api";

export interface ChatMessage {
  role: "user" | "agent";
  text: string;
}

interface InterviewState {
  transcript: string;
  previousState: string;
  evaluation: InterviewEvaluation | null;
  isEvaluating: boolean;
  isPlayingAudio: boolean;
  autoPlayEvaluation: boolean;
  messages: ChatMessage[];
  interviewStarted: boolean;
  initialGreetingText: string | null;
  setTranscript: (t: string) => void;
  appendTranscript: (chunk: string) => void;
  setPreviousState: (s: string) => void;
  setEvaluation: (e: InterviewEvaluation | null) => void;
  setEvaluating: (v: boolean) => void;
  setPlayingAudio: (v: boolean) => void;
  setAutoPlayEvaluation: (v: boolean) => void;
  addMessage: (role: ChatMessage["role"], text: string) => void;
  setInterviewStarted: (v: boolean) => void;
  setInitialGreetingText: (t: string | null) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  transcript: "",
  previousState: "",
  evaluation: null,
  isEvaluating: false,
  isPlayingAudio: false,
  autoPlayEvaluation: false,
  messages: [],
  interviewStarted: false,
  initialGreetingText: null,
  setTranscript: (t) => set({ transcript: t }),
  appendTranscript: (chunk) =>
    set((s) => ({ transcript: (s.transcript + " " + chunk).trim() })),
  setPreviousState: (s) => set({ previousState: s }),
  setEvaluation: (e) => set({ evaluation: e }),
  setEvaluating: (v) => set({ isEvaluating: v }),
  setPlayingAudio: (v) => set({ isPlayingAudio: v }),
  setAutoPlayEvaluation: (v) => set({ autoPlayEvaluation: v }),
  addMessage: (role, text) =>
    set((s) => ({ messages: [...s.messages, { role, text }] })),
  setInterviewStarted: (v) => set({ interviewStarted: v }),
  setInitialGreetingText: (t) => set({ initialGreetingText: t }),
  reset: () =>
    set({
      transcript: "",
      previousState: "",
      evaluation: null,
      isEvaluating: false,
      isPlayingAudio: false,
      autoPlayEvaluation: false,
      messages: [],
      interviewStarted: false,
      initialGreetingText: null,
    }),
}));
