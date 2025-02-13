import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const config = {
  runtime: 'edge',
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  console.log('API Route Hit:', request.url);
  console.log('Method:', request.method);
  try {
    console.log('API URL:', new URL(request.url).pathname);

    // Add size check
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      return new Response('File too large', { status: 413 });
    }

    console.log('Received request to /api/proposals')
    const formData = await request.formData();
    console.log('FormData received:', formData.get("rfp"))
    const file = formData.get('rfp') as File;

    if (!file) {
      return new Response('No file provided', { status: 400 });
    }

    // Convert File to Buffer directly
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    try {
      const pdfData = await pdfParse(buffer);
      
      // Create prompt and continue with OpenAI call  - SW1V 3QX
      const prompt = `Draft a detailed response proposal for the following RFP:\n\n${pdfData.text}`;
      
      // Request a streamed completion from OpenAI
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an AI tool that drafts proposal responses based on provided RFPs. Provide a clear, detailed and well-structured draft proposal response.",
            },
            { role: "user", content: prompt },
          ],
          stream: true,
        }),
      });

      if (!openaiResponse.ok || !openaiResponse.body) {
        const errorMessage = await openaiResponse.text();
        return new NextResponse(errorMessage, { status: 500 });
      }

      // Return the streaming response
      return new NextResponse(openaiResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (error) {
      console.error('Error in proposal API:', error);
      return new NextResponse('Failed to process file', { status: 500 });
    }
  } catch (error) {
    console.error('Error in proposal API:', error);
    return new NextResponse('Failed to process file', { status: 500 });
  }
}
