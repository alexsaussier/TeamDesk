export type ConsultantLevel = string;

export interface ConsultantLevelDefinition {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
}

export interface ConsultantAssignment {
  projectId: string;
  percentage: number;
  hourlyRate?: number;
}

export interface Consultant {
  _id: string
  id: string
  organizationId: string;
  name: string;
  level: ConsultantLevel;
  salary: number;
  skills: string[];
  assignments: ConsultantAssignment[];
  picture: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type ProjectStatus = 'Discussions' | 'Sold' | 'Started' | 'Completed';

export interface TeamSize {
  [levelId: string]: number;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  client: string;
  requiredSkills: string[];
  startDate: string;
  endDate: string;
  teamSize: TeamSize;
  chanceToClose: number;
  assignedConsultants: {
    id: string;
    _id: string;
    name: string;
    skills: string[];
    picture: string;
    percentage: number;
    hourlyRate?: number;
    level: ConsultantLevel;
  }[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export const getNextSoldProject = (projects: Project[]): Project | null => {
  const today = new Date();
  return projects
    .filter(project => 
      project.status === 'Sold' && 
      new Date(project.startDate) > today
    )
    .sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )[0] || null;
};

export const getNextStartingProject = (projects: Project[]): Project | null => {
  const today = new Date();
  return projects
    .filter(project => 
      new Date(project.startDate) > today
    )
    .sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )[0] || null;
};

export enum CandidateStatus {
  New = 'New',
  Shortlisted = 'Shortlisted',
  Interviewing = 'Interviewing',
  Rejected = 'Rejected',
  Offered = 'Offered',
  Hired = 'Hired'
}

export interface Candidate {
  _id?: string;
  name: string;
  email: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: CandidateStatus;
  currentRound: number;
  score?: number;
  notes?: string;
  salaryExpectation?: number;
  visaRequired?: boolean;
  availableFrom?: string;
  interviewFeedback?: InterviewFeedback[];
  phone?: string;
  interviewScheduled?: boolean;
  interviewDateTime?: Date | string;
  meetingLink?: string;
}

export interface InterviewFeedback {
  roundIndex: number;
  interviewerEmail: string;
  decision: 'Go' | 'No Go' | 'Pending';
  comments?: string;
  submittedAt: string;
}

export interface InterviewRound {
  _id?: string;
  name: string;
  interviewers: string[];
}

export interface Job {
  _id: string;
  organizationId: string;
  createdBy: string;
  title: string;
  department: string;
  location: string;
  jobDescription: string;
  salaryMin?: number;
  salaryMax?: number;
  visaSponsorship: boolean;
  shortlistCount: number;
  additionalInstructions?: string;
  interviewRounds: InterviewRound[];
  publicLink: string;
  status: 'Draft' | 'Published' | 'Closed';
  candidates: Candidate[];
  createdAt: string;
  updatedAt: string;
  candidateCounts?: {
    total: number;
    new: number;
    shortlisted: number;
    interviewing: number;
    rejected: number;
    offered: number;
    hired: number;
  };
}

export interface Organization {
  _id: string;
  name: string;
  description: string;
  perks: string;
  planType: 'free' | 'premium';
  currency: 'USD' | 'EUR' | 'GBP';
  stripeCustomerId?: string; // Stripe customer ID for subscription management
  consultantLevels: ConsultantLevelDefinition[];
  onboardingProgress?: {
    settingsConfigured: boolean;
    projectCreated: boolean;
    workforceAdded: boolean;
    tutorialCompleted: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  organizationId: string;
  role: 'admin';
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

export interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  subscription?: {
    id: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    interval: string;
    amount: number;
    currency: string;
  };
  paymentMethod?: {
    id: string;
    type: string;
    card?: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    };
  };
}
  
  