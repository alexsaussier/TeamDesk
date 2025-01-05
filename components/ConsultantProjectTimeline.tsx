import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Consultant, Project } from '@/types'
import { cn } from '@/lib/utils'

interface ConsultantProjectTimelineProps {
  consultant: Consultant | null
  projects: Project[]
}

const getMonthsBetweenDates = (startDate: Date, endDate: Date): string[] => {
  const months: string[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    months.push(currentDate.toLocaleString('default', { month: 'short', year: 'numeric' }))
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return months
}

const getProjectMonths = (): string[] => {
  const today = new Date()
  today.setDate(1) // Set to first day of current month
  
  const futureDate = new Date(today)
  futureDate.setMonth(today.getMonth() + 11) // Add 11 months to show a total of 12 months
  
  return getMonthsBetweenDates(today, futureDate)
}

const isProjectActiveInMonth = (project: Project, month: string): boolean => {
  const [monthStr, yearStr] = month.split(' ')
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

const getProjectCellStyle = (project: Project, month: string, months: string[]): string => {
  if (!isProjectActiveInMonth(project, month)) return ''
  
  const isFirst = month === months.find(m => isProjectActiveInMonth(project, m))
  const isLast = month === [...months].reverse().find(m => isProjectActiveInMonth(project, m))
  
  if (isFirst && isLast) return 'rounded-md'
  if (isFirst) return 'rounded-l-md'
  if (isLast) return 'rounded-r-md w-[95%]'
  return ''
}

export default function ConsultantProjectTimeline({ consultant, projects }: ConsultantProjectTimelineProps) {
  const getConsultantProjects = () => {
    if (!consultant || !projects.length) return []
    
    return consultant.assignments
      .map(assignment => projects.find(p => p.id === assignment.projectId))
      .filter((project): project is Project => project !== undefined)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }

  const consultantProjects = getConsultantProjects()
  const months = getProjectMonths()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] min-w-[200px]">Assignment</TableHead>
              {months.map((month) => (
                <TableHead 
                  key={month} 
                  className="text-center w-[80px] min-w-[80px]"
                >
                  {month}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium w-[200px] min-w-[200px]">
                Projects
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{consultantProjects.length} assignments</Badge>
                </div>
              </TableCell>
              {months.map((month) => (
                <TableCell 
                  key={month}
                  className="text-center p-0 w-[80px] min-w-[80px]"
                >
                  {consultantProjects.map(project => (
                    isProjectActiveInMonth(project, month) && (
                      <div 
                        key={project.id}
                        className={cn(
                          "w-full h-8 bg-sky-100 mb-1 last:mb-0 flex items-center",
                          getProjectCellStyle(project, month, months)
                        )}
                        style={{
                          position: 'relative',
                          overflow: 'visible'
                        }}
                      >
                        {month === months.find(m => isProjectActiveInMonth(project, m)) && (
                          <div 
                            className="absolute left-2 text-xs text-black whitespace-nowrap z-10"
                            style={{
                              maxWidth: `${80 * months.filter(m => 
                                isProjectActiveInMonth(project, m)
                              ).length - 16}px`
                            }}
                          >
                            {project.name}
                            {project.client && (
                              <span className="opacity-75"> • {project.client}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>

        {consultantProjects.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No project assignments found
          </div>
        )}
      </CardContent>
    </Card>
  )
} 