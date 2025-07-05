import MessageBubble from './MessageBubble';

interface Message {
  id: string;
  author: 'user' | 'character';
  text: string;
  timestamp: Date;
}

interface Character {
  id: string;
  name: string;
  creator: string;
  avatar: string;
}

interface ChatLogProps {
  chatHistory: Message[];
  character: Character;
}

export default function ChatLog({ chatHistory, character }: ChatLogProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-950">
      <div className="max-w-4xl mx-auto">
        {chatHistory.map((message, index) => (
          <MessageBubble
            key={message.id}
            author={message.author}
            text={message.text}
            timestamp={message.timestamp}
            characterAvatar={character.avatar}
            isFirst={index === 0 && message.author === 'character'}
          />
        ))}
      </div>
    </div>
  );
} 