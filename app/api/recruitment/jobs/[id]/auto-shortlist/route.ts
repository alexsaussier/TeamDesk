import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import { CandidateStatus } from '@/models/Job';

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

    // Get only new candidates
    const newCandidates = job.candidates.filter(
      (candidate: any) => candidate.status === CandidateStatus.New
    );

    // Sort by score (highest first)
    newCandidates.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));

    // Get the number of candidates to shortlist
    const shortlistCount = Math.min(
      job.shortlistCount || 5,
      newCandidates.length
    );

    // Get the IDs of candidates to shortlist
    const candidateIdsToShortlist = newCandidates
      .slice(0, shortlistCount)
      .map((candidate: any) => candidate._id.toString());

    // Update candidate statuses
    job.candidates.forEach((candidate: any) => {
        if (candidateIdsToShortlist.includes(candidate._id.toString())) {
          candidate.status = CandidateStatus.Shortlisted;
        }
      });

    job.updatedAt = new Date();
    await job.save();

    return NextResponse.json({ 
      success: true,
      shortlistedCount: candidateIdsToShortlist.length,
      job: {
        ...job.toObject(),
        _id: job._id.toString(),
        organizationId: job.organizationId.toString(),
        createdBy: job.createdBy.toString(),
        candidates: job.candidates.map((candidate: any) => ({
          ...candidate.toObject(),
          _id: candidate._id.toString()
        }))
      }
    });
  } catch (error) {
    console.error('Error auto-shortlisting candidates:', error);
    return NextResponse.json(
      { error: 'Failed to auto-shortlist candidates' },
      { status: 500 }
    );
  }
} 