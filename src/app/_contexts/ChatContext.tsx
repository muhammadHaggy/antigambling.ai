'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Character } from '@/lib/types';

export interface Message {
  id: string;
  author: 'user' | 'character';
  text: string;
  timestamp: Date;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}

interface ChatContextType {
  chatState: ChatState;
  sendMessage: (text: string, character: Character, documentContext?: string | null) => Promise<void>;
  clearChat: () => void;
  initializeChat: (characterId: string, sessionId?: string) => Promise<void>;
  loadChatSession: (sessionId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [chatStates, setChatStates] = useState<Record<string, ChatState>>({});
  const [currentCharacterId, setCurrentCharacterId] = useState<string>('');

  const getCurrentChatState = useCallback((): ChatState => {
    return chatStates[currentCharacterId] || {
      messages: [],
      isLoading: false,
      error: null,
      sessionId: null,
    };
  }, [chatStates, currentCharacterId]);

  const updateChatState = useCallback((characterId: string, updater: (prev: ChatState) => ChatState) => {
    setChatStates(prev => ({
      ...prev,
      [characterId]: updater(prev[characterId] || {
        messages: [],
        isLoading: false,
        error: null,
        sessionId: null,
      })
    }));
  }, []);

  const loadChatSession = useCallback(async (sessionId: string) => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success && data.session) {
        const characterId = data.session.characterId;
        setCurrentCharacterId(characterId);

        // Convert database messages to our format
        const messages: Message[] = data.session.messages.map((msg: { id: string; role: string; content: string; createdAt: string }) => ({
          id: msg.id,
          author: msg.role === 'user' ? 'user' : 'character',
          text: msg.content,
          timestamp: new Date(msg.createdAt),
        }));

        updateChatState(characterId, prev => ({
          ...prev,
          messages,
          sessionId: data.session.id,
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error('Failed to load chat session:', error);
      updateChatState(currentCharacterId, prev => ({
        ...prev,
        error: 'Failed to load chat session',
        isLoading: false,
      }));
    }
  }, [session, status, updateChatState, currentCharacterId]);

  const initializeChat = useCallback(async (characterId: string, sessionId?: string) => {
    setCurrentCharacterId(characterId);
    
    if (sessionId) {
      // Load existing session
      await loadChatSession(sessionId);
    } else {
      // Initialize empty chat for new session
      updateChatState(characterId, prev => ({
        ...prev,
        messages: [],
        isLoading: false,
        error: null,
        sessionId: null,
      }));
    }
  }, [updateChatState, loadChatSession]);

  const sendMessage = useCallback(async (text: string, character: Character, documentContext?: string | null) => {
    if (!text.trim()) return;

    // Check if user is authenticated
    if (status !== 'authenticated' || !session?.user) {
      updateChatState(character.id, prev => ({
        ...prev,
        error: 'Please sign in to start chatting',
        isLoading: false,
      }));
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      author: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    // Add user message and set loading state
    updateChatState(character.id, prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const currentState = chatStates[character.id];
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: character.id,
          message: text.trim(),
          sessionId: currentState?.sessionId || undefined,
          documentContext: documentContext || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        // Create AI response message
        const aiMessage: Message = {
          id: data.messageId || `ai-${Date.now()}`,
          author: 'character',
          text: data.reply,
          timestamp: new Date(),
        };

        // Update state with AI response and session ID
        updateChatState(character.id, prev => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
          sessionId: data.sessionId,
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error(data.error || 'Failed to get response from API');
      }

    } catch (error) {
      console.error('Chat API error:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          errorMessage = 'Please sign in to continue chatting.';
        } else if (error.message.includes('Gemini API key not configured')) {
          errorMessage = 'API key not configured. Please check the setup guide.';
        } else if (error.message.includes('Character not found')) {
          errorMessage = 'Character not found. Please try a different character.';
        } else if (error.message.includes('quota')) {
          errorMessage = 'API quota exceeded. Please try again later.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        }
      }

      updateChatState(character.id, prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [chatStates, updateChatState, session, status]);

  const clearChat = useCallback(() => {
    if (currentCharacterId) {
      updateChatState(currentCharacterId, () => ({
        messages: [],
        isLoading: false,
        error: null,
        sessionId: null,
      }));
    }
  }, [currentCharacterId, updateChatState]);

  return (
    <ChatContext.Provider
      value={{
        chatState: getCurrentChatState(),
        sendMessage,
        clearChat,
        initializeChat,
        loadChatSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 