import mongoose from 'mongoose';

// Define candidate status enum
export enum CandidateStatus {
  New = 'New',
  Shortlisted = 'Shortlisted',
  Interviewing = 'Interviewing',
  Rejected = 'Rejected',
  Offered = 'Offered',
  Hired = 'Hired'
}

// Define job status enum
export enum JobStatus {
  Draft = 'Draft',
  Published = 'Published',
  Closed = 'Closed'
}

// Define candidate schema
const CandidateSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  resumeUrl: { type: String },
  status: { 
    type: String, 
    enum: Object.values(CandidateStatus),
    default: CandidateStatus.New
  },
  currentRound: { type: Number, default: 0 },
  score: { type: Number },
  notes: { type: String },
  salaryExpectation: { type: Number },
  visaRequired: { type: Boolean },
  availableFrom: { type: Date },
  interviewFeedback: [{
    roundIndex: { type: Number },
    interviewerEmail: { type: String },
    decision: { type: String, enum: ['Go', 'No Go', 'Pending'] },
    comments: { type: String },
    submittedAt: { type: Date }
  }]
});

// Define interview round schema
const InterviewRoundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  interviewers: [{ type: String }]
});

// Define job schema
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
  interviewRounds: [InterviewRoundSchema],
  publicLink: { type: String, unique: true },
  status: { 
    type: String, 
    enum: Object.values(JobStatus),
    default: JobStatus.Published
  },
  candidates: [CandidateSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Job = mongoose.models.Job || mongoose.model('Job', JobSchema); 