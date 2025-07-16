import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '../../../../auth';
import { PrismaClient } from '@prisma/client';
import { getCharacterById } from '@/lib/characters';

const prisma = new PrismaClient();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { characterId, message, sessionId } = body;

    // Validate required fields
    if (!characterId || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: characterId and message' },
        { status: 400 }
      );
    }

    // Get character data
    const character = getCharacterById(characterId);
    if (!character) {
      return NextResponse.json(
        { success: false, error: `Character not found: ${characterId}` },
        { status: 404 }
      );
    }

    // Find or create chat session
    let chatSession;
    if (sessionId) {
      // Find existing session
      chatSession = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: session.user.id,
          characterId: characterId
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!chatSession) {
        return NextResponse.json(
          { success: false, error: 'Chat session not found or access denied' },
          { status: 404 }
        );
      }
    } else {
      // Create new session
      chatSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
          characterId: characterId,
          title: `Chat with ${character.name}`
        },
        include: {
          messages: true
        }
      });
    }

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'user',
        content: message
      }
    });

    // Build conversation history for Gemini
    const conversationHistory = chatSession.messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'model',
      parts: [{ text: msg.content }]
    }));

    // Add the new user message
    conversationHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Create system prompt for the character
    const systemPrompt = `You are ${character.name}. ${character.backgroundStory}

Key traits:
- Stay completely in character at all times
- Use the speaking style and personality described in your background
- Draw from your character's knowledge and experiences
- Keep responses conversational and natural
- Keep responses short and concise like a real person

Formatting guidelines:
- Use markdown formatting to make your responses more readable and engaging
- Use **bold** for emphasis on important points
- Use *italics* for emotional emphasis or inner thoughts
- Use bullet points (-) or numbered lists (1.) when listing items or steps
- Use \`code\` formatting for technical terms or specific instructions
- Use > blockquotes for important quotes or key messages
- Use ## headings for structuring longer responses (sparingly)
- Keep formatting natural and don't overuse it

Examples of good formatting:
- "Saya pernah kehilangan **semuanya** karena judi online."
- "Ada beberapa hal yang perlu kamu tahu:
  1. Judi online adalah *jebakan*
  2. Kemenangan awal hanya **umpan**
  3. Rumah selalu menang"

Respond as ${character.name} would, incorporating your personality, background, and appropriate markdown formatting.`;

    try {
      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        systemInstruction: systemPrompt
      });

      // Start chat with history
      const chat = model.startChat({
        history: conversationHistory.slice(0, -1) // All messages except the last one
      });

      // Send the latest message
      const result = await chat.sendMessage(message);
      const aiResponse = result.response.text();

      // Save AI response to database
      const aiMessage = await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          role: 'model',
          content: aiResponse
        }
      });

      // Update session timestamp
      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: { updatedAt: new Date() }
      });

      return NextResponse.json({
        success: true,
        reply: aiResponse,
        sessionId: chatSession.id,
        messageId: aiMessage.id
      });

    } catch (geminiError: unknown) {
      console.error('Gemini API error:', geminiError);
      
      // Handle specific Gemini API errors
      let errorMessage = 'Failed to generate response. Please try again.';
      
      if (geminiError instanceof Error) {
        if (geminiError.message?.includes('quota')) {
          errorMessage = 'Gemini API quota exceeded. Please try again later.';
        } else if (geminiError.message?.includes('safety')) {
          errorMessage = 'Response blocked due to safety filters. Please rephrase your message.';
        } else if (geminiError.message?.includes('authentication')) {
          errorMessage = 'Gemini API authentication failed. Please check your API key.';
        }
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 