import { Project, Consultant, ProjectStatus } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { mockProjects } from '@/lib/mockData'
import { isConsultantAvailable } from '@/utils/consultantAvailability'
import { ProjectDetailsModal } from '@/components/ProjectDetailsModal'

interface ProjectKanbanProps {
  projects: Project[]
  consultants: Consultant[]
  onAssign: (consultantId: string, projectId: string) => void
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void
}

const columns: ProjectStatus[] = ['Discussions', 'Sold', 'Started', 'Completed']

// Add type for populated project data
interface PopulatedProject extends Omit<Project, 'assignedConsultants'> {
  assignedConsultants: Consultant[]
}

export default function ProjectKanban({ projects, consultants, onAssign, onUpdateStatus }: ProjectKanbanProps) {
  const [populatedProjects, setPopulatedProjects] = useState<PopulatedProject[]>([])
  const [selectedProject, setSelectedProject] = useState<PopulatedProject | null>(null)

  // Populate projects with consultant data
  useEffect(() => {
    const populated = projects.map(project => ({
      ...project,
      assignedConsultants: project.assignedConsultants
        .map(id => consultants.find(c => c.id === id || c._id === id))
        .filter((c): c is Consultant => c !== undefined)
    }))
    setPopulatedProjects(populated)
  }, [projects, consultants])

  // Update selected project when populatedProjects changes
  useEffect(() => {
    if (selectedProject) {
      const updatedProject = populatedProjects.find(p => p.id === selectedProject.id)
      if (updatedProject) {
        setSelectedProject(updatedProject)
      }
    }
  }, [populatedProjects])

  const handleDragEnd = (result: any) => {
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
                    {populatedProjects
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
                                </CardHeader>
                                <CardContent>
                                  <div className="flex flex-wrap gap-1">
                                    {project.requiredSkills.slice(0, 3).map(skill => (
                                      <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))}
                                    {project.requiredSkills.length > 3 && (
                                      <Badge variant="secondary">+{project.requiredSkills.length - 3}</Badge>
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

