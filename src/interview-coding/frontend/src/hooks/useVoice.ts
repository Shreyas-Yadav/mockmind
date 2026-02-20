import { useState, useEffect, useCallback, useRef } from 'react';
import {
  UseVoiceReturn,
  VoiceSettings,
  DEFAULT_VOICE_SETTINGS,
} from '../lib/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export function useVoice(): UseVoiceReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const finalTranscriptRef = useRef<string>(''); // Track final transcript separately

  // Check browser support
  useEffect(() => {
    const hasSpeechRecognition =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    
    const hasSpeechSynthesis =
      typeof window !== 'undefined' && 'speechSynthesis' in window;

    setIsSupported(hasSpeechRecognition && hasSpeechSynthesis);

    if (hasSpeechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }

    if (!hasSpeechRecognition) {
      setError('Speech recognition is not supported in this browser');
    }

    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore errors during cleanup
        }
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsRecording(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptPart = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcriptPart + ' ';
          setConfidence(result[0].confidence);
        } else {
          interimTranscript += transcriptPart;
        }
      }

      // Update final transcript if we have new final results
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
        setTranscript(finalTranscriptRef.current + interimTranscript);
      } else if (interimTranscript) {
        // Show interim results without adding to final
        setTranscript(finalTranscriptRef.current + interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Speech recognition error';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your device.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error occurred. Please check your connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      setError(errorMessage);
      setIsRecording(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    return recognition;
  }, []);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    const recognition = initializeRecognition();
    if (!recognition) {
      setError('Failed to initialize speech recognition');
      return;
    }

    try {
      // Clear previous transcript and reset final transcript ref
      setTranscript('');
      finalTranscriptRef.current = '';
      setConfidence(0);
      setError(null);
      
      recognition.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Failed to start recording. Please try again.');
    }
  }, [isSupported, initializeRecognition]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    setIsRecording(false);
  }, []);

  const playText = useCallback(
    async (text: string): Promise<void> => {
      if (!synthRef.current) {
        console.warn('Speech synthesis not available');
        return;
      }

      if (!settings.enabled) {
        console.log('Voice playback is disabled');
        return;
      }

      // Cancel any ongoing speech
      synthRef.current.cancel();

      return new Promise((resolve, reject) => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Apply settings
          utterance.rate = settings.rate;
          utterance.pitch = settings.pitch;
          utterance.volume = settings.volume;

          // Use selected voice if available
          if (settings.voice) {
            utterance.voice = settings.voice;
          }

          utterance.onend = () => {
            console.log('Speech synthesis finished');
            currentUtteranceRef.current = null;
            resolve();
          };

          utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            currentUtteranceRef.current = null;
            reject(new Error(`Speech synthesis failed: ${event.error}`));
          };

          currentUtteranceRef.current = utterance;
          if (synthRef.current) {
            synthRef.current.speak(utterance);
          }
        } catch (err) {
          console.error('Error in playText:', err);
          reject(err);
        }
      });
    },
    [settings]
  );

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Auto-play agent messages if enabled
  useEffect(() => {
    if (settings.autoPlay) {
      // This would be triggered by parent component passing messages
      // Implementation depends on integration with chat system
    }
  }, [settings.autoPlay]);

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return {
    isRecording,
    isSupported,
    transcript,
    confidence,
    error,
    startRecording,
    stopRecording,
    playText,
    settings,
    updateSettings,
  };
}
