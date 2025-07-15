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

  // Voice configuration for this character
  const voiceConfig: VoiceConfig = getVoiceConfig(character);

  const updateStatus = useCallback((newStatus: VoiceChatStatus) => {
    setStatus(newStatus);
  }, []);

  const updateError = useCallback((msg: string | null) => {
    setError(msg);
    if (msg) {
      setStatus('error');
    }
  }, []);

  const initAudio = useCallback(() => {
    if (!outputAudioContextRef.current) return;
    nextStartTimeRef.current = outputAudioContextRef.current.currentTime;
  }, []);

  const initSession = useCallback(async () => {
    try {
      console.log('🔍 [VOICE] Starting session initialization for character:', character.name);
      
      // Initialize audio contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as unknown as typeof AudioContext))({
        sampleRate: 16000
      });
      outputAudioContextRef.current = new (window.AudioContext || (window as unknown as typeof AudioContext))({
        sampleRate: 24000
      });
      
      console.log('🔍 [VOICE] Audio contexts created');

      // Create gain nodes
      inputNodeRef.current = inputAudioContextRef.current.createGain();
      outputNodeRef.current = outputAudioContextRef.current.createGain();
      
      // Connect output node to destination
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);

      initAudio();

      // Initialize Gemini client
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set');
      }

      clientRef.current = new GoogleGenAI({
        apiKey: apiKey,
      });

      const model = 'gemini-2.5-flash-preview-native-audio-dialog';
      console.log('🔍 [VOICE] Connecting to Gemini Live API with voice:', voiceConfig.voiceName);

      sessionRef.current = await clientRef.current.live.connect({
        model: model,
        callbacks: {
          onopen: () => {
            console.log('🔍 [VOICE] WebSocket connection opened');
            updateStatus('connected');
          },
          onmessage: async (message: LiveServerMessage) => {
            console.log('🔍 [VOICE] Received message from Gemini:', message);
            
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData;
            
            if (audio && audio.data) {
              console.log('🔊 [VOICE] Processing audio response');
              
              if (outputAudioContextRef.current && outputNodeRef.current) {
                // Resume output context if suspended
                if (outputAudioContextRef.current.state === 'suspended') {
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
                    sourcesRef.current.delete(source);
                  });

                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
                  sourcesRef.current.add(source);
                  
                } catch (error) {
                  console.error('🔍 [VOICE] Error in audio processing:', error);
                  updateError(`Audio processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              }
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              console.log('🔍 [VOICE] Received interruption signal');
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('🔍 [VOICE] WebSocket error:', e);
            updateError(e.message);
          },
          onclose: (e: CloseEvent) => {
            console.log('🔍 [VOICE] WebSocket connection closed:', e.code, e.reason);
            updateStatus('idle');
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
      
      console.log('🔍 [VOICE] Session initialization completed successfully');
    } catch (e) {
      console.error('🔍 [VOICE] Error initializing session:', e);
      updateError(e instanceof Error ? e.message : 'Failed to initialize session');
    }
  }, [character.name, voiceConfig, updateStatus, updateError, initAudio]);

  const stopRecording = useCallback(() => {
    if (!isRecording && !mediaStreamRef.current && !inputAudioContextRef.current) {
      return;
    }

    setIsRecording(false);
    isRecordingRef.current = false;

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

    updateStatus('connected');
  }, [isRecording, updateStatus]);

  const startRecording = useCallback(async () => {
    if (isRecording) return;

    try {
      if (!inputAudioContextRef.current) {
        await initSession();
      }

      if (!inputAudioContextRef.current) {
        throw new Error('Failed to initialize audio context');
      }

      await inputAudioContextRef.current.resume();

      console.log('🔍 [VOICE] Requesting microphone access...');
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        },
        video: false,
      });

      console.log('🔍 [VOICE] Microphone access granted');
      
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
        if (!isRecordingRef.current || !sessionRef.current) return;

        const inputBuffer = audioProcessingEvent.inputBuffer;
        const pcmData = inputBuffer.getChannelData(0);

        const maxAmplitude = Math.max(...pcmData.map(Math.abs));
        console.log('🎤 [VOICE] Processing audio chunk - max amplitude:', maxAmplitude.toFixed(6));

        sessionRef.current.sendRealtimeInput({ media: createBlob(pcmData) });
      };

      sourceNodeRef.current.connect(scriptProcessorNodeRef.current);
      scriptProcessorNodeRef.current.connect(inputAudioContextRef.current.destination);

      setIsRecording(true);
      isRecordingRef.current = true;
      updateStatus('recording');
      
    } catch (err) {
      console.error('🔍 [VOICE] Error starting recording:', err);
      updateError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      stopRecording();
    }
  }, [isRecording, initSession, updateStatus, updateError, stopRecording]);

  const startVoiceChat = useCallback(async () => {
    try {
      updateError(null);
      updateStatus('connecting');
      
      // Check permissions first
      if (permissionState !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          updateError('Microphone permission is required for voice chat');
          return;
        }
      }

      await initSession();
      await startRecording();
      
    } catch (err) {
      console.error('🔍 [VOICE] Error starting voice chat:', err);
      updateError(err instanceof Error ? err.message : 'Failed to start voice chat');
    }
  }, [permissionState, requestPermission, initSession, startRecording, updateError, updateStatus]);

  const stopVoiceChat = useCallback(() => {
    stopRecording();
    
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
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    updateStatus('idle');
    updateError(null);
  }, [stopRecording, updateStatus, updateError]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const resetSession = useCallback(() => {
    stopVoiceChat();
    setError(null);
    updateStatus('idle');
  }, [stopVoiceChat, updateStatus]);

  // Update error if permission error changes
  useEffect(() => {
    if (permissionError) {
      updateError(permissionError);
    }
  }, [permissionError, updateError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoiceChat();
    };
  }, [stopVoiceChat]);

  return {
    status,
    isRecording,
    error,
    startVoiceChat,
    stopVoiceChat,
    toggleRecording,
    resetSession,
    permissionState,
    requestPermission,
  };
} 