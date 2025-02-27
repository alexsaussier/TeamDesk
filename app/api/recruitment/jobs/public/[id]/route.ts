import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { JobStatus } from '@/models/Job';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    
    const jobId = params.id;
    
    // Find the job by its ID
    const job = await Job.findOne({
      publicLink: { $regex: `/jobs/${jobId}$` },
      status: JobStatus.Published
    }).select('title department location jobDescription salaryMin salaryMax visaSponsorship');
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or no longer active' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: jobId,
      title: job.title,
      department: job.department,
      location: job.location,
      description: job.jobDescription,
      salaryRange: job.salaryMin && job.salaryMax 
        ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
        : 'Competitive',
      visaSponsorship: job.visaSponsorship
    });
  } catch (error) {
    console.error('Error fetching public job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job details' },
      { status: 500 }
    );
  }
} 