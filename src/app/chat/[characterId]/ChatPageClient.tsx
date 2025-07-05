'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChat } from '@/app/_contexts/ChatContext';
import { characters } from '@/lib/characters';
import { Character } from '@/lib/types';
import ChatHeader from '@/app/_components/ChatHeader';
import ChatLog from '@/app/_components/ChatLog';
import MessageInput from '@/app/_components/MessageInput';

interface ChatPageClientProps {
  characterId: string;
}

export default function ChatPageClient({ characterId }: ChatPageClientProps) {
  const { chatState, sendMessage, initializeChat } = useChat();
  const [character, setCharacter] = useState<Character | null>(null);
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

  // Greeting is now handled in ChatLog component

  const handleSendMessage = async (text: string) => {
    if (character) {
      await sendMessage(text, character);
    }
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
      <ChatHeader character={character} />
      
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
            disabled={chatState.isLoading}
            placeholder={`Message ${character.name}...`}
          />
          
          {chatState.error && (
            <div className="mt-2 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{chatState.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 