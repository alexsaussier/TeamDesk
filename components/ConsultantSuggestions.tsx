import { Consultant, Project, TeamSize } from "@/types"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface ConsultantSuggestionProps {
  consultant: Consultant;
  matchScore: number;
  skillsMatch: string[];
  skillsMissing: string[];
  isAvailable: boolean;
}

interface ConsultantSuggestionsProps {
  consultants: Consultant[];
  projectRequirements: {
    startDate: string;
    endDate: string;
    requiredSkills: string[];
    teamSize: TeamSize;
  };
  onAssign: (consultantId: string) => void;
  allProjects: Project[];
}

interface AssignmentCounts {
  [key: string]: {
    assigned: number;
    needed: number;
  }
}

function ConsultantCard({ consultant, matchScore, skillsMatch, skillsMissing, isAvailable, onAssign }: ConsultantSuggestionProps & { onAssign: (id: string) => void }) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={consultant.picture} alt={consultant.name} />
          </Avatar>
          <div>
            <h4 className="font-medium">{consultant.name}</h4>
            <p className="text-sm text-muted-foreground capitalize">{consultant.level}</p>
          </div>
        </div>
        <Badge variant={isAvailable ? "win" : "destructive"}>
          {isAvailable ? "Available" : "Unavailable"}
        </Badge>
      </div>

      <div className="space-y-2">
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

        {/*skillsMissing.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Missing Skills:</p>
            <div className="flex flex-wrap gap-1">
              {skillsMissing.map(skill => (
                <Badge key={skill} variant="secondary" className="bg-red-50 text-red-700">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}*/}
      </div>

      <Button 
        className="w-full" 
        onClick={() => onAssign(consultant._id)}
        disabled={!isAvailable}
      >
        Assign to Project
      </Button>
    </div>
  );
}

export default function ConsultantSuggestions({ 
  consultants, 
  projectRequirements, 
  onAssign,
  allProjects 
}: ConsultantSuggestionsProps) {
  const calculateMatchScore = (consultant: Consultant): ConsultantSuggestionProps => {
    // Check availability
    const isAvailable = !consultant.assignments.some(assignment => {
      const project = allProjects.find(p => p.id === assignment.projectId);
      if (!project) return false;
      
      const projectStart = new Date(project.startDate);
      const projectEnd = new Date(project.endDate);
      const newStart = new Date(projectRequirements.startDate);
      const newEnd = new Date(projectRequirements.endDate);
      
      return (newStart <= projectEnd && newEnd >= projectStart);
    });

    // Calculate skills match
    const skillsMatch = consultant.skills.filter(skill => 
      projectRequirements.requiredSkills.includes(skill)
    );
    
    const skillsMissing = projectRequirements.requiredSkills.filter(
      skill => !consultant.skills.includes(skill)
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
      isAvailable
    };
  };

  // Group consultants by level and calculate match scores
  const groupedSuggestions = consultants.reduce((acc, consultant) => {
    const level = consultant.level;
    const matchData = calculateMatchScore(consultant);
    
    if (!acc[level]) {
      acc[level] = [];
    }
    
    acc[level].push(matchData);
    return acc;
  }, {} as Record<string, ConsultantSuggestionProps[]>);

  // Sort suggestions by match score within each group
  Object.keys(groupedSuggestions).forEach(level => {
    groupedSuggestions[level].sort((a, b) => b.matchScore - a.matchScore);
  });

  const assignmentCounts = Object.entries(projectRequirements.teamSize).reduce((acc, [level, needed]) => {
    acc[level] = {
      assigned: 0,
      needed
    };
    return acc;
  }, {} as AssignmentCounts);

  return (
    <div className="space-y-6">
      {Object.entries(projectRequirements.teamSize)
        .filter(([_, count]) => count > 0)
        .map(([level, count]) => (
          <div key={level} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium capitalize">
                {level} Consultants ({assignmentCounts[level].assigned}/{assignmentCounts[level].needed} assigned)
              </h3>
              <Badge variant="outline">
                {groupedSuggestions[level]?.filter(s => s.isAvailable).length || 0} available
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedSuggestions[level]?.map(suggestion => (
                <ConsultantCard 
                  key={suggestion.consultant._id}
                  {...suggestion}
                  onAssign={onAssign}
                />
              ))}
              {(!groupedSuggestions[level] || groupedSuggestions[level].length === 0) && (
                <p className="text-sm text-muted-foreground col-span-2">
                  No {level} consultants found
                </p>
              )}
            </div>
          </div>
        ))}
    </div>
  );
} 