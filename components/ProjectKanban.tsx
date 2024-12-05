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

      {/* Project Details Modal */}

      <Dialog open={selectedProject !== null} onOpenChange={() => setSelectedProject(null)}>
        {selectedProject && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{selectedProject.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedProject.startDate).toLocaleDateString()} - {new Date(selectedProject.endDate).toLocaleDateString()}
              </p>
            </DialogHeader>

            <div className="grid gap-6">
              {/* Skills Section */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.requiredSkills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              {/* Team Section */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Project Team</h4>
                <div className="grid gap-2">
                  {selectedProject.assignedConsultants.length > 0 ? (
                    selectedProject.assignedConsultants.map(consultant => (
                      <div 
                        key={consultant.id}
                        className="flex items-center gap-2 text-sm bg-secondary/20 rounded-md p-2"
                      >
                        <span className="h-2 w-2 rounded-full bg-secondary"></span>
                        {consultant.name}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No team members assigned yet</p>
                  )}
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Assign Team Members</h4>
                  <Select
                    value={undefined}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Manage team" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {consultants.map(consultant => {
                        const isAssigned = selectedProject?.assignedConsultants.some(ac => ac.id === consultant.id);
                        const isAvailable = isConsultantAvailable(consultant, selectedProject!, projects);
                        
                        return (
                          <div
                            key={consultant.id}
                            className="flex items-center space-x-2 p-2 hover:bg-secondary/20 rounded-sm"
                            onClick={(e) => e.preventDefault()}
                          >
                            <input
                              type="checkbox"
                              id={consultant.id}
                              checked={isAssigned}
                              disabled={!isAvailable && !isAssigned}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              onChange={async (e) => {
                                try {
                                  const consultantId = consultant._id || consultant.id;
                                  
                                  if (e.target.checked && !isAssigned) {
                                    console.log('Attempting to assign:', {
                                      consultantId,
                                      projectId: selectedProject!.id
                                    });
                                    
                                    // Assign consultant only if not already assigned
                                    await onAssign(consultantId, selectedProject!.id);
                                  } else if (!e.target.checked && isAssigned) {
                                    // Unassign consultant
                                    const response = await fetch(`/api/projects/${selectedProject!.id}/unassign`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({ consultantId: consultant.id }),
                                    });

                                    if (!response.ok) {
                                      throw new Error('Failed to unassign consultant');
                                    }
                                  }
                                  
                                  // Update local state
                                  setSelectedProject(prev => {
                                    if (!prev) return null;
                                    return {
                                      ...prev,
                                      assignedConsultants: e.target.checked 
                                        ? isAssigned 
                                          ? prev.assignedConsultants // If already assigned, don't add again
                                          : [...prev.assignedConsultants, consultant]
                                        : prev.assignedConsultants.filter(c => c.id !== consultant.id)
                                    } as PopulatedProject;
                                  });
                                } catch (error) {
                                  console.error('Error updating team assignment:', error);
                                }
                              }}
                            />
                            <label
                              htmlFor={consultant.id}
                              className={`flex-1 text-sm ${!isAvailable && !isAssigned ? 'text-muted-foreground' : ''}`}
                              onClick={(e) => e.preventDefault()}
                            >
                              {consultant.name}
                              {!isAvailable && !isAssigned && (
                                <span className="ml-2 text-xs text-muted-foreground">(Unavailable)</span>
                              )}
                            </label>
                          </div>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Update Status</h4>
                  <Select 
                    value={selectedProject.status} 
                    onValueChange={(value) => onUpdateStatus(selectedProject.id, value as ProjectStatus)}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
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
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

