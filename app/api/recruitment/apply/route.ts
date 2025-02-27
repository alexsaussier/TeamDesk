import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    if (!jobId || !name || !email || !resume) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the job
    const job = await Job.findById(new mongoose.Types.ObjectId(jobId));
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Save the resume file
    const resumeBuffer = Buffer.from(await resume.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'uploads', 'resumes', jobId);
    
    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });
    
    const fileName = `${Date.now()}-${resume.name}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, resumeBuffer);
    
    // Store the relative path
    const resumeUrl = `/uploads/resumes/${jobId}/${fileName}`;

    // Parse resume with OpenAI
    let score = 0;
    try {
      // Convert resume to text (simplified - in production you'd use a proper parser)
      const resumeText = resumeBuffer.toString('utf-8');
      
      // Score the resume against the job description
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert recruiter who evaluates resumes against job descriptions.
            Score the candidate's resume from 0-100 based on how well it matches the job requirements.
            Consider skills, experience, education, and overall fit.
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
      score = parseInt(scoreText || '0', 10);
      
      // Handle parsing errors
      if (isNaN(score)) {
        score = 0;
      }
    } catch (error) {
      console.error('Error scoring resume:', error);
      // Continue with score = 0 if there's an error
    }

    // Add the candidate to the job
    job.candidates.push({
      name,
      email,
      phone,
      coverLetter,
      resumeUrl,
      status: 'New',
      currentRound: 0,
      score,
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