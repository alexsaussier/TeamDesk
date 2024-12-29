import { Project, Consultant, ProjectStatus, } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { checkConsultantAvailability } from '@/utils/consultantAvailability'
import { Spinner } from '@/components/ui/spinner'
import { Trash2, MinusCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteProjectModal from './DeleteProjectModal'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ProjectDetailsModalProps {
  project: (Project ) | null
  consultants: Consultant[]
  allProjects: Project[]
  isOpen: boolean
  onClose: () => void
  onAssign: (consultantId: string, projectId: string) => void
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void
  columns: ProjectStatus[]
  onDelete: (projectId: string) => void
  onUnassign: (consultantId: string, projectId: string) => void
}

export function ProjectDetailsModal({
  project,
  consultants,
  allProjects,
  isOpen,
  onClose,
  onAssign,
  onUpdateStatus,
  columns,
  onDelete,
  onUnassign
}: ProjectDetailsModalProps) {
  const [localProject, setLocalProject] = useState<Project | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setLocalProject(project)
  }, [project])

  if (!localProject) return null

  // Check if assignedConsultants is an array of Consultants (PopulatedProject) or strings (Project)
  const assignedConsultants = localProject.assignedConsultants

  const handleAssign = async (consultantId: string) => {
    try {
      console.log('Assigning consultant:', {
        consultantId,
        projectId: localProject.id,
        // Log the full objects to inspect
        consultant: consultants.find(c => c._id === consultantId || c.id === consultantId),
        project: localProject
      })
      setIsAssigning(true)
      await onAssign(consultantId, localProject.id)
      
      if (localProject) {
        setLocalProject(prev => {
          if (!prev) return null
          const newConsultant = consultants.find(c => c._id === consultantId || c.id === consultantId)
          if (!newConsultant) return prev
          return {
            ...prev,
            assignedConsultants: [...prev.assignedConsultants, newConsultant]
          }
        })
      }
    } catch (error) {
      console.error('Error assigning consultant:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    try {
      setIsUpdatingStatus(true)
      await onUpdateStatus(localProject.id, newStatus)
      setLocalProject(prev => prev ? { ...prev, status: newStatus } : null)
    } catch (error) {
      console.error('Error updating status:', error)
      // You might want to show an error toast here
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete(localProject.id)
      onClose()
    } catch (error) {
      console.error('Error deleting project:', error)
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
    }
  }

  const handleUnassign = async (consultantId: string) => {
    try {
      setIsAssigning(true)
      await onUnassign(consultantId, localProject.id)
      
      setLocalProject(prev => {
        if (!prev) return null
        return {
          ...prev,
          assignedConsultants: prev.assignedConsultants.filter(c => 
            c._id !== consultantId && c.id !== consultantId
          )
        }
      })
    } catch (error) {
      console.error('Error unassigning consultant:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{localProject.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Project Details Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Project Details</h4>
            <div className="grid gap-2">
              <div>
                <span className="text-sm font-medium">Client:</span>
                <span className="text-sm ml-2">{localProject.client}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Timeline:</span>
                <span className="text-sm ml-2">
                  {new Date(localProject.startDate).toLocaleDateString()} - 
                  {new Date(localProject.endDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">Team Size:</span>
                <div className="grid grid-cols-3 gap-4 mt-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Junior:</span>
                    <span className="ml-2">{localProject.teamSize?.junior ?? 0}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Manager:</span>
                    <span className="ml-2">{localProject.teamSize?.manager ?? 0}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Partner:</span>
                    <span className="ml-2">{localProject.teamSize?.partner ?? 0}</span>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium">Required Skills:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {localProject.requiredSkills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Project Team</h4>
            <div className="grid gap-2">
              {assignedConsultants.length > 0 ? (
                assignedConsultants.map(consultant => (
                  <div 
                    key={consultant._id || consultant.id}
                    className="flex items-center gap-2 text-sm bg-secondary/20 rounded-md p-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-secondary"></span>
                    <span>{consultant.name}</span>
                    {consultant.skills && consultant.skills.length > 0 && (
                      <span className="text-muted-foreground ml-auto">
                        {consultant.skills.slice(0, 2).join(', ')}
                        {consultant.skills.length > 2 && '...'}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-2 text-gray-400 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUnassign(consultant._id || consultant.id)
                      }}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
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
              <h4 className="text-sm font-medium text-muted-foreground">
                Assign Team Members
                {isAssigning && <Spinner className="ml-2 inline-block h-4 w-4" />}
              </h4>
              <Select onValueChange={handleAssign} disabled={isAssigning}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Add team member" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map(consultant => {
                    const isAssigned = assignedConsultants.some(ac => 
                      ac._id === consultant._id || ac.id === consultant.id
                    );
                    const { hasConflicts } = checkConsultantAvailability(consultant, localProject, allProjects);
                    
                    if (isAssigned) return null;
                    
                    return (
                      <SelectItem 
                        key={consultant._id || consultant.id} 
                        value={consultant._id || consultant.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {consultant.name}
                          {hasConflicts && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Warning: This consultant has overlapping project assignments</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Update Status
                {isUpdatingStatus && <Spinner className="ml-2 inline-block h-4 w-4" />}
              </h4>
              <Select 
                value={localProject.status} 
                onValueChange={handleStatusChange}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select status" />
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

          <div className="flex justify-end pt-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-red-600"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>

      <DeleteProjectModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        projectName={localProject.name}
        isDeleting={isDeleting}
      />
    </Dialog>
  )
}