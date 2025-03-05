import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import { Candidate, Job as JobType } from '@/types/index';

/**
 * API route handler for managing job listings
 * Provides endpoints to:
 * - GET: Retrieve job listings with candidate statistics
 * - Handles authentication and organization-specific access
 * - Calculates candidate counts by status (new, shortlisted, interviewing, etc.)
**/

export async function GET(request: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = session.user.organizationId;

    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    // Build query
    const query: { organizationId: mongoose.Types.ObjectId; status?: string } = { 
      organizationId: new mongoose.Types.ObjectId(organizationId) 
    };
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .select('-candidates.resumeUrl') // Exclude large fields for performance
      .lean();

    // Add summary statistics
    const jobsWithStats = jobs.map(job => {
      const typedJob = job as unknown as JobType & { 
        _id: mongoose.Types.ObjectId;
        organizationId: mongoose.Types.ObjectId;
        createdBy: mongoose.Types.ObjectId;
      };
      
      const candidateCounts = {
        total: typedJob.candidates?.length || 0,
        new: 0,
        shortlisted: 0,
        interviewing: 0,
        rejected: 0,
        offered: 0,
        hired: 0
      };

      // Count candidates by status
      typedJob.candidates?.forEach((candidate: Candidate) => {
        const status = candidate.status.toLowerCase() as keyof typeof candidateCounts;
        if (candidateCounts.hasOwnProperty(status)) {
          candidateCounts[status]++;
        }
      });

      return {
        ...typedJob,
        _id: typedJob._id.toString(),
        organizationId: typedJob.organizationId.toString(),
        createdBy: typedJob.createdBy.toString(),
        candidateCounts
      };
    });

    return NextResponse.json({ jobs: jobsWithStats });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
} 