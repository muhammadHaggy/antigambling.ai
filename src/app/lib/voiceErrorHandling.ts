/**
 * Voice Chat Error Handling and Testing Utilities
 */

export enum VoiceErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NO_MICROPHONE = 'NO_MICROPHONE',
  API_KEY_MISSING = 'API_KEY_MISSING',
  API_CONNECTION_FAILED = 'API_CONNECTION_FAILED',
  AUDIO_CONTEXT_FAILED = 'AUDIO_CONTEXT_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNSUPPORTED_BROWSER = 'UNSUPPORTED_BROWSER',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface VoiceError {
  type: VoiceErrorType;
  message: string;
  originalError?: Error;
  timestamp: Date;
  userAgent: string;
  suggestions: string[];
}

export class VoiceErrorHandler {
  private static errors: VoiceError[] = [];

  static createError(
    type: VoiceErrorType,
    message: string,
    originalError?: Error,
    suggestions: string[] = []
  ): VoiceError {
    const error: VoiceError = {
      type,
      message,
      originalError,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      suggestions,
    };

    this.errors.push(error);
    this.logError(error);
    return error;
  }

  static handleMediaDeviceError(error: Error): VoiceError {
    if (error.name === 'NotAllowedError') {
      return this.createError(
        VoiceErrorType.PERMISSION_DENIED,
        'Microphone access denied by user',
        error,
        [
          'Click the microphone icon in your browser address bar',
          'Go to browser settings and allow microphone access',
          'Reload the page and try again',
        ]
      );
    }

    if (error.name === 'NotFoundError') {
      return this.createError(
        VoiceErrorType.NO_MICROPHONE,
        'No microphone found on this device',
        error,
        [
          'Connect a microphone to your device',
          'Check if microphone is properly connected',
          'Try a different microphone',
        ]
      );
    }

    if (error.name === 'NotSupportedError') {
      return this.createError(
        VoiceErrorType.UNSUPPORTED_BROWSER,
        'Your browser does not support voice chat',
        error,
        [
          'Use a modern browser like Chrome, Firefox, or Safari',
          'Update your browser to the latest version',
          'Enable microphone support in browser settings',
        ]
      );
    }

    return this.createError(
      VoiceErrorType.UNKNOWN_ERROR,
      `Media device error: ${error.message}`,
      error,
      ['Try refreshing the page', 'Check your device settings']
    );
  }

  static handleApiError(error: Error): VoiceError {
    if (error.message.includes('API_KEY')) {
      return this.createError(
        VoiceErrorType.API_KEY_MISSING,
        'Gemini API key is missing or invalid',
        error,
        [
          'Add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file',
          'Get a valid API key from Google AI Studio',
          'Restart the development server',
        ]
      );
    }

    if (error.message.includes('WebSocket') || error.message.includes('connection')) {
      return this.createError(
        VoiceErrorType.API_CONNECTION_FAILED,
        'Failed to connect to Gemini Live API',
        error,
        [
          'Check your internet connection',
          'Verify API key has Gemini Live access',
          'Try again in a few moments',
        ]
      );
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return this.createError(
        VoiceErrorType.NETWORK_ERROR,
        'Network connection error',
        error,
        [
          'Check your internet connection',
          'Try refreshing the page',
          'Check if you are behind a firewall',
        ]
      );
    }

    return this.createError(
      VoiceErrorType.UNKNOWN_ERROR,
      `API error: ${error.message}`,
      error,
      ['Try refreshing the page', 'Check console for more details']
    );
  }

  static handleAudioContextError(error: Error): VoiceError {
    return this.createError(
      VoiceErrorType.AUDIO_CONTEXT_FAILED,
      'Failed to initialize audio system',
      error,
      [
        'Try refreshing the page',
        'Check if another application is using your microphone',
        'Restart your browser',
      ]
    );
  }

  static getErrorMessage(error: VoiceError): string {
    return error.message;
  }

  static getErrorSuggestions(error: VoiceError): string[] {
    return error.suggestions;
  }

  static getAllErrors(): VoiceError[] {
    return [...this.errors];
  }

  static clearErrors(): void {
    this.errors = [];
  }

  static getErrorsByType(type: VoiceErrorType): VoiceError[] {
    return this.errors.filter(error => error.type === type);
  }

  private static logError(error: VoiceError): void {
    console.error(`🔊 [ERROR] ${error.type}: ${error.message}`);
    if (error.originalError) {
      console.error('Original error:', error.originalError);
    }
    if (error.suggestions.length > 0) {
      console.log('💡 Suggestions:');
      error.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
    }
  }
}

/**
 * Test audio permissions and capabilities
 */
export async function testAudioPermissions(): Promise<{
  hasPermission: boolean;
  error?: VoiceError;
  capabilities?: {
    hasAudioInput: boolean;
    hasAudioOutput: boolean;
    supportedConstraints: string[];
  };
}> {
  try {
    // Test basic audio capabilities
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const error = VoiceErrorHandler.createError(
        VoiceErrorType.UNSUPPORTED_BROWSER,
        'Browser does not support audio input',
        undefined,
        ['Use a modern browser with microphone support']
      );
      return { hasPermission: false, error };
    }

    // Test microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Get audio capabilities
    const devices = await navigator.mediaDevices.enumerateDevices();
    const capabilities = {
      hasAudioInput: devices.some(device => device.kind === 'audioinput'),
      hasAudioOutput: devices.some(device => device.kind === 'audiooutput'),
      supportedConstraints: navigator.mediaDevices.getSupportedConstraints 
        ? Object.keys(navigator.mediaDevices.getSupportedConstraints())
        : [],
    };

    // Clean up test stream
    stream.getTracks().forEach(track => track.stop());

    return { hasPermission: true, capabilities };
  } catch (error) {
    const voiceError = VoiceErrorHandler.handleMediaDeviceError(error as Error);
    return { hasPermission: false, error: voiceError };
  }
}

/**
 * Test Gemini API connection
 */
export async function testGeminiApiConnection(): Promise<{
  isConnected: boolean;
  error?: VoiceError;
  latency?: number;
}> {
  const startTime = Date.now();
  
  try {
    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      const error = VoiceErrorHandler.createError(
        VoiceErrorType.API_KEY_MISSING,
        'NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set',
        undefined,
        [
          'Add your Gemini API key to .env.local',
          'Get an API key from Google AI Studio',
          'Restart the development server',
        ]
      );
      return { isConnected: false, error };
    }

    // Test basic API connectivity (simplified test)
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const error = VoiceErrorHandler.createError(
        VoiceErrorType.API_CONNECTION_FAILED,
        `API connection failed: ${response.status} ${response.statusText}`,
        undefined,
        [
          'Check your API key is valid',
          'Verify you have access to Gemini Live API',
          'Check your internet connection',
        ]
      );
      return { isConnected: false, error };
    }

    const latency = Date.now() - startTime;
    return { isConnected: true, latency };
  } catch (error) {
    const voiceError = VoiceErrorHandler.handleApiError(error as Error);
    return { isConnected: false, error: voiceError };
  }
}

/**
 * Test audio context creation
 */
export async function testAudioContext(): Promise<{
  isWorking: boolean;
  error?: VoiceError;
  info?: {
    inputSampleRate: number;
    outputSampleRate: number;
    inputLatency: number;
    outputLatency: number;
  };
}> {
  let inputContext: AudioContext | undefined;
  let outputContext: AudioContext | undefined;

  try {
    // Test input audio context
    inputContext = new (window.AudioContext || (window as unknown as typeof AudioContext))({
      sampleRate: 16000,
    });

    // Test output audio context
    outputContext = new (window.AudioContext || (window as unknown as typeof AudioContext))({
      sampleRate: 24000,
    });

    // Resume contexts
    await inputContext.resume();
    await outputContext.resume();

    const info = {
      inputSampleRate: inputContext.sampleRate,
      outputSampleRate: outputContext.sampleRate,
      inputLatency: inputContext.baseLatency || 0,
      outputLatency: outputContext.baseLatency || 0,
    };

    return { isWorking: true, info };
  } catch (error) {
    const voiceError = VoiceErrorHandler.handleAudioContextError(error as Error);
    return { isWorking: false, error: voiceError };
  } finally {
    // Clean up test contexts
    if (inputContext) {
      await inputContext.close();
    }
    if (outputContext) {
      await outputContext.close();
    }
  }
}

/**
 * Run comprehensive voice chat system test
 */
export async function runVoiceChatSystemTest(): Promise<{
  overall: 'pass' | 'fail';
  results: {
    permissions: Awaited<ReturnType<typeof testAudioPermissions>>;
    apiConnection: Awaited<ReturnType<typeof testGeminiApiConnection>>;
    audioContext: Awaited<ReturnType<typeof testAudioContext>>;
  };
  recommendations: string[];
}> {
  console.log('🧪 Running Voice Chat System Test...');
  
  const results = {
    permissions: await testAudioPermissions(),
    apiConnection: await testGeminiApiConnection(),
    audioContext: await testAudioContext(),
  };

  const recommendations: string[] = [];
  let overall: 'pass' | 'fail' = 'pass';

  // Check permissions
  if (!results.permissions.hasPermission) {
    overall = 'fail';
    recommendations.push('Fix microphone permissions');
  }

  // Check API connection
  if (!results.apiConnection.isConnected) {
    overall = 'fail';
    recommendations.push('Fix Gemini API connection');
  } else if (results.apiConnection.latency && results.apiConnection.latency > 2000) {
    recommendations.push('API latency is high - check internet connection');
  }

  // Check audio context
  if (!results.audioContext.isWorking) {
    overall = 'fail';
    recommendations.push('Fix audio context initialization');
  }

  // Log results
  console.log('🧪 Voice Chat System Test Results:');
  console.log('===================================');
  console.log(`Overall: ${overall === 'pass' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Permissions: ${results.permissions.hasPermission ? '✅' : '❌'}`);
  console.log(`API Connection: ${results.apiConnection.isConnected ? '✅' : '❌'}`);
  console.log(`Audio Context: ${results.audioContext.isWorking ? '✅' : '❌'}`);
  
  if (results.apiConnection.latency) {
    console.log(`API Latency: ${results.apiConnection.latency}ms`);
  }
  
  if (recommendations.length > 0) {
    console.log('');
    console.log('📋 Recommendations:');
    recommendations.forEach(rec => console.log(`  - ${rec}`));
  }

  return { overall, results, recommendations };
}

/**
 * Get user-friendly error message for UI display
 */
export function getUserFriendlyErrorMessage(error: VoiceError): string {
  switch (error.type) {
    case VoiceErrorType.PERMISSION_DENIED:
      return 'Microphone access is required for voice chat. Please allow microphone access and try again.';
    
    case VoiceErrorType.NO_MICROPHONE:
      return 'No microphone detected. Please connect a microphone and try again.';
    
    case VoiceErrorType.API_KEY_MISSING:
      return 'Voice chat service is not configured. Please contact support.';
    
    case VoiceErrorType.API_CONNECTION_FAILED:
      return 'Unable to connect to voice chat service. Please check your internet connection and try again.';
    
    case VoiceErrorType.AUDIO_CONTEXT_FAILED:
      return 'Unable to initialize audio system. Please refresh the page and try again.';
    
    case VoiceErrorType.NETWORK_ERROR:
      return 'Network connection error. Please check your internet connection and try again.';
    
    case VoiceErrorType.UNSUPPORTED_BROWSER:
      return 'Your browser does not support voice chat. Please use a modern browser like Chrome, Firefox, or Safari.';
    
    default:
      return 'An unexpected error occurred. Please try again or contact support.';
  }
} 