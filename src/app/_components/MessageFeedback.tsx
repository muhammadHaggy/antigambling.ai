'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface MessageFeedbackProps {
  messageId: string;
  sessionId?: string;
  onFeedbackSubmitted?: (rating: number) => void;
}

export default function MessageFeedback({ 
  messageId, 
  sessionId, 
  onFeedbackSubmitted 
}: MessageFeedbackProps) {
  const [feedbackState, setFeedbackState] = useState<{
    rating: number | null;
    isSubmitting: boolean;
    error: string | null;
  }>({
    rating: null,
    isSubmitting: false,
    error: null,
  });

  const submitFeedback = async (rating: number) => {
    if (feedbackState.isSubmitting || feedbackState.rating !== null) {
      return; // Prevent multiple submissions or changing existing feedback
    }

    setFeedbackState(prev => ({
      ...prev,
      isSubmitting: true,
      error: null,
    }));

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackType: 'message_rating',
          rating,
          messageId,
          sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      if (data.success) {
        setFeedbackState(prev => ({
          ...prev,
          rating,
          isSubmitting: false,
          error: null,
        }));
        
        onFeedbackSubmitted?.(rating);
      } else {
        throw new Error(data.error || 'Failed to submit feedback');
      }

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFeedbackState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to submit feedback',
      }));
    }
  };

  const handleThumbsUp = () => submitFeedback(1);
  const handleThumbsDown = () => submitFeedback(-1);

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Thumbs Up Button */}
      <button
        onClick={handleThumbsUp}
        disabled={feedbackState.isSubmitting || feedbackState.rating !== null}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          feedbackState.rating === 1
            ? 'bg-green-600 text-white' // Selected state
            : feedbackState.rating === -1 || feedbackState.isSubmitting
            ? 'text-gray-600 cursor-not-allowed' // Disabled state
            : 'text-gray-400 hover:text-green-400 hover:bg-green-400/10' // Default state
        }`}
        title={feedbackState.rating === 1 ? 'You liked this message' : 'Like this message'}
      >
        <ThumbsUp size={14} />
      </button>

      {/* Thumbs Down Button */}
      <button
        onClick={handleThumbsDown}
        disabled={feedbackState.isSubmitting || feedbackState.rating !== null}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          feedbackState.rating === -1
            ? 'bg-red-600 text-white' // Selected state
            : feedbackState.rating === 1 || feedbackState.isSubmitting
            ? 'text-gray-600 cursor-not-allowed' // Disabled state
            : 'text-gray-400 hover:text-red-400 hover:bg-red-400/10' // Default state
        }`}
        title={feedbackState.rating === -1 ? 'You disliked this message' : 'Dislike this message'}
      >
        <ThumbsDown size={14} />
      </button>

      {/* Loading indicator */}
      {feedbackState.isSubmitting && (
        <div className="ml-2">
          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error message */}
      {feedbackState.error && (
        <div className="ml-2 text-xs text-red-400" title={feedbackState.error}>
          Failed to submit
        </div>
      )}
    </div>
  );
} 