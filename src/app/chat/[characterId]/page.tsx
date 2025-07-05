import { ChatPageClient } from './ChatPageClient';

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

interface ChatPageProps {
  params: Promise<{
    characterId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { characterId } = await params;
  const character = characters[characterId as keyof typeof characters];
  
  if (!character) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <p>Character not found</p>
      </div>
    );
  }

  return <ChatPageClient character={character} />;
} 