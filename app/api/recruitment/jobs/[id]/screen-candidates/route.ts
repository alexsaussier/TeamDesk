import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import pdfParse from 'pdf-parse';

/*
 * API Route: POST /api/recruitment/jobs/[id]/screen-candidates
 * 
 * This route handles the automated screening of candidates for a specific job posting.
 * It processes each candidate's resume stored in S3, evaluates them against the job requirements
 * using OpenAI's GPT model, and updates their screening scores in the database.
 * 
 * The screening process:
 * 1. Retrieves the job and its candidates from the database
 * 2. For each candidate's resume:
 *    - Downloads the PDF from S3
 *    - Extracts text content
 *    - Sends to OpenAI for evaluation against job requirements
 *    - Updates candidate's score in database
 * 
 * Authentication: Requires a valid session
 * Permissions: Only accessible to users with access to the job
 */

console.log("screen-candidates route loaded");

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to read S3 object
async function getS3Object(s3Url: string): Promise<string> {
  // Parse the S3 URL to get bucket and key
  const s3UrlPattern = /s3:\/\/([^\/]+)\/(.+)/;
  const match = s3Url.match(s3UrlPattern);
  
  if (!match) {
    throw new Error(`Invalid S3 URL format: ${s3Url}`);
  }
  
  const [, bucket, key] = match;
  
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  
  const response = await s3Client.send(command);
  
  // Convert the readable stream to a buffer
  if (!response.Body) {
    throw new Error('Empty response body');
  }
  
  const stream = response.Body as Readable;
  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
  
  // Check if it's a PDF and extract text
  if (key.toLowerCase().endsWith('.pdf')) {
    try {
      // Use pdf-parse to extract text from the PDF buffer
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      // Fall back to treating as text if PDF extraction fails
      return buffer.toString('utf-8');
    }
  }
  
  // For non-PDF files, return as UTF-8 string
  return buffer.toString('utf-8');
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log("request received: starting to screen candidates.");

    const jobId = await params.id;

    // Find the job
    const job = await Job.findOne({
      _id: new mongoose.Types.ObjectId(jobId),
      organizationId: new mongoose.Types.ObjectId(session.user.organizationId)
    });
    console.log("job found: ");

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Find candidates without scores
    const candidatesToScreen = job.candidates.filter(
      (candidate: any) => candidate.score === undefined || candidate.score === null || candidate.score === 0
    );
    console.log("candidates to screen: ", candidatesToScreen.length);

    if (candidatesToScreen.length === 0) {
      return NextResponse.json({ 
        success: true,
        screenedCount: 0,
        message: 'No candidates need screening'
      });
    }

    let screenedCount = 0;

    // Process each candidate
    for (const candidate of candidatesToScreen) {
      try {
        // Skip if no resume
        if (!candidate.resumeUrl) {
          console.log(`No resume URL for candidate: ${candidate._id}`);
          continue;
        }

        // Check if the URL is an S3 URL
        if (!candidate.resumeUrl.startsWith('s3://')) {
          console.log(`Not an S3 URL: ${candidate.resumeUrl}`);
          continue;
        }

        // Get resume text from S3
        let resumeText;
        try {
          resumeText = await getS3Object(candidate.resumeUrl);
          console.log(`Successfully retrieved resume from S3, first 100 chars: ${resumeText.substring(0, 100)}`);
        } catch (error) {
          console.error(`Error retrieving resume from S3 for candidate ${candidate._id}:`, error);
          continue;
        }

        // Score the resume against the job description
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert recruiter who evaluates resumes against job descriptions.
              Score the candidate's resume from 0-100 based on how well it matches the job requirements.
              Consider skills, experience, education, and overall fit.
              
              ${job.additionalInstructions ? `IMPORTANT SCREENING INSTRUCTIONS: ${job.additionalInstructions}` : ''}
              
              Return only a number from 0-100 representing the score.`
            },
            {
              role: 'user',
              content: `Job Description:\n${job.jobDescription}\n\nResume:\n${resumeText}`
            }
          ],
          temperature: 0.3,
        });

        const scoreText = completion.choices[0].message.content?.trim();
        
        const score = parseInt(scoreText || '0', 10);
        
        // Handle parsing errors
        if (!isNaN(score)) {
          // Update the candidate's score
          candidate.score = score;
          screenedCount++;
          console.log(`Successfully scored candidate ${candidate._id} with score ${score}`);
        } else {
          console.error(`Failed to parse score for candidate ${candidate._id}: "${scoreText}"`);
        }
      } catch (error) {
        console.error(`Error screening candidate ${candidate._id}:`, error);
        // Continue with the next candidate
      }
    }

    // Save the updated job
    job.updatedAt = new Date();
    await job.save();

    return NextResponse.json({ 
      success: true,
      screenedCount
    });
  } catch (error) {
    console.error('Error screening candidates:', error);
    return NextResponse.json(
      { error: 'Failed to screen candidates' },
      { status: 500 }
    );
  }
} 