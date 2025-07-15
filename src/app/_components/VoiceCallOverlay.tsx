'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Character } from '../../lib/types';
import { VoiceChatStatus } from '../hooks/useVoiceChat';
import VoiceCallControls from './VoiceCallControls';
import AudioWaveform from './AudioWaveform';

interface VoiceCallOverlayProps {
  character: Character;
  status: VoiceChatStatus;
  isRecording: boolean;
  error: string | null;
  onHangUp: () => void;

  onToggleMute: () => void;
  isMuted: boolean;
  callDuration: number;
}

export default function VoiceCallOverlay({
  character,
  status,
  isRecording,
  error,
  onHangUp,

  onToggleMute,
  isMuted,
  callDuration,
}: VoiceCallOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Smooth fade-in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = (): string => {
    switch (status) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      case 'recording':
        return isRecording ? 'Listening...' : 'Speaking...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Calling...';
    }
  };

  const getStatusColor = (): string => {
    switch (status) {
      case 'connecting':
        return 'text-yellow-400';
      case 'connected':
      case 'recording':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-between p-8 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Top section - Status and timer */}
      <div className="flex flex-col items-center space-y-4 mt-8">
        <div className="text-center">
          <p className={`text-lg font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </p>
          {status === 'connected' || status === 'recording' ? (
            <p className="text-white text-sm mt-1">
              {formatDuration(callDuration)}
            </p>
          ) : null}
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 max-w-md">
            <p className="text-red-300 text-sm text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Middle section - Character avatar and info */}
      <div className="flex flex-col items-center space-y-6 flex-1 justify-center">
        <div className="relative">
          {/* Avatar with glow effect */}
          <div className={`relative w-48 h-48 rounded-full overflow-hidden border-4 transition-all duration-300 ${
            status === 'recording' && isRecording 
              ? 'border-green-400 shadow-lg shadow-green-400/50' 
              : status === 'connected' || status === 'recording'
              ? 'border-blue-400 shadow-lg shadow-blue-400/30'
              : 'border-gray-500'
          }`}>
            <Image
              src={character.avatar}
              alt={character.name}
              fill
              className="object-cover"
              priority
            />
            
            {/* Pulse animation overlay for speaking */}
            {status === 'recording' && !isRecording && (
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse" />
            )}
          </div>

          {/* Audio waveform around avatar */}
          <AudioWaveform 
            isActive={status === 'recording'} 
            isListening={isRecording}
            size="large"
            className="absolute -inset-8"
          />
        </div>

        {/* Character name and creator */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">{character.name}</h1>
          <p className="text-gray-400 text-lg">{character.creator}</p>
        </div>

        {/* Voice activity indicator */}
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
            status === 'recording' && isRecording 
              ? 'bg-green-400 animate-pulse' 
              : status === 'recording' && !isRecording
              ? 'bg-blue-400 animate-pulse'
              : 'bg-gray-500'
          }`} />
          <span className="text-gray-300 text-sm">
            {status === 'recording' && isRecording ? 'You are speaking' : 
             status === 'recording' && !isRecording ? `${character.name} is speaking` : 
             'Voice chat active'}
          </span>
        </div>
      </div>

      {/* Bottom section - Call controls */}
      <div className="w-full max-w-md">
        <VoiceCallControls
          status={status}
          isMuted={isMuted}
          onHangUp={onHangUp}
          onToggleMute={onToggleMute}
        />
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
} 