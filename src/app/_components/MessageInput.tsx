'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useChat, Character } from '@/app/_contexts/ChatContext';

interface MessageInputProps {
  character: Character;
}

export default function MessageInput({ character }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const { sendMessage, chatState } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !chatState.isLoading) {
      await sendMessage(message, character);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="sticky bottom-0 bg-gray-950 border-t border-gray-800 p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {chatState.error && (
          <div className="mb-3 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
            {chatState.error}
          </div>
        )}
        
        <div className="relative flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${character.name}...`}
              disabled={chatState.isLoading}
              className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '48px',
                maxHeight: '128px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!message.trim() || chatState.isLoading}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center"
          >
            {chatState.isLoading ? (
              <div className="w-[18px] h-[18px] border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={18} className="text-white" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 