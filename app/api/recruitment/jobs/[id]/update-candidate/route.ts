import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import { Candidate } from '@/types/index';

/**
 * API route handler for updating candidate information within a job listing
 * Provides endpoint to:
 * - POST: Update a candidate's details (status, interview feedback, etc.)
 * - Validates authentication and organization access
 * - Ensures candidate exists in the specified job
 * - Handles updates to candidate properties while maintaining data integrity
 */

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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