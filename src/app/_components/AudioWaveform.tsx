'use client';

import { useEffect, useState } from 'react';

interface AudioWaveformProps {
  isActive: boolean;
  isListening: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function AudioWaveform({
  isActive,
  isListening,
  size = 'medium',
  className = '',
}: AudioWaveformProps) {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (isActive) {
      setAnimationKey(prev => prev + 1);
    }
  }, [isActive, isListening]);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-32 h-32';
      case 'large':
        return 'w-80 h-80';
      default:
        return 'w-48 h-48';
    }
  };

  const getBarHeight = (index: number) => {
    const baseHeight = size === 'small' ? 4 : size === 'large' ? 12 : 8;
    const maxHeight = size === 'small' ? 16 : size === 'large' ? 48 : 32;
    
    if (!isActive) return baseHeight;
    
    // Create different heights for different bars to simulate waveform
    const heights = [0.3, 0.7, 1, 0.8, 0.5, 0.9, 0.6, 0.4];
    const multiplier = heights[index % heights.length];
    
    return baseHeight + (maxHeight - baseHeight) * multiplier;
  };

  const getAnimationDelay = (index: number) => {
    return `${index * 0.1}s`;
  };

  const getColor = () => {
    if (!isActive) return 'bg-gray-600';
    return isListening ? 'bg-green-400' : 'bg-blue-400';
  };

  const bars = Array.from({ length: 8 }, (_, index) => (
    <div
      key={`${animationKey}-${index}`}
      className={`${getColor()} rounded-full transition-all duration-300 ${
        isActive ? 'animate-pulse' : ''
      }`}
      style={{
        width: size === 'small' ? '2px' : size === 'large' ? '4px' : '3px',
        height: `${getBarHeight(index)}px`,
        animationDelay: getAnimationDelay(index),
        animationDuration: '1s',
        animationIterationCount: 'infinite',
      }}
    />
  ));

  return (
    <div className={`flex items-center justify-center ${getSizeClasses()} ${className}`}>
      <div className="flex items-end space-x-1">
        {bars}
      </div>
      
      {/* Circular pulse effect for large size */}
      {size === 'large' && isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-full h-full rounded-full border-2 ${
            isListening ? 'border-green-400/30' : 'border-blue-400/30'
          } animate-ping`} />
          <div className={`absolute w-4/5 h-4/5 rounded-full border ${
            isListening ? 'border-green-400/20' : 'border-blue-400/20'
          } animate-pulse`} />
        </div>
      )}
    </div>
  );
} 