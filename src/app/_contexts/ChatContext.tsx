'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export interface Message {
  id: string;
  author: 'user' | 'character';
  text: string;
  timestamp: Date;
}

export interface Character {
  id: string;
  name: string;
  creator: string;
  avatar: string;
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

// Character-specific response templates
const characterResponses: Record<string, string[]> = {
  '1': [ // Elon Musk
    "That's a fascinating perspective! You know, at Tesla and SpaceX, we're always pushing the boundaries of what's possible.",
    "Innovation is key to humanity's future. Whether it's sustainable energy or making life multiplanetary, we need to think big.",
    "I believe in first principles thinking. Let's break this down to its fundamental components.",
    "The future is going to be wild! We're working on technologies that seemed impossible just a few years ago.",
  ],
  '2': [ // Socrates
    "An excellent question! But tell me, what do you think you already know about this subject?",
    "I know that I know nothing. Perhaps we can explore this together through questioning.",
    "Is it not curious that the more we learn, the more we realize how little we truly understand?",
    "Let us examine this assumption. What evidence do we have for believing this to be true?",
  ],
  '3': [ // Sherlock Holmes
    "Fascinating! The details you've provided suggest several possible deductions.",
    "Elementary! When you eliminate the impossible, whatever remains, however improbable, must be the truth.",
    "I observe that you have a keen interest in this matter. Tell me, what other clues have you noticed?",
    "The game is afoot! Your observation skills are improving, though there's always more to see.",
  ],
  '4': [ // Marie Curie
    "Science is built on curiosity and persistence. Your question shows both qualities!",
    "In my research, I've learned that discovery often comes from careful observation and methodical work.",
    "Knowledge belongs to humanity. I'm delighted to share what I've learned through my experiments.",
    "Nothing in life is to be feared, it is only to be understood. Let's explore this together.",
  ],
  '5': [ // Albert Einstein
    "Imagination is more important than knowledge. Your question sparks interesting possibilities!",
    "The important thing is not to stop questioning. Curiosity has its own reason for existence.",
    "I have no special talent. I am only passionately curious about the universe around us.",
    "Try not to become a person of success, but rather try to become a person of value.",
  ],
  '6': [ // Leonardo da Vinci
    "Curiosity about life in all its aspects is the secret of great creative minds.",
    "Learning never exhausts the mind. Your question opens new avenues of exploration!",
    "Art and science are not separate realms, but different ways of understanding our world.",
    "I have been impressed with the urgency of doing. Knowing is not enough; we must apply.",
  ],
};

// Default responses for unknown characters
const defaultResponses = [
  "That's an interesting point! I'd love to hear more about your thoughts on this.",
  "I appreciate you sharing that with me. What made you think about this topic?",
  "Your perspective is valuable. How do you think we could explore this further?",
  "Thank you for bringing this up. It's given me something new to consider.",
];

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
    
    // Initialize with default message if no messages exist
    if (!chatStates[characterId]?.messages.length) {
      const initialMessage: Message = {
        id: `${characterId}-initial`,
        author: 'character',
        text: "Hello! I'm excited to chat with you today. What would you like to discuss?",
        timestamp: new Date(),
      };
      
      updateChatState(characterId, prev => ({
        ...prev,
        messages: [initialMessage],
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
      // Simulate AI response delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Generate AI response
      const responses = characterResponses[character.id] || defaultResponses;
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        author: 'character',
        text: randomResponse,
        timestamp: new Date(),
      };

      updateChatState(character.id, prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false,
      }));

    } catch {
      updateChatState(character.id, prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to send message. Please try again.',
      }));
    }
  }, [updateChatState]);

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