import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

// Create a Job model schema
const JobSchema = new mongoose.Schema({
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Organization'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  jobDescription: { type: String, required: true },
  salaryMin: { type: Number },
  salaryMax: { type: Number },
  visaSponsorship: { type: Boolean, default: false },
  shortlistCount: { type: Number, default: 5 },
  additionalInstructions: { type: String },
  interviewRounds: [{
    name: { type: String, required: true },
    interviewers: [{ type: String }]
  }],
  publicLink: { type: String, unique: true },
  status: { 
    type: String, 
    enum: ['Draft', 'Published', 'Closed'],
    default: 'Published'
  },
  candidates: [{
    name: { type: String },
    email: { type: String },
    resumeUrl: { type: String },
    status: { 
      type: String, 
      enum: ['New', 'Shortlisted', 'Interviewing', 'Rejected', 'Offered', 'Hired'],
      default: 'New'
    },
    currentRound: { type: Number, default: 0 },
    score: { type: Number },
    notes: { type: String },
    salaryExpectation: { type: Number },
    visaRequired: { type: Boolean },
    availableFrom: { type: Date }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create the model if it doesn't exist
const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

export async function POST(request: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const organizationId = session.user.organizationId;

    const body = await request.json();
    const { 
      title, 
      department, 
      location, 
      jobDescription, 
      salaryMin, 
      salaryMax, 
      visaSponsorship, 
      shortlistCount, 
      additionalInstructions, 
      interviewRounds 
    } = body;

    // Generate a unique public link
    const publicLink = `${process.env.NEXT_PUBLIC_APP_URL}/jobs/${generateUniqueId()}`;

    const newJob = new Job({
      organizationId,
      createdBy: userId,
      title,
      department,
      location,
      jobDescription,
      salaryMin,
      salaryMax,
      visaSponsorship,
      shortlistCount,
      additionalInstructions,
      interviewRounds,
      publicLink,
      status: 'Published',
      candidates: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedJob = await newJob.save();
    
    return NextResponse.json(savedJob, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/recruitment/create-job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function to generate a unique ID for the public link
function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
} 