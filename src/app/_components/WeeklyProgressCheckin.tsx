'use client';

import { useState } from 'react';
import { Calendar, X } from 'lucide-react';

interface WeeklyProgressCheckinProps {
  onSubmit: (rating: number) => void;
  onClose: () => void;
}

export default function WeeklyProgressCheckin({ 
  onSubmit, 
  onClose 
}: WeeklyProgressCheckinProps) {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedRating === 0 || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(selectedRating);
      onClose();
    } catch (error) {
      console.error('Error submitting weekly check-in:', error);
      setIsSubmitting(false);
    }
  };

  const progressOptions = [
    {
      value: 1,
      label: 'Jauh Lebih Buruk',
      description: 'Kendali diri saya menurun secara signifikan',
      color: 'bg-red-600 hover:bg-red-700 border-red-500'
    },
    {
      value: 2,
      label: 'Lebih Buruk',
      description: 'Kendali diri saya agak menurun',
      color: 'bg-orange-600 hover:bg-orange-700 border-orange-500'
    },
    {
      value: 3,
      label: 'Tidak Ada Perubahan',
      description: 'Tingkat Kendali diri saya tetap sama',
      color: 'bg-gray-600 hover:bg-gray-700 border-gray-500'
    },
    {
      value: 4,
      label: 'Lebih Baik',
      description: 'Kendali diri saya agak membaik',
      color: 'bg-blue-600 hover:bg-blue-700 border-blue-500'
    },
    {
      value: 5,
      label: 'Jauh Lebih Baik',
      description: 'Kendali diri saya membaik secara signifikan',
      color: 'bg-green-600 hover:bg-green-700 border-green-500'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-lg w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Weekly Progress Check-in
              </h2>
              <p className="text-gray-400 text-sm">
                How are you doing this week?
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-gray-700"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Question */}
        <div className="mb-6">
          <h3 className="text-base font-semibold text-white mb-2">
            Selama seminggu terakhir, bagaimana Anda menilai kontrol Anda terhadap emosi dan reaksi Anda?
          </h3>
          <p className="text-gray-300 text-sm">
            Ini membantu kami memahami perkembangan Anda dan meningkatkan pengalaman Anda.
          </p>
        </div>

        {/* Progress Options */}
        <div className="space-y-2 mb-6">
          {progressOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedRating(option.value)}
              disabled={isSubmitting}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedRating === option.value
                  ? `${option.color} border-opacity-100 text-white`
                  : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">
                    {option.label}
                  </div>
                  <div className="text-xs opacity-80">
                    {option.description}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                  selectedRating === option.value
                    ? 'bg-white border-white'
                    : 'border-gray-400'
                }`}>
                  {selectedRating === option.value && (
                    <div className="w-full h-full rounded-full bg-current opacity-20"></div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            Skip for Now
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedRating === 0 || isSubmitting}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center text-sm"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Submit Progress'
            )}
          </button>
        </div>

        {/* Helper Text */}
        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-400 text-center">
            Data perkembangan Anda membantu kami memahami seberapa baik platform kami mendukung perkembangan Anda.
            Pemeriksaan ini muncul sekali setiap minggu dan dapat dilewati jika Anda mau.
          </p>
        </div>
      </div>
    </div>
  );
} 