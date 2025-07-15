import { characters } from '../../lib/characters';
import { getVoiceConfig, GEMINI_VOICES } from './voiceConfig';

export interface VoiceTestResult {
  characterId: string;
  characterName: string;
  voiceName: string;
  languageCode: string;
  hasSystemInstruction: boolean;
  systemInstructionLength: number;
  isValidVoice: boolean;
}

/**
 * Test voice configuration for all characters
 */
export function testAllCharacterVoices(): VoiceTestResult[] {
  return characters.map(character => {
    const config = getVoiceConfig(character);
    
    return {
      characterId: character.id,
      characterName: character.name,
      voiceName: config.voiceName,
      languageCode: config.languageCode,
      hasSystemInstruction: !!config.systemInstruction,
      systemInstructionLength: config.systemInstruction.length,
      isValidVoice: Object.values(GEMINI_VOICES).includes(config.voiceName as (typeof GEMINI_VOICES)[keyof typeof GEMINI_VOICES]),
    };
  });
}

/**
 * Get voice mapping summary
 */
export function getVoiceMappingSummary() {
  const results = testAllCharacterVoices();
  
  const summary = {
    totalCharacters: results.length,
    validVoices: results.filter(r => r.isValidVoice).length,
    invalidVoices: results.filter(r => !r.isValidVoice).length,
    maleVoices: results.filter(r => 
      ['Orus', 'Enceladus', 'Achird', 'Iapetus', 'Umbriel', 'Schedar', 'Algieba'].includes(r.voiceName)
    ).length,
    femaleVoices: results.filter(r => 
      ['Laomedeia', 'Vindemiatrix'].includes(r.voiceName)
    ).length,
    charactersWithInstructions: results.filter(r => r.hasSystemInstruction).length,
    averageInstructionLength: Math.round(
      results.reduce((sum, r) => sum + r.systemInstructionLength, 0) / results.length
    ),
  };
  
  return { summary, details: results };
}

/**
 * Validate character voice assignments
 */
export function validateVoiceAssignments(): string[] {
  const issues: string[] = [];
  const results = testAllCharacterVoices();
  
  // Check for invalid voices
  results.forEach(result => {
    if (!result.isValidVoice) {
      issues.push(`Character "${result.characterName}" has invalid voice: ${result.voiceName}`);
    }
  });
  
  // Check for missing system instructions
  results.forEach(result => {
    if (!result.hasSystemInstruction) {
      issues.push(`Character "${result.characterName}" has no system instruction`);
    }
  });
  
  // Check for very short system instructions
  results.forEach(result => {
    if (result.systemInstructionLength < 100) {
      issues.push(`Character "${result.characterName}" has very short system instruction (${result.systemInstructionLength} chars)`);
    }
  });
  
  // Check for duplicate voice assignments
  const voiceUsage = new Map<string, string[]>();
  results.forEach(result => {
    if (!voiceUsage.has(result.voiceName)) {
      voiceUsage.set(result.voiceName, []);
    }
    voiceUsage.get(result.voiceName)!.push(result.characterName);
  });
  
  voiceUsage.forEach((characters, voice) => {
    if (characters.length > 1) {
      issues.push(`Voice "${voice}" is used by multiple characters: ${characters.join(', ')}`);
    }
  });
  
  return issues;
}

/**
 * Get character by ID for testing
 */
export function getCharacterForTesting(characterId: string) {
  const character = characters.find(c => c.id === characterId);
  if (!character) {
    throw new Error(`Character with ID "${characterId}" not found`);
  }
  
  const config = getVoiceConfig(character);
  return {
    character,
    config,
    testInfo: {
      characterId: character.id,
      characterName: character.name,
      voiceName: config.voiceName,
      languageCode: config.languageCode,
      hasSystemInstruction: !!config.systemInstruction,
      systemInstructionLength: config.systemInstruction.length,
      isValidVoice: Object.values(GEMINI_VOICES).includes(config.voiceName as (typeof GEMINI_VOICES)[keyof typeof GEMINI_VOICES]),
    }
  };
}

/**
 * Log voice configuration summary to console
 */
export function logVoiceConfigSummary() {
  const { summary, details } = getVoiceMappingSummary();
  
  console.log('🎤 Voice Chat Configuration Summary:');
  console.log('=====================================');
  console.log(`Total Characters: ${summary.totalCharacters}`);
  console.log(`Valid Voices: ${summary.validVoices}`);
  console.log(`Invalid Voices: ${summary.invalidVoices}`);
  console.log(`Male Voices: ${summary.maleVoices}`);
  console.log(`Female Voices: ${summary.femaleVoices}`);
  console.log(`Characters with Instructions: ${summary.charactersWithInstructions}`);
  console.log(`Average Instruction Length: ${summary.averageInstructionLength} chars`);
  console.log('');
  
  console.log('📋 Character Voice Assignments:');
  console.log('================================');
  details.forEach(detail => {
    const status = detail.isValidVoice ? '✅' : '❌';
    console.log(`${status} ${detail.characterName} → ${detail.voiceName} (${detail.languageCode})`);
  });
  
  const issues = validateVoiceAssignments();
  if (issues.length > 0) {
    console.log('');
    console.log('⚠️  Configuration Issues:');
    console.log('========================');
    issues.forEach(issue => console.log(`- ${issue}`));
  } else {
    console.log('');
    console.log('✅ All voice configurations are valid!');
  }
}

/**
 * Test voice configuration for a specific character
 */
export function testCharacterVoice(characterId: string) {
  try {
    const { character, config, testInfo } = getCharacterForTesting(characterId);
    
    console.log(`🎤 Testing voice configuration for: ${character.name}`);
    console.log('================================================');
    console.log(`Character ID: ${testInfo.characterId}`);
    console.log(`Voice: ${testInfo.voiceName}`);
    console.log(`Language: ${testInfo.languageCode}`);
    console.log(`Valid Voice: ${testInfo.isValidVoice ? '✅' : '❌'}`);
    console.log(`Has System Instruction: ${testInfo.hasSystemInstruction ? '✅' : '❌'}`);
    console.log(`Instruction Length: ${testInfo.systemInstructionLength} characters`);
    console.log('');
    console.log('System Instruction Preview:');
    console.log(config.systemInstruction.substring(0, 200) + '...');
    
    return { character, config, testInfo };
  } catch (error) {
    console.error('Error testing character voice:', error);
    throw error;
  }
} 