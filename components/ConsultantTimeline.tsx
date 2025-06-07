import { Consultant, Project } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Helper to get months (same as Timeline.tsx)
const getMonthsBetweenDates = (startDate: Date, endDate: Date): string[] => {
  const months: string[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    months.push(currentDate.toLocaleString('en-US', { month: 'short', year: 'numeric' }))
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return months
}

const getTimelineMonths = (): string[] => {
  const today = new Date()
  today.setDate(1) // Set to first day of current month
  
  const futureDate = new Date(today)
  futureDate.setMonth(today.getMonth() + 11) // Add 11 months to show a total of 12 months
  
  return getMonthsBetweenDates(today, futureDate)
}

// Helper to check if a project assignment is active in a given month
const isProjectActiveForConsultantInMonth = (
  project: Project,
  monthString: string
): boolean => {
  const [monthStr, yearStr] = monthString.split(' ')
  const monthDate = new Date(`${monthStr} 1, ${yearStr}`)
  const projectStart = new Date(project.startDate)
  const projectEnd = new Date(project.endDate)
  
  const monthStartYear = monthDate.getFullYear()
  const monthStartMonth = monthDate.getMonth()
  const projectStartYear = projectStart.getFullYear()
  const projectStartMonth = projectStart.getMonth()
  const projectEndYear = projectEnd.getFullYear()
  const projectEndMonth = projectEnd.getMonth()

  return (
    (monthStartYear > projectStartYear || 
     (monthStartYear === projectStartYear && monthStartMonth >= projectStartMonth)) &&
    (monthStartYear < projectEndYear || 
     (monthStartYear === projectEndYear && monthStartMonth <= projectEndMonth))
  )
}

// Helper for cell styling (same logic as Timeline.tsx)
const getAssignmentCellStyle = (
  project: Project,
  month: string,
  months: string[]
): string => {
  if (!isProjectActiveForConsultantInMonth(project, month)) return ''
  
  const isFirst = month === months.find(m => isProjectActiveForConsultantInMonth(project, m))
  const isLast = month === [...months].reverse().find(m => isProjectActiveForConsultantInMonth(project, m))
  
  if (isFirst && isLast) return 'rounded-md'
  if (isFirst) return 'rounded-l-md'
  if (isLast) return 'rounded-r-md'
  return ''
}

interface ConsultantTimelineProps {
  consultants: Consultant[]
  projects: Project[]
  onProjectClick: (project: Project) => void
}

export default function ConsultantTimeline({ consultants, projects, onProjectClick }: ConsultantTimelineProps) {
  const months = getTimelineMonths()

  // Sort consultants by name for consistent order
  const sortedConsultants = [...consultants].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Consultant</TableHead>
              {months.map((month) => (
                <TableHead key={month} className="text-center">{month}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedConsultants.map((consultant) => {
              return (
                <TableRow 
                  key={consultant.id}
                  className="hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={consultant.picture} alt={consultant.name} />
                      </Avatar>
                      <div>
                        {consultant.name}
                        <br />
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">{consultant.level}</Badge>
                          
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  {months.map((monthString) => {
                    const activeProjectsForConsultantInMonth = consultant.assignments
                      .map(assignment => {
                        const project = projects.find(p => p.id === assignment.projectId)
                        return project && isProjectActiveForConsultantInMonth(project, monthString) 
                          ? { project, percentage: assignment.percentage }
                          : null
                      })
                      .filter(Boolean) as { project: Project; percentage: number }[]
                    
                    return (
                      <TableCell 
                        key={`${consultant.id}-${monthString}`} 
                        className="text-center p-0"
                      >
                        {activeProjectsForConsultantInMonth.length > 0 && (
                          <div className="relative w-full h-4 flex flex-col">
                            {activeProjectsForConsultantInMonth.map(({ project, percentage }, index) => {
                              const cellStyle = getAssignmentCellStyle(project, monthString, months)
                              const isMultiple = activeProjectsForConsultantInMonth.length > 1
                              const barHeight = isMultiple ? 'h-2' : 'h-4'
                              
                              // Check if this is the first month for this project assignment
                              const isFirstMonth = monthString === months.find(m => 
                                isProjectActiveForConsultantInMonth(project, m)
                              )
                              
                              return (
                                <div
                                  key={project.id}
                                  title={`${project.name} (${percentage}%)`}
                                  className={cn(
                                    "bg-blue-500 cursor-pointer hover:bg-blue-600 transition-colors flex items-center overflow-hidden",
                                    barHeight,
                                    cellStyle,
                                    isMultiple && index > 0 && "mt-px",
                                    isFirstMonth ? "justify-start px-1" : "justify-center"
                                  )}
                                  onClick={() => onProjectClick(project)}
                                >
                                  {isFirstMonth && (
                                    <span className="truncate whitespace-nowrap text-white text-xs font-medium">
                                      {project.name} ({percentage}%)
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 