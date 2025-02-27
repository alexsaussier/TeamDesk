import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import { CandidateStatus } from '@/models/Job';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.id;
    const { candidateIds } = await request.json();

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'No candidate IDs provided' },
        { status: 400 }
      );
    }

    // Find the job and update candidate statuses
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

    // Update candidate statuses
    job.candidates.forEach((candidate: any) => {
      if (candidateIds.includes(candidate._id.toString())) {
        candidate.status = CandidateStatus.Shortlisted;
      }
    });

    job.updatedAt = new Date();
    await job.save();

    return NextResponse.json({ 
      success: true,
      shortlistedCount: candidateIds.length
    });
  } catch (error) {
    console.error('Error shortlisting candidates:', error);
    return NextResponse.json(
      { error: 'Failed to shortlist candidates' },
      { status: 500 }
    );
  }
} 