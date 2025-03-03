import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the request is multipart form data (audio) or JSON (text)
    const contentType = request.headers.get('content-type') || '';
    let input = '';
    let transcription = '';

    if (contentType.includes('multipart/form-data')) {
      // Handle audio input
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File;
      
      if (!audioFile) {
        return NextResponse.json(
          { error: 'Audio file is required' },
          { status: 400 }
        );
      }

      // Convert audio to text using OpenAI Whisper API
      const audioBuffer = await audioFile.arrayBuffer();
      
      // Create a proper File object from the buffer
      const audioFileObj = new File(
        [audioBuffer], 
        audioFile.name, 
        { type: audioFile.type, lastModified: Date.now() }
      );
      
      const whisperResponse = await openai.audio.transcriptions.create({
        file: audioFileObj,
        model: 'whisper-1',
      });
      
      transcription = whisperResponse.text;
      input = transcription;
      
      console.log('Transcribed audio input:', input);
    } else {
      // Handle text input
      const body = await request.json();
      input = body.input;
      
      if (!input) {
        return NextResponse.json(
          { error: 'Input is required' },
          { status: 400 }
        );
      }
    }

    // Generate job description using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert recruiter who creates professional job descriptions. 
          Based on the user's input, create a comprehensive job description with the following sections:
          1. Job Title
          2. About the Company
          3. Job Overview
          4. Responsibilities
          5. Requirements
          6. Preferred Qualifications
          7. Benefits and Perks
          
          Format the output in a clean, professional way with appropriate headings and bullet points.
          Do not include any explanations or notes outside of the job description itself.`
        },
        {
          role: 'user',
          content: `Create a job description based on the following information: ${input}`
        }
      ],
      temperature: 0.7,
    });

    const description = completion.choices[0].message.content;

    return NextResponse.json({ 
      description,
      transcription: contentType.includes('multipart/form-data') ? transcription : undefined
    });
  } catch (error) {
    console.error('Error generating job description:', error);
    return NextResponse.json(
      { error: 'Failed to generate job description' },
      { status: 500 }
    );
  }
} 