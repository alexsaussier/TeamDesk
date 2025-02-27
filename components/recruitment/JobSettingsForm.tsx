"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    visaSponsorship: false,
    shortlistCount: "5",
    additionalInstructions: "",
    interviewRounds: [
      { id: "1", name: "Initial Screening", interviewers: [""] }
    ] as InterviewRound[]
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addInterviewRound = () => {
    const newRound = {
      id: Date.now().toString(),
      name: `Round ${formData.interviewRounds.length + 1}`,
      interviewers: [""]
    };
    
    setFormData(prev => ({
      ...prev,
      interviewRounds: [...prev.interviewRounds, newRound]
    }));
  };

  const removeInterviewRound = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interviewRounds: prev.interviewRounds.filter(round => round.id !== id)
    }));
  };

  const updateRoundName = (id: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      interviewRounds: prev.interviewRounds.map(round => 
        round.id === id ? { ...round, name } : round
      )
    }));
  };

  const addInterviewer = (roundId: string) => {
    setFormData(prev => ({
      ...prev,
      interviewRounds: prev.interviewRounds.map(round => 
        round.id === roundId 
          ? { ...round, interviewers: [...round.interviewers, ""] } 
          : round
      )
    }));
  };

  const removeInterviewer = (roundId: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      interviewRounds: prev.interviewRounds.map(round => 
        round.id === roundId 
          ? { 
              ...round, 
              interviewers: round.interviewers.filter((_, i) => i !== index) 
            } 
          : round
      )
    }));
  };

  const updateInterviewer = (roundId: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      interviewRounds: prev.interviewRounds.map(round => 
        round.id === roundId 
          ? { 
              ...round, 
              interviewers: round.interviewers.map((interviewer, i) => 
                i === index ? value : interviewer
              ) 
            } 
          : round
      )
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

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/recruitment/create-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          jobDescription,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          shortlistCount: parseInt(formData.shortlistCount),
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
          Configure the details and interview process for this position
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
                value={formData.title} 
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input 
                id="department" 
                value={formData.department} 
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="e.g., Engineering"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input 
                id="location" 
                value={formData.location} 
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., New York, NY (Remote)"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Salary Min ($)</Label>
                <Input 
                  id="salaryMin" 
                  type="number"
                  value={formData.salaryMin} 
                  onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                  placeholder="e.g., 80000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Salary Max ($)</Label>
                <Input 
                  id="salaryMax" 
                  type="number"
                  value={formData.salaryMax} 
                  onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                  placeholder="e.g., 120000"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="visaSponsorship" 
              checked={formData.visaSponsorship}
              onCheckedChange={(checked) => handleInputChange("visaSponsorship", checked)}
            />
            <Label htmlFor="visaSponsorship">Offer visa sponsorship</Label>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Candidate Selection</h3>
          
          <div className="space-y-2">
            <Label htmlFor="shortlistCount">Number of candidates to shortlist</Label>
            <Select 
              value={formData.shortlistCount} 
              onValueChange={(value) => handleInputChange("shortlistCount", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of candidates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 candidates</SelectItem>
                <SelectItem value="5">5 candidates</SelectItem>
                <SelectItem value="10">10 candidates</SelectItem>
                <SelectItem value="15">15 candidates</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additionalInstructions">Additional Instructions</Label>
            <Textarea 
              id="additionalInstructions" 
              value={formData.additionalInstructions} 
              onChange={(e) => handleInputChange("additionalInstructions", e.target.value)}
              placeholder="e.g., Prioritize candidates with startup experience, be flexible with salary for exceptional candidates"
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Interview Process</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addInterviewRound}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Round
            </Button>
          </div>
          
          <div className="space-y-6">
            {formData.interviewRounds.map((round, roundIndex) => (
              <Card key={round.id} className="border border-muted">
                <CardHeader className="py-4 px-6">
                  <div className="flex items-center justify-between">
                    <Input
                      value={round.name}
                      onChange={(e) => updateRoundName(round.id, e.target.value)}
                      className="font-medium border-none p-0 h-auto text-lg focus-visible:ring-0"
                    />
                    {formData.interviewRounds.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeInterviewRound(round.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="py-2 px-6 space-y-4">
                  <Label>Interviewers</Label>
                  {round.interviewers.map((interviewer, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={interviewer}
                        onChange={(e) => updateInterviewer(round.id, index, e.target.value)}
                        placeholder="Interviewer name or email"
                        className="flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeInterviewer(round.id, index)}
                        disabled={round.interviewers.length === 1}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addInterviewer(round.id)}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Interviewer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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