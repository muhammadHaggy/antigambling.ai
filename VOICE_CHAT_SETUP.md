# Voice Chat Feature Setup Guide

## Overview

The voice chat feature allows users to have real-time voice conversations with AI characters using Google's Gemini Live API. Each character has been assigned a gender-appropriate voice that matches their personality and background.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Google Gemini API Key** with access to Gemini Live API
3. **Modern web browser** with microphone support
4. **HTTPS connection** (required for microphone access)

## Environment Setup

### 1. Create Environment File

Create a `.env.local` file in the root directory of your project:

```bash
# Google Gemini API Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Other existing environment variables...
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=your_database_url
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Enable Gemini Live API access
5. Copy the API key to your `.env.local` file

**Important**: The Gemini Live API may require special access or be in preview mode. Check the latest documentation.

## Character Voice Mapping

Each character has been assigned a specific voice that matches their gender and personality:

### Male Characters

| Character | Voice | Description | Personality Match |
|-----------|-------|-------------|-------------------|
| **Andang** | Orus | Firm, Lower middle pitch | Mature, grounded after recovery |
| **Rian Dwi Wicaksono** | Enceladus | Breathy, Lower pitch | Tragic, remorseful tone |
| **Nofrianto** | Achird | Friendly, Lower middle pitch | Street-smart, relatable |
| **Dr. Ardi Prasetyo** | Iapetus | Clear, Lower middle pitch | Professional, clear communication |
| **Ustadz Fikri Maulana** | Umbriel | Easy-going, Lower middle pitch | Warm, brotherly tone |
| **Pastor Samuel Tobing** | Schedar | Even, Lower middle pitch | Pastoral wisdom |
| **Bhante Dhammasila** | Algieba | Smooth, Lower pitch | Calm, meditative nature |

### Female Characters

| Character | Voice | Description | Personality Match |
|-----------|-------|-------------|-------------------|
| **Mbak Rara** | Laomedeia | Upbeat, Higher pitch | Energetic, passionate activist |
| **Ida Ayu Wulan Daryani** | Vindemiatrix | Gentle, Middle pitch | Soft-spoken, meditative priestess |

## Features

### Core Functionality

- **Real-time voice conversation** with AI characters
- **Character-specific voices** and personalities
- **Phone call-like interface** with professional design
- **Audio permissions handling** with clear error messages
- **Visual feedback** for voice activity (speaking/listening)
- **Call controls** (mute, hang up)
- **Call duration timer**
- **Seamless integration** with existing text chat

### UI Components

1. **Call Button**: Phone icon in chat header (top right)
2. **Voice Call Overlay**: Full-screen phone call interface
3. **Audio Waveform**: Visual feedback around character avatar
4. **Call Controls**: Mute, hang up, and speaker buttons
5. **Status Indicators**: Connection status and voice activity

## Usage Instructions

### Starting a Voice Chat

1. **Navigate to any character chat page**
2. **Click the phone icon** in the top right corner of the chat header
3. **Grant microphone permission** when prompted by the browser
4. **Wait for connection** - you'll see "Connecting..." status
5. **Start speaking** when you see "Connected" status

### During Voice Chat

- **Green indicator**: You are speaking
- **Blue indicator**: Character is speaking
- **Mute button**: Toggle your microphone on/off
- **Hang up button**: End the voice chat (large red button)
- **Call timer**: Shows duration of the conversation

### Ending Voice Chat

- **Click the hang up button** (red phone icon)
- **Voice chat overlay disappears** and returns to text chat
- **All audio resources are cleaned up** automatically

## Technical Implementation

### Architecture

```
Voice Chat System
├── useVoiceChat Hook (Core functionality)
├── useAudioPermissions Hook (Permission management)
├── VoiceCallOverlay Component (UI)
├── VoiceCallControls Component (Controls)
├── AudioWaveform Component (Visual feedback)
└── Voice Configuration System (Character mapping)
```

### Key Files

- `src/app/hooks/useVoiceChat.ts` - Main voice chat logic
- `src/app/hooks/useAudioPermissions.ts` - Permission handling
- `src/app/lib/voiceConfig.ts` - Character voice mapping
- `src/app/lib/audioUtils.ts` - Audio processing utilities
- `src/app/_components/VoiceCallOverlay.tsx` - Call interface
- `src/app/_components/VoiceCallControls.tsx` - Call controls
- `src/app/_components/AudioWaveform.tsx` - Visual feedback

### Audio Processing

- **Input**: 16kHz PCM audio from microphone
- **Output**: 24kHz audio from Gemini Live API
- **Processing**: Real-time audio chunks sent to Gemini
- **Playback**: Decoded audio played through Web Audio API

## Browser Compatibility

### Supported Browsers

- **Chrome** (recommended) - Full support
- **Firefox** - Full support
- **Safari** - Full support (macOS/iOS)
- **Edge** - Full support

### Requirements

- **Microphone access** permission
- **HTTPS connection** (required for getUserMedia)
- **Modern Web Audio API** support
- **WebSocket** support for Gemini Live API

## Troubleshooting

### Common Issues

#### 1. "Microphone permission denied"
- **Solution**: Enable microphone access in browser settings
- **Chrome**: Settings → Privacy and security → Site settings → Microphone
- **Firefox**: Settings → Privacy & Security → Permissions → Microphone

#### 2. "NEXT_PUBLIC_GEMINI_API_KEY is not set"
- **Solution**: Add your Gemini API key to `.env.local`
- **Check**: Restart development server after adding environment variables

#### 3. "Failed to initialize session"
- **Solution**: Verify API key has Gemini Live API access
- **Check**: Network connection and API quotas

#### 4. "No audio output"
- **Solution**: Check browser audio settings and volume
- **Check**: Ensure speakers/headphones are working

#### 5. "Connection keeps dropping"
- **Solution**: Check internet connection stability
- **Check**: Gemini Live API service status

### Development Issues

#### 1. Build errors
```bash
npm run build
```
Check for TypeScript errors and fix them.

#### 2. Runtime errors
- Open browser developer tools (F12)
- Check console for error messages
- Verify environment variables are loaded

#### 3. Audio not working in development
- Ensure you're using HTTPS or localhost
- Check microphone permissions in browser
- Verify audio context is properly initialized

## Performance Optimization

### Best Practices

1. **Audio Context Management**: Properly close audio contexts when done
2. **Memory Cleanup**: Stop all audio sources and disconnect nodes
3. **Error Handling**: Graceful degradation when voice chat fails
4. **Permission Caching**: Remember permission state across sessions

### Monitoring

- **Console logs**: Voice chat operations are logged with `[VOICE]` prefix
- **Audio levels**: Input amplitude is logged for debugging
- **Connection status**: WebSocket connection state is tracked

## Security Considerations

### API Key Security

- **Never expose API keys** in client-side code
- **Use environment variables** for sensitive data
- **Rotate API keys** regularly
- **Monitor API usage** for unusual activity

### Audio Privacy

- **Microphone access** is only requested when needed
- **Audio data** is processed in real-time, not stored
- **Permissions** can be revoked at any time
- **HTTPS required** for secure audio transmission

## Future Enhancements

### Planned Features

1. **Speaker toggle functionality** (currently placeholder)
2. **Voice activity detection** improvements
3. **Audio quality settings** (bitrate, sample rate)
4. **Recording capabilities** (with user consent)
5. **Multi-language support** beyond Indonesian
6. **Voice customization** options
7. **Accessibility improvements** (screen reader support)

### Technical Improvements

1. **WebRTC integration** for better audio quality
2. **Noise cancellation** and echo reduction
3. **Adaptive bitrate** based on connection quality
4. **Offline voice synthesis** fallback
5. **Audio compression** optimization

## Support

For issues or questions related to the voice chat feature:

1. **Check this documentation** first
2. **Review browser console** for error messages
3. **Verify environment setup** is correct
4. **Test with different characters** to isolate issues
5. **Check Gemini Live API** service status

## Version History

- **v1.0.0**: Initial voice chat implementation
  - Character-specific voice mapping
  - Real-time voice conversation
  - Phone call-like interface
  - Audio permissions handling
  - Visual feedback system 