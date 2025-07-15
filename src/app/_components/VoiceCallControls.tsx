'use client';

import { PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { VoiceChatStatus } from '../hooks/useVoiceChat';

interface VoiceCallControlsProps {
  status: VoiceChatStatus;
  isMuted: boolean;
  onHangUp: () => void;
  onToggleMute: () => void;
}

export default function VoiceCallControls({
  status,
  isMuted,
  onHangUp,
  onToggleMute,
}: VoiceCallControlsProps) {
  const isDisabled = status === 'connecting' || status === 'error';

  return (
    <div className="flex items-center justify-center space-x-6">
      {/* Mute/Unmute Button */}
      <button
        onClick={onToggleMute}
        disabled={isDisabled}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
          isMuted
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
            : 'bg-gray-700 hover:bg-gray-600 shadow-lg shadow-gray-700/30'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
      >
        {isMuted ? (
          <MicOff size={24} className="text-white" />
        ) : (
          <Mic size={24} className="text-white" />
        )}
      </button>

      {/* Hang Up Button */}
      <button
        onClick={onHangUp}
        className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg shadow-red-500/40"
      >
        <PhoneOff size={32} className="text-white" />
      </button>

      {/* Speaker Button (placeholder for future implementation) */}
      <button
        onClick={() => {
          // TODO: Implement speaker toggle functionality
          console.log('Speaker toggle not implemented yet');
        }}
        disabled={isDisabled}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 bg-gray-700 hover:bg-gray-600 shadow-lg shadow-gray-700/30 ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
        }`}
      >
        <Volume2 size={24} className="text-white" />
      </button>
    </div>
  );
} 