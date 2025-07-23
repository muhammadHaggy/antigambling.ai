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

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Please upload a file smaller than 2MB.' },
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
      const analysisPrompt = `Kamu adalah konsultan keuangan profesional kelas dunia. Tugasmu adalah menganalisis data mutasi rekening dan memberikan penjelasan yang sangat detail, jelas, dan mudah dipahami oleh orang awam. Jangan gunakan istilah keuangan yang rumit, jangan gunakan emoji, dan jangan gunakan efek penulisan seperti bold, italic, underline, atau format khusus lainnya.

Gunakan format output berikut, dan isi setiap bagian dengan narasi yang ramah, membangun, dan komunikatif:

1. Ringkasan Keuangan:
Tuliskan ringkasan keuangan dalam bentuk cerita narasi. Jelaskan dari mana saja sumber pemasukan terbesar, ke mana saja pengeluaran terbanyak, dan apa artinya bagi kondisi keuangan user. Jika ada transaksi di e-commerce seperti Shopee, Tokopedia, Traveloka, Bukalapak, Lazada, Blibli, dan lainnya, sebutkan secara spesifik: berapa kali transaksi dilakukan di masing-masing platform, dan total nominalnya. Jika ada transaksi yang sering terjadi di kategori tertentu (misal: transportasi, makanan, hiburan), sebutkan juga jumlah dan totalnya.

2. Metrik Utama:
Jelaskan angka-angka penting seperti total pemasukan, total pengeluaran, selisih, dan pengeluaran terbesar, semuanya dalam bentuk kalimat narasi. Jika ditemukan hutang atau penggunaan paylater, pinjaman online, atau kartu kredit (misal: Shopee Paylater, Kredivo, Akulaku, Gopay Pinjam, OVO Paylater, dsb), analisis secara detail: sebutkan jumlah transaksi, total nominal, dan frekuensi penggunaannya. Jelaskan juga jika ada pola top-up dompet digital (Gopay, OVO, Dana, Shopeepay, dsb): berapa kali top-up dilakukan ke masing-masing platform, dan total nominalnya. Jika ada transaksi transfer antar bank atau ke rekening lain, sebutkan juga jumlah dan totalnya.

3. Insight:
Berikan saran atau insight yang membangun dan actionable, misalnya tips mengelola hutang, mengatur pengeluaran e-commerce, atau strategi meningkatkan tabungan. Jika ada pola pengeluaran yang kurang sehat, berikan peringatan dan solusi konkrit. Sampaikan dengan bahasa yang profesional, tegas, namun tetap ramah dan memotivasi.

Pastikan seluruh output hanya berupa paragraf narasi, tidak ada tabel, list, emoji, atau efek penulisan apapun. Gunakan bahasa Indonesia yang profesional, komunikatif, dan mudah dipahami.`;

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