import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

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
    const query: any = { organizationId: new mongoose.Types.ObjectId(organizationId) };
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .select('-candidates.resumeUrl') // Exclude large fields for performance
      .lean();

    // Add summary statistics
    const jobsWithStats = jobs.map(job => {
      const candidateCounts = {
        total: job.candidates?.length || 0,
        new: 0,
        shortlisted: 0,
        interviewing: 0,
        rejected: 0,
        offered: 0,
        hired: 0
      };

      // Count candidates by status
      job.candidates?.forEach((candidate: any) => {
        const status = candidate.status.toLowerCase() as keyof typeof candidateCounts;
        if (candidateCounts.hasOwnProperty(status)) {
          candidateCounts[status]++;
        }
      });

      return {
        ...job,
        _id: (job as any)._id.toString(),
        organizationId: (job as any).organizationId.toString(),
        createdBy: (job as any).createdBy.toString(),
        candidateCounts
      };
    });

    return NextResponse.json(jobsWithStats);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 