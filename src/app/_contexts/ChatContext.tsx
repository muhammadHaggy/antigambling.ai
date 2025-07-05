'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Character } from '@/lib/types';

export interface Message {
  id: string;
  author: 'user' | 'character';
  text: string;
  timestamp: Date;
}

// Convert our message format to Gemini API format
interface GeminiMessage {
  id: string;
  role: 'user' | 'model';
  parts: Array<{
    text: string;
  }>;
  timestamp: Date;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

interface ChatContextType {
  chatState: ChatState;
  sendMessage: (text: string, character: Character) => Promise<void>;
  clearChat: () => void;
  initializeChat: (characterId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Local storage utilities
const STORAGE_KEY = 'character-ai-chats';

const saveToStorage = (chatStates: Record<string, ChatState>) => {
  try {
    // Convert dates to strings for storage
    const serializedStates = Object.entries(chatStates).reduce((acc, [key, state]) => {
      acc[key] = {
        ...state,
        messages: state.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
        })),
      };
      return acc;
    }, {} as Record<string, {
      messages: Array<{
        id: string;
        author: 'user' | 'character';
        text: string;
        timestamp: string;
      }>;
      isLoading: boolean;
      error: string | null;
    }>);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedStates));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
};

const loadFromStorage = (): Record<string, ChatState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const parsed = JSON.parse(stored);
    const result: Record<string, ChatState> = {};
    
    // Convert string dates back to Date objects
    for (const [key, state] of Object.entries(parsed)) {
      const chatState = state as {
        messages: Array<{
          id: string;
          author: 'user' | 'character';
          text: string;
          timestamp: string;
        }>;
        isLoading: boolean;
        error: string | null;
      };
      
      result[key] = {
        ...chatState,
        messages: chatState.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      };
    }
    
    return result;
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return {};
  }
};

// Convert our message format to Gemini API format
const convertToGeminiFormat = (messages: Message[]): GeminiMessage[] => {
  return messages.map(msg => ({
    id: msg.id,
    role: msg.author === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
    timestamp: msg.timestamp,
  }));
};

// API call to backend
const callChatAPI = async (characterId: string, chatHistory: GeminiMessage[]): Promise<string> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      characterId,
      chatHistory,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to get response from API');
  }

  return data.reply;
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatStates, setChatStates] = useState<Record<string, ChatState>>({});
  const [currentCharacterId, setCurrentCharacterId] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedStates = loadFromStorage();
    setChatStates(savedStates);
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever chatStates changes
  useEffect(() => {
    if (isHydrated) {
      saveToStorage(chatStates);
    }
  }, [chatStates, isHydrated]);

  const getCurrentChatState = useCallback((): ChatState => {
    return chatStates[currentCharacterId] || {
      messages: [],
      isLoading: false,
      error: null,
    };
  }, [chatStates, currentCharacterId]);

  const updateChatState = useCallback((characterId: string, updater: (prev: ChatState) => ChatState) => {
    setChatStates(prev => ({
      ...prev,
      [characterId]: updater(prev[characterId] || {
        messages: [],
        isLoading: false,
        error: null,
      })
    }));
  }, []);

  const initializeChat = useCallback((characterId: string) => {
    setCurrentCharacterId(characterId);
    
    // Don't add initial message here - let the backend handle greetings
    // Just ensure the chat state exists
    if (!chatStates[characterId]) {
      updateChatState(characterId, prev => ({
        ...prev,
        messages: [],
        isLoading: false,
        error: null,
      }));
    }
  }, [chatStates, updateChatState]);

  const sendMessage = useCallback(async (text: string, character: Character) => {
    if (!text.trim()) return;

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
      // Get current chat history including the new user message
      const currentState = chatStates[character.id] || { messages: [], isLoading: false, error: null };
      const allMessages = [...currentState.messages, userMessage];
      
      // Convert to Gemini format for API call
      const geminiHistory = convertToGeminiFormat(allMessages);

      // Call the API
      const reply = await callChatAPI(character.id, geminiHistory);

      // Create AI response message
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        author: 'character',
        text: reply,
        timestamp: new Date(),
      };

      // Update state with AI response
      updateChatState(character.id, prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false,
        error: null,
      }));

    } catch (error) {
      console.error('Chat API error:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Gemini API key not configured')) {
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
  }, [chatStates, updateChatState]);

  const clearChat = useCallback(() => {
    if (currentCharacterId) {
      updateChatState(currentCharacterId, () => ({
        messages: [],
        isLoading: false,
        error: null,
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