# Backend Setup Guide

This guide will help you set up the backend integration for the Character.ai clone using the Google Gemini API.

## Prerequisites

- Node.js 18+ installed
- A Google AI Studio account
- Basic knowledge of Next.js and TypeScript

## Phase 1: Backend Setup & Configuration ✅ COMPLETED

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" and create a new key
4. Copy the API key (keep it secure!)

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
GEMINI_API_KEY=your_api_key_here
```

**Important**: Never commit this file to version control. It's already in `.gitignore`.

### 3. Install Dependencies

The required dependencies are already installed:
- `@google/generative-ai` - Google's official Gemini SDK

## Phase 2: Frontend Integration ✅ COMPLETED

### What Was Updated

The frontend has been fully integrated with the backend API:

#### 1. ChatContext Updates
- **Real API Integration**: Replaced mock responses with actual Gemini API calls
- **Message Format Conversion**: Converts between frontend and Gemini message formats
- **Enhanced Error Handling**: Specific error messages for different failure scenarios
- **Improved Loading States**: Better user feedback during API calls

#### 2. Component Updates
- **ChatLog**: Now displays character greetings and handles real message flow
- **MessageInput**: Simplified interface with callback-based message sending
- **ChatPageClient**: Improved character loading and error handling

#### 3. Character Greetings
- Characters now display their custom greeting messages from the backend data
- Greetings are shown automatically when starting a new conversation

#### 4. Error Handling
The system now provides specific error messages for:
- Missing API key configuration
- Character not found
- API quota exceeded
- Network connectivity issues
- General API failures

## How to Test

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```

2. **Add Your API Key**:
   - Create `.env.local` with your Gemini API key
   - Restart the development server

3. **Test the Chat**:
   - Visit `http://localhost:3000`
   - Click on any character
   - Start chatting!

## API Usage Examples

### Successful Chat Request
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "characterId": "elon-musk",
    "chatHistory": [
      {
        "id": "user-1",
        "role": "user",
        "parts": [{"text": "Hello!"}],
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ]
  }'
```

### Response Format
```json
{
  "success": true,
  "reply": "Hello! Great to meet you. I'm always excited to discuss innovation and the future of technology. What's on your mind today?"
}
```

## Error Scenarios

### Missing API Key
```json
{
  "success": false,
  "error": "Gemini API key not configured. Please add GEMINI_API_KEY to your .env.local file."
}
```

### Character Not Found
```json
{
  "success": false,
  "error": "Character not found: invalid-character-id"
}
```

### API Quota Exceeded
```json
{
  "success": false,
  "error": "Gemini API quota exceeded. Please try again later."
}
```

## Character Data Structure

Characters are defined in `/src/lib/characters.ts` with the following structure:

```typescript
interface Character {
  id: string;
  name: string;
  avatar: string;
  greeting: string;
  backgroundStory: string;
  creator: string;
  description: string;
  interactions: number;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Available Characters

The system includes 6 pre-configured characters:
- **Elon Musk** - Tech entrepreneur and innovator
- **Socrates** - Ancient Greek philosopher
- **Sherlock Holmes** - Master detective
- **Marie Curie** - Pioneering scientist
- **Albert Einstein** - Theoretical physicist
- **Leonardo da Vinci** - Renaissance polymath

## Advanced Features

### Chat Persistence
- Conversations are automatically saved to localStorage
- Chat history persists across browser sessions
- Each character has separate conversation history

### Prompt Engineering
- Each character has a detailed background story (300+ words)
- System instructions ensure consistent character behavior
- Context-aware responses based on conversation history

### Real-time Features
- Typing indicators during API calls
- Auto-scrolling chat interface
- Responsive message input with auto-resize

## Troubleshooting

### Common Issues

1. **"API key not configured" error**
   - Ensure `.env.local` exists with `GEMINI_API_KEY=your_key`
   - Restart the development server after adding the key

2. **"Character not found" error**
   - Check that the character ID in the URL matches one in `/src/lib/characters.ts`
   - Verify the character data is properly exported

3. **Network errors**
   - Check your internet connection
   - Verify the Gemini API is accessible from your location

4. **Quota exceeded**
   - The free tier has usage limits
   - Consider upgrading your Google AI Studio plan

### Debug Mode

Set `NODE_ENV=development` to see detailed error logs in the console.

## Next Steps

The backend integration is now complete! The application provides:
- ✅ Real AI-powered character conversations
- ✅ Persistent chat history
- ✅ Character-specific personalities
- ✅ Comprehensive error handling
- ✅ Modern, responsive UI

You can now:
1. Add more characters to `/src/lib/characters.ts`
2. Customize character personalities by editing their `backgroundStory`
3. Implement additional features like conversation sharing
4. Deploy to production platforms like Vercel or Netlify

## Production Deployment

When deploying to production:
1. Add your `GEMINI_API_KEY` to your hosting platform's environment variables
2. Ensure your domain is whitelisted in Google AI Studio (if required)
3. Consider implementing rate limiting for API calls
4. Monitor usage to avoid quota limits

The application is now ready for production use! 