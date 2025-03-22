"use client";
 

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Calendar, Globe, Building, Brain, MessageSquare, ArrowLeft, Link as LinkIcon, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CandidateManagement from "@/components/recruitment/CandidateManagement";
import { Job } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isScreening, setIsScreening] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState("");
  const [schedulingMethod, setSchedulingMethod] = useState<"manual" | "calendly" | "calendar">("manual");
  const [availableDates, setAvailableDates] = useState("");
  const [calendlyLink, setCalendlyLink] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Array<{start: string, end: string, formatted: string}>>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [organizationName, setOrganizationName] = useState<string>("");
  const [isCheckingEmails, setIsCheckingEmails] = useState(false);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/recruitment/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job");
      }
      const data = await response.json();
      setJob(data);
      setLoading(false);
      if (data.organizationId) {
        fetchOrganizationName(data.organizationId);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
    checkCalendarConnection();
  }, [jobId]);

  const fetchOrganizationName = async (organizationId: string) => {
    try {
      const response = await fetch(`/api/organization?id=${organizationId}`);
      if (response.ok) {
        const data = await response.json();
        setOrganizationName(data.name);
      }
    } catch (error) {
      console.error("Error fetching organization:", error);
    }
  };

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

  const handleScreenCandidates = async () => {
    setIsScreening(true);
    try {
      if (!job) {
        throw new Error("Job data not available");
      }
      
      console.log("Sending request to alternative screen candidates endpoint");
      const response = await fetch(`/api/recruitment/jobs/${job._id}/screen-candidates-alt`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error("Failed to screen candidates");
      }
      
      const data = await response.json();
      
      toast({
        title: "Success",
        description: data.message || `Screened ${data.screenedCount} candidates.`,
      });
      
      // Refresh job data to get updated scores
      console.log("Refreshing job data...");
      window.location.reload();
    } catch (error) {
      console.error("Error screening candidates:", error);
      toast({
        title: "Error",
        description: "Failed to screen candidates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScreening(false);
    }
  };

  const handleContactCandidates = async (useShortlisted = false) => {
    let candidatesToContact = selectedCandidates;
    
    // If using shortlisted candidates instead of selected ones
    if (useShortlisted) {
      candidatesToContact = job?.candidates
        .filter(c => c.status === "Shortlisted")
        .map(c => c._id as string) || [];
        
      if (!candidatesToContact.length) {
        toast({
          title: "No shortlisted candidates",
          description: "There are no shortlisted candidates to contact.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Using selected candidates
      if (!candidatesToContact.length) {
        toast({
          title: "No candidates selected",
          description: "Please select candidates to contact.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Get organization name from state or fallback to job data or generic term
    const orgName = organizationName || "our organization";
    
    const defaultTemplate = `Dear {{candidate_name}},

I hope this email finds you well. Thank you for your application for the ${job?.title} position at ${orgName}.

We were impressed with your qualifications and would like to invite you for an interview. Please select a time that works for you from the available slots, or calendar link, if provided.

{{scheduling_details}}

Please confirm your availability by replying to this email or booking directly through the provided link.

We look forward to speaking with you!

Best regards,
The Hiring Team`;

    setSelectedCandidates(candidatesToContact);
    setEmailTemplate(defaultTemplate);
    setContactDialogOpen(true);
  };

  const fetchCalendarAvailability = async () => {
    setIsLoadingSlots(true);
    try {
      const response = await fetch("/api/calendar/available-slots?days=7&duration=60");
      if (!response.ok) {
        throw new Error(`Failed to fetch available slots: ${response.status}`);
      }
      
      const data = await response.json();
      setAvailableSlots(data.availableSlots || []);
      
      // If we have slots, pre-populate the available dates
      if (data.availableSlots && data.availableSlots.length > 0) {
        const formattedSlots = data.availableSlots
          .slice(0, 5) // Limit to 5 slots
          .map((slot: { formatted: string }) => slot.formatted)
          .join("\n");
        
        setAvailableDates(formattedSlots);
        toast({
          title: "Success",
          description: `Found ${data.availableSlots.length} available slots in your calendar.`,
        });
      } else {
        toast({
          title: "No available slots",
          description: "No available slots found in your calendar for the next 7 days.",
        });
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast({
        title: "Error",
        description: "Failed to fetch calendar availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSendEmails = async () => {
    setIsSending(true);
    try {
      // Prepare scheduling details based on selected method
      const schedulingDetails = schedulingMethod === "calendly" 
        ? `Please use this Calendly link to book your interview: ${calendlyLink}`
        : `Available interview slots:\n${availableDates}`;
      
      const response = await fetch(`/api/recruitment/jobs/${jobId}/contact-candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateIds: selectedCandidates,
          emailTemplate,
          schedulingDetails,
          schedulingMethod,
          calendlyLink: schedulingMethod === "calendly" ? calendlyLink : undefined,
          availableDates: schedulingMethod === "manual" ? availableDates : undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send emails");
      }
      
      const data = await response.json();
      
      toast({
        title: "Emails sent successfully",
        description: `Sent ${data.sentCount} emails to selected candidates.`,
      });
      
      setContactDialogOpen(false);
    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        title: "Error",
        description: "Failed to send emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Add this function to check if all candidates have scores
  const allCandidatesScored = () => {
    if (!job || !job.candidates || job.candidates.length === 0) return false;
    return job.candidates.every(candidate => candidate.score !== undefined);
  };

  const checkEmailResponses = async () => {
    console.log("Starting email response check...");
    setIsCheckingEmails(true);
    try {
      console.log("Sending request to /api/email/monitor-responses");
      const response = await fetch('/api/email/monitor-responses', {
        method: 'POST',
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response data:", errorData);
        
        // Check if the error is due to missing calendar connection
        if (response.status === 400 && errorData.error === 'Calendar not connected') {
          toast({
            title: "Calendar Not Connected",
            description: "Please connect your Google Calendar in the recruitment dashboard.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(`Failed to check email responses: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Response data:", data);
      
      toast({
        title: "Email check complete",
        description: `Scheduled ${data.scheduledCount} interviews based on candidate responses. Reload page to refresh data`,
      });
      
      // Refresh job data to get updated candidate statuses
      console.log("Refreshing job data...");
    } catch (error) {
      console.error('Error checking emails:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: "Error",
        description: "Failed to check email responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log("Email check process completed");
      setIsCheckingEmails(false);
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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-start gap-6">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center gap-1 mt-1"
          >
            <Link href="/dashboard/recruitment">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          
          <div> 
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>{job.department}</span>
              <span>•</span>
              <Globe className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800">
            {job.status}
          </Badge>
          <Button variant="outline" asChild>
            <a href={`${process.env.NEXT_PUBLIC_APP_URL || ''}${job.publicLink}`} target="_blank" rel="noopener noreferrer">
              View Public Link
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 pt-4">
        <TabsList className="gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">
            Candidates ({job.candidateCounts?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">{job.candidateCounts?.total || 0}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">{job.candidateCounts?.shortlisted || 0}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Interview Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">{job.candidateCounts?.interviewing || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap">{job.jobDescription}</div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Department</div>
                  <div>{job.department}</div>
                  
                  <div className="text-sm font-medium">Location</div>
                  <div>{job.location}</div>
                  
                  <div className="text-sm font-medium">Salary Range</div>
                  <div>
                    {job.salaryMin && job.salaryMax 
                      ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                      : 'Not specified'}
                  </div>
                  
                  <div className="text-sm font-medium">Visa Sponsorship</div>
                  <div>{job.visaSponsorship ? 'Available' : 'Not Available'}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Interview Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {job.interviewRounds.map((round, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full h-6 w-6 flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <h4 className="font-medium">{round.name}</h4>
                      </div>
                      <div className="pl-8 text-sm text-muted-foreground">
                        {round.interviewers.length > 0 
                          ? `Interviewers: ${round.interviewers.join(', ')}`
                          : 'No interviewers assigned'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {job.additionalInstructions && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">{job.additionalInstructions}</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="candidates">
          <div className="mb-4 flex justify-end gap-2">
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      onClick={handleScreenCandidates} 
                      disabled={isScreening || allCandidatesScored()}
                      className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white"
                    >
                      {isScreening ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Screening Candidates...
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-4 w-4" />
                          Screen Candidates
                        </>
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {allCandidatesScored() ? (
                    <p>All candidates have already been scored.</p>
                  ) : (
                    <p>Automatically analyze and score candidates based on their resumes and the job requirements. This helps identify the most qualified candidates.</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      onClick={() => handleContactCandidates(true)}
                      disabled={!job?.candidates?.some(candidate => candidate.status === "Shortlisted")}
                      className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Start Interviewing Shortlisted
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {!job?.candidates?.some(candidate => candidate.status === "Shortlisted") ? 
                    <p>No shortlisted candidates available to start interviewing.</p> :
                    <p>Send interview invitations to all shortlisted candidates.</p>
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {selectedCandidates.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button 
                        onClick={() => handleContactCandidates(false)}
                        disabled={!selectedCandidates.some(id => {
                          const candidate = job?.candidates.find(c => c._id === id);
                          return candidate && candidate.status !== "Interviewing" && candidate.status !== "Offered" && candidate.status !== "Hired";
                        })}
                        className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Start Interviewing Selected ({selectedCandidates.length})
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {!selectedCandidates.some(id => {
                      const candidate = job?.candidates.find(c => c._id === id);
                      return candidate && candidate.status !== "Interviewing" && candidate.status !== "Offered" && candidate.status !== "Hired";
                    }) ? 
                      <p>Selected candidates are already in the interview process. To move them to the next round, click on "Decision" button for each candidate.</p> :
                      <p>Send interview invitations to selected candidates who are not yet in the interview process.</p>
                    }
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      onClick={checkEmailResponses} 
                      disabled={isCheckingEmails}
                      className="bg-gradient-to-r from-indigo-400 to-indigo-600 hover:from-indigo-500 hover:to-indigo-700 text-white"
                    >
                      {isCheckingEmails ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking Emails...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Check Email Responses
                        </>
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Manually check for new email responses from candidates.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <CandidateManagement jobId={jobId} onCandidatesSelected={setSelectedCandidates} />
        </TabsContent>
        
        <TabsContent value="interviews">
          <Card>
            <CardHeader>
              <CardTitle>Interview Management</CardTitle>
              <CardDescription>
                Schedule and manage interviews for shortlisted candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Interview management will be available in the next phase.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Selected Candidates</DialogTitle>
            <DialogDescription>
              Send interview invitations to {selectedCandidates.length} selected candidates.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="emailTemplate">Email Template</Label>
              <Textarea
                id="emailTemplate"
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use {'{'}{'{'}candidate_name{'}'}{'}'} for the candidate&apos;s name and {'{'}{'{'}scheduling_details{'}'}{'}'} for interview slots.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Scheduling Method</Label>
              <RadioGroup value={schedulingMethod} onValueChange={(v) => setSchedulingMethod(v as "manual" | "calendly" | "calendar")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual">Manual (Specify available dates/times)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="calendly" id="calendly" />
                  <Label htmlFor="calendly">Calendly Link</Label>
                </div>
                {calendarConnected && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="calendar" id="calendar" />
                    <Label htmlFor="calendar">Use Calendar Availability</Label>
                  </div>
                )}
              </RadioGroup>
            </div>
            
            {schedulingMethod === "manual" ? (
              <div className="space-y-2">
                <Label htmlFor="availableDates">Available Interview Slots</Label>
                <Textarea
                  id="availableDates"
                  value={availableDates}
                  onChange={(e) => setAvailableDates(e.target.value)}
                  placeholder="Monday, June 10: 10:00 AM - 12:00 PM, 2:00 PM - 4:00 PM
Tuesday, June 11: 9:00 AM - 11:00 AM, 1:00 PM - 3:00 PM"
                  rows={4}
                />
              </div>
            ) : schedulingMethod === "calendly" ? (
              <div className="space-y-2">
                <Label htmlFor="calendlyLink">Calendly Link</Label>
                <Input
                  id="calendlyLink"
                  value={calendlyLink}
                  onChange={(e) => setCalendlyLink(e.target.value)}
                  placeholder="https://calendly.com/your-name/interview"
                />
              </div>
            ) : schedulingMethod === "calendar" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="availableDates">Available Slots from Your Calendar</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchCalendarAvailability}
                    disabled={isLoadingSlots}
                  >
                    {isLoadingSlots ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-3 w-3" />
                        Find Available Slots
                      </>
                    )}
                  </Button>
                </div>
                
                {isLoadingSlots ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <Textarea
                    id="availableDates"
                    value={availableDates}
                    onChange={(e) => setAvailableDates(e.target.value)}
                    placeholder="Click &quot;Find Available Slots&quot; to check your calendar for availability"
                    rows={4}
                  />
                )}
                
                {availableSlots.length === 0 && !isLoadingSlots && (
                  <p className="text-xs text-muted-foreground">
                    Click &quot;Find Available Slots&quot; to check your calendar for availability.
                  </p>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmails}
              disabled={isSending}
              className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Emails"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}