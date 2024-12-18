import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getNextSoldProject } from '@/types/index'

interface StatsGridProps {
  consultants: Consultant[]
  projects: Project[]
}

export default function StatsGrid({ consultants, projects }: StatsGridProps) {
  const totalConsultants = consultants.length
  const today = new Date()
  const staffedConsultants = consultants.filter(c => 
    c.assignments?.some(assignmentId => {
      const project = projects.find(p => p._id === assignmentId)
      if (!project) return false
      const startDate = new Date(project.startDate)
      const endDate = project.endDate ? new Date(project.endDate) : null
      return startDate <= today && (!endDate || endDate >= today)
    })
  ).length
  const staffedPercentage = (staffedConsultants / totalConsultants) * 100

  const liveProjects = projects.filter(p => p.status === 'Started').length

  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  const projectsNextMonth = projects.filter(p => {
    const startDate = new Date(p.startDate)
    return startDate <= nextMonth && (p.status === 'Started' || p.status === 'Sold')
  }).length

  const nextProject = getNextSoldProject(projects)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalConsultants}</div>
          <p className="text-xs text-muted-foreground">
            {staffedPercentage.toFixed(1)}% currently staffed
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Live Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{liveProjects}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expected Live Projects Next Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectsNextMonth}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Project Starting</CardTitle>
        </CardHeader>
        <CardContent>
          {nextProject ? (
            <>
              <div className="text-2xl font-bold">{nextProject.name}</div>
              <p className="text-xs text-muted-foreground">
                Starts on {new Date(nextProject.startDate).toLocaleDateString()}
              </p>
            </>
          ) : (
            <div className="text-2xl font-bold">No upcoming projects</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

