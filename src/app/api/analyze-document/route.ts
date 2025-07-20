import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '../../../../auth';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please upload a PDF, JPG, or PNG file.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Please upload a file smaller than 10MB.' },
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name}, MIME: ${file.type}, Size: ${file.size} bytes`);

    try {
      // Convert file to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileBase64 = buffer.toString('base64');

      // Prepare the prompt for document analysis
      const analysisPrompt = `Briefly summarize the key points of this document. This summary will be used as context for a chat conversation. 

Please provide:
1. Main topics or themes covered
2. Key facts, data, or information presented
3. Important conclusions or recommendations

Keep the summary concise but comprehensive enough to serve as useful context for answering questions about this document.`;

      // Use Gemini's multimodal capabilities
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

      const contents = [
        {
          role: "user",
          parts: [
            { text: analysisPrompt },
            {
              inlineData: {
                mimeType: file.type,
                data: fileBase64
              }
            }
          ]
        }
      ];

      console.log('Sending request to Gemini API...');
      const result = await model.generateContent({ contents });
      const summary = result.response.text();

      console.log('Document analysis completed successfully');

      return NextResponse.json({
        success: true,
        summary: summary,
        filename: file.name,
        mimeType: file.type,
        size: file.size
      });

    } catch (geminiError: unknown) {
      console.error('Gemini API error:', geminiError);
      
      // Handle specific Gemini API errors
      let errorMessage = 'Failed to analyze document. Please try again.';
      
      if (geminiError instanceof Error) {
        if (geminiError.message?.includes('quota')) {
          errorMessage = 'Gemini API quota exceeded. Please try again later.';
        } else if (geminiError.message?.includes('safety')) {
          errorMessage = 'Document analysis blocked due to safety filters. Please try a different document.';
        } else if (geminiError.message?.includes('authentication')) {
          errorMessage = 'Gemini API authentication failed. Please check your API key.';
        } else if (geminiError.message?.includes('unsupported')) {
          errorMessage = 'Document format not supported. Please try a different file.';
        }
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Document analysis API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload documents.' },
    { status: 405 }
  );
} 