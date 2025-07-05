import ChatHeader from '../../_components/ChatHeader';
import ChatLog from '../../_components/ChatLog';
import MessageInput from '../../_components/MessageInput';

// Sample character data
const characters = {
  '1': {
    id: '1',
    name: 'Elon Musk',
    creator: '@ElonMuskAI',
    avatar: '/next.svg',
  },
  '2': {
    id: '2',
    name: 'Socrates',
    creator: '@PhilosopherAI',
    avatar: '/vercel.svg',
  },
  '3': {
    id: '3',
    name: 'Sherlock Holmes',
    creator: '@DetectiveAI',
    avatar: '/file.svg',
  },
  '4': {
    id: '4',
    name: 'Marie Curie',
    creator: '@ScienceAI',
    avatar: '/globe.svg',
  },
  '5': {
    id: '5',
    name: 'Albert Einstein',
    creator: '@GeniusAI',
    avatar: '/window.svg',
  },
  '6': {
    id: '6',
    name: 'Leonardo da Vinci',
    creator: '@RenaissanceAI',
    avatar: '/next.svg',
  },
};

// Sample chat history
const sampleChatHistory = [
  {
    id: '1',
    author: 'character' as const,
    text: 'Hello! I\'m excited to chat with you today. What would you like to discuss?',
    timestamp: new Date('2024-01-15T10:00:00'),
  },
  {
    id: '2',
    author: 'user' as const,
    text: 'Hi there! I\'d love to learn more about your work and innovations.',
    timestamp: new Date('2024-01-15T10:01:00'),
  },
  {
    id: '3',
    author: 'character' as const,
    text: 'That\'s fantastic! I\'m always eager to share insights about technology, space exploration, and sustainable energy. What aspect interests you most?',
    timestamp: new Date('2024-01-15T10:02:00'),
  },
];

interface ChatPageProps {
  params: {
    characterId: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const character = characters[params.characterId as keyof typeof characters];
  
  if (!character) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <p>Character not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <ChatHeader character={character} />
      <ChatLog chatHistory={sampleChatHistory} character={character} />
      <MessageInput characterName={character.name} />
    </div>
  );
} 