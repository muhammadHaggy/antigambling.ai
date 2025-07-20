import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get the user session to ensure they're authenticated
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { feedbackType, rating, textComment, messageId, sessionId } = body;

    // Validate required fields
    if (!feedbackType) {
      return NextResponse.json(
        { error: 'feedbackType is required' },
        { status: 400 }
      );
    }

    // Validate feedbackType values
    const validFeedbackTypes = ['message_rating', 'session_rating', 'weekly_checkin'];
    if (!validFeedbackTypes.includes(feedbackType)) {
      return NextResponse.json(
        { error: 'Invalid feedbackType. Must be one of: ' + validFeedbackTypes.join(', ') },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
      // For message_rating: -1 (thumbs down) or +1 (thumbs up)
      // For session_rating and weekly_checkin: 1-5 stars
      if (feedbackType === 'message_rating') {
        if (rating !== -1 && rating !== 1) {
          return NextResponse.json(
            { error: 'Rating for message_rating must be -1 (thumbs down) or 1 (thumbs up)' },
            { status: 400 }
          );
        }
      } else if (feedbackType === 'session_rating' || feedbackType === 'weekly_checkin') {
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          return NextResponse.json(
            { error: 'Rating for session_rating and weekly_checkin must be an integer between 1 and 5' },
            { status: 400 }
          );
        }
      }
    }

    // Validate messageId exists if provided
    if (messageId) {
      const message = await prisma.chatMessage.findUnique({
        where: { id: messageId }
      });
      if (!message) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }
    }

    // Validate sessionId exists if provided
    if (sessionId) {
      const chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId }
      });
      if (!chatSession) {
        return NextResponse.json(
          { error: 'Chat session not found' },
          { status: 404 }
        );
      }
    }

    // Create the feedback record
    const feedback = await prisma.feedback.create({
      data: {
        userId: user.id,
        feedbackType,
        rating: rating || null,
        textComment: textComment || null,
        messageId: messageId || null,
        sessionId: sessionId || null,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        feedback: {
          id: feedback.id,
          feedbackType: feedback.feedbackType,
          rating: feedback.rating,
          textComment: feedback.textComment,
          createdAt: feedback.createdAt
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve feedback (optional, for admin/analytics)
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get feedback for the current user
    const feedback = await prisma.feedback.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        message: true,
        session: true
      }
    });

    return NextResponse.json({ feedback });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 