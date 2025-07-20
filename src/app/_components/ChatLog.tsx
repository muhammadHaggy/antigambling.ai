import { useEffect, useRef } from 'react';
import NextImage from 'next/image';
import MessageBubble from './MessageBubble';
import { Character } from '@/lib/types';

interface Message {
  id: string;
  author: 'user' | 'character';
  text: string;
  timestamp: Date;
  documentFilename?: string;
}

interface ChatLogProps {
  messages: Message[];
  character: Character;
  isLoading: boolean;
  error: string | null;
}

export default function ChatLog({ messages, character, isLoading }: ChatLogProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Show greeting message if no messages exist
  const displayMessages = messages.length === 0 && !isLoading ? [
    {
      id: `${character.id}-greeting`,
      author: 'character' as const,
      text: character.greeting,
      timestamp: new Date(),
    }
  ] : messages;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-950">
      <div className="max-w-4xl mx-auto">
        {displayMessages.map((message, index) => (
          <MessageBubble
            key={message.id}
            author={message.author}
            text={message.text}
            timestamp={message.timestamp}
            characterAvatar={character.avatar}
            isFirst={index === 0 && message.author === 'character'}
            documentFilename={message.documentFilename}
          />
        ))}
        
        {isLoading && (
          <div className="flex gap-3 mb-4 justify-start">
            <div className="flex-shrink-0">
              <NextImage
                src={character.avatar}
                alt="Character"
                width={32}
                height={32}
                className="rounded-full bg-gray-700"
              />
            </div>
            <div className="flex items-center px-4 py-2 bg-gray-800 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 