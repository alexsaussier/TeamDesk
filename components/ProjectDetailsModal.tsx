import { Project, Consultant, ProjectStatus, } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { checkConsultantAvailability } from '@/utils/consultantAvailability'
import { Spinner } from '@/components/ui/spinner'
import { Trash2, MinusCircle, AlertTriangle, ClipboardList, Users, LayoutGrid, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteProjectModal from './DeleteProjectModal'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ProjectDetailsModalProps {
  project: (Project ) | null
  consultants: Consultant[]
  allProjects: Project[]
  isOpen: boolean
  onClose: () => void
  onAssign: (consultantId: string, projectId: string, percentage: number) => void
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

  console.log("selected project", localProject)
  // Check if assignedConsultants is an array of Consultants (PopulatedProject) or strings (Project)
  const assignedConsultants = localProject.assignedConsultants

  const handleAssign = async (consultantId: string) => {
    try {
      const percentage = 100; // You might want to add a UI input for this
      setIsAssigning(true)
      await onAssign(consultantId, localProject.id, percentage)
      
      if (localProject) {
        setLocalProject(prev => {
          if (!prev) return null
          const newConsultant = consultants.find(c => c._id === consultantId || c.id === consultantId)
          if (!newConsultant) return prev
          return {
            ...prev,
            assignedConsultants: [...prev.assignedConsultants, { ...newConsultant, percentage }]
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
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">{localProject.name}</DialogTitle>
          <p className="text-muted-foreground mt-1">{localProject.client}</p>
        </DialogHeader>

        <div className="grid gap-8 overflow-y-auto pr-2">
          {/* Project Details Card */}
          <div className="bg-card rounded-lg border p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Project Details
            </h3>
            <div className="grid gap-4">
              {/* Timeline Section */}
              <div className="bg-sky-50 rounded-lg p-4">
                <span className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </span>
                <div className="flex items-center gap-2 font-medium">
                  <span>{new Date(localProject.startDate).toLocaleDateString()}</span>
                  <span>-</span>
                  <span>{new Date(localProject.endDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Team Size Section */}
              <div className="bg-sky-50 rounded-lg p-4">
                <span className="text-sm text-muted-foreground block mb-2">Team Size:</span>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Junior', value: localProject.teamSize?.junior ?? 0 },
                    { label: 'Manager', value: localProject.teamSize?.manager ?? 0 },
                    { label: 'Partner', value: localProject.teamSize?.partner ?? 0 }
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-background rounded-md p-3">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-2xl font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Skills Section */}
              <div className="bg-sky-50 rounded-lg p-4">
                <span className="text-sm text-muted-foreground block mb-2">Required Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {localProject.requiredSkills.map(skill => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Project Team Card */}
          <div className="bg-card rounded-lg border p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Project Team
            </h3>
            <div className="grid gap-2 mb-6">
              {assignedConsultants.length > 0 ? (
                assignedConsultants.map(consultant => (
                  <div 
                    key={consultant._id || consultant.id}
                    className="flex items-center gap-3 bg-secondary/10 rounded-lg p-3 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {consultant.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{consultant.name}</p>
                      {consultant.skills && (
                        <p className="text-xs text-muted-foreground">
                          {consultant.skills.slice(0, 2).join(', ')}
                          {consultant.skills.length > 2 && '...'}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
                <p className="text-sm text-muted-foreground text-center py-4">
                  No team members assigned yet
                </p>
              )}
            </div>

            {/* Actions Section */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  Assign Team Members
                  {isAssigning && <Spinner className="h-4 w-4" />}
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

              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  Update Status
                  {isUpdatingStatus && <Spinner className="h-4 w-4" />}
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
          </div>

          {/* Delete Button */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
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