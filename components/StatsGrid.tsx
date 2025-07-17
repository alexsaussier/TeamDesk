import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getNextStartingProject } from '@/types/index'
import { Users, Briefcase, ArrowRight, Coffee } from "lucide-react"
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { getCurrentAssignment } from '@/lib/consultantUtils'

interface StatsGridProps {
  consultants: Consultant[]
  projects: Project[]
}

export default function StatsGrid({ consultants, projects }: StatsGridProps) {
  const totalConsultants = consultants.length
  

  const liveProjects = projects.filter(p => p.status === 'Started').length


  const nextProject = getNextStartingProject(projects)

  const router = useRouter()

  // Calculate consultants currently on bench
  const benchConsultants = consultants.filter(consultant => {
    const currentAssignment = getCurrentAssignment(consultant, projects)
    return !currentAssignment
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <Card 
        className="flex flex-col transition-all duration-200 bg-gradient-to-l from-blue-500 to-blue-800 text-white hover:shadow-lg hover:-translate-y-1 hover:translate-x-1 cursor-pointer"
        onClick={() => router.push('/dashboard/workforce')}
      >
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Users className="h-4 w-4 text-muted-foreground mr-2" />
          <CardTitle className="text-sm font-medium">Team Size</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-end pt-2">
          <div className="text-3xl font-bold tracking-tight">{totalConsultants}</div>
          <p className="text-xs text-right text-muted-foreground mt-1">View team</p>
        </CardContent>
      </Card>

      <Card 
        className="flex flex-col transition-all duration-200 bg-gradient-to-l from-blue-500 to-blue-800 text-white hover:shadow-lg hover:-translate-y-1 hover:translate-x-1 cursor-pointer"
        onClick={() => router.push('/dashboard/bench')}
      >
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Coffee className="h-4 w-4 text-muted-foreground mr-2" />
          <CardTitle className="text-sm font-medium">On Bench</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-end pt-2">
          <div className="text-3xl font-bold tracking-tight flex items-baseline gap-2">
            {benchConsultants.length}
            {totalConsultants > 0 && (
              <span className="text-lg font-normal text-muted-foreground">
              | {Math.round((benchConsultants.length / totalConsultants) * 100)}% of team
              </span>
            )}
          </div>
          <p className="text-xs text-right text-muted-foreground mt-1">View bench</p>
</CardContent>
      </Card>
      
      <Card 
        className="flex flex-col transition-all duration-200 bg-gradient-to-l from-blue-500 to-blue-800 text-white hover:shadow-lg hover:-translate-y-1 hover:translate-x-1 cursor-pointer"
        onClick={() => router.push('/dashboard/projects')}
      >
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Briefcase className="h-4 w-4 text-muted-foreground mr-2" />
          <CardTitle className="text-sm font-medium">Live Projects</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-end pt-4">
          <div className="text-3xl font-bold tracking-tight">{liveProjects}</div>
          <p className="text-xs text-right text-muted-foreground mt-1">View projects</p>
        </CardContent>
      </Card>
      
      <Card 
        className="flex flex-col transition-all duration-200 bg-gradient-to-l from-blue-500 to-blue-800 text-white hover:shadow-lg hover:-translate-y-1 hover:translate-x-1 cursor-pointer"
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
          {nextProject && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Starts on {new Date(nextProject.startDate).toLocaleDateString()}
              </p>
              <Badge variant="secondary" className="ml-2">
                Status: {nextProject.status}
              </Badge>
            </div>
          )}
          {!nextProject && (
            <p className="text-xs text-muted-foreground mt-1">&nbsp;</p>
          )}
        </CardContent>
      </Card>

      
    </div>
  )
}

