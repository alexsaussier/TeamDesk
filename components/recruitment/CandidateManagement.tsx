"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Search, Filter, Download, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Job, Candidate, CandidateStatus } from "@/types";

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
        <p className="text-muted-foreground">Job not found or you don't have access.</p>
      </div>
    );
  }

  return (
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
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={handleAutoShortlist}
            >
              <CheckCircle2 className="h-4 w-4" />
              Auto-Shortlist
            </Button>
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
                        {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-sm">{candidate.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{candidate.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(candidate.status)}>
                            {candidate.status}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            Score: {candidate.score || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hidden sm:flex"
                      asChild
                    >
                      <a href={`/dashboard/recruitment/candidates/${candidate._id}`}>
                        View
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 