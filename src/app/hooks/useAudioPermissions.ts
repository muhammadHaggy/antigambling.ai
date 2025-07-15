"use client";

import { useState, useCallback, useEffect } from 'react';

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'checking';

export interface AudioPermissionsResult {
  permissionState: PermissionState;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<PermissionState>;
  error: string | null;
}

export function useAudioPermissions(): AudioPermissionsResult {
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');
  const [error, setError] = useState<string | null>(null);

  const checkPermission = useCallback(async (): Promise<PermissionState> => {
    try {
      setError(null);
      
      // Check if navigator.permissions is available
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        const state = result.state as PermissionState;
        setPermissionState(state);
        return state;
      }
      
      // Fallback: try to access getUserMedia to check permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // If successful, we have permission
        stream.getTracks().forEach(track => track.stop());
        setPermissionState('granted');
        return 'granted';
             } catch {
         // If it fails, permission is likely denied or prompt
         setPermissionState('prompt');
         return 'prompt';
       }
    } catch (err) {
      console.error('Error checking audio permission:', err);
      setError('Failed to check audio permission');
      setPermissionState('prompt');
      return 'prompt';
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      setPermissionState('checking');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });
      
      // Permission granted
      stream.getTracks().forEach(track => track.stop());
      setPermissionState('granted');
      return true;
      
    } catch (err) {
      console.error('Error requesting audio permission:', err);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone access in your browser settings.');
          setPermissionState('denied');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
          setPermissionState('denied');
        } else if (err.name === 'NotSupportedError') {
          setError('Microphone access is not supported in this browser.');
          setPermissionState('denied');
        } else {
          setError(`Failed to access microphone: ${err.message}`);
          setPermissionState('denied');
        }
      } else {
        setError('Failed to access microphone. Please try again.');
        setPermissionState('denied');
      }
      
      return false;
    }
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    permissionState,
    requestPermission,
    checkPermission,
    error,
  };
} 