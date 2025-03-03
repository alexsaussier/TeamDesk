import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

/**
 * API Route: /api/recruitment/apply
 * 
 * Handles job applications submitted by candidates. This route:
 * - Validates required application fields (name, email, resume, etc)
 * - Uploads the candidate's resume to S3 storage
 * - Processes application details including cover letter and visa requirements
 * - Associates the application with the corresponding job posting
 * - Stores application data in the database
 * 
 * @method POST
 * @access Public
 */


const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});


export async function POST(request: Request) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const jobId = formData.get('jobId') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const coverLetter = formData.get('coverLetter') as string;
    const salaryExpectation = formData.get('salaryExpectation') as string;
    const visaRequired = formData.get('visaRequired') === 'true';
    const availableFrom = formData.get('availableFrom') as string;
    const resume = formData.get('resume') as File;
    
    // Validate required fields
    if (!jobId || !name || !email || !resume) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Find the job
    const job = await Job.findOne({
      publicLink: { $regex: `/jobs/${jobId}$` }
    });
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Upload resume to S3
    const resumeBuffer = Buffer.from(await resume.arrayBuffer());
    const fileExtension = resume.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const s3Key = `resourcing-app/applicant-resumes/${jobId}/${uniqueFileName}`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
      Body: resumeBuffer,
      ContentType: resume.type,
    }));
    
    // Store S3 URL in database
    const resumeUrl = `s3://${process.env.AWS_S3_BUCKET_NAME}/${s3Key}`;
    
    // Add the candidate to the job without scoring
    job.candidates.push({
      name,
      email,
      phone,
      coverLetter,
      resumeUrl,  // This now contains the S3 URL
      status: 'New',
      currentRound: 0,
      salaryExpectation: salaryExpectation ? parseInt(salaryExpectation, 10) : undefined,
      visaRequired,
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
    });

    job.updatedAt = new Date();
    await job.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    );
  }
} 