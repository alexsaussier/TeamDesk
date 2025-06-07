"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, FileText, Calendar, Building, User, Mail, Phone, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Job, Candidate, CandidateStatus } from "@/types";
import Link from "next/link";

export default function CandidateDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const candidateId = params.candidateId as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobAndCandidate = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/recruitment/jobs/${jobId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch job data");
        }
        
        const jobData = await response.json();
        setJob(jobData);
        
        // Find the candidate in the job data
        const foundCandidate = jobData.candidates.find(
          (c: Candidate) => c._id === candidateId
        );
        
        if (!foundCandidate) {
          throw new Error("Candidate not found");
        }
        
        setCandidate(foundCandidate);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load candidate data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndCandidate();
  }, [jobId, candidateId, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case CandidateStatus.New:
        return "bg-blue-100 text-blue-800";
      case CandidateStatus.Shortlisted:
        return "bg-green-100 text-green-800";
      case CandidateStatus.Interviewing:
        return "bg-purple-100 text-purple-800";
      case CandidateStatus.Rejected:
        return "bg-red-100 text-red-800";
      case CandidateStatus.Offered:
        return "bg-amber-100 text-amber-800";
      case CandidateStatus.Hired:
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job || !candidate) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Candidate not found or you don&apos;t have access.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={`/dashboard/recruitment/jobs/${jobId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/recruitment/jobs/${jobId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Job
              </Link>
            </Button>
            <Badge className={getStatusColor(candidate.status)}>
              {candidate.status}
            </Badge>
            {candidate.status === CandidateStatus.Interviewing && candidate.currentRound && (
              <Badge variant="outline">
                Round {candidate.currentRound} Interview
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold mt-2">{candidate.name}</h1>
          <p className="text-muted-foreground">
            Candidate for {job.title}
          </p>
        </div>
        
        {candidate.resumeUrl && (
          <Button className="flex items-center gap-2" asChild>
            <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Download Resume
            </a>
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="feedback">Interview Feedback</TabsTrigger>
          <TabsTrigger value="resume">Resume & Cover Letter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Name:</span>
                    <span>{candidate.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{candidate.email}</span>
                  </div>
                  
                  {candidate.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone:</span>
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {candidate.salaryExpectation && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Salary Expectation:</span>
                      <span>${candidate.salaryExpectation.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {candidate.availableFrom && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Available From:</span>
                      <span>{formatDate(candidate.availableFrom)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Visa Required:</span>
                    <span>{candidate.visaRequired ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              
              {candidate.score !== undefined && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Resume Score:</span>
                    <Badge variant="outline" className="font-mono">
                      {candidate.score}
                    </Badge>
                  </div>
                </div>
              )}
              
              {candidate.notes && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Notes:</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md whitespace-pre-wrap">
                    {candidate.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Position:</span>
                <span>{job.title}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Department:</span>
                <span>{job.department}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Application Date:</span>
                <span>
                  {/* This is an approximation as we don't have the exact application date */}
                  {formatDate(job.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-4">
          {(!candidate.interviewFeedback || candidate.interviewFeedback.length === 0) ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No interview feedback available yet.</p>
              </CardContent>
            </Card>
          ) : (
            candidate.interviewFeedback.map((feedback, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>
                    Round {feedback.roundIndex} Feedback
                  </CardTitle>
                  <CardDescription>
                    Submitted by {feedback.interviewerEmail || 'Interviewer'} on {formatDate(feedback.submittedAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Decision:</span>
                    <Badge className={
                      feedback.decision === 'Go' ? 'bg-green-100 text-green-800' : 
                      feedback.decision === 'No Go' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {feedback.decision}
                    </Badge>
                  </div>
                  
                  {feedback.comments && (
                    <div>
                      <h4 className="font-medium mb-2">Comments:</h4>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md whitespace-pre-wrap">
                        {feedback.comments}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="resume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.resumeUrl ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Button asChild>
                      <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Download Resume
                      </a>
                    </Button>
                  </div>
                  
                  <div className="aspect-[8.5/11] bg-gray-50 dark:bg-gray-800 rounded-md flex items-center justify-center">
                    <iframe 
                      src={candidate.resumeUrl} 
                      className="w-full h-full rounded-md"
                      title={`${candidate.name}'s Resume`}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No resume available.</p>
              )}
            </CardContent>
          </Card>
          
          {candidate.coverLetter && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md whitespace-pre-wrap">
                  {candidate.coverLetter}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 