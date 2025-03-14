import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import { CandidateStatus } from '@/models/Job';
import { Candidate } from '@/types/index';

/**
 * Auto-shortlist route - Automatically shortlists top candidates based on their scores
 * 
 * This API endpoint:
 * 1. Authenticates the user and verifies job access
 * 2. Filters for candidates with 'New' status
 * 3. Sorts candidates by their screening scores
 * 4. Takes the top N candidates (based on job.shortlistCount)
 * 5. Updates their status to 'Shortlisted'
 * 
 * The number of candidates shortlisted is the minimum between:
 * - The job's configured shortlistCount (default: 5)
 * - The total number of new candidates available
 */


export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = await params.id;

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
      (candidate: Candidate) => candidate.status === CandidateStatus.New
    );

    // If no new candidates, return early
    if (newCandidates.length === 0) {
      console.log(`No new candidates found for job ${jobId} that can be shortlisted`);
      return NextResponse.json({ 
        success: true,
        shortlistedCount: 0,
        message: "No new candidates available for shortlisting"
      });
    }

    // Sort by score (highest first)
    newCandidates.sort((a: Candidate, b: Candidate) => (b.score || 0) - (a.score || 0));

    // Get the number of candidates to shortlist
    const shortlistCount = Math.min(
      job.shortlistCount || 5,
      newCandidates.length
    );

    // Get the IDs of candidates to shortlist
    const candidateIdsToShortlist = newCandidates
      .slice(0, shortlistCount)
      .map((candidate: Candidate) => candidate._id?.toString() || '');

    // Update candidate statuses
    job.candidates.forEach((candidate: Candidate) => {
        if (candidateIdsToShortlist.includes(candidate._id?.toString() || '')) {
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
        candidates: job.candidates.map((candidate: Candidate) => ({
          ...candidate,
          _id: candidate._id?.toString() || ''
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