import { Project, Consultant, ProjectStatus } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { ProjectDetailsModal } from '@/components/ProjectDetailsModal'
import { Avatar, AvatarImage } from "@/components/ui/avatar"

interface ProjectKanbanProps {
  projects: Project[]
  consultants: Consultant[]
  onAssign: (consultantId: string, projectId: string) => void
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void
}

const columns: ProjectStatus[] = ['Discussions', 'Sold', 'Started', 'Completed']

export default function ProjectKanban({ projects, consultants, onAssign, onUpdateStatus }: ProjectKanbanProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    
    const { draggableId, destination } = result
    const newStatus = destination.droppableId as ProjectStatus
    onUpdateStatus(draggableId, newStatus)
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(column => (
            <div key={column} className="flex-1 min-w-[250px]">
              <h3 className="font-semibold mb-2">{column}</h3>
              <Droppable droppableId={column}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4 min-h-[200px] bg-secondary/10 rounded-lg"
                  >
                    {projects
                      .filter(project => project.status === column)
                      .map((project, index) => (
                        <Draggable
                          key={project.id}
                          draggableId={project.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card 
                                className="cursor-pointer hover:shadow-md transition-shadow bg-background"
                                onClick={() => setSelectedProject(project)}
                              >
                                <CardHeader>
                                  <CardTitle className="text-lg">{project.name}</CardTitle>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div className="flex flex-wrap gap-1">
                                      {project.requiredSkills.slice(0, 3).map(skill => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                      ))}
                                      {project.requiredSkills.length > 3 && (
                                        <Badge variant="secondary">+{project.requiredSkills.length - 3}</Badge>
                                      )}
                                    </div>
                                    
                                    {project.assignedConsultants && project.assignedConsultants.length > 0 && (
                                      <div className="flex -space-x-2">
                                        {project.assignedConsultants.map((consultant) => (
                                          <Avatar key={consultant.id} className="border-2 border-background w-8 h-8">
                                            <AvatarImage src={consultant.picture} alt={consultant.name} />
                                          </Avatar>
                                        ))}
                                        {project.assignedConsultants.length > 4 && (
                                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm border-2 border-background">
                                            +{project.assignedConsultants.length - 4}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <ProjectDetailsModal
        project={selectedProject}
        consultants={consultants}
        isOpen={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        onAssign={onAssign}
        onUpdateStatus={onUpdateStatus}
        columns={columns}
      />
    </>
  )
}

