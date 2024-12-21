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
  onAssign: (consultantId: string, projectId: string) => Promise<void>
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => Promise<void>
  onDelete: (projectId: string) => Promise<void>
}

const columns: ProjectStatus[] = ['Discussions', 'Sold', 'Started', 'Completed']

const columnColors = {
  'Discussions': 'bg-blue-50 border-blue-100',
  'Sold': 'bg-emerald-50 border-emerald-100',
  'Started': 'bg-green-50 border-green-100',
  'Completed': 'bg-slate-50 border-slate-100'
}

const columnHeaderColors = {
  'Discussions': 'text-blue-600',
  'Sold': 'text-emerald-600',
  'Started': 'text-green-600',
  'Completed': 'text-slate-600'
}

export default function ProjectKanban({ projects, consultants, onAssign, onUpdateStatus, onDelete }: ProjectKanbanProps) {
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
        <div className="flex gap-4 overflow-x-auto h-[calc(100vh-12rem)]">
          {columns.map(column => (
            <div key={column} className="flex-1 min-w-[300px] flex flex-col h-full">
              <h3 className={`font-semibold mb-3 ${columnHeaderColors[column]} text-lg`}>{column}</h3>
              <Droppable droppableId={column}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-4 p-4 rounded-lg border-2 flex-1 ${columnColors[column]} transition-colors duration-200 overflow-y-auto`}
                  >
                    {projects
                      .filter(project => project.status === column)
                      .map((project, index) => (
                        <Draggable
                          key={project.id}
                          draggableId={project.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={snapshot.isDragging ? 'rotate-2' : ''}
                            >
                              <Card 
                                className={`cursor-pointer transition-all duration-200 bg-white
                                  ${snapshot.isDragging 
                                    ? 'shadow-lg ring-2 ring-blue-500/50' 
                                    : 'hover:shadow-md hover:-translate-y-1'}`}
                                onClick={() => setSelectedProject(project)}
                              >
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg font-semibold text-gray-800">
                                    {project.name}
                                  </CardTitle>
                                  <div className="text-sm text-gray-500">
                                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div className="flex flex-wrap gap-1.5">
                                      {project.requiredSkills.slice(0, 3).map(skill => (
                                        <Badge 
                                          key={skill} 
                                          variant="secondary"
                                          className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                                        >
                                          {skill}
                                        </Badge>
                                      ))}
                                      {project.requiredSkills.length > 3 && (
                                        <Badge 
                                          variant="secondary"
                                          className="bg-gray-50 text-gray-600 hover:bg-gray-100"
                                        >
                                          +{project.requiredSkills.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {project.assignedConsultants && project.assignedConsultants.length > 0 && (
                                      <div className="flex -space-x-2 pt-2">
                                        {project.assignedConsultants.map((consultant) => (
                                          <Avatar 
                                            key={consultant.id} 
                                            className="border-2 border-white ring-2 ring-blue-500/10 w-8 h-8"
                                          >
                                            <AvatarImage src={consultant.picture} alt={consultant.name} />
                                          </Avatar>
                                        ))}
                                        {project.assignedConsultants.length > 4 && (
                                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm border-2 border-white ring-2 ring-blue-500/10 text-gray-600">
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
        onDelete={onDelete}
        columns={columns}
      />
    </>
  )
}

