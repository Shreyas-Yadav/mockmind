/**
 * Dispatches evaluate payload when 1.5s vocal pause is detected or on explicit trigger.
 * Call start() to begin listening for pauses; onPause() is invoked with current transcript.
 */

const PAUSE_MS = 1500;

export function createPayloadDispatcher(
  onPause: (transcript: string) => void,
  getTranscript: () => string
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function schedule() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const t = getTranscript().trim();
      if (t) onPause(t);
      timeoutId = null;
    }, PAUSE_MS);
  }

  function cancel() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function onTranscriptUpdate() {
    schedule();
  }

  function trigger() {
    cancel();
    const t = getTranscript().trim();
    if (t) onPause(t);
  }

  return { onTranscriptUpdate, cancel, trigger };
}
