import { redirect } from 'next/navigation';
import { auth } from '../../../auth';
import ChatHistoryClient from '@/app/_components/ChatHistoryClient';

export default async function ChatsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/');
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">Chat History</h1>
        <p className="text-gray-400 mt-2">Your previous conversations</p>
      </div>
      
      <ChatHistoryClient />
    </div>
  );
} 