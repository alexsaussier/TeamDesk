import { Consultant, Project } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Helper to get months (can be extracted to a shared util if used elsewhere)
const getMonthsBetweenDates = (startDate: Date, endDate: Date): string[] => {
  const months: string[] = []
  const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const finalEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

  while (currentDate <= finalEndDate) {
    months.push(currentDate.toLocaleString('en-US', { month: 'short', year: 'numeric' }))
    currentDate.setMonth(currentDate.getMonth() + 1)
  }
  return months
}

const getTimelineMonths = (numberOfMonths: number = 12): string[] => {
  const today = new Date()
  const futureDate = new Date(today)
  futureDate.setMonth(today.getMonth() + numberOfMonths -1) // e.g., 11 for 12 months total
  return getMonthsBetweenDates(today, futureDate)
}

// Helper to check if a project assignment is active in a given month
const isProjectActiveForConsultantInMonth = (
  project: Project,
  monthString: string // e.g., "Sep 2024"
): boolean => {
  const [monthStr, yearStr] = monthString.split(' ')
  // Ensure robust date parsing, e.g., by mapping monthStr to a number
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = monthNames.indexOf(monthStr);
  if (monthIndex === -1) return false; // Invalid month string

  const monthDateStart = new Date(parseInt(yearStr), monthIndex, 1)
  const monthDateEnd = new Date(parseInt(yearStr), monthIndex + 1, 0) // Last day of the month

  const projectStartDate = new Date(project.startDate)
  const projectEndDate = new Date(project.endDate)

  // Normalize project dates to start of day for comparison
  projectStartDate.setHours(0,0,0,0);
  projectEndDate.setHours(23,59,59,999);


  return projectStartDate <= monthDateEnd && projectEndDate >= monthDateStart;
}


// Helper for cell styling (rounded corners)
const getAssignmentCellStyle = (
    project: Project,
    month: string, // Current month being rendered
    allTimelineMonths: string[], // All months in the timeline header
    consultantAssignmentsForMonth: Project[] // Projects active for this consultant in this month
  ): { barStyle: string; project: Project } => {

    return consultantAssignmentsForMonth.map(p => {
      if (p.id !== project.id) return { barStyle: '', project: p }; // This case should ideally not be hit if used correctly

      const projectStartDate = new Date(project.startDate);
      const projectEndDate = new Date(project.endDate);

      const currentMonthDate = new Date(month + " 1"); // First day of current month string

      let isFirstActiveMonthForProject = false;
      const firstProjectMonth = new Date(projectStartDate.getFullYear(), projectStartDate.getMonth(), 1);
      if (currentMonthDate.getFullYear() === firstProjectMonth.getFullYear() && currentMonthDate.getMonth() === firstProjectMonth.getMonth()) {
        isFirstActiveMonthForProject = true;
      }


      let isLastActiveMonthForProject = false;
      const lastProjectMonth = new Date(projectEndDate.getFullYear(), projectEndDate.getMonth(), 1);
       if (currentMonthDate.getFullYear() === lastProjectMonth.getFullYear() && currentMonthDate.getMonth() === lastProjectMonth.getMonth()) {
        isLastActiveMonthForProject = true;
      }
      
      let barStyle = '';
      if (isFirstActiveMonthForProject && isLastActiveMonthForProject) barStyle = 'rounded-md';
      else if (isFirstActiveMonthForProject) barStyle = 'rounded-l-md';
      else if (isLastActiveMonthForProject) barStyle = 'rounded-r-md';
      
      return { barStyle, project: p };
    }).find(styleInfo => styleInfo.project.id === project.id) || { barStyle: '', project: project };
}


// Basic color hashing for projects (replace with a more robust solution if needed)
const getProjectColor = (projectId: string): string => {
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = projectId.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500'
  ];
  return colors[Math.abs(hash) % colors.length];
}


interface ConsultantTimelineProps {
  consultants: Consultant[]
  projects: Project[]
  onProjectClick: (project: Project) => void
}

export default function ConsultantTimeline({ consultants, projects, onProjectClick }: ConsultantTimelineProps) {
  const timelineMonths = getTimelineMonths(12) // Display 12 months

  // Sort consultants by name for consistent order
  const sortedConsultants = [...consultants].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Card>
      <CardContent className="p-0"> {/* Remove default CardContent padding */}
        <div className="overflow-x-auto"> {/* Enable horizontal scrolling for the table */}
          <Table className="min-w-full"> {/* Ensure table takes at least full width */}
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 bg-background whitespace-nowrap w-[250px] min-w-[250px]">Consultant</TableHead>
                {timelineMonths.map((month) => (
                  <TableHead key={month} className="text-center whitespace-nowrap min-w-[100px]">{month}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedConsultants.map((consultant) => {
                return (
                  <TableRow key={consultant.id}>
                    <TableCell className="sticky left-0 z-10 bg-background font-medium whitespace-nowrap w-[250px] min-w-[250px]">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={consultant.picture} alt={consultant.name} />
                          {/* Fallback can be added here */}
                        </Avatar>
                        <div>
                          {consultant.name}
                          <div className="text-xs text-muted-foreground capitalize">{consultant.level}</div>
                        </div>
                      </div>
                    </TableCell>
                    {timelineMonths.map((monthString) => {
                      const activeProjectsForConsultantInMonth = consultant.assignments
                        .map(assignment => projects.find(p => p.id === assignment.projectId))
                        .filter(project => project && isProjectActiveForConsultantInMonth(project, monthString)) as Project[];
                      
                      return (
                        <TableCell 
                          key={`${consultant.id}-${monthString}`} 
                          className="text-center p-1 relative h-12 min-w-[100px]" // Ensure cell has some height and padding
                        >
                          {activeProjectsForConsultantInMonth.length > 0 && (
                            <div className="relative w-full h-full flex flex-col justify-around">
                              {activeProjectsForConsultantInMonth.map((project) => {
                                const { barStyle } = getAssignmentCellStyle(project, monthString, timelineMonths, activeProjectsForConsultantInMonth);
                                const projectColor = getProjectColor(project.id);
                                const assignmentDetails = consultant.assignments.find(a => a.projectId === project.id);
                                const percentage = assignmentDetails ? assignmentDetails.percentage : 100;
                                
                                return (
                                  <div
                                    key={project.id}
                                    title={`${project.name} (${percentage}%)`}
                                    className={cn(
                                      "w-full h-[calc(100%-2px)] my-px text-white text-xs flex items-center justify-center overflow-hidden cursor-pointer",
                                      projectColor,
                                      barStyle,
                                      "opacity-75 hover:opacity-100"
                                    )}
                                    style={{ height: `${100 / activeProjectsForConsultantInMonth.length}%`}} // Distribute height
                                    onClick={() => onProjectClick(project)}
                                  >
                                    <span className="truncate px-1">{project.name} ({percentage}%)</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 