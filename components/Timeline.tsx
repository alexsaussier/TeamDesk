import { Project } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarImage } from "@/components/ui/avatar"

interface TimelineProps {
  projects: Project[]
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

const getProjectMonths = (projects: Project[]): string[] => {
  const startDates = projects.map(project => new Date(project.startDate))
  const endDates = projects.map(project => new Date(project.endDate))
  const minDate = new Date(Math.min(...startDates.map(date => date.getTime())))
  const maxDate = new Date(Math.max(...endDates.map(date => date.getTime())))
  return getMonthsBetweenDates(minDate, maxDate)
}

const isProjectActiveInMonth = (project: Project, month: string): boolean => {
  const [monthStr, yearStr] = month.split(' ')
  const monthDate = new Date(`${monthStr} 1, ${yearStr}`)
  const projectStart = new Date(project.startDate)
  const projectEnd = new Date(project.endDate)
  return monthDate >= projectStart && monthDate <= projectEnd
}

export default function Timeline({ projects }: TimelineProps) {
  const months = getProjectMonths(projects)

  return (
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
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">
                  {project.name}
                  <br />
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{project.status}</Badge>
                    <div className="flex -space-x-2">
                      {project.assignedConsultants?.map((consultant, index) => (
                        <Avatar 
                          key={consultant.id} 
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
                  <TableCell key={`${project.id}-${month}`} className="text-center">
                    {isProjectActiveInMonth(project, month) && (
                      <div className="w-full h-4 bg-blue-500 rounded-full"></div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

