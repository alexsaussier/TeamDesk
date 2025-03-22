"use client"

import { useState, useEffect } from 'react'
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileText, Users, MessageSquare, Search, Calendar, Building, Globe, Loader2, Trash2 } from "lucide-react"
import JobDescriptionCreator from "@/components/recruitment/JobDescriptionCreator"
import JobSettingsForm from "@/components/recruitment/JobSettingsForm"
import { useToast } from "@/hooks/use-toast";
import { Job } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function RecruitmentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const [currentStep, setCurrentStep] = useState<"description" | "settings">("description")
  const [jobDescription, setJobDescription] = useState<string | null>(null)
  
  // Jobs listing state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobsActiveTab, setJobsActiveTab] = useState("all");
  const { toast } = useToast();
  
  // Delete job state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [calendarConnected, setCalendarConnected] = useState(false);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);

  useEffect(() => {
    fetchJobs();
    checkCalendarConnection();
  }, [toast]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/recruitment/jobs");
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setJobs(data);
      } else if (data.jobs && Array.isArray(data.jobs)) {
        // If the API returns an object with a jobs property
        setJobs(data.jobs);
      } else {
        // If neither condition is met, set to empty array
        console.error("Unexpected API response format:", data);
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive",
      });
      setJobs([]); // Set to empty array on error
    } finally {
      setLoading(false);
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

  const handleConnectCalendar = async () => {
    setIsConnectingCalendar(true);
    try {
      const response = await fetch("/api/calendar/authorize");
      if (response.ok) {
        const { authUrl } = await response.json();
        // Open Google authorization in a new window
        window.open(authUrl, "_blank", "width=600,height=700");
        
        // Poll for connection status
        const checkInterval = setInterval(async () => {
          const statusRes = await fetch("/api/calendar/status");
          if (statusRes.ok) {
            const data = await statusRes.json();
            if (data.connected) {
              setCalendarConnected(true);
              clearInterval(checkInterval);
              setIsConnectingCalendar(false);
              toast({
                title: "Success",
                description: "Google Calendar connected successfully!",
              });
            }
          }
        }, 3000);
        
        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          setIsConnectingCalendar(false);
        }, 120000);
      } else {
        throw new Error("Failed to get authorization URL");
      }
    } catch (error) {
      console.error("Error connecting calendar:", error);
      toast({
        title: "Error",
        description: "Failed to connect Google Calendar. Please try again.",
        variant: "destructive",
      });
      setIsConnectingCalendar(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    setIsConnectingCalendar(true);
    try {
      const response = await fetch("/api/calendar/disconnect", {
        method: "POST",
      });
      
      if (response.ok) {
        setCalendarConnected(false);
        toast({
          title: "Success",
          description: "Google Calendar disconnected successfully.",
        });
      } else {
        throw new Error("Failed to disconnect calendar");
      }
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  // Filter jobs based on search query and active tab
  const filteredJobs = Array.isArray(jobs) 
    ? jobs.filter(job => {
        const matchesSearch = 
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (jobsActiveTab === "all") {
          return matchesSearch;
        }
        
        return matchesSearch && job.status.toLowerCase() === jobsActiveTab;
      })
    : [];

  const handleStartJobCreation = () => {
    setIsCreatingJob(true)
    setCurrentStep("description")
    setActiveTab("create")
  }

  const handleJobDescriptionComplete = (description: string) => {
    setJobDescription(description)
    setCurrentStep("settings")
  }

  const handleJobSettingsComplete = () => {
    // Reset the creation flow and go back to jobs tab
    setIsCreatingJob(false)
    setJobDescription(null)
    setActiveTab("overview")
    // In a real implementation, we would save the job and refresh the jobs list
    fetchJobs();
  }

  const handleCancel = () => {
    setIsCreatingJob(false)
    setJobDescription(null)
    setActiveTab("overview")
  }

  const handleDeleteClick = (e: React.MouseEvent, job: Job) => {
    e.preventDefault();
    e.stopPropagation();
    setJobToDelete(job);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/recruitment/jobs/${jobToDelete._id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete job");
      }
      
      // Remove the job from the state
      setJobs(prevJobs => Array.isArray(prevJobs) 
        ? prevJobs.filter(job => job._id !== jobToDelete._id)
        : []);
      
      toast({
        title: "Success",
        description: `"${jobToDelete.title}" has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Recruitment Agent</h1>
        <div className="flex items-center gap-5">
          
          {/* Calendar Integration with Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-2 text-sm cursor-pointer">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={!calendarConnected ? handleConnectCalendar : undefined}
                disabled={isConnectingCalendar}
              >
                <div className={`w-2 h-2 rounded-full ${calendarConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                {isConnectingCalendar ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Calendar className="h-3 w-3" />
                )}
                {calendarConnected ? 'Connected' : 'Connect'}

              </Button>
            </div>
            
            {/* Dropdown menu that appears on hover */}
            {calendarConnected && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="py-1">
                  <button
                    className="w-full text-left px-2 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={handleDisconnectCalendar}
                    disabled={isConnectingCalendar}
                  >
                    {isConnectingCalendar ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    ) : (
                      <Calendar className="h-3 w-3 mr-2" />                    
                    )}
                    Disconnect Calendar
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {!isCreatingJob && (
            <Button 
              onClick={handleStartJobCreation}
              className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Job
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="relative">
          {/* Blurred background */}
          <div className="filter blur-sm pointer-events-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Interviews</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Loading...</CardTitle>
              </CardHeader>
              <CardContent className="h-40"></CardContent>
            </Card>
          </div>
          
          {/* Loading overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">Loading jobs...</p>
            </div>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="create" disabled={!isCreatingJob}>Create Job</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jobs.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {jobs.reduce((total, job) => total + (job.candidateCounts?.total || 0), 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Interviews</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {jobs.reduce((total, job) => total + (job.candidateCounts?.interviewing || 0), 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {jobs.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>
                    Use our AI-powered recruitment agent to automate your hiring process
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Our AI recruitment agent helps you create job descriptions, screen resumes,
                    manage interviews, and generate offers - all with minimal manual effort.
                  </p>
                  <Button 
                    onClick={handleStartJobCreation}
                    className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Job
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <Tabs value={jobsActiveTab} onValueChange={setJobsActiveTab}>
                  <TabsList className="gap-2">
                    <TabsTrigger value="all">All Jobs</TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                    <TabsTrigger value="draft">Draft</TabsTrigger>
                    <TabsTrigger value="closed">Closed</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={jobsActiveTab} className="mt-6">
                    {loading ? (
                      <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : filteredJobs.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No jobs found.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredJobs.map((job) => (
                          <div key={job._id} className="relative group">
                            <Link href={`/dashboard/recruitment/jobs/${job._id}`}>
                              <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{job.title}</CardTitle>
                                    <Badge className={
                                      job.status === 'Published' ? 'bg-green-100 text-green-800' :
                                      job.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }>
                                      {job.status}
                                    </Badge>
                                  </div>
                                  <CardDescription className="flex items-center gap-1">
                                    <Building className="h-3 w-3" />
                                    {job.department}
                                    <span className="mx-1">•</span>
                                    <Globe className="h-3 w-3" />
                                    {job.location}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                      <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>{job.candidateCounts?.total || 0} candidates</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                      <div>
                                        <div className="font-medium">{job.candidateCounts?.new || 0}</div>
                                        <div className="text-xs text-muted-foreground">New</div>
                                      </div>
                                      <div>
                                        <div className="font-medium">{job.candidateCounts?.shortlisted || 0}</div>
                                        <div className="text-xs text-muted-foreground">Shortlisted</div>
                                      </div>
                                      <div>
                                        <div className="font-medium">{job.candidateCounts?.interviewing || 0}</div>
                                        <div className="text-xs text-muted-foreground">Interviewing</div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleDeleteClick(e, job)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </TabsContent>
          

          {/* Create Job Tab */}
          <TabsContent value="create" className="space-y-4">
            {currentStep === "description" && (
              <JobDescriptionCreator onComplete={handleJobDescriptionComplete} onCancel={handleCancel} />
            )}
            
            {currentStep === "settings" && jobDescription && (
              <JobSettingsForm 
                jobDescription={jobDescription} 
                onComplete={handleJobSettingsComplete} 
                onCancel={handleCancel} 
              />
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              This will permanently delete the job &quot;{jobToDelete?.title}&quot;. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Job"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 