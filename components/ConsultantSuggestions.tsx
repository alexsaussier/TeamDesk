import { Consultant, Project, TeamSize } from "@/types"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useOrganizationLevels } from '@/contexts/OrganizationContext'

/**
 * ConsultantSuggestions Component
 * 
 * This component is used to suggest and assign consultants to projects based on their skills,
 * availability, and match with project requirements. It's primarily used in:
 * 
 * 1. The AddProjectModal component when creating a new project (step 2 of the project creation flow)
 * 2. Potentially in project editing flows to modify team assignments
 * 
 * The component analyzes consultants' skills against project requirements, calculates their
 * availability based on existing assignments across all projects, and provides an interface
 * for project managers to select appropriate team members with relevant information like:
 * - Skill match percentage
 * - Availability during the project timeline
 * - Consultant level (junior, manager, partner)
 * 
 * It also allows setting assignment percentages and hourly rates for consultants assigned to projects.
 */


interface ConsultantSuggestionProps {
  consultant: Consultant;
  matchScore: number;
  skillsMatch: string[];
  skillsMissing: string[];
  isAvailable: boolean;
  isAssigned: boolean;
  availabilityPercentage: number;
  percentage?: number;
  onToggleAssign: (consultantId: string, assigned: boolean, percentage?: number) => void;
}

interface ConsultantSuggestionsProps {
  consultants: Consultant[];
  projectRequirements: {
    startDate: string;
    endDate: string;
    requiredSkills: string[];
    teamSize: TeamSize;
  };
  allProjects: Project[];
  projectId: string;
  defaultHourlyRates?: {
    junior: number;
    manager: number;
    partner: number;
  };
}

function ConsultantCard({ consultant, matchScore, skillsMatch, isAvailable, isAssigned, onToggleAssign, availabilityPercentage }: ConsultantSuggestionProps) {
  const [isEditingPercentage, setIsEditingPercentage] = useState(false);
  const [tempPercentage, setTempPercentage] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const handleAssignment = async (assigned: boolean, percentage?: number) => {
    setIsLoading(true);
    try {
      await onToggleAssign(consultant._id, assigned, percentage);
    } finally {
      setIsLoading(false);
      setIsEditingPercentage(false);
    }
  };

  return (
    <div className="relative border rounded-lg p-4 space-y-3">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      <div className={`relative ${isAssigned ? 'opacity-50' : ''}`}>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={consultant.picture} alt={consultant.name} />
          </Avatar>
          <div>
            <h4 className="font-medium">{consultant.name}</h4>
            <p className="text-sm text-muted-foreground capitalize">{consultant.level}</p>
          </div>
        </div>

        {!isEditingPercentage ? (
          <div className="flex items-center gap-2 mt-3">
            <Checkbox
              checked={isAssigned}
              onCheckedChange={(checked) => {
                if (checked && !isAssigned) {
                  setIsEditingPercentage(true);
                } else {
                  handleAssignment(false);
                }
              }}
              disabled={(!isAvailable && !isAssigned) || isLoading}
            />
            <Label htmlFor={`assign-${consultant._id}`} className="text-sm text-muted-foreground">
              Assign to project
            </Label>
            <Badge variant={isAvailable ? "secondary" : "destructive"} className="ml-auto">
              {isAvailable ? `${availabilityPercentage}% Available` : "0% available"}
            </Badge>
          </div>
        ) : (
          <div className="space-y-2 mt-3">
            <div className="flex items-center gap-2">
              <Label htmlFor={`percentage-${consultant._id}`} className="text-sm">
                Assignment Percentage:
              </Label>
              <Input
                id={`percentage-${consultant._id}`}
                type="number"
                min="0"
                max="100"
                value={tempPercentage}
                onChange={(e) => setTempPercentage(parseInt(e.target.value) || 0)}
                className="w-24 h-8"
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-green-600"
                onClick={() => handleAssignment(true, tempPercentage)}
                disabled={isLoading}
              >
                <Check className="h-4 w-4 mr-1" />
                Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600"
                onClick={() => setIsEditingPercentage(false)}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2 mt-3">
          <div>
            <p className="text-sm font-medium">Match Score: {matchScore}%</p>
            <Progress value={matchScore} className="h-2" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Matching Skills:</p>
            <div className="flex flex-wrap gap-1">
              {skillsMatch.map(skill => (
                <Badge key={skill} variant="secondary" className="bg-green-50 text-green-700">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConsultantSuggestions({ 
  consultants, 
  projectRequirements, 
  allProjects,
  projectId,
  defaultHourlyRates
}: ConsultantSuggestionsProps) {
  const { levels } = useOrganizationLevels()
  const { toast } = useToast()
  // Track assigned consultants locally
  const [assignedConsultants, setAssignedConsultants] = useState<string[]>([])

  const handleToggleAssign = async (consultantId: string, assigned: boolean, percentage: number = 100) => {
    if (!projectId) {
      console.error('Project ID is undefined')
      return
    }

    try {
      if (assigned) {
        const consultant = consultants.find(c => c._id === consultantId || c.id === consultantId);
        const hourlyRate = consultant && defaultHourlyRates && (consultant.level in defaultHourlyRates) 
          ? defaultHourlyRates[consultant.level as keyof typeof defaultHourlyRates] 
          : 0;
        
        // Call the assign API
        const response = await fetch(`/api/projects/${projectId}/assign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            consultantId,
            percentage,
            hourlyRate
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to assign consultant')
        }
        setAssignedConsultants(prev => [...prev, consultantId])
      } else {
        // Call the unassign API
        const response = await fetch(`/api/projects/${projectId}/unassign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ consultantId }),
        })

        if (!response.ok) {
          throw new Error('Failed to unassign consultant')
        }
        setAssignedConsultants(prev => prev.filter(id => id !== consultantId))
      }
    } catch (error) {
      console.error('Error toggling consultant assignment:', error)
      // Revert the UI state if the API call fails
      if (assigned) {
        setAssignedConsultants(prev => prev.filter(id => id !== consultantId))
      } else {
        setAssignedConsultants(prev => [...prev, consultantId])
      }
    }
  }

  const calculateMatchScore = (consultant: Consultant): ConsultantSuggestionProps => {
    // Check availability and calculate percentage
    let availabilityPercentage = 100;
    const today = new Date();
    
    consultant.assignments.forEach(assignment => {
      const project = allProjects.find(p => p.id === assignment.projectId);
      if (!project) return;
      
      const projectStart = new Date(project.startDate);
      const projectEnd = new Date(project.endDate);
      
      if (projectStart <= today && projectEnd >= today) {
        availabilityPercentage -= assignment.percentage;
      }
    });

    // Rest of the existing availability check
    const isAvailable = availabilityPercentage > 0;

    // Calculate skills match (case insensitive)
    const skillsMatch = consultant.skills.filter(skill => 
      projectRequirements.requiredSkills.some(
        reqSkill => reqSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    
    const skillsMissing = projectRequirements.requiredSkills.filter(
      reqSkill => !consultant.skills.some(
        skill => skill.toLowerCase() === reqSkill.toLowerCase()
      )
    );

    // Calculate match score (weighted)
    const skillsScore = (skillsMatch.length / projectRequirements.requiredSkills.length) * 60;
    const availabilityScore = isAvailable ? 40 : 0;
    const matchScore = Math.round(skillsScore + availabilityScore);

    return {
      consultant,
      matchScore,
      skillsMatch,
      skillsMissing,
      isAvailable,
      availabilityPercentage: Math.max(0, availabilityPercentage),
      isAssigned: assignedConsultants.includes(consultant._id),
      onToggleAssign: handleToggleAssign
    };
  };

  // Calculate consultant suggestions
  const consultantSuggestions = consultants.map(calculateMatchScore);

  // Group suggestions by level using dynamic levels
  const groupedSuggestions = useMemo(() => {
    const grouped: Record<string, ConsultantSuggestionProps[]> = {}
    
    levels.forEach(level => {
      grouped[level.id] = consultantSuggestions.filter(s => s.consultant.level === level.id)
    })
    
    return grouped
  }, [consultantSuggestions, levels])

  return (
    <div className="space-y-6">
      {levels
        .filter(level => (projectRequirements.teamSize[level.id] || 0) > 0)
        .map((level) => (
          <div key={level.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {level.name} Consultants ({assignedConsultants.filter(id => 
                  consultants.find(c => c._id === id)?.level === level.id
                ).length}/{projectRequirements.teamSize[level.id]} assigned)
              </h3>
              <Badge variant="outline">
                {groupedSuggestions[level.id]?.filter(s => s.isAvailable).length || 0} available
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedSuggestions[level.id]?.map(suggestion => (
                <ConsultantCard 
                  key={suggestion.consultant._id}
                  {...suggestion}
                  isAssigned={assignedConsultants.includes(suggestion.consultant._id)}
                  onToggleAssign={handleToggleAssign}
                  availabilityPercentage={suggestion.availabilityPercentage}
                />
              ))}
              {(!groupedSuggestions[level.id] || groupedSuggestions[level.id].length === 0) && (
                <p className="text-sm text-muted-foreground col-span-2">
                  No {level.name} consultants found
                </p>
              )}
            </div>
          </div>
        ))}
    </div>
  );
} 