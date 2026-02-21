"use client";

import { useEffect, useRef, useState } from "react";
import { useInterviewStore } from "@/lib/state-manager";

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition)
    : undefined;

const SpeechGrammarListAPI =
  typeof window !== "undefined"
    ? (window.SpeechGrammarList || (window as unknown as { webkitSpeechGrammarList?: typeof SpeechGrammarList }).webkitSpeechGrammarList)
    : undefined;

/** JSGF grammar hint: system design / interview vocabulary to improve recognition. */
const INTERVIEW_GRAMMAR = `
#JSGF V1.0;
grammar interview;
public <word> =
  load balancer | cache | database | API | server | client | scalability |
  microservices | latency | throughput | sharding | replication | consistent hashing |
  message queue | Kafka | Redis | MongoDB | PostgreSQL | MySQL |
  horizontal scaling | vertical scaling | availability | consistency |
  design | diagram | component | service | request | response |
  interview | system | architecture | distributed | cluster |
  database | storage | backup | failover | redundancy |
  authentication | authorization | token | session |
  CDN | DNS | HTTP | HTTPS | REST | WebSocket |
  user | users | data | traffic | scale | scaling ;
`;

export default function SpeechListener({
  onTranscriptUpdate,
  disabled,
}: {
  onTranscriptUpdate?: () => void;
  disabled?: boolean;
}) {
  const appendTranscript = useInterviewStore((s) => s.appendTranscript);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<InstanceType<NonNullable<typeof SpeechRecognitionAPI>> | null>(null);
  const wantsListeningRef = useRef(false);

  const startListening = () => {
    setError(null);
    if (!SpeechRecognitionAPI) {
      setError("Browser speech not supported (use Chrome, Edge, or Safari)");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          if (transcript.trim()) {
            appendTranscript(transcript);
            onTranscriptUpdate?.();
          }
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setError("Microphone access denied");
        stopListening();
      } else if (event.error === "network") {
        setError("Speech needs internet (Chrome uses Google servers). Check connection or type in the transcript box.");
        stopListening();
      } else if (event.error !== "aborted" && event.error !== "no-speech") {
        setError(`Speech: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (wantsListeningRef.current && recognitionRef.current) {
        try {
          recognition.start();
        } catch {
          setListening(false);
        }
      }
    };

    wantsListeningRef.current = true;
    try {
      recognition.start();
      setListening(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to start speech recognition";
      setError(msg);
    }
  };

  const stopListening = () => {
    wantsListeningRef.current = false;
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      try {
        rec.abort();
      } catch {
        // ignore
      }
    }
    setListening(false);
  };

  useEffect(() => {
    return () => stopListening();
  }, []);

  if (disabled) return null;

  return (
    <div className="flex items-center gap-2" style={{ fontFamily: "Calibri, sans-serif" }}>
      <button
        type="button"
        onClick={listening ? stopListening : startListening}
        className={`px-3 py-1.5 text-sm font-bold border-2 border-[#3f3f3f] rounded-sm ${listening ? "bg-[#941870] text-[#e5e5e5] border-[#941870]" : "bg-transparent text-[#e5e5e5] hover:bg-[#941870]/20"}`}
      >
        {listening ? "Stop mic" : "Start mic"}
      </button>
      {error && <span className="text-sm font-bold text-[#f87171]">{error}</span>}
    </div>
  );
}
