import ChatPageClient from './ChatPageClient';

interface ChatPageProps {
  params: Promise<{ characterId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { characterId } = await params;
  
  return <ChatPageClient characterId={characterId} />;
} 