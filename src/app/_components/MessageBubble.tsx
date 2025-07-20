import Image from 'next/image';
import { Paperclip } from 'lucide-react';
import MarkdownMessage from './MarkdownMessage';

interface MessageBubbleProps {
  author: 'user' | 'character';
  text: string;
  timestamp: Date;
  characterAvatar?: string;
  isFirst?: boolean;
  documentFilename?: string;
}

export default function MessageBubble({ 
  author, 
  text, 
  timestamp, 
  characterAvatar,
  isFirst = false,
  documentFilename
}: MessageBubbleProps) {
  const isCharacter = author === 'character';
  
  return (
    <div className={`flex gap-3 mb-4 ${isCharacter ? 'justify-start' : 'justify-end'}`}>
      {isCharacter && (
        <div className="flex-shrink-0">
          <Image
            src={characterAvatar || '/next.svg'}
            alt="Character"
            width={32}
            height={32}
            className="rounded-full bg-gray-700"
          />
        </div>
      )}
      
      <div className={`flex flex-col ${isCharacter ? 'items-start' : 'items-end'} max-w-[70%]`}>
        {isFirst && isCharacter && (
          <div className="mb-2 p-4 bg-gray-800 rounded-lg">
            <Image
              src={characterAvatar || '/next.svg'}
              alt="Character introduction"
              width={200}
              height={150}
              className="rounded-lg mb-2"
            />
          </div>
        )}
        
        {/* Document indicator for user messages */}
        {!isCharacter && documentFilename && (
          <div className="mb-1 px-2 py-1 bg-blue-800/30 border border-blue-700/50 rounded-md flex items-center gap-1.5 max-w-fit">
            <Paperclip size={12} className="text-blue-400" />
            <span className="text-xs text-blue-300 truncate max-w-[150px]" title={documentFilename}>
              {documentFilename}
            </span>
          </div>
        )}
        
        <div
          className={`px-4 py-2 rounded-lg ${
            isCharacter
              ? 'bg-gray-800 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          {isCharacter ? (
            <MarkdownMessage content={text} />
          ) : (
            <p className="text-sm leading-relaxed">{text}</p>
          )}
        </div>
        
        <span className="text-xs text-gray-500 mt-1">
          {timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
      
      {!isCharacter && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
        </div>
      )}
    </div>
  );
} 