import { NextResponse } from 'next/server';
import pdf from 'pdf-parse/lib/pdf-parse';
import OpenAI from 'openai';
import { connectDB } from '@/lib/mongodb';
import { Consultant } from '@/models/Consultant';
import { Organization } from '@/models/Organization';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSystemPrompt(organizationId: string) {
  await connectDB();
  
  const [organization, consultants] = await Promise.all([
    Organization.findById(organizationId),
    Consultant.find({ organizationId })
  ]);
  
  const consultantDescriptions = consultants.map(consultant => {
    const yearsExp = new Date().getFullYear() - new Date(consultant.createdAt).getFullYear();
    return `- ${consultant.name}: ${consultant.level.charAt(0).toUpperCase() + consultant.level.slice(1)}, ${yearsExp} years experience in ${consultant.skills.join(', ')}`;
  }).join('\n');

  return `You are an expert proposal writer for ${organization.name}. Analyze the RFP text and create a comprehensive proposal response.
Consider our company's strengths and available consultants:
${consultantDescriptions}

Create a detailed proposal that:
1. Addresses the RFP requirements
2. Matches our consultants' skills to project needs (only put forward relevant consultants, matching project needs)
3. Includes timeline and delivery approach
4. Highlights our competitive advantages`;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('rfp') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer and extract text
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdf(buffer);
    
    // Generate dynamic system prompt based on actual consultants
    const systemPrompt = await generateSystemPrompt(session.user.organizationId);

    // Generate proposal with OpenAI
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please analyze this RFP and create a detailed proposal response:\n\n${pdfData.text}` }
      ],
      temperature: 0.7,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Proposal generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate proposal' },
      { status: 500 }
    );
  }
}
