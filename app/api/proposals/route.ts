import { NextResponse } from "next/server";
import PDFParser from 'pdf-parse';

export async function POST(request: Request) {
 
  try {
    const formData = await request.formData();
    const file = formData.get('rfp') as File;
    
    if (!file) {
      return new Response('No file provided', { status: 400 });
    }

    // Convert File to Buffer for pdf-parse
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Parse PDF
    try {
      const pdfData = await PDFParser(buffer);
      const text = pdfData.text;
      
      // Basic validation of the extracted text
      if (!text || text.trim().length === 0) {
        return new Response('Could not extract text from PDF', { status: 400 });
      }

      console.log("Extracted PDF content preview:", text.substring(0, 300));

      // Request a streamed completion from OpenAI
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an AI tool that drafts proposal responses based on provided RFPs. Provide a clear, detailed and well-structured draft proposal response.",
            },
            { 
              role: "user", 
              content: `Please analyze this RFP content and draft a response:\n\n${text}` 
            },
          ],
          stream: true,
        }),
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json().catch(() => null);
        console.error('OpenAI API Error:', {
          status: openaiResponse.status,
          statusText: openaiResponse.statusText,
          error: errorData
        });
        return new Response(
          `OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}${
            errorData ? `\n${JSON.stringify(errorData, null, 2)}` : ''
          }`,
          { status: openaiResponse.status }
        );
      }

      if (!openaiResponse.body) {
        console.error('OpenAI API returned no response body');
        return new Response('No response from OpenAI API', { status: 500 });
      }

      return new NextResponse(openaiResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return new Response('Failed to parse PDF file', { status: 400 });
    }
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Failed to process file', { status: 500 });
  }
}
