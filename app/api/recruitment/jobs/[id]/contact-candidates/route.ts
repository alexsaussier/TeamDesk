import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

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

    const jobId = params.id;
    const body = await request.json();
    const { 
      candidateIds, 
      emailTemplate, 
      schedulingDetails,
      schedulingMethod,
      calendlyLink,
      availableDates 
    } = body;

    if (!candidateIds || !candidateIds.length || !emailTemplate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the job
    const job = await Job.findOne({
      _id: new mongoose.Types.ObjectId(jobId),
      organizationId: new mongoose.Types.ObjectId(session.user.organizationId)
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Filter candidates by the provided IDs
    const candidatesToContact = job.candidates.filter(
      (candidate: any) => candidateIds.includes(candidate._id.toString())
    );

    if (!candidatesToContact.length) {
      return NextResponse.json(
        { error: 'No matching candidates found' },
        { status: 404 }
      );
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Send emails to each candidate
    const emailPromises = candidatesToContact.map(async (candidate: any) => {
      // Replace template variables
      let emailContent = emailTemplate
        .replace(/{{candidate_name}}/g, candidate.name)
        .replace(/{{scheduling_details}}/g, schedulingDetails);

      // Send the email
      await transporter.sendMail({
        from: `"${session.user.name || 'Hiring Team'}" <${process.env.EMAIL_FROM}>`,
        to: candidate.email,
        subject: `Interview Invitation: ${job.title}`,
        text: emailContent,
      });

      // Update candidate status if not already in interview process
      if (candidate.status === 'Shortlisted' || candidate.status === 'New') {
        candidate.status = 'Interviewing';
        candidate.currentRound = 1; // Set to first interview round
      }

      // Add a note about the invitation
      const schedulingInfo = schedulingMethod === 'calendly' 
        ? `Calendly link: ${calendlyLink}` 
        : `Available dates: ${availableDates}`;
      
      if (!candidate.notes) {
        candidate.notes = '';
      }
      
      candidate.notes += `\n[${new Date().toISOString()}] Interview invitation sent. ${schedulingInfo}`;
      
      return candidate;
    });

    await Promise.all(emailPromises);
    
    // Save the updated job with candidate status changes
    await job.save();

    return NextResponse.json({ 
      success: true,
      sentCount: candidatesToContact.length,
    });
  } catch (error) {
    console.error('Error contacting candidates:', error);
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    );
  }
} 