import { ChatPageClient } from './ChatPageClient';
import { getCharacterById } from '@/lib/characters';

interface ChatPageProps {
  params: Promise<{
    characterId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { characterId } = await params;
  const character = getCharacterById(characterId);
  
  if (!character) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <p>Character not found</p>
      </div>
    );
  }

  return <ChatPageClient character={character} />;
} 