import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Consultant, Project } from '@/types'

interface ConsultantSkillsCardProps {
  consultant: Consultant | null
  projects: Project[]
}

export default function ConsultantSkillsCard({ consultant, projects }: ConsultantSkillsCardProps) {
  const getSkillUtilization = (skill: string) => {
    if (!consultant || !projects.length) return 0
    
    const skillProjects = projects.filter(project => 
      project.assignedConsultants.some(ac => ac.id.toString() === consultant._id.toString()) &&
      project.requiredSkills.includes(skill)
    )

    return skillProjects.length
  }

  const getSkillLastUsed = (skill: string) => {
    if (!consultant || !projects.length) return null
    
    const skillProjects = projects.filter(project => 
      project.assignedConsultants.some(ac => ac.id.toString() === consultant._id.toString()) &&
      project.requiredSkills.includes(skill)
    )

    if (!skillProjects.length) return null

    return new Date(Math.max(...skillProjects.map(p => new Date(p.endDate).getTime())))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Experience</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Primary Skills */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Skills Overview</h3>
            <div className="grid gap-4">
              {consultant?.skills.map(skill => {
                const projectCount = getSkillUtilization(skill)
                const lastUsed = getSkillLastUsed(skill)
                
                return (
                  <div key={skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{skill}</div>
                      <div className="text-sm text-muted-foreground">
                        Used in {projectCount} project{projectCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {lastUsed && (
                      <Badge variant="secondary" className="ml-2">
                        Last used: {lastUsed.toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Project Experience Summary */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Project Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects
                .filter(project => project.assignedConsultants.some(ac => ac.id.toString() === consultant?._id.toString()))
                .map(project => (
                  <Card key={project.id}>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">{project.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        {project.client}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.requiredSkills.map(skill => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 