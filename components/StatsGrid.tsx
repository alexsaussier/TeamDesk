import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getNextSoldProject } from '@/types/index'
import { Users, Briefcase, ArrowRight } from "lucide-react"
import { useRouter } from 'next/navigation'

interface StatsGridProps {
  consultants: Consultant[]
  projects: Project[]
}

export default function StatsGrid({ consultants, projects }: StatsGridProps) {
  const totalConsultants = consultants.length
  const today = new Date()
  const staffedConsultants = consultants.filter(c => 
    c.assignments?.some(assignmentId => {
      const project = projects.find(p => p.id === assignmentId)
      if (!project) return false
      const startDate = new Date(project.startDate)
      const endDate = project.endDate ? new Date(project.endDate) : null
      return startDate <= today && (!endDate || endDate >= today)
    })
  ).length

  const liveProjects = projects.filter(p => p.status === 'Started').length


  const nextProject = getNextSoldProject(projects)

  const router = useRouter()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <Card 
        className="flex flex-col transition-all duration-200 bg-blue-50 hover:shadow-md hover:border-gray-300 cursor-pointer"
        onClick={() => router.push('/dashboard/workforce')}
      >
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Users className="h-4 w-4 text-muted-foreground mr-2" />
          <CardTitle className="text-sm font-medium">Team Size</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-end pt-2">
          <div className="text-3xl font-bold tracking-tight">{totalConsultants}</div>
          <p className="text-xs text-muted-foreground mt-1">&nbsp;</p>
        </CardContent>
      </Card>

      <Card 
        className="flex flex-col transition-all duration-200 bg-blue-50 hover:shadow-md hover:border-gray-300 cursor-pointer"
        onClick={() => router.push('/dashboard/projects')}
      >
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Briefcase className="h-4 w-4 text-muted-foreground mr-2" />
          <CardTitle className="text-sm font-medium">Live Projects</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-end pt-4">
          <div className="text-3xl font-bold tracking-tight">{liveProjects}</div>
          <p className="text-xs text-muted-foreground mt-1">&nbsp;</p>
        </CardContent>
      </Card>
      
      <Card 
        className="flex flex-col transition-all duration-200 bg-blue-50 hover:shadow-md hover:border-gray-300 cursor-pointer"
        onClick={() => router.push('/dashboard/timeline')}
      >
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <ArrowRight className="h-4 w-4 text-muted-foreground mr-2" />
          <CardTitle className="text-sm font-medium">Next Project Starting</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-end pt-4">
          <div className="text-xl font-bold tracking-tight">
            {nextProject ? nextProject.name : "No upcoming projects"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {nextProject ? `Starts on ${new Date(nextProject.startDate).toLocaleDateString()}` : "\u00A0"}
          </p>
        </CardContent>
      </Card>

      
    </div>
  )
}

