import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import { Candidate } from '@/types/index';

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
    const { candidateId, updatedCandidate } = body;

    if (!candidateId || !updatedCandidate) {
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

    // Find the candidate in the job
    const candidateIndex = job.candidates.findIndex(
      (c: Candidate) => c._id?.toString() === candidateId
    );

    if (candidateIndex === -1) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Get the original candidate for comparison
    const originalCandidate = job.candidates[candidateIndex].toObject();

    // Update the candidate
    job.candidates[candidateIndex] = {
      ...originalCandidate,
      ...updatedCandidate,
      _id: job.candidates[candidateIndex]._id // Ensure we keep the original _id
    };

    // Save the updated job
    await job.save();

    return NextResponse.json({ 
      success: true,
      candidate: job.candidates[candidateIndex]
    });
  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json(
      { error: 'Failed to update candidate' },
      { status: 500 }
    );
  }
} 