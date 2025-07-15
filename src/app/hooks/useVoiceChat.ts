"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Session, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../lib/audioUtils';
import { getVoiceConfig, VoiceConfig } from '../lib/voiceConfig';
import { Character } from '../../lib/types';
import { useAudioPermissions } from './useAudioPermissions';

export type VoiceChatStatus = 'idle' | 'connecting' | 'connected' | 'recording' | 'error';

export interface VoiceChatResult {
  status: VoiceChatStatus;
  isRecording: boolean;
  error: string | null;
  startVoiceChat: () => Promise<void>;
  stopVoiceChat: () => void;
  forceStopVoiceChat: () => void;
  toggleRecording: () => void;
  resetSession: () => void;
  permissionState: string;
  requestPermission: () => Promise<boolean>;
}

export function useVoiceChat(character: Character): VoiceChatResult {
  const [status, setStatus] = useState<VoiceChatStatus>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio permissions
  const { permissionState, requestPermission, error: permissionError } = useAudioPermissions();

  // Refs for persistent objects
  const sessionRef = useRef<Session | null>(null);
  const clientRef = useRef<GoogleGenAI | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputNodeRef = useRef<GainNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isRecordingRef = useRef<boolean>(false);
  const isInitializingRef = useRef<boolean>(false);
  const isActiveRef = useRef<boolean>(false); // Track if voice chat is actively being used
  const cleanupPreventedRef = useRef<boolean>(false); // Prevent cleanup during critical operations
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null); // Track cleanup timer

  // Voice configuration for this character
  const voiceConfig: VoiceConfig = getVoiceConfig(character);

  const updateStatus = useCallback((newStatus: VoiceChatStatus) => {
    console.log('🔍 [VOICE-STATUS] Status change:', status, '->', newStatus);
    setStatus(newStatus);
  }, [status]);

  const updateError = useCallback((msg: string | null) => {
    console.log('🔍 [VOICE-ERROR] Error update:', msg);
    setError(msg);
    if (msg) {
      setStatus('error');
    }
  }, []);

  const initAudio = useCallback(() => {
    console.log('🔍 [VOICE-INIT] Initializing audio timing');
    if (!outputAudioContextRef.current) return;
    nextStartTimeRef.current = outputAudioContextRef.current.currentTime;
  }, []);

  const cleanupAudioContexts = useCallback(() => {
    console.log('🔍 [VOICE-CLEANUP] Cleaning up audio contexts...');
    
    // Clean up input audio context
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      console.log('🔍 [VOICE-CLEANUP] Closing input audio context');
      inputAudioContextRef.current.close();
    }
    inputAudioContextRef.current = null;
    
    // Clean up output audio context
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      console.log('🔍 [VOICE-CLEANUP] Closing output audio context');
      outputAudioContextRef.current.close();
    }
    outputAudioContextRef.current = null;
    
    // Clean up nodes
    inputNodeRef.current = null;
    outputNodeRef.current = null;
  }, []);

  const initSession = useCallback(async () => {
    console.log('🔍 [VOICE-INIT] initSession called - current session exists:', !!sessionRef.current);
    console.log('🔍 [VOICE-INIT] isInitializing:', isInitializingRef.current);
    
    // Prevent multiple initializations
    if (isInitializingRef.current) {
      console.log('🔍 [VOICE-INIT] Already initializing, skipping...');
      return;
    }
    
    // Mark as active and prevent cleanup
    isActiveRef.current = true;
    cleanupPreventedRef.current = true;
    
    if (sessionRef.current) {
      console.log('🔍 [VOICE-INIT] Session already exists, cleaning up first...');
      sessionRef.current.close();
      sessionRef.current = null;
    }
    
    isInitializingRef.current = true;
    
    try {
      console.log('🔍 [VOICE-INIT] Starting session initialization for character:', character.name);
      
      // Clean up existing audio contexts only if not in use
      if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        console.log('🔍 [VOICE-INIT] Closing existing input audio context');
        inputAudioContextRef.current.close();
      }
      if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        console.log('🔍 [VOICE-INIT] Closing existing output audio context');
        outputAudioContextRef.current.close();
      }
      
      // Initialize audio contexts
      console.log('🔍 [VOICE-INIT] Creating new audio contexts...');
      inputAudioContextRef.current = new (window.AudioContext || (window as unknown as typeof AudioContext))({
        sampleRate: 16000
      });
      outputAudioContextRef.current = new (window.AudioContext || (window as unknown as typeof AudioContext))({
        sampleRate: 24000
      });
      
      console.log('🔍 [VOICE-INIT] Audio contexts created - input state:', inputAudioContextRef.current.state, 'output state:', outputAudioContextRef.current.state);

      // Create gain nodes
      inputNodeRef.current = inputAudioContextRef.current.createGain();
      outputNodeRef.current = outputAudioContextRef.current.createGain();
      
      // Connect output node to destination
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);
      console.log('🔍 [VOICE-INIT] Gain nodes created and connected');

      initAudio();

      // Initialize Gemini client
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set');
      }

      console.log('🔍 [VOICE-INIT] Creating Gemini client...');
      clientRef.current = new GoogleGenAI({
        apiKey: apiKey,
      });

      const model = 'gemini-2.5-flash-preview-native-audio-dialog';
      console.log('🔍 [VOICE-INIT] Connecting to Gemini Live API with voice:', voiceConfig.voiceName);

      sessionRef.current = await clientRef.current.live.connect({
        model: model,
        callbacks: {
          onopen: () => {
            console.log('🔍 [VOICE-CONN] WebSocket connection opened successfully');
            if (isActiveRef.current) {
              updateStatus('connected');
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            console.log('🔍 [VOICE-MSG] Received message from Gemini:', message);
            
            // Handle setup completion
            if (message.setupComplete) {
              console.log('🔍 [VOICE-MSG] Setup completed successfully');
              return;
            }
            
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData;
            
            if (audio && audio.data) {
              console.log('🔊 [VOICE-AUDIO] Processing audio response, data length:', audio.data.length);
              
              if (outputAudioContextRef.current && outputNodeRef.current && outputAudioContextRef.current.state !== 'closed') {
                // Resume output context if suspended
                if (outputAudioContextRef.current.state === 'suspended') {
                  console.log('🔊 [VOICE-AUDIO] Resuming suspended output context');
                  await outputAudioContextRef.current.resume();
                }
                
                nextStartTimeRef.current = Math.max(
                  nextStartTimeRef.current,
                  outputAudioContextRef.current.currentTime,
                );

                try {
                  const decodedData = decode(audio.data);
                  const audioBuffer = await decodeAudioData(
                    decodedData,
                    outputAudioContextRef.current,
                    24000,
                    1,
                  );
                  
                  const source = outputAudioContextRef.current.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(outputNodeRef.current);
                  
                  source.addEventListener('ended', () => {
                    console.log('🔊 [VOICE-AUDIO] Audio playback ended');
                    sourcesRef.current.delete(source);
                  });

                  console.log('🔊 [VOICE-AUDIO] Starting audio playback, duration:', audioBuffer.duration);
                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
                  sourcesRef.current.add(source);
                  
                } catch (error) {
                  console.error('🔍 [VOICE-ERROR] Error in audio processing:', error);
                  updateError(`Audio processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              } else {
                console.log('🔍 [VOICE-ERROR] Audio contexts not available for playback');
              }
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              console.log('🔍 [VOICE-INT] Received interruption signal, stopping', sourcesRef.current.size, 'sources');
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('🔍 [VOICE-ERROR] WebSocket error:', e);
            updateError(e.message);
            isInitializingRef.current = false;
            cleanupPreventedRef.current = false;
          },
          onclose: (e: CloseEvent) => {
            console.log('🔍 [VOICE-CONN] WebSocket connection closed:', e.code, e.reason);
            console.log('🔍 [VOICE-CONN] Connection closed during initialization:', isInitializingRef.current);
            isInitializingRef.current = false;
            cleanupPreventedRef.current = false;
            if (isActiveRef.current) {
              updateStatus('idle');
            }
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { 
              prebuiltVoiceConfig: { 
                voiceName: voiceConfig.voiceName 
              } 
            },
            languageCode: voiceConfig.languageCode
          },
          systemInstruction: {
            parts: [{
              text: voiceConfig.systemInstruction
            }]
          },
        },
      });
      
      console.log('🔍 [VOICE-INIT] Session initialization completed successfully');
      isInitializingRef.current = false;
      // Keep cleanup prevented until recording starts or voice chat is manually stopped
      // cleanupPreventedRef.current = false;
    } catch (e) {
      console.error('🔍 [VOICE-ERROR] Error initializing session:', e);
      updateError(e instanceof Error ? e.message : 'Failed to initialize session');
      isInitializingRef.current = false;
      cleanupPreventedRef.current = false;
      isActiveRef.current = false;
      updateStatus('idle');
    }
  }, [character.name, voiceConfig, updateStatus, updateError, initAudio]);

  const stopRecording = useCallback(() => {
    console.log('🔍 [VOICE-REC] stopRecording called - isRecording:', isRecording, 'hasMediaStream:', !!mediaStreamRef.current);
    
    if (!isRecording && !mediaStreamRef.current && !inputAudioContextRef.current) {
      console.log('🔍 [VOICE-REC] Nothing to stop, returning early');
      return;
    }

    console.log('🔍 [VOICE-REC] Stopping recording...');
    setIsRecording(false);
    isRecordingRef.current = false;

    if (scriptProcessorNodeRef.current && sourceNodeRef.current && inputAudioContextRef.current) {
      console.log('🔍 [VOICE-REC] Disconnecting audio nodes');
      scriptProcessorNodeRef.current.disconnect();
      sourceNodeRef.current.disconnect();
    }

    scriptProcessorNodeRef.current = null;
    sourceNodeRef.current = null;

    if (mediaStreamRef.current) {
      console.log('🔍 [VOICE-REC] Stopping media stream tracks');
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    console.log('🔍 [VOICE-REC] Recording stopped, updating status to connected');
    if (isActiveRef.current) {
      updateStatus('connected');
    }
    
    // Reset cleanup prevention when recording stops
    cleanupPreventedRef.current = false;
  }, [isRecording, updateStatus]);

  const startRecording = useCallback(async () => {
    console.log('🔍 [VOICE-REC] startRecording called - isRecording:', isRecording, 'hasSession:', !!sessionRef.current);
    
    if (isRecording) {
      console.log('🔍 [VOICE-REC] Already recording, returning early');
      return;
    }

    try {
      // Check if we have a valid session
      if (!sessionRef.current) {
        console.log('🔍 [VOICE-REC] No session available');
        throw new Error('No session available');
      }

      // Check if audio context is available and valid
      if (!inputAudioContextRef.current || inputAudioContextRef.current.state === 'closed') {
        console.log('🔍 [VOICE-REC] Audio context not available or closed, reinitializing...');
        
        // Reinitialize audio contexts
        inputAudioContextRef.current = new (window.AudioContext || (window as unknown as typeof AudioContext))({
          sampleRate: 16000
        });
        outputAudioContextRef.current = new (window.AudioContext || (window as unknown as typeof AudioContext))({
          sampleRate: 24000
        });
        
        // Recreate gain nodes
        inputNodeRef.current = inputAudioContextRef.current.createGain();
        outputNodeRef.current = outputAudioContextRef.current.createGain();
        
        // Connect output node to destination
        outputNodeRef.current.connect(outputAudioContextRef.current.destination);
        
        console.log('🔍 [VOICE-REC] Audio contexts reinitialized');
      }

      console.log('🔍 [VOICE-REC] Resuming input audio context...');
      await inputAudioContextRef.current.resume();

      console.log('🔍 [VOICE-REC] Requesting microphone access...');
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        },
        video: false,
      });

      console.log('🔍 [VOICE-REC] Microphone access granted, setting up audio pipeline...');
      
      // Double-check audio context is still valid before creating nodes
      if (!inputAudioContextRef.current) {
        console.log('🔍 [VOICE-REC] Audio context became invalid after microphone access');
        throw new Error('Audio context became invalid');
      }
      
      sourceNodeRef.current = inputAudioContextRef.current.createMediaStreamSource(
        mediaStreamRef.current,
      );
      sourceNodeRef.current.connect(inputNodeRef.current!);
      
      const bufferSize = 256;
      scriptProcessorNodeRef.current = inputAudioContextRef.current.createScriptProcessor(
        bufferSize,
        1,
        1,
      );

      scriptProcessorNodeRef.current.onaudioprocess = (audioProcessingEvent) => {
        if (!isRecordingRef.current || !sessionRef.current) {
          console.log('🎤 [VOICE-PROC] Skipping audio processing - recording:', isRecordingRef.current, 'session:', !!sessionRef.current);
          return;
        }

        const inputBuffer = audioProcessingEvent.inputBuffer;
        const pcmData = inputBuffer.getChannelData(0);

        const maxAmplitude = Math.max(...pcmData.map(Math.abs));
        if (maxAmplitude > 0.001) {
          console.log('🎤 [VOICE-PROC] Processing audio chunk - max amplitude:', maxAmplitude.toFixed(6));
        }

        try {
          sessionRef.current.sendRealtimeInput({ media: createBlob(pcmData) });
        } catch (error) {
          console.error('🎤 [VOICE-ERROR] Error sending audio data:', error);
        }
      };

      sourceNodeRef.current.connect(scriptProcessorNodeRef.current);
      scriptProcessorNodeRef.current.connect(inputAudioContextRef.current.destination);

      console.log('🔍 [VOICE-REC] Audio pipeline connected, starting recording...');
      setIsRecording(true);
      isRecordingRef.current = true;
      updateStatus('recording');
      
      // Now that recording is active, we can allow cleanup if needed
      cleanupPreventedRef.current = false;
      
    } catch (err) {
      console.error('🔍 [VOICE-ERROR] Error starting recording:', err);
      updateError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Reset flags on error
      isActiveRef.current = false;
      cleanupPreventedRef.current = false;
      
      stopRecording();
    }
  }, [isRecording, updateStatus, updateError, stopRecording]);

  const startVoiceChat = useCallback(async () => {
    console.log('🔍 [VOICE-START] startVoiceChat called - current status:', status, 'permission:', permissionState);
    
    try {
      updateError(null);
      updateStatus('connecting');
      isActiveRef.current = true;
      cleanupPreventedRef.current = true; // Prevent cleanup during entire voice chat session
      
      // Cancel any pending cleanup timer
      if (cleanupTimerRef.current) {
        console.log('🔍 [VOICE-START] Canceling pending cleanup timer');
        clearTimeout(cleanupTimerRef.current);
        cleanupTimerRef.current = null;
      }
      
      // Check permissions first
      if (permissionState !== 'granted') {
        console.log('🔍 [VOICE-START] Requesting microphone permission...');
        const granted = await requestPermission();
        if (!granted) {
          updateError('Microphone permission is required for voice chat');
          return;
        }
        console.log('🔍 [VOICE-START] Microphone permission granted');
      }

      console.log('🔍 [VOICE-START] Initializing session...');
      await initSession();
      
      // Wait a bit for session to be fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🔍 [VOICE-START] Starting recording...');
      await startRecording();
      
      console.log('🔍 [VOICE-START] Voice chat started successfully');
      
    } catch (err) {
      console.error('🔍 [VOICE-ERROR] Error starting voice chat:', err);
      updateError(err instanceof Error ? err.message : 'Failed to start voice chat');
      isActiveRef.current = false;
      cleanupPreventedRef.current = false;
      updateStatus('idle');
    }
  }, [status, permissionState, requestPermission, initSession, startRecording, updateError, updateStatus]);

  const stopVoiceChat = useCallback(() => {
    console.log('🔍 [VOICE-STOP] stopVoiceChat called');
    console.log('🔍 [VOICE-STOP] Current status:', status);
    console.log('🔍 [VOICE-STOP] Is recording:', isRecording);
    
    // Only allow manual stop, not automatic cleanup during recording
    if (status === 'recording' && isRecording && cleanupPreventedRef.current) {
      console.log('🔍 [VOICE-STOP] Voice chat is actively recording and cleanup is prevented, ignoring stop...');
      return;
    }
    
    isActiveRef.current = false;
    cleanupPreventedRef.current = false;
    
    stopRecording();
    
    if (sessionRef.current) {
      console.log('🔍 [VOICE-STOP] Closing session...');
      sessionRef.current.close();
      sessionRef.current = null;
    }

    // Stop all audio sources
    console.log('🔍 [VOICE-STOP] Stopping', sourcesRef.current.size, 'audio sources');
    for (const source of sourcesRef.current.values()) {
      source.stop();
      sourcesRef.current.delete(source);
    }

    // Clean up audio contexts
    cleanupAudioContexts();

    console.log('🔍 [VOICE-STOP] Voice chat stopped, updating status to idle');
    updateStatus('idle');
    updateError(null);
  }, [status, isRecording, stopRecording, updateStatus, updateError, cleanupAudioContexts]);

  const forceStopVoiceChat = useCallback(() => {
    console.log('🔍 [VOICE-FORCE-STOP] Force stopping voice chat...');
    
    // Cancel any pending cleanup timer
    if (cleanupTimerRef.current) {
      console.log('🔍 [VOICE-FORCE-STOP] Canceling cleanup timer');
      clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }
    
    // Force stop regardless of current state
    isActiveRef.current = false;
    cleanupPreventedRef.current = false;
    
    stopRecording();
    
    if (sessionRef.current) {
      console.log('🔍 [VOICE-FORCE-STOP] Closing session...');
      sessionRef.current.close();
      sessionRef.current = null;
    }

    // Stop all audio sources
    console.log('🔍 [VOICE-FORCE-STOP] Stopping', sourcesRef.current.size, 'audio sources');
    for (const source of sourcesRef.current.values()) {
      source.stop();
      sourcesRef.current.delete(source);
    }

    // Clean up audio contexts
    cleanupAudioContexts();

    console.log('🔍 [VOICE-FORCE-STOP] Voice chat force stopped, updating status to idle');
    updateStatus('idle');
    updateError(null);
  }, [stopRecording, updateStatus, updateError, cleanupAudioContexts]);

  const toggleRecording = useCallback(() => {
    console.log('🔍 [VOICE-TOGGLE] toggleRecording called - isRecording:', isRecording);
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const resetSession = useCallback(() => {
    console.log('🔍 [VOICE-RESET] resetSession called');
    forceStopVoiceChat();
    setError(null);
    updateStatus('idle');
  }, [forceStopVoiceChat, updateStatus]);

  // Update error if permission error changes
  useEffect(() => {
    if (permissionError) {
      console.log('🔍 [VOICE-PERM] Permission error changed:', permissionError);
      updateError(permissionError);
    }
  }, [permissionError, updateError]);

  // Cleanup on unmount - only run once on mount, not on status changes
  useEffect(() => {
    return () => {
      console.log('🔍 [VOICE-CLEANUP] Component unmounting, cleanup prevented:', cleanupPreventedRef.current);
      console.log('🔍 [VOICE-CLEANUP] Voice chat active:', isActiveRef.current);
      console.log('🔍 [VOICE-CLEANUP] Current status:', status);
      
      // Cancel any pending cleanup timer
      if (cleanupTimerRef.current) {
        console.log('🔍 [VOICE-CLEANUP] Canceling cleanup timer on unmount');
        clearTimeout(cleanupTimerRef.current);
        cleanupTimerRef.current = null;
      }
      
      // Only cleanup if not in the middle of critical operations and not actively recording
      if (!cleanupPreventedRef.current && !isActiveRef.current && status !== 'recording') {
        console.log('🔍 [VOICE-CLEANUP] Proceeding with cleanup...');
        
        // Force stop recording
        setIsRecording(false);
        isRecordingRef.current = false;
        
        // Stop recording resources
        if (scriptProcessorNodeRef.current && sourceNodeRef.current && inputAudioContextRef.current) {
          console.log('🔍 [VOICE-CLEANUP] Disconnecting audio nodes');
          scriptProcessorNodeRef.current.disconnect();
          sourceNodeRef.current.disconnect();
        }
        
        scriptProcessorNodeRef.current = null;
        sourceNodeRef.current = null;
        
        if (mediaStreamRef.current) {
          console.log('🔍 [VOICE-CLEANUP] Stopping media stream tracks');
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
        
        // Close session
        if (sessionRef.current) {
          console.log('🔍 [VOICE-CLEANUP] Closing session...');
          sessionRef.current.close();
          sessionRef.current = null;
        }
        
        // Stop all audio sources
        console.log('🔍 [VOICE-CLEANUP] Stopping', sourcesRef.current.size, 'audio sources');
        for (const source of sourcesRef.current.values()) {
          source.stop();
          sourcesRef.current.delete(source);
        }
        
        // Clean up audio contexts
        cleanupAudioContexts();
        
        console.log('🔍 [VOICE-CLEANUP] Cleanup completed');
      } else {
        console.log('🔍 [VOICE-CLEANUP] Cleanup prevented - voice chat is active or initializing');
        // Mark as inactive but don't cleanup immediately
        isActiveRef.current = false;
        
        // Set a delayed cleanup if needed
        cleanupTimerRef.current = setTimeout(() => {
          console.log('🔍 [VOICE-CLEANUP] Delayed cleanup check...');
          if (!isActiveRef.current && !cleanupPreventedRef.current) {
            console.log('🔍 [VOICE-CLEANUP] Performing delayed cleanup...');
            
            // Force stop recording
            setIsRecording(false);
            isRecordingRef.current = false;
            
            // Stop recording resources
            if (scriptProcessorNodeRef.current && sourceNodeRef.current && inputAudioContextRef.current) {
              scriptProcessorNodeRef.current.disconnect();
              sourceNodeRef.current.disconnect();
            }
            
            scriptProcessorNodeRef.current = null;
            sourceNodeRef.current = null;
            
            if (mediaStreamRef.current) {
              mediaStreamRef.current.getTracks().forEach((track) => track.stop());
              mediaStreamRef.current = null;
            }
            
            // Close session
            if (sessionRef.current) {
              sessionRef.current.close();
              sessionRef.current = null;
            }
            
            // Stop all audio sources
            for (const source of sourcesRef.current.values()) {
              source.stop();
              sourcesRef.current.delete(source);
            }
            
            // Clean up audio contexts
            cleanupAudioContexts();
          }
          cleanupTimerRef.current = null;
        }, 2000); // Wait 2 seconds before cleanup to allow initialization to complete
      }
    };
  }, []); // Empty dependency array - only run once on mount

  return {
    status,
    isRecording,
    error,
    startVoiceChat,
    stopVoiceChat,
    forceStopVoiceChat,
    toggleRecording,
    resetSession,
    permissionState,
    requestPermission,
  };
} 