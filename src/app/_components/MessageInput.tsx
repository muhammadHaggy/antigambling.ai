'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({ onSendMessage, disabled = false, placeholder = "Type a message..." }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      await onSendMessage(message);
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
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        
        <div className="relative flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
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
            disabled={!message.trim() || disabled}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center"
          >
            {disabled ? (
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