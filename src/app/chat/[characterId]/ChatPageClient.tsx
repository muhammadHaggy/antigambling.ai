'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChat } from '@/app/_contexts/ChatContext';
import { characters } from '@/lib/characters';
import { Character } from '@/lib/types';
import ChatHeader from '@/app/_components/ChatHeader';
import ChatLog from '@/app/_components/ChatLog';
import MessageInput from '@/app/_components/MessageInput';
import VoiceCallOverlay from '@/app/_components/VoiceCallOverlay';
import { useVoiceChat } from '@/app/hooks/useVoiceChat';

interface ChatPageClientProps {
  characterId: string;
}

export default function ChatPageClient({ characterId }: ChatPageClientProps) {
  const { chatState, sendMessage, initializeChat } = useChat();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [documentContext, setDocumentContext] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  useEffect(() => {
    // Find the character
    const foundCharacter = characters.find(c => c.id === characterId);
    setCharacter(foundCharacter || null);
    
    if (foundCharacter) {
      initializeChat(characterId, sessionId || undefined);
    }
  }, [characterId, sessionId, initializeChat]);

  // Voice chat hook - only initialize if character is found
  const voiceChat = useVoiceChat(character || characters[0]); // Fallback to first character

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVoiceChatActive && (voiceChat.status === 'connected' || voiceChat.status === 'recording')) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVoiceChatActive, voiceChat.status]);

  // Greeting is now handled in ChatLog component

  const handleSendMessage = async (text: string) => {
    if (character) {
      // Send the message with document context as a separate parameter
      await sendMessage(text, character, documentContext);
      
      // Clear document context and filename after using it once
      if (documentContext) {
        setDocumentContext(null);
        setUploadedFileName(null);
      }
    }
  };

  const handleDocumentUploaded = (summary: string, filename: string) => {
    setDocumentContext(summary);
    setUploadedFileName(filename);
  };

  const handleStartVoiceChat = async () => {
    if (!character) return;
    
    try {
      setIsVoiceChatActive(true);
      await voiceChat.startVoiceChat();
    } catch (error) {
      console.error('Failed to start voice chat:', error);
      setIsVoiceChatActive(false);
    }
  };

  const handleStopVoiceChat = () => {
    voiceChat.forceStopVoiceChat(); // Use force stop for user-initiated stops
    setIsVoiceChatActive(false);
    setIsMuted(false);
    setCallDuration(0);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // Note: Actual mute functionality would be implemented in the voice chat hook
  };

  if (!character) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Character not found</h2>
          <p className="text-gray-400">The character you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ChatHeader 
        character={character} 
        onStartVoiceChat={handleStartVoiceChat}
        isVoiceChatActive={isVoiceChatActive}
      />
      
      <div className="flex-1 flex flex-col min-h-0">
        <ChatLog 
          messages={chatState.messages}
          character={character}
          isLoading={chatState.isLoading}
          error={chatState.error}
        />
        
        <div className="flex-shrink-0 border-t border-gray-700 p-4">
          <MessageInput 
            onSendMessage={handleSendMessage}
            onDocumentUploaded={handleDocumentUploaded}
            disabled={chatState.isLoading}
            placeholder={`Message ${character.name}...`}
            uploadedFileName={uploadedFileName}
          />
          
          {chatState.error && (
            <div className="mt-2 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{chatState.error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Voice Call Overlay */}
      {isVoiceChatActive && (
        <VoiceCallOverlay
          character={character}
          status={voiceChat.status}
          isRecording={voiceChat.isRecording}
          error={voiceChat.error}
          onHangUp={handleStopVoiceChat}
          onToggleMute={handleToggleMute}
          isMuted={isMuted}
          callDuration={callDuration}
        />
      )}
    </div>
  );
} 