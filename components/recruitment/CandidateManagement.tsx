"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Search, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Job, Candidate, CandidateStatus, InterviewFeedback } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CandidateManagementProps {
  jobId: string;
  onCandidatesSelected?: (candidateIds: string[]) => void;
}

export default function CandidateManagement({ jobId, onCandidatesSelected }: CandidateManagementProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const { toast } = useToast();
  const [interviewFeedbackOpen, setInterviewFeedbackOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [interviewDecision, setInterviewDecision] = useState<'Go' | 'No Go' | null>(null);
  const [interviewComments, setInterviewComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [schedulingMethod, setSchedulingMethod] = useState<'calendly' | 'manual' | 'calendar'>('calendly');
  const [calendlyLink, setCalendlyLink] = useState('');
  const [availableDates, setAvailableDates] = useState('');
  const [schedulingDetails, setSchedulingDetails] = useState('Congratulations! You have been selected for the next interview round. Please select a time that works for you for the next interview round.');
  const [availableSlots, setAvailableSlots] = useState<Array<{start: string, end: string, formatted: string}>>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/recruitment/jobs/${jobId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch job");
        }
        const data = await response.json();
        setJob(data);
      } catch (error) {
        console.error("Error fetching job:", error);
        toast({
          title: "Error",
          description: "Failed to load candidates. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, toast]);

  useEffect(() => {
    if (onCandidatesSelected) {
      onCandidatesSelected(selectedCandidates);
    }
  }, [selectedCandidates, onCandidatesSelected]);

  // Check calendar connection status
  useEffect(() => {
    const checkCalendarConnection = async () => {
      try {
        const response = await fetch("/api/calendar/status");
        if (response.ok) {
          const data = await response.json();
          setCalendarConnected(data.connected);
        }
      } catch (error) {
        console.error("Error checking calendar connection:", error);
      }
    };
    
    checkCalendarConnection();
  }, []);

  const handleShortlistCandidates = async () => {
    if (!selectedCandidates.length) {
      toast({
        title: "No candidates selected",
        description: "Please select candidates to shortlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/recruitment/jobs/${jobId}/shortlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ candidateIds: selectedCandidates }),
      });

      if (!response.ok) {
        throw new Error("Failed to shortlist candidates");
      }

      // Update local state
      const updatedJob = { ...job } as Job;
      updatedJob.candidates = updatedJob.candidates.map(candidate => {
        if (selectedCandidates.includes(candidate._id as string)) {
          return { ...candidate, status: CandidateStatus.Shortlisted };
        }
        return candidate;
      });

      setJob(updatedJob);
      setSelectedCandidates([]);

      toast({
        title: "Candidates shortlisted",
        description: `Successfully shortlisted ${selectedCandidates.length} candidates.`,
      });
    } catch (error) {
      console.error("Error shortlisting candidates:", error);
      toast({
        title: "Error",
        description: "Failed to shortlist candidates. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAutoShortlist = async () => {
    try {
      const response = await fetch(`/api/recruitment/jobs/${jobId}/auto-shortlist`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to auto-shortlist candidates");
      }

      const data = await response.json();
      setJob(data.job);

      toast({
        title: "Auto-shortlisting complete",
        description: `Successfully shortlisted ${data.shortlistedCount} candidates based on their scores.`,
      });
    } catch (error) {
      console.error("Error auto-shortlisting:", error);
      toast({
        title: "Error",
        description: "Failed to auto-shortlist candidates. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleInterviewFeedback = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setInterviewDecision(null);
    setInterviewComments('');
    setSchedulingMethod('calendly');
    setCalendlyLink('');
    setAvailableDates('');
    setSchedulingDetails('Congratulations! You have been selected for the next interview round. Please select a time that works for you for the next interview round.');
    
    // Fetch available slots if calendar is connected
    if (calendarConnected) {
      setIsLoadingSlots(true);
      try {
        const response = await fetch("/api/calendar/available-slots?days=7&duration=60");
        if (response.ok) {
          const data = await response.json();
          setAvailableSlots(data.availableSlots || []);
          
          // If we have slots, pre-populate the available dates
          if (data.availableSlots && data.availableSlots.length > 0) {
            const formattedSlots = data.availableSlots
              .slice(0, 5) // Limit to 5 slots
              .map((slot: { formatted: string }) => slot.formatted)
              .join("\n");
            
            setAvailableDates(formattedSlots);
          }
        }
      } catch (error) {
        console.error("Error fetching available slots:", error);
      } finally {
        setIsLoadingSlots(false);
      }
    }
    
    setInterviewFeedbackOpen(true);
  };

  const submitInterviewFeedback = async () => {
    if (!selectedCandidate || !interviewDecision) {
      toast({
        title: "Missing information",
        description: "Please select a decision before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingFeedback(true);

    try {
      // Create a copy of the job to update locally
      const updatedJob = { ...job } as Job;
      const candidateIndex = updatedJob.candidates.findIndex(
        c => c._id === selectedCandidate._id
      );
      
      if (candidateIndex === -1) {
        throw new Error("Candidate not found");
      }
      
      // Update the candidate based on the decision
      const candidate = { ...updatedJob.candidates[candidateIndex] };
      
      // Add the feedback to the candidate
      const feedback: InterviewFeedback = {
        roundIndex: candidate.currentRound || 1,
        interviewerEmail: "", // This would ideally be the current user's email
        decision: interviewDecision,
        comments: interviewComments,
        submittedAt: new Date().toISOString()
      };
      
      candidate.interviewFeedback = [
        ...(candidate.interviewFeedback || []),
        feedback
      ];
      
      // Update candidate status based on decision
      if (interviewDecision === 'Go') {
        // Move to next round
        candidate.currentRound = (candidate.currentRound || 1) + 1;
        // Check if there are more rounds
        const totalRounds = updatedJob.interviewRounds?.length || 0;
        if (candidate.currentRound > totalRounds) {
          candidate.status = CandidateStatus.Offered;
        }
      } else {
        // Reject the candidate
        candidate.status = CandidateStatus.Rejected;
      }
      
      // Update the candidate in the job
      updatedJob.candidates[candidateIndex] = candidate;
      
      // First, update the candidate status
      const updateResponse = await fetch(`/api/recruitment/jobs/${jobId}/update-candidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          candidateId: selectedCandidate._id,
          updatedCandidate: candidate
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update candidate status");
      }

      // Then, send the email notification using the contact-candidates endpoint
      if (interviewDecision === 'Go') {
        // Check if this is the final round (offer)
        const isOffer = candidate.status === CandidateStatus.Offered;
        
        // Prepare email template
        let emailTemplate = isOffer 
          ? `Dear {{candidate_name}},

Congratulations! We are pleased to inform you that you have successfully completed all interview rounds for the ${job?.title} position.

Our team was impressed with your qualifications and performance throughout the interview process. We will be in touch shortly with more details about the next steps.

Best regards,
The Hiring Team`
          : schedulingDetails;
        
        // Add scheduling information only if not an offer
        if (!isOffer) {
          if (schedulingMethod === 'calendly') {
            emailTemplate += `\n\nPlease use the following link to schedule your interview: ${calendlyLink}`;
          } else if (schedulingMethod === 'manual' || schedulingMethod === 'calendar') {
            emailTemplate += `\n\nPlease choose from the following available dates:\n${availableDates}`;
          }
        }
        
        // Send email to the candidate
        const emailResponse = await fetch(`/api/recruitment/jobs/${jobId}/contact-candidates`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidateIds: [selectedCandidate._id],
            emailTemplate,
            schedulingMethod: isOffer ? undefined : schedulingMethod,
            calendlyLink: isOffer ? undefined : calendlyLink,
            availableDates: isOffer ? undefined : availableDates,
            schedulingDetails: isOffer ? undefined : schedulingDetails
          }),
        });
        
        if (!emailResponse.ok) {
          console.warn("Email notification could not be sent, but candidate status was updated");
        }
      } else {
        // Send rejection email
        const rejectionTemplate = `Dear {{candidate_name}},

Thank you for your interest in the ${job?.title} position and for taking the time to interview with us.

After careful consideration, we have decided to pursue other candidates whose qualifications more closely match our current needs. We appreciate your interest in our company and wish you the best in your job search.

Best regards,
The Hiring Team`;

        const emailResponse = await fetch(`/api/recruitment/jobs/${jobId}/contact-candidates`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidateIds: [selectedCandidate._id],
            emailTemplate: rejectionTemplate
          }),
        });
        
        if (!emailResponse.ok) {
          console.warn("Rejection email could not be sent, but candidate status was updated");
        }
      }

      // Update the local state with the updated job
      setJob(updatedJob);
      setInterviewFeedbackOpen(false);
      
      toast({
        title: "Feedback submitted",
        description: interviewDecision === 'Go' 
          ? candidate.status === CandidateStatus.Offered 
            ? "Candidate has completed all interview rounds and is now marked as Offered. An email notification has been sent."
            : `Candidate will proceed to Round ${candidate.currentRound}. An interview invitation has been sent.` 
          : "Candidate has been rejected. A notification email has been sent.",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredCandidates = job?.candidates.filter(candidate => {
    // Filter by tab
    if (activeTab !== "all" && candidate.status.toLowerCase() !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query)
      );
    }
    
    return true;
  }) || [];

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Job not found or you don&apos;t have access.</p>
      </div>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Candidates for {job.title}</CardTitle>
          <CardDescription>
            {job.candidates.length} candidates have applied for this position
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={handleAutoShortlist}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Auto-Shortlist
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Automatically shortlist top candidates based on their resume scores. This will select the highest-scoring candidates with &apos;New&apos; status.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button 
                variant="outline" 
                className="flex items-center gap-1"
                disabled={!selectedCandidates.length}
                onClick={handleShortlistCandidates}
              >
                <CheckCircle2 className="h-4 w-4" />
                Shortlist Selected
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 sm:grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
              <TabsTrigger value="interviewing">Interviewing</TabsTrigger>
              <TabsTrigger value="offered">Offered</TabsTrigger>
              <TabsTrigger value="hired">Hired</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No candidates found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCandidates.map((candidate) => (
                    <div 
                      key={candidate._id} 
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox 
                        checked={selectedCandidates.includes(candidate._id as string)}
                        onCheckedChange={() => handleToggleCandidate(candidate._id as string)}
                        id={`candidate-${candidate._id}`}
                      />
                      
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {candidate.name 
                            ? candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()
                            : 'N/A'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-sm">{candidate.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{candidate.email}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Progress:</span>
                              <div className="flex items-center">
                                {candidate.status === CandidateStatus.Interviewing && candidate.currentRound ? (
                                  <span className="text-xs font-medium text-purple-700">
                                    Round {candidate.currentRound} Interview
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium">{candidate.status}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(candidate.status)}>
                              {candidate.status}
                            </Badge>
                            <Badge variant="outline" className="font-mono">
                              Resume Score: {candidate.score || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {candidate.status === CandidateStatus.Interviewing && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleInterviewFeedback(candidate)}
                          >
                            Feedback
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hidden sm:flex"
                          asChild
                        >
                          <a href={`/dashboard/recruitment/jobs/${jobId}/candidates/${candidate._id}`}>
                            View
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={interviewFeedbackOpen} onOpenChange={setInterviewFeedbackOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Interview Feedback</DialogTitle>
            <DialogDescription>
              {selectedCandidate && (
                <>
                  Provide feedback for {selectedCandidate.name}&apos;s Round {selectedCandidate.currentRound} interview.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="decision">Decision</Label>
              <RadioGroup 
                id="decision" 
                value={interviewDecision || ''} 
                onValueChange={(value) => setInterviewDecision(value as 'Go' | 'No Go')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Go" id="go" />
                  <Label htmlFor="go" className="text-green-600">Proceed to next round</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No Go" id="nogo" />
                  <Label htmlFor="nogo" className="text-red-600">Reject candidate</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                placeholder="Enter your feedback about the candidate..."
                value={interviewComments}
                onChange={(e) => setInterviewComments(e.target.value)}
                rows={4}
              />
            </div>

            {interviewDecision === 'Go' && selectedCandidate && (
              <div className="space-y-4 border-t pt-4">
                {/* Check if next round would be beyond total rounds (offer) */}
                {(selectedCandidate.currentRound || 0) + 1 <= (job?.interviewRounds?.length || 0) ? (
                  <>
                    <h4 className="font-medium">Next Interview Scheduling</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="schedulingDetails">Message to Candidate</Label>
                      <Textarea
                        id="schedulingDetails"
                        placeholder="Instructions for the next interview round..."
                        value={schedulingDetails}
                        onChange={(e) => setSchedulingDetails(e.target.value)}
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Scheduling Method</Label>
                      <RadioGroup 
                        value={schedulingMethod} 
                        onValueChange={(value) => setSchedulingMethod(value as 'calendly' | 'manual' | 'calendar')}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="calendly" id="calendly" />
                          <Label htmlFor="calendly">Calendly Link</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="manual" id="manual" />
                          <Label htmlFor="manual">Suggest Available Dates</Label>
                        </div>
                        {calendarConnected && (
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="calendar" id="calendar" />
                            <Label htmlFor="calendar">Use Calendar Availability</Label>
                          </div>
                        )}
                      </RadioGroup>
                    </div>
                    
                    {schedulingMethod === 'calendly' ? (
                      <div className="space-y-2">
                        <Label htmlFor="calendlyLink">Calendly Link</Label>
                        <Input
                          id="calendlyLink"
                          placeholder="https://calendly.com/your-link"
                          value={calendlyLink}
                          onChange={(e) => setCalendlyLink(e.target.value)}
                        />
                      </div>
                    ) : schedulingMethod === 'manual' ? (
                      <div className="space-y-2">
                        <Label htmlFor="availableDates">Available Dates</Label>
                        <Textarea
                          id="availableDates"
                          placeholder="Monday, Oct 10 at 2pm, Tuesday, Oct 11 at 10am..."
                          value={availableDates}
                          onChange={(e) => setAvailableDates(e.target.value)}
                          rows={3}
                        />
                      </div>
                    ) : schedulingMethod === 'calendar' && (
                      <div className="space-y-2">
                        <Label htmlFor="availableDates">Available Slots from Your Calendar</Label>
                        {isLoadingSlots ? (
                          <div className="flex justify-center py-2">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <Textarea
                            id="availableDates"
                            value={availableDates}
                            onChange={(e) => setAvailableDates(e.target.value)}
                            rows={5}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No available slots found in your calendar for the next 7 days.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-green-600 font-medium">
                      This is the final round. The candidate will be marked as Offered.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      A congratulatory email will be sent without scheduling details.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterviewFeedbackOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitInterviewFeedback} 
              disabled={Boolean(
                !interviewDecision || 
                submittingFeedback || 
                (interviewDecision === 'Go' && 
                 selectedCandidate && 
                 (selectedCandidate.currentRound || 0) + 1 <= (job?.interviewRounds?.length || 0) && 
                 ((schedulingMethod === 'calendly' && !calendlyLink) || 
                  (schedulingMethod === 'manual' && !availableDates) || 
                  (schedulingMethod === 'calendar' && !availableDates)))
              )}
            >
              {submittingFeedback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 