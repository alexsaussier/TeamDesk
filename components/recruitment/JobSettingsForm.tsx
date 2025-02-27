"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Sparkles, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface JobSettingsFormProps {
  jobDescription: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface InterviewRound {
  id: string;
  name: string;
  interviewers: string[];
}

export default function JobSettingsForm({ jobDescription, onComplete, onCancel }: JobSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Extract information from job description
  const extractJobInfo = (description: string) => {
    const info = {
      title: "",
      department: "",
      location: "",
    };

    // Try to extract job title
    const titleMatch = description.match(/Job Title:?\s*([^\n]+)/i) || 
                      description.match(/^#\s*([^\n]+)/m) ||
                      description.match(/^(.+?)(?:\n|$)/);
    if (titleMatch && titleMatch[1]) {
      info.title = titleMatch[1].trim();
    }

    // Try to extract department
    const departmentMatch = description.match(/Department:?\s*([^\n]+)/i) ||
                           description.match(/About the Company:?\s*([^\n]+)/i);
    if (departmentMatch && departmentMatch[1]) {
      info.department = departmentMatch[1].trim();
    }

    // Try to extract location
    const locationMatch = description.match(/Location:?\s*([^\n]+)/i) ||
                         description.match(/(?:Position|Job) Location:?\s*([^\n]+)/i);
    if (locationMatch && locationMatch[1]) {
      info.location = locationMatch[1].trim();
    }

    return info;
  };

  const extractedInfo = extractJobInfo(jobDescription);

  // Initialize form data with extracted information
  const [formData, setFormData] = useState({
    title: extractedInfo.title,
    department: extractedInfo.department,
    location: extractedInfo.location,
    salaryMin: "",
    salaryMax: "",
    visaSponsorship: false,
    shortlistCount: "5",
    additionalInstructions: "",
    interviewRounds: [
      { 
        name: "Initial Screening", 
        description: "Basic qualification check and cultural fit assessment",
        interviewers: [""] 
      },
      { 
        name: "Technical Interview", 
        description: "In-depth technical skills evaluation",
        interviewers: [""] 
      },
      { 
        name: "Final Interview", 
        description: "Meeting with the hiring manager and team",
        interviewers: [""] 
      }
    ]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleRoundChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedRounds = [...prev.interviewRounds];
      updatedRounds[index] = { ...updatedRounds[index], [field]: value };
      return { ...prev, interviewRounds: updatedRounds };
    });
  };

  const handleInterviewerChange = (roundIndex: number, interviewerIndex: number, value: string) => {
    setFormData(prev => {
      const updatedRounds = [...prev.interviewRounds];
      const updatedInterviewers = [...updatedRounds[roundIndex].interviewers];
      updatedInterviewers[interviewerIndex] = value;
      updatedRounds[roundIndex].interviewers = updatedInterviewers;
      return { ...prev, interviewRounds: updatedRounds };
    });
  };

  const addInterviewer = (roundIndex: number) => {
    setFormData(prev => {
      const updatedRounds = [...prev.interviewRounds];
      updatedRounds[roundIndex].interviewers.push("");
      return { ...prev, interviewRounds: updatedRounds };
    });
  };

  const removeInterviewer = (roundIndex: number, interviewerIndex: number) => {
    setFormData(prev => {
      const updatedRounds = [...prev.interviewRounds];
      updatedRounds[roundIndex].interviewers = updatedRounds[roundIndex].interviewers.filter(
        (_, i) => i !== interviewerIndex
      );
      return { ...prev, interviewRounds: updatedRounds };
    });
  };

  const addInterviewRound = () => {
    setFormData(prev => ({
      ...prev,
      interviewRounds: [
        ...prev.interviewRounds,
        {
          name: `Interview Round ${prev.interviewRounds.length + 1}`,
          description: "",
          interviewers: [""]
        }
      ]
    }));
  };

  const removeInterviewRound = (roundIndex: number) => {
    if (formData.interviewRounds.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "You must have at least one interview round.",
        variant: "destructive",
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      interviewRounds: prev.interviewRounds.filter((_, i) => i !== roundIndex)
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.title || !formData.department || !formData.location) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Clean up empty interviewers
    const cleanedFormData = {
      ...formData,
      interviewRounds: formData.interviewRounds.map(round => ({
        ...round,
        interviewers: round.interviewers.filter(email => email.trim() !== "")
      }))
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/recruitment/create-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...cleanedFormData,
          jobDescription,
          salaryMin: cleanedFormData.salaryMin ? parseInt(cleanedFormData.salaryMin) : null,
          salaryMax: cleanedFormData.salaryMax ? parseInt(cleanedFormData.salaryMax) : null,
          shortlistCount: parseInt(cleanedFormData.shortlistCount),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create job");
      }

      toast({
        title: "Job created successfully",
        description: "Your job has been created and is ready to receive applications.",
      });
      
      onComplete();
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Job Settings</CardTitle>
        <CardDescription>
          Configure the details and requirements for this job posting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g. Engineering"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. New York, NY (Remote)"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortlistCount">Shortlist Count</Label>
              <Input
                id="shortlistCount"
                name="shortlistCount"
                type="number"
                min="1"
                max="20"
                value={formData.shortlistCount}
                onChange={handleInputChange}
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground">
                Number of candidates to shortlist for interviews
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Compensation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Minimum Salary (USD)</Label>
              <Input
                id="salaryMin"
                name="salaryMin"
                type="number"
                min="0"
                step="1000"
                value={formData.salaryMin}
                onChange={handleInputChange}
                placeholder="e.g. 80000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Maximum Salary (USD)</Label>
              <Input
                id="salaryMax"
                name="salaryMax"
                type="number"
                min="0"
                step="1000"
                value={formData.salaryMax}
                onChange={handleInputChange}
                placeholder="e.g. 120000"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="visaSponsorship"
              name="visaSponsorship"
              checked={formData.visaSponsorship}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, visaSponsorship: checked === true }))
              }
            />
            <Label htmlFor="visaSponsorship">Visa sponsorship available</Label>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Interview Process</h3>
            <Button 
              type="button" 
              variant="outline" 
              onClick={addInterviewRound}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Round
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Define the interview rounds for this position
          </p>
          
          {formData.interviewRounds.map((round, roundIndex) => (
            <div key={roundIndex} className="space-y-2 p-4 border rounded-md">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Round {roundIndex + 1}</h4>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeInterviewRound(roundIndex)}
                  className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`round-${roundIndex}-name`}>Round Name</Label>
                <Input
                  id={`round-${roundIndex}-name`}
                  value={round.name}
                  onChange={(e) => handleRoundChange(roundIndex, 'name', e.target.value)}
                  placeholder="e.g. Technical Interview"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`round-${roundIndex}-description`}>Description</Label>
                <Textarea
                  id={`round-${roundIndex}-description`}
                  value={round.description}
                  onChange={(e) => handleRoundChange(roundIndex, 'description', e.target.value)}
                  placeholder="Describe what this round will assess"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <Label>Interviewers</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addInterviewer(roundIndex)}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Interviewer
                  </Button>
                </div>
                
                {round.interviewers.map((interviewer, interviewerIndex) => (
                  <div key={interviewerIndex} className="flex items-center gap-2">
                    <Input
                      type="email"
                      value={interviewer}
                      onChange={(e) => handleInterviewerChange(roundIndex, interviewerIndex, e.target.value)}
                      placeholder="Interviewer email"
                      className="flex-1"
                    />
                    {round.interviewers.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeInterviewer(roundIndex, interviewerIndex)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Email addresses to notify when candidates are ready for this interview round
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="additionalInstructions">AI Screening Instructions</Label>
          <Textarea
            id="additionalInstructions"
            name="additionalInstructions"
            value={formData.additionalInstructions}
            onChange={handleInputChange}
            placeholder="Special instructions for the AI resume screener (e.g., 'Prioritize candidates with MBAs', 'Focus on Python experience')"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            These instructions will guide the AI when screening resumes. They won't be visible to candidates.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Job...
            </>
          ) : (
            "Create Job"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 