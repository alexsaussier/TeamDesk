import { NextResponse } from 'next/server';
import pdf from 'pdf-parse/lib/pdf-parse'

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('rfp') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for pdf-parse
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Parse PDF
    const pdfData = await pdf(buffer);
    
    // Return the extracted text
    return NextResponse.json({ text: pdfData.text });

  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}
