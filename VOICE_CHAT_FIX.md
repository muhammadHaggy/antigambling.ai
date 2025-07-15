# Voice Chat "Audio context not available" Fix

## Problem Description

The voice chat feature was failing with "Audio context not available" error due to a race condition between:
1. Component initialization and cleanup
2. Session initialization and recording start
3. React's Strict Mode causing component remounts

## Root Cause

The main issue was in the cleanup logic of the `useVoiceChat` hook:

1. **Premature Cleanup**: The cleanup `useEffect` had dependencies `[forceStopVoiceChat, status]` which caused it to recreate the cleanup function every time the status changed
2. **Race Condition**: During voice chat initialization:
   - `startVoiceChat` begins and sets `cleanupPreventedRef.current = true`
   - Component unmounts (due to React Strict Mode or navigation)
   - Cleanup runs and calls `forceStopVoiceChat()` which destroys audio contexts
   - WebSocket connection opens successfully (after cleanup)
   - `startRecording` is called but finds no audio context

## Solution

### 1. Fixed Cleanup Logic
- Changed cleanup `useEffect` to have empty dependencies `[]` so it only runs once on mount
- Removed dependency on `forceStopVoiceChat` and `status` which was causing premature cleanup
- Inlined the cleanup logic to avoid calling `forceStopVoiceChat` during initialization

### 2. Added Audio Context Recovery
- Modified `startRecording` to detect when audio context is closed or unavailable
- Added automatic recreation of audio contexts if they become invalid
- Recreates gain nodes and connections when audio context is reinitialized

### 3. Improved State Management
- Better handling of `cleanupPreventedRef.current` flag
- Reset cleanup prevention flag when recording starts successfully
- Proper error handling that resets all flags on failure

### 4. Extended Cleanup Delay
- Increased delayed cleanup timeout from 1 second to 2 seconds
- This gives more time for session initialization to complete

## Key Changes

### In `useVoiceChat.ts`:

1. **Cleanup Effect** (lines ~553-594):
   ```typescript
   // OLD: useEffect(() => { ... }, [forceStopVoiceChat, status]);
   // NEW: useEffect(() => { ... }, []); // Empty dependency array
   ```

2. **Audio Context Recovery** in `startRecording`:
   ```typescript
   // Check if audio context is available and valid
   if (!inputAudioContextRef.current || inputAudioContextRef.current.state === 'closed') {
     console.log('🔍 [VOICE-REC] Audio context not available or closed, reinitializing...');
     
     // Reinitialize audio contexts
     inputAudioContextRef.current = new (window.AudioContext || ...)({
       sampleRate: 16000
     });
     // ... recreate gain nodes and connections
   }
   ```

3. **Better Flag Management**:
   - Keep `cleanupPreventedRef.current = true` during entire initialization
   - Reset to `false` only when recording starts successfully or on error
   - Added proper error handling in all functions

## Testing

To test the fix:
1. Start the development server: `npm run dev`
2. Navigate to a character chat page
3. Click the phone icon to start voice chat
4. The voice chat should initialize without "Audio context not available" error
5. Voice recording should start successfully

## Files Modified

- `character-ai-clone/src/app/hooks/useVoiceChat.ts` - Main fix implementation
- `character-ai-clone/test-voice-fix.js` - Test script for audio context recreation
- `character-ai-clone/VOICE_CHAT_FIX.md` - This documentation

## Prevention

To prevent similar issues in the future:
1. Be careful with `useEffect` dependencies that can cause frequent re-creation
2. Use refs for objects that should persist across renders
3. Always check if audio contexts are valid before using them
4. Implement proper error handling and state cleanup
5. Consider React Strict Mode effects during development 