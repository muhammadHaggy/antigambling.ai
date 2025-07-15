import { Character } from '../../lib/types';

// Gemini Live voice options with descriptions
export const GEMINI_VOICES = {
  // Male voices (Lower/Middle pitch)
  ORUS: 'Orus', // Firm, Lower middle pitch
  ENCELADUS: 'Enceladus', // Breathy, Lower pitch
  ACHIRD: 'Achird', // Friendly, Lower middle pitch
  IAPETUS: 'Iapetus', // Clear, Lower middle pitch
  UMBRIEL: 'Umbriel', // Easy-going, Lower middle pitch
  SCHEDAR: 'Schedar', // Even, Lower middle pitch
  ALGIEBA: 'Algieba', // Smooth, Lower pitch
  
  // Female voices (Higher/Middle pitch)
  LAOMEDEIA: 'Laomedeia', // Upbeat, Higher pitch
  VINDEMIATRIX: 'Vindemiatrix', // Gentle, Middle pitch
} as const;

// Character voice mapping based on gender and personality
export const CHARACTER_VOICE_MAP: Record<string, string> = {
  // Male Characters
  '1': GEMINI_VOICES.ORUS, // Andang - Firm, mature, grounded personality
  '2': GEMINI_VOICES.ENCELADUS, // Rian - Breathy, tragic, remorseful tone
  '3': GEMINI_VOICES.ACHIRD, // Nofrianto - Friendly, street-smart, relatable
  '4': GEMINI_VOICES.IAPETUS, // Dr. Ardi - Clear, professional communication
  '5': GEMINI_VOICES.UMBRIEL, // Ustadz Fikri - Easy-going, warm, brotherly
  '7': GEMINI_VOICES.SCHEDAR, // Pastor Samuel - Even, pastoral wisdom
  '9': GEMINI_VOICES.ALGIEBA, // Bhante Dhammasila - Smooth, calm, meditative
  
  // Female Characters
  '6': GEMINI_VOICES.LAOMEDEIA, // Mbak Rara - Upbeat, energetic, passionate
  '8': GEMINI_VOICES.VINDEMIATRIX, // Ida Ayu Wulan - Gentle, soft-spoken, meditative
};

// Language configuration
export const LANGUAGE_CONFIG = {
  INDONESIAN: 'id-ID',
  ENGLISH: 'en-US',
} as const;

// Voice configuration interface
export interface VoiceConfig {
  voiceName: string;
  languageCode: string;
  systemInstruction: string;
}

// Get voice configuration for a character
export function getVoiceConfig(character: Character): VoiceConfig {
  const voiceName = CHARACTER_VOICE_MAP[character.id] || GEMINI_VOICES.ORUS;
  
  return {
    voiceName,
    languageCode: LANGUAGE_CONFIG.INDONESIAN,
    systemInstruction: character.backgroundStory,
  };
}

// Get all available voice options (for admin/testing purposes)
export function getAvailableVoices() {
  return Object.values(GEMINI_VOICES);
}

// Validate if a voice name is supported
export function isValidVoice(voiceName: string): boolean {
  return Object.values(GEMINI_VOICES).includes(voiceName as (typeof GEMINI_VOICES)[keyof typeof GEMINI_VOICES]);
} 