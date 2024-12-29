import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Consultant, Project } from '@/types'

interface ConsultantProjectTimelineProps {
  consultant: Consultant | null
  projects: Project[]
}

export default function ConsultantProjectTimeline({ consultant, projects }: ConsultantProjectTimelineProps) {
  const getConsultantProjects = () => {
    if (!consultant || !projects.length) return []
    
    return consultant.assignments
      .map(assignment => projects.find(p => p.id === assignment.projectId))
      .filter((project): project is Project => project !== undefined)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500'
      case 'Started': return 'bg-blue-500'
      case 'Sold': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const consultantProjects = getConsultantProjects()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {consultantProjects.map((project, index) => (
            <div key={project.id} className="relative pl-8">
              {/* Timeline connector */}
              {index !== consultantProjects.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
              )}
              
              {/* Timeline dot */}
              <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full ${getStatusColor(project.status)} border-2 border-white shadow`} />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <Badge variant="secondary">{project.status}</Badge>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map(skill => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Client: {project.client}
                </p>
              </div>
            </div>
          ))}

          {consultantProjects.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No project history available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 