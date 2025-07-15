/**
 * Audio Performance Monitoring and Optimization Utilities
 */

export interface AudioPerformanceMetrics {
  inputLatency: number;
  outputLatency: number;
  bufferSize: number;
  sampleRate: number;
  channelCount: number;
  contextState: string;
  memoryUsage: number;
  activeSourcesCount: number;
}

export interface AudioContextInfo {
  inputContext?: AudioContext;
  outputContext?: AudioContext;
  inputLatency: number;
  outputLatency: number;
  inputState: string;
  outputState: string;
}

/**
 * Monitor audio context performance
 */
export function getAudioContextMetrics(
  inputContext?: AudioContext,
  outputContext?: AudioContext,
  activeSources?: Set<AudioBufferSourceNode>
): AudioPerformanceMetrics {
  const metrics: AudioPerformanceMetrics = {
    inputLatency: 0,
    outputLatency: 0,
    bufferSize: 0,
    sampleRate: 0,
    channelCount: 0,
    contextState: 'unknown',
    memoryUsage: 0,
    activeSourcesCount: activeSources?.size || 0,
  };

  if (inputContext) {
    metrics.inputLatency = inputContext.baseLatency || 0;
    metrics.sampleRate = inputContext.sampleRate;
    metrics.contextState = inputContext.state;
  }

  if (outputContext) {
    metrics.outputLatency = outputContext.baseLatency || 0;
    if (!metrics.sampleRate) {
      metrics.sampleRate = outputContext.sampleRate;
    }
    if (metrics.contextState === 'unknown') {
      metrics.contextState = outputContext.state;
    }
  }

  // Estimate memory usage (rough calculation)
  metrics.memoryUsage = metrics.activeSourcesCount * 1024; // Rough estimate in KB

  return metrics;
}

/**
 * Optimize audio context settings
 */
export function getOptimalAudioContextConfig(): {
  inputConfig: AudioContextOptions;
  outputConfig: AudioContextOptions;
  bufferSize: number;
} {
  // Detect device capabilities
  const isLowLatencyDevice = navigator.userAgent.includes('Chrome') && 
                           !navigator.userAgent.includes('Mobile');

  return {
    inputConfig: {
      sampleRate: 16000,
      latencyHint: isLowLatencyDevice ? 'interactive' : 'balanced',
    },
    outputConfig: {
      sampleRate: 24000,
      latencyHint: isLowLatencyDevice ? 'interactive' : 'balanced',
    },
    bufferSize: isLowLatencyDevice ? 256 : 512,
  };
}

/**
 * Monitor audio performance and log warnings
 */
export function monitorAudioPerformance(
  inputContext?: AudioContext,
  outputContext?: AudioContext,
  activeSources?: Set<AudioBufferSourceNode>
): void {
  const metrics = getAudioContextMetrics(inputContext, outputContext, activeSources);
  
  // Log performance warnings
  if (metrics.inputLatency > 0.05) { // 50ms
    console.warn(`🎤 [PERF] High input latency: ${metrics.inputLatency * 1000}ms`);
  }
  
  if (metrics.outputLatency > 0.05) { // 50ms
    console.warn(`🔊 [PERF] High output latency: ${metrics.outputLatency * 1000}ms`);
  }
  
  if (metrics.activeSourcesCount > 10) {
    console.warn(`🔊 [PERF] High number of active sources: ${metrics.activeSourcesCount}`);
  }
  
  if (metrics.memoryUsage > 10240) { // 10MB
    console.warn(`💾 [PERF] High estimated memory usage: ${metrics.memoryUsage}KB`);
  }
  
  if (metrics.contextState !== 'running') {
    console.warn(`⚠️  [PERF] Audio context not running: ${metrics.contextState}`);
  }
}

/**
 * Clean up audio resources
 */
export function cleanupAudioResources(
  inputContext?: AudioContext,
  outputContext?: AudioContext,
  activeSources?: Set<AudioBufferSourceNode>,
  mediaStream?: MediaStream
): Promise<void> {
  return new Promise((resolve) => {
    console.log('🧹 [PERF] Cleaning up audio resources...');
    
    // Stop all active audio sources
    if (activeSources) {
      for (const source of activeSources.values()) {
        try {
          source.stop();
          source.disconnect();
        } catch (error) {
          console.warn('Error stopping audio source:', error);
        }
      }
      activeSources.clear();
    }
    
    // Stop media stream tracks
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (error) {
          console.warn('Error stopping media track:', error);
        }
      });
    }
    
    // Close audio contexts
    const closePromises: Promise<void>[] = [];
    
    if (inputContext && inputContext.state !== 'closed') {
      closePromises.push(inputContext.close().catch(error => {
        console.warn('Error closing input context:', error);
      }));
    }
    
    if (outputContext && outputContext.state !== 'closed') {
      closePromises.push(outputContext.close().catch(error => {
        console.warn('Error closing output context:', error);
      }));
    }
    
    Promise.all(closePromises).finally(() => {
      console.log('✅ [PERF] Audio resources cleaned up');
      resolve();
    });
  });
}

/**
 * Detect audio device capabilities
 */
export async function detectAudioCapabilities(): Promise<{
  hasAudioInput: boolean;
  hasAudioOutput: boolean;
  supportedSampleRates: number[];
  maxChannels: number;
  lowLatencySupport: boolean;
}> {
  const capabilities = {
    hasAudioInput: false,
    hasAudioOutput: false,
    supportedSampleRates: [16000, 24000, 44100, 48000],
    maxChannels: 2,
    lowLatencySupport: false,
  };
  
  try {
    // Test audio input
    const devices = await navigator.mediaDevices.enumerateDevices();
    capabilities.hasAudioInput = devices.some(device => device.kind === 'audioinput');
    capabilities.hasAudioOutput = devices.some(device => device.kind === 'audiooutput');
    
    // Test low latency support (Chrome-specific)
    capabilities.lowLatencySupport = 'AudioContext' in window && 
                                   navigator.userAgent.includes('Chrome');
    
  } catch (error) {
    console.warn('Error detecting audio capabilities:', error);
  }
  
  return capabilities;
}

/**
 * Optimize buffer size based on device performance
 */
export function getOptimalBufferSize(): number {
  // Detect device performance level
  const isHighPerformance = navigator.hardwareConcurrency >= 4 &&
                           ((navigator as unknown as { deviceMemory?: number }).deviceMemory || 0) >= 4; // 4GB+ RAM
  
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    return 1024; // Larger buffer for mobile to prevent dropouts
  } else if (isHighPerformance) {
    return 256; // Smaller buffer for low latency
  } else {
    return 512; // Balanced buffer size
  }
}

/**
 * Monitor audio glitches and dropouts
 */
export class AudioGlitchMonitor {
  private glitchCount = 0;
  private lastGlitchTime = 0;
  private readonly glitchThreshold = 0.1; // 100ms between audio chunks
  
  checkForGlitch(currentTime: number): boolean {
    const timeSinceLastChunk = currentTime - this.lastGlitchTime;
    
    if (this.lastGlitchTime > 0 && timeSinceLastChunk > this.glitchThreshold) {
      this.glitchCount++;
      console.warn(`🔊 [PERF] Audio glitch detected: ${timeSinceLastChunk * 1000}ms gap`);
      
      if (this.glitchCount > 5) {
        console.error('🔊 [PERF] Multiple audio glitches detected - consider increasing buffer size');
      }
      
      this.lastGlitchTime = currentTime;
      return true;
    }
    
    this.lastGlitchTime = currentTime;
    return false;
  }
  
  getGlitchCount(): number {
    return this.glitchCount;
  }
  
  reset(): void {
    this.glitchCount = 0;
    this.lastGlitchTime = 0;
  }
}

/**
 * Performance logging utility
 */
export function logAudioPerformanceReport(
  inputContext?: AudioContext,
  outputContext?: AudioContext,
  activeSources?: Set<AudioBufferSourceNode>,
  glitchMonitor?: AudioGlitchMonitor
): void {
  const metrics = getAudioContextMetrics(inputContext, outputContext, activeSources);
  
  console.log('🎤 Audio Performance Report:');
  console.log('============================');
  console.log(`Input Latency: ${(metrics.inputLatency * 1000).toFixed(2)}ms`);
  console.log(`Output Latency: ${(metrics.outputLatency * 1000).toFixed(2)}ms`);
  console.log(`Sample Rate: ${metrics.sampleRate}Hz`);
  console.log(`Context State: ${metrics.contextState}`);
  console.log(`Active Sources: ${metrics.activeSourcesCount}`);
  console.log(`Estimated Memory: ${metrics.memoryUsage}KB`);
  
  if (glitchMonitor) {
    console.log(`Audio Glitches: ${glitchMonitor.getGlitchCount()}`);
  }
  
  console.log('============================');
} 