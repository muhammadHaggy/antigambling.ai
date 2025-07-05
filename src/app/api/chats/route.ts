import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { PrismaClient } from '@prisma/client';
import { getCharacterById } from '@/lib/characters';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's chat sessions with latest message for preview
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Get only the latest message for preview
        }
      },
      orderBy: {
        updatedAt: 'desc' // Most recently updated first
      }
    });

    // Format the response with character information
    const formattedSessions = chatSessions.map((chatSession: { id: string; characterId: string; title: string | null; createdAt: Date; updatedAt: Date; messages: { role: string; content: string; createdAt: Date }[] }) => {
      const character = getCharacterById(chatSession.characterId);
      const latestMessage = chatSession.messages[0];
      
      return {
        id: chatSession.id,
        characterId: chatSession.characterId,
        character: character ? {
          name: character.name,
          avatar: character.avatar
        } : null,
        title: chatSession.title,
        createdAt: chatSession.createdAt,
        updatedAt: chatSession.updatedAt,
        preview: latestMessage ? {
          role: latestMessage.role,
          content: latestMessage.content.length > 100 
            ? latestMessage.content.substring(0, 100) + '...'
            : latestMessage.content,
          createdAt: latestMessage.createdAt
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      sessions: formattedSessions
    });

  } catch (error: unknown) {
    console.error('Chat history API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Get specific chat session with all messages
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

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get chat session with all messages
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
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

    // Get character information
    const character = getCharacterById(chatSession.characterId);

    return NextResponse.json({
      success: true,
      session: {
        id: chatSession.id,
        characterId: chatSession.characterId,
        character: character,
        title: chatSession.title,
        createdAt: chatSession.createdAt,
        updatedAt: chatSession.updatedAt,
        messages: chatSession.messages.map((msg: { id: string; role: string; content: string; createdAt: Date }) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt
        }))
      }
    });

  } catch (error: unknown) {
    console.error('Get chat session API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 