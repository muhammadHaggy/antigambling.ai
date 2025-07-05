'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MessageCircle, Clock, User } from 'lucide-react';

interface ChatSession {
  id: string;
  characterId: string;
  character: {
    name: string;
    avatar: string;
  } | null;
  title: string;
  createdAt: string;
  updatedAt: string;
  preview: {
    role: string;
    content: string;
    createdAt: string;
  } | null;
}

interface ChatHistoryResponse {
  success: boolean;
  sessions: ChatSession[];
  error?: string;
}

export default function ChatHistoryClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchChatHistory();
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [session, status, router]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/chats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: ChatHistoryResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        setSessions(data.sessions);
      } else {
        throw new Error(data.error || 'Failed to fetch chat history');
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      setError(error instanceof Error ? error.message : 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (session: ChatSession) => {
    router.push(`/chat/${session.characterId}?sessionId=${session.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
          <span>Loading chat history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">Failed to load chat history</div>
          <div className="text-gray-500 mb-4">{error}</div>
          <button
            onClick={fetchChatHistory}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No chat history yet</h3>
          <p className="text-gray-400 mb-6">Start a conversation with a character to see it here</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start Chatting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => handleSessionClick(session)}
            className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <div className="flex items-start space-x-4">
              {/* Character Avatar */}
              <div className="flex-shrink-0">
                {session.character?.avatar ? (
                  <Image
                    src={session.character.avatar}
                    alt={session.character.name || 'Character'}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {session.character?.name || 'Unknown Character'}
                  </h3>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDate(session.updatedAt)}
                  </div>
                </div>

                {/* Last Message Preview */}
                {session.preview && (
                  <div className="text-gray-300 text-sm">
                    <span className="font-medium text-purple-400">
                      {session.preview.role === 'user' ? 'You' : session.character?.name}:
                    </span>{' '}
                    <span className="text-gray-400">{session.preview.content}</span>
                  </div>
                )}

                {/* Session Title (if different from character name) */}
                {session.title && session.title !== `Chat with ${session.character?.name}` && (
                  <div className="text-gray-500 text-sm mt-1">
                    {session.title}
                  </div>
                )}
              </div>

              {/* Message Count Indicator */}
              <div className="flex-shrink-0">
                <MessageCircle className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 