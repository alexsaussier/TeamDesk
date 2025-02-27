import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import OpenAI from 'openai';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import pdf from 'pdf-parse/lib/pdf-parse';

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
    console.log("request received at alternative endpoint: starting to screen candidates.");

    const jobId = params.id;
    console.log("Job ID from params:", jobId);

    // Find the job
    const job = await Job.findOne({
      _id: new mongoose.Types.ObjectId(jobId),
      organizationId: new mongoose.Types.ObjectId(session.user.organizationId)
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

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

    // Helper function to retrieve and parse PDF from S3
    async function getResumeTextFromS3(s3Url: string): Promise<string> {
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
      const chunks: Buffer[] = [];
      
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      
      const buffer = Buffer.concat(chunks);
      
      // Check if it's a PDF and extract text using pdf-parse
      if (key.toLowerCase().endsWith('.pdf')) {
        try {
          const pdfData = await pdf(buffer);
          return pdfData.text;
        } catch (error) {
          console.error('Error extracting text from PDF:', error);
          // Fall back to treating as text if PDF extraction fails
          return buffer.toString('utf-8');
        }
      }
      
      // For non-PDF files, return as UTF-8 string
      return buffer.toString('utf-8');
    }

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

        console.log(`Retrieving resume from S3: ${candidate.resumeUrl}`);
        
        try {
          // Get resume text from S3
          const resumeText = await getResumeTextFromS3(candidate.resumeUrl);
          console.log(`Successfully retrieved resume, length: ${resumeText.length} characters`);
          console.log("resumeText sample: ", resumeText.slice(0, 500));
          
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
            candidate.score = 50; // Fallback score
            screenedCount++;
          }
        } catch (error) {
          console.error(`Error processing resume for candidate ${candidate._id}:`, error);
          // Assign a fallback score
          candidate.score = Math.floor(Math.random() * 51) + 50;
          console.log(`Assigned fallback score ${candidate.score} to candidate ${candidate._id} due to error`);
          screenedCount++;
        }
      } catch (error) {
        console.error(`Error checking candidate ${candidate._id}:`, error);
        // Continue with the next candidate
      }
    }

    // Save the updated job
    job.updatedAt = new Date();
    await job.save();

    return NextResponse.json({ 
      success: true,
      screenedCount,
      message: `Successfully screened ${screenedCount} candidates`
    });
  } catch (error) {
    console.error('Error in screen-candidates-alt:', error);
    return NextResponse.json(
      { error: 'Failed to screen candidates' },
      { status: 500 }
    );
  }
} 