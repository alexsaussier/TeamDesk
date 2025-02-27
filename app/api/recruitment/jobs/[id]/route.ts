import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
/**
 * API route handler for managing individual job postings
 * Provides endpoints to:
 * - GET: Retrieve job details including candidate statistics
 * - Handles authentication and organization-specific access
 * - Calculates candidate counts by status (new, shortlisted, interviewing, etc.)
 * - PATCH: Update job status 
 * - DELETE: Delete job
 */

export async function GET(
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
    const organizationId = session.user.organizationId;

    const job = await Job.findOne({
      _id: new mongoose.Types.ObjectId(jobId),
      organizationId: new mongoose.Types.ObjectId(organizationId)
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Calculate candidate counts by status
    const candidateCounts = {
      total: job.candidates.length,
      new: 0,
      shortlisted: 0,
      interviewing: 0,
      rejected: 0,
      offered: 0,
      hired: 0
    };

    // Count candidates by status
    job.candidates.forEach((candidate: any) => {
      const status = candidate.status.toLowerCase() as keyof typeof candidateCounts;
      if (candidateCounts.hasOwnProperty(status)) {
        candidateCounts[status]++;
      }
    });

    // Convert MongoDB document to plain object and stringify ObjectIds
    const jobData = {
      ...job.toObject(),
      _id: job._id.toString(),
      organizationId: job.organizationId.toString(),
      createdBy: job.createdBy.toString(),
      candidates: job.candidates.map((candidate: any) => ({
        ...candidate.toObject(),
        _id: candidate._id.toString()
      })),
      candidateCounts
    };

    return NextResponse.json(jobData);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job details' },
      { status: 500 }
    );
  }
}

// Update job status
export async function PATCH(
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
    const organizationId = session.user.organizationId;
    const { status } = await request.json();

    const job = await Job.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(jobId),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      },
      {
        $set: { status, updatedAt: new Date() }
      },
      { new: true }
    );

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      status: job.status
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 }
    );
  }
}

// Add this DELETE method to your existing file
export async function DELETE(
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
    const organizationId = session.user.organizationId;

    const result = await Job.deleteOne({
      _id: new mongoose.Types.ObjectId(jobId),
      organizationId: new mongoose.Types.ObjectId(organizationId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Job not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
} 