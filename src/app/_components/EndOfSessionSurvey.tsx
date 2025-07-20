'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';

interface EndOfSessionSurveyProps {
  onSubmit: (rating: number) => void;
  onClose: () => void;
  characterName: string;
}

export default function EndOfSessionSurvey({ 
  onSubmit, 
  onClose, 
  characterName 
}: EndOfSessionSurveyProps) {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedRating === 0 || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(selectedRating);
      onClose();
    } catch (error) {
      console.error('Error submitting survey:', error);
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleStarHover = (rating: number) => {
    setHoveredRating(rating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const displayRating = hoveredRating || selectedRating;

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Very Poor';
      case 2: return 'Poor';
      case 3: return 'Average';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Rate Your Conversation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-300 text-sm mb-4">
            How would you rate your conversation with {characterName}?
          </p>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleStarClick(rating)}
                onMouseEnter={() => handleStarHover(rating)}
                onMouseLeave={handleStarLeave}
                disabled={isSubmitting}
                className="p-1 transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed"
              >
                <Star
                  size={32}
                  className={`transition-colors duration-200 ${
                    rating <= displayRating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-500 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Text */}
          <div className="text-center mb-6">
            <span className="text-sm text-gray-400">
              {getRatingText(displayRating)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedRating === 0 || isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Submit'
            )}
          </button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 text-center mt-3">
          Your feedback helps us improve the conversation experience
        </p>
      </div>
    </div>
  );
} 