import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCharacterById } from '@/lib/characters';
import { ChatRequest, ChatResponse, GeminiMessage } from '@/lib/types';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: ChatRequest = await request.json();
    const { characterId, chatHistory } = body;

    // Validate request
    if (!characterId || !chatHistory) {
      return NextResponse.json(
        { reply: '', success: false, error: 'Missing characterId or chatHistory' },
        { status: 400 }
      );
    }

    // Get character data
    const character = getCharacterById(characterId);
    if (!character) {
      return NextResponse.json(
        { reply: '', success: false, error: 'Character not found' },
        { status: 404 }
      );
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
      return NextResponse.json(
        { reply: '', success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' 
    });

    // Construct the master prompt with character persona
    const systemInstruction = `CONTEXT: ${character.backgroundStory}

IMPORTANT INSTRUCTIONS:
- You must ALWAYS stay in character as ${character.name}
- Never break character or mention that you are an AI
- Respond as ${character.name} would, using their personality, knowledge, and speaking style
- Draw from the character's background, achievements, and known viewpoints
- Keep responses engaging, authentic, and true to the character
- If asked about topics outside the character's expertise, respond as they would - some might admit limitations, others might relate it to their field`;

    // Convert chat history to Gemini format
    const geminiHistory: GeminiMessage[] = [];
    
    // Add system instruction as the first message
    geminiHistory.push({
      role: 'user',
      parts: [{ text: systemInstruction }]
    });
    
    geminiHistory.push({
      role: 'model',
      parts: [{ text: `Understood. I will respond as ${character.name} and stay in character at all times.` }]
    });

    // Add the character's greeting if this is the first conversation
    if (chatHistory.length === 0) {
      geminiHistory.push({
        role: 'model',
        parts: [{ text: character.greeting }]
      });
    } else {
      // Add existing chat history
      chatHistory.forEach(message => {
        geminiHistory.push({
          role: message.role,
          parts: message.parts
        });
      });
    }

    // Start a chat session with the constructed history
    const chat = model.startChat({
      history: geminiHistory.slice(0, -1), // Remove the last message to send it separately
    });

    // Get the last user message
    const lastMessage = chatHistory[chatHistory.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json(
        { reply: '', success: false, error: 'Last message must be from user' },
        { status: 400 }
      );
    }

    // Send the message and get response
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = await result.response;
    const reply = response.text();

    // Return successful response
    return NextResponse.json({
      reply,
      success: true
    } as ChatResponse);

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Handle specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID')) {
        return NextResponse.json(
          { reply: '', success: false, error: 'Invalid Gemini API key' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('QUOTA_EXCEEDED')) {
        return NextResponse.json(
          { reply: '', success: false, error: 'API quota exceeded' },
          { status: 429 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { reply: '', success: false, error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 