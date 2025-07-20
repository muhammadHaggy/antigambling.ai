'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useChat } from '@/app/_contexts/ChatContext';
import { characters } from '@/lib/characters';
import { Character } from '@/lib/types';
import ChatHeader from '@/app/_components/ChatHeader';
import ChatLog from '@/app/_components/ChatLog';
import MessageInput from '@/app/_components/MessageInput';
import VoiceCallOverlay from '@/app/_components/VoiceCallOverlay';
import EndOfSessionSurvey from '@/app/_components/EndOfSessionSurvey';
import { useVoiceChat } from '@/app/hooks/useVoiceChat';

interface ChatPageClientProps {
  characterId: string;
}

export default function ChatPageClient({ characterId }: ChatPageClientProps) {
  const { chatState, sendMessage, initializeChat, resetChatState } = useChat();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [documentContext, setDocumentContext] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showEndOfSessionSurvey, setShowEndOfSessionSurvey] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');

  // Add effect to handle navigation and cleanup
  useEffect(() => {
    // Reset chat state when component mounts or character changes
    resetChatState();

    // Reset survey and timer state when navigating to different character
    setShowEndOfSessionSurvey(false);
    resetInactivityTimer();

    // Find the character and initialize chat
    const foundCharacter = characters.find(c => c.id === characterId);
    setCharacter(foundCharacter || null);
    
    if (foundCharacter) {
      initializeChat(characterId, sessionId || undefined);
    }

    // Reset chat state when unmounting
    return () => {
      resetChatState();
      resetInactivityTimer();
    };
  }, [characterId, sessionId, initializeChat, resetChatState]);

  // Add effect to handle URL update when sessionId is received
  useEffect(() => {
    const currentSessionId = searchParams.get('sessionId');
    if (chatState.sessionId && !currentSessionId) {
      router.replace(`/chat/${characterId}?sessionId=${chatState.sessionId}`);
    }
  }, [chatState.sessionId, characterId, router, searchParams]);

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

  // Inactivity timer for end-of-session survey
  const startInactivityTimer = () => {
    // Clear existing timer if any
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    // Start new timer for 10 minutes (600000ms)
    const timer = setTimeout(() => {
      setShowEndOfSessionSurvey(true);
      setInactivityTimer(null);
    }, 600000); // 10 minutes
    setInactivityTimer(timer);
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      setInactivityTimer(null);
    }
  };

  // Effect to manage inactivity timer based on messages
  useEffect(() => {
    const messages = chatState.messages;
    // Only start timer if we have messages and the last message is from character
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Start timer when AI sends a message
      if (lastMessage.author === 'character' && !chatState.isLoading) {
        startInactivityTimer();
      }
    }
    // Cleanup timer on unmount
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [chatState.messages, chatState.isLoading]);

  // Greeting is now handled in ChatLog component

  const handleSendMessage = async (text: string) => {
    if (character) {
      // Reset inactivity timer when user sends a message
      resetInactivityTimer();
      
      // Send the message with document context and filename as separate parameters
      const newSessionId = await sendMessage(text, character, documentContext, uploadedFileName);
      
      // If this is a new chat and we got a sessionId, update the URL
      if (newSessionId && !searchParams.get('sessionId')) {
        router.replace(`/chat/${characterId}?sessionId=${newSessionId}`);
      }
      
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

  const handleSurveySubmit = async (rating: number, textComment?: string) => {
    if (!chatState.sessionId) {
      console.error('No session ID available for survey submission');
      return;
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackType: 'session_rating',
          rating,
          textComment: textComment || undefined,
          sessionId: chatState.sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit survey');
      }

      console.log('Survey submitted successfully:', data);
    } catch (error) {
      console.error('Error submitting survey:', error);
      throw error; // Re-throw to let the component handle the error
    }
  };

  const handleSurveyClose = () => {
    setShowEndOfSessionSurvey(false);
    // Reset the timer so it doesn't show again for this session
    resetInactivityTimer();
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
          sessionId={chatState.sessionId || undefined}
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

      {/* End of Session Survey */}
      {showEndOfSessionSurvey && (
        <EndOfSessionSurvey
          characterName={character.name}
          onSubmit={handleSurveySubmit}
          onClose={handleSurveyClose}
        />
      )}
    </div>
  );
} 