'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useVoice } from '../hooks/useVoice';
import { VoiceSettings } from '../lib/types';

interface VoiceControlsProps {
  onTranscriptComplete?: (transcript: string) => void;
  className?: string;
}

export function VoiceControls({
  onTranscriptComplete,
  className = '',
}: VoiceControlsProps) {
  const {
    isRecording,
    isSupported,
    transcript,
    error,
    startRecording,
    stopRecording,
    playText,
    settings,
    updateSettings,
  } = useVoice();

  const [showSettings, setShowSettings] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');

  // Handle transcript completion
  useEffect(() => {
    if (!isRecording && transcript && transcript !== lastTranscript) {
      setLastTranscript(transcript);
      if (onTranscriptComplete) {
        onTranscriptComplete(transcript.trim());
      }
    }
  }, [isRecording, transcript, lastTranscript, onTranscriptComplete]);

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleToggleVoice = () => {
    updateSettings({ enabled: !settings.enabled });
  };

  const handleToggleAutoPlay = () => {
    updateSettings({ autoPlay: !settings.autoPlay });
  };

  if (!isSupported) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        Voice features not supported in this browser
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Microphone Button */}
      <Button
        variant={isRecording ? 'destructive' : 'outline'}
        size="icon"
        onClick={handleMicClick}
        title={isRecording ? 'Stop recording' : 'Start recording'}
        className={isRecording ? 'animate-pulse' : ''}
      >
        {isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* Voice Output Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleToggleVoice}
        title={settings.enabled ? 'Disable voice output' : 'Enable voice output'}
      >
        {settings.enabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>

      {/* Settings Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowSettings(!showSettings)}
        title="Voice settings"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-muted-foreground">Recording...</span>
        </div>
      )}

      {/* Interim Transcript Display */}
      {isRecording && transcript && (
        <div className="text-sm text-muted-foreground italic max-w-xs truncate">
          {transcript}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-sm text-destructive max-w-xs truncate" title={error}>
          {error}
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Card className="absolute top-full mt-2 right-0 p-4 w-80 z-50 shadow-lg">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Voice Settings</h3>

            {/* Auto-play Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm">Auto-play responses</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleAutoPlay}
              >
                {settings.autoPlay ? 'On' : 'Off'}
              </Button>
            </div>

            {/* Speech Rate */}
            <div className="space-y-2">
              <label className="text-sm">Speech Rate: {settings.rate.toFixed(1)}</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.rate}
                onChange={(e) =>
                  updateSettings({ rate: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Pitch */}
            <div className="space-y-2">
              <label className="text-sm">Pitch: {settings.pitch.toFixed(1)}</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.pitch}
                onChange={(e) =>
                  updateSettings({ pitch: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <label className="text-sm">Volume: {Math.round(settings.volume * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) =>
                  updateSettings({ volume: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Test Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => playText('This is a test of the voice synthesis system.')}
              className="w-full"
            >
              Test Voice
            </Button>

            {/* Close Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSettings(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
