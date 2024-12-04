import { Project, Consultant, ProjectStatus } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { mockProjects } from '@/lib/mockData'

interface ProjectKanbanProps {
  projects: Project[]
  consultants: Consultant[]
  onAssign: (consultantId: string, projectId: string) => void
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void
}

const columns: ProjectStatus[] = ['Discussions', 'Sold', 'Started', 'Completed']

export default function ProjectKanban({ projects, consultants, onAssign, onUpdateStatus }: ProjectKanbanProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    const { draggableId, destination } = result
    const newStatus = destination.droppableId as ProjectStatus

    // Update the status in the mockProjects array
    const projectIndex = mockProjects.findIndex(project => project.id === draggableId)
    if (projectIndex !== -1) {
      mockProjects[projectIndex].status = newStatus
    }

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
                    className="space-y-4"
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
                                className="cursor-pointer hover:shadow-md transition-shadow"
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

      {/* Project Details Modal */}

      <Dialog open={selectedProject !== null} onOpenChange={() => setSelectedProject(null)}>
        {selectedProject && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedProject.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Required Skills:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedProject.requiredSkills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedProject.startDate).toLocaleDateString()} - {new Date(selectedProject.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Assigned Consultants:</h4>
                <ul className="list-disc list-inside">
                  {selectedProject.assignedConsultants.map(consultant => (
                    <li key={consultant.id} className="text-sm">
                      {consultant.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2">
                <Select onValueChange={(value) => onAssign(value, selectedProject.id)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Assign consultant" />
                  </SelectTrigger>
                  <SelectContent>
                    {consultants
                      .filter(c => !selectedProject.assignedConsultants.some(ac => ac.id === c.id))
                      .map(consultant => (
                        <SelectItem key={consultant.id} value={consultant.id}>
                          {consultant.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select 
                  defaultValue={selectedProject.status} 
                  onValueChange={(value) => onUpdateStatus(selectedProject.id, value as ProjectStatus)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

