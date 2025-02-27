"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function JobApplicationPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { toast } = useToast();
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    salaryExpectation: "",
    visaRequired: false,
    availableFrom: ""
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/recruitment/jobs/public/${jobId}`);
        if (!response.ok) {
          throw new Error("Job not found");
        }
        const data = await response.json();
        setJob(data);
      } catch (error) {
        console.error("Error fetching job:", error);
        toast({
          title: "Error",
          description: "This job posting could not be found or has expired.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, toast]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resume) {
      toast({
        title: "Resume required",
        description: "Please upload your resume to apply.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("jobId", jobId);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("coverLetter", formData.coverLetter);
      formDataToSend.append("salaryExpectation", formData.salaryExpectation);
      formDataToSend.append("visaRequired", formData.visaRequired.toString());
      formDataToSend.append("availableFrom", formData.availableFrom);
      formDataToSend.append("resume", resume);

      const response = await fetch("/api/recruitment/apply", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Job Not Found</CardTitle>
            <CardDescription>
              This job posting could not be found or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle>Application Submitted!</CardTitle>
            <CardDescription>
              Thank you for applying to {job.title} at {job.department}. We'll review your application and be in touch soon.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <CardDescription className="text-lg">
              {job.department} • {job.location}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {job.description ? (
              <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br/>') }} />
            ) : (
              <p>No job description available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apply for this position</CardTitle>
            <CardDescription>
              Please fill out the form below to apply for this position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={formData.email} 
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone} 
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salaryExpectation">Salary Expectation (USD)</Label>
                    <Input 
                      id="salaryExpectation" 
                      type="number"
                      value={formData.salaryExpectation} 
                      onChange={(e) => handleInputChange("salaryExpectation", e.target.value)}
                      placeholder="e.g., 80000"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availableFrom">Available From</Label>
                    <Input 
                      id="availableFrom" 
                      type="date"
                      value={formData.availableFrom} 
                      onChange={(e) => handleInputChange("availableFrom", e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 h-full pt-8">
                    <Switch 
                      id="visaRequired" 
                      checked={formData.visaRequired}
                      onCheckedChange={(checked) => handleInputChange("visaRequired", checked)}
                    />
                    <Label htmlFor="visaRequired">I require visa sponsorship</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume/CV *</Label>
                  <div className="border-2 border-dashed rounded-md p-4">
                    <Input 
                      id="resume" 
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResume(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label 
                      htmlFor="resume" 
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">
                        {resume ? resume.name : "Click to upload your resume"}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        PDF, DOC, or DOCX up to 5MB
                      </span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <Textarea 
                    id="coverLetter" 
                    value={formData.coverLetter} 
                    onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                    placeholder="Tell us why you're interested in this position and why you'd be a good fit."
                    className="min-h-[150px]"
                  />
                </div>
              </div>
              
              <Button 
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 