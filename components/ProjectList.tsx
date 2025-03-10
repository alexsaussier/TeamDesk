import { Project, Consultant } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProjectListProps {
  projects: Project[]
  consultants: Consultant[]
  onAssign: (consultantId: string, projectId: string) => void
}

export default function ProjectList({ projects, consultants, onAssign }: ProjectListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {projects.map(project => (
            <li key={project.id} className="border-b pb-2">
              <h3 className="font-semibold">{project.name}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {project.requiredSkills.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Duration: {new Date(project.startDate).toLocaleDateString()} to {new Date(project.endDate).toLocaleDateString()}
              </p>
              <div className="mt-2">
                <h4 className="text-sm font-semibold">Assigned Consultants:</h4>
                <ul className="list-disc list-inside">
                  {project.assignedConsultants.map(consultant => (
                    <li key={consultant.id} className="text-sm">
                      {consultant.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Select onValueChange={(value) => onAssign(value, project.id)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Assign consultant" />
                  </SelectTrigger>
                  <SelectContent>
                    {consultants
                      .filter(c => !project.assignedConsultants.some(ac => ac.id === c._id || ac.id === c.id))
                      .map(consultant => (
                        <SelectItem key={consultant._id || consultant.id} value={consultant._id || consultant.id}>
                          {consultant.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

