'use client';

import { useEffect } from 'react';
import { useChat } from '@/app/_contexts/ChatContext';
import ChatHeader from '@/app/_components/ChatHeader';
import ChatLog from '@/app/_components/ChatLog';
import MessageInput from '@/app/_components/MessageInput';
import { Character } from '@/lib/types';

interface ChatPageClientProps {
  character: Character;
}

export function ChatPageClient({ character }: ChatPageClientProps) {
  const { initializeChat, chatState } = useChat();
  
  useEffect(() => {
    if (character) {
      initializeChat(character.id);
    }
  }, [character, initializeChat]);

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <ChatHeader character={character} />
      <ChatLog chatHistory={chatState.messages} character={character} />
      <MessageInput character={character} />
    </div>
  );
} 