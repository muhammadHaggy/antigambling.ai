// Character data types and interfaces
export interface Character {
  id: string;
  name: string;
  avatar: string; // URL to the avatar image
  greeting: string; // The first message the character says
  backgroundStory: string; // The core of the character's persona
  creator: string; // Character creator username
  description: string; // Short description for character cards
  interactions: number; // Number of interactions for display
  tags: string[]; // Character tags/categories
  isPublic: boolean; // Whether the character is publicly available
  createdAt: Date; // When the character was created
  updatedAt: Date; // When the character was last updated
}

// Chat message interface
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  parts: Array<{
    text: string;
  }>;
  timestamp: Date;
}

// Chat history for API requests
export interface ChatHistory {
  characterId: string;
  messages: ChatMessage[];
}

// API request/response types
export interface ChatRequest {
  characterId: string;
  chatHistory: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  success: boolean;
  error?: string;
}

// Gemini API specific types
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{
    text: string;
  }>;
}

export interface GeminiChatHistory {
  history: GeminiMessage[];
}

// Character creation/update types
export interface CreateCharacterRequest {
  name: string;
  avatar: string;
  greeting: string;
  backgroundStory: string;
  description: string;
  tags: string[];
  isPublic: boolean;
}

export interface UpdateCharacterRequest extends Partial<CreateCharacterRequest> {
  id: string;
} 