"use client";
 

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Calendar, Globe, Building, Brain, MessageSquare } from "lucide-react";
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
          description: "Failed to load job details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
    checkCalendarConnection();
  }, [jobId, toast]);

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
      const jobResponse = await fetch(`/api/recruitment/jobs/${job._id}`);
      if (jobResponse.ok) {
        const updatedJob = await jobResponse.json();
        setJob(updatedJob);
      }
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

  const handleContactCandidates = async () => {
    if (!selectedCandidates.length) {
      toast({
        title: "No candidates selected",
        description: "Please select candidates to contact.",
        variant: "destructive",
      });
      return;
    }
    
    // Generate default email template based on job details
    const selectedCandidateNames = job?.candidates
      .filter(c => selectedCandidates.includes(c._id as string))
      .map(c => c.name)
      .join(", ");
    
    const defaultTemplate = `Dear {{candidate_name}},

I hope this email finds you well. Thank you for your application for the ${job?.title} position at our company.

We were impressed with your qualifications and would like to invite you for an interview. Please select a time that works for you from the available slots, or calendar link, if provided.

{{scheduling_details}}

Please confirm your availability by replying to this email or booking directly through the provided link.

We look forward to speaking with you!

Best regards,
The Hiring Team`;

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
          .map((slot: any) => slot.formatted)
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
        <p className="text-muted-foreground">Job not found or you don't have access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
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
            
            <Button 
              onClick={handleScreenCandidates} 
              disabled={isScreening}
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

            <Button 
              onClick={handleContactCandidates}
              disabled={!selectedCandidates?.length}
              className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Start Interview Process for Selected Candidates
            </Button>
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
        <DialogContent className="max-w-3xl">
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
                Use {'{'}{'{'}candidate_name{'}'}{'}'} for the candidate's name and {'{'}{'{'}scheduling_details{'}'}{'}'} for interview slots.
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
                    placeholder="Click 'Find Available Slots' to check your calendar"
                    rows={4}
                  />
                )}
                
                {availableSlots.length === 0 && !isLoadingSlots && (
                  <p className="text-xs text-muted-foreground">
                    Click "Find Available Slots" to check your calendar for availability.
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