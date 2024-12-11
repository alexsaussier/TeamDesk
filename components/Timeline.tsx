import { Project } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { ProjectDetailsModal } from '@/components/ProjectDetailsModal'
import { useState } from 'react'
import { cn } from "@/lib/utils"

interface TimelineProps {
  projects: Project[]
  consultants: any[]
  columns: any[]
}

// Add type for populated project
interface PopulatedProject extends Omit<Project, 'assignedConsultants'> {
  assignedConsultants: {
    _id: string
    id: string
    name: string
    picture: string
  }[]
}

const getMonthsBetweenDates = (startDate: Date, endDate: Date): string[] => {
  const months: string[] = []
  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    months.push(currentDate.toLocaleString('default', { month: 'short', year: 'numeric' }))
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return months
}

{/* Get the first month and last month of all the projects aggregated - so we can diplay the right timeline */}
const getProjectMonths = (projects: Project[]): string[] => {
  // Use today's date as the minimum date
  const today = new Date()
  today.setDate(1) // Set to first day of current month
  
  const endDates = projects.map(project => new Date(project.endDate))
  const minDate = today
  const maxDate = new Date(Math.max(...endDates.map(date => date.getTime())))
  
  // If maxDate is before today, return 12 months from today
  if (maxDate < today) {
    const futureDate = new Date(today)
    futureDate.setMonth(today.getMonth() + 11) // Add 11 months to include today's month
    return getMonthsBetweenDates(today, futureDate)
  }
  
  return getMonthsBetweenDates(minDate, maxDate)
}

const isProjectActiveInMonth = (project: Project, month: string): boolean => {
  const [monthStr, yearStr] = month.split(' ')
  const monthDate = new Date(`${monthStr} 1, ${yearStr}`)
  const projectStart = new Date(project.startDate)
  const projectEnd = new Date(project.endDate)
  
  // Compare just the year and month
  const monthStartYear = monthDate.getFullYear()
  const monthStartMonth = monthDate.getMonth()
  const projectStartYear = projectStart.getFullYear()
  const projectStartMonth = projectStart.getMonth()
  const projectEndYear = projectEnd.getFullYear()
  const projectEndMonth = projectEnd.getMonth()

  // Check if the month falls between project start and end months
  return (
    (monthStartYear > projectStartYear || 
     (monthStartYear === projectStartYear && monthStartMonth >= projectStartMonth)) &&
    (monthStartYear < projectEndYear || 
     (monthStartYear === projectEndYear && monthStartMonth <= projectEndMonth))
  )
}

{/* For displaying a continuous line across months */}
const getProjectCellStyle = (project: Project, month: string, months: string[]): string => {
  if (!isProjectActiveInMonth(project, month)) return ''
  
  const isFirst = month === months.find(m => isProjectActiveInMonth(project, m))
  const isLast = month === [...months].reverse().find(m => isProjectActiveInMonth(project, m))
  
  if (isFirst && isLast) return 'rounded-md'
  if (isFirst) return 'rounded-l-md'
  if (isLast) return 'rounded-r-md'
  return ''
}

export default function Timeline({ projects, consultants, columns }: TimelineProps) {
  //Sort projects by start date
  const populatedProjects = [...projects].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  ) 
  const months = getProjectMonths(populatedProjects)
  const [selectedProject, setSelectedProject] = useState<PopulatedProject | null>(null)

  const handleAssign = async (consultantId: string, projectId: string) => {
    // Implement your assignment logic here
    const response = await fetch(`/api/projects/${projectId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ consultantId }),
    });
    if (!response.ok) {
      throw new Error('Failed to assign consultant');
    }
  }

  const handleStatusUpdate = async (projectId: string, newStatus: ProjectStatus) => {
    // Implement your status update logic here
    const response = await fetch(`/api/projects/${projectId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) {
      throw new Error('Failed to update status');
    }
  }

  return (
    <>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Project</TableHead>
                {months.map((month) => (
                  <TableHead key={month} className="text-center">{month}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {populatedProjects.map((project) => (
                <TableRow 
                  key={project.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedProject(project)}
                >
                  <TableCell className="font-medium">
                    {project.name}
                    <br />
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{project.status}</Badge>
                      <div className="flex -space-x-2">
                        {project.assignedConsultants?.map((consultant) => (
                          <Avatar 
                            key={consultant._id} 
                            className="border-2 border-background w-6 h-6"
                          >
                            <AvatarImage 
                              src={consultant.picture} 
                              alt={consultant.name}
                            />
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  {months.map((month) => (
                    <TableCell 
                      key={`${project.id}-${month}`} 
                      className="text-center p-0"
                    >
                      {isProjectActiveInMonth(project, month) && (
                        <div className={cn(
                          "w-full h-4 bg-blue-500",
                          getProjectCellStyle(project, month, months)
                        )}></div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProjectDetailsModal
        project={selectedProject}
        consultants={consultants}
        isOpen={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        onAssign={handleAssign}
        onUpdateStatus={handleStatusUpdate}
        columns={columns}
      />
    </>
  )
}

