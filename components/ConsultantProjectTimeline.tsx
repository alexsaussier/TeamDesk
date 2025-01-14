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

// Add this new function to group projects by rows based on overlapping dates
const groupProjectsByRows = (projects: Project[]): Project[][] => {
  if (!projects.length) return [];
  
  const rows: Project[][] = [];
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  sortedProjects.forEach(project => {
    // Find the first row where the project can fit
    const rowIndex = rows.findIndex(row => {
      const lastProject = row[row.length - 1];
      return new Date(lastProject.endDate) < new Date(project.startDate);
    });

    if (rowIndex === -1) {
      // Create new row if project overlaps with all existing rows
      rows.push([project]);
    } else {
      // Add to existing row if no overlap
      rows[rowIndex].push(project);
    }
  });

  return rows;
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
  const projectRows = groupProjectsByRows(consultantProjects)
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
            {projectRows.map((rowProjects, rowIndex) => (
              <TableRow 
                key={rowIndex} 
                className="border-b-0 hover:bg-transparent"
              >
                <TableCell 
                  className={cn(
                    "font-medium w-[200px] min-w-[200px]",
                    rowIndex === 0 ? "align-middle border-b-0" : "border-t-0"
                  )}
                >
                  {rowIndex === 0 && (
                    <>
                      Projects
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{consultantProjects.length} assignments</Badge>
                      </div>
                    </>
                  )}
                </TableCell>
                {months.map((month) => (
                  <TableCell 
                    key={month}
                    className={cn(
                      "text-center p-0 w-[80px] min-w-[80px]",
                      rowIndex === 0 ? "border-b-0" : "border-t-0"
                    )}
                  >
                    {rowProjects.map(project => (
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
            ))}
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