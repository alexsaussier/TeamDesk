import { Project, Consultant, ProjectStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { isConsultantAvailable } from '@/utils/consultantAvailability'
import { useState, useEffect } from 'react'

interface ProjectDetailsModalProps {
  project: Project & { assignedConsultants: Consultant[] } | null
  consultants: Consultant[]
  isOpen: boolean
  onClose: () => void
  onAssign: (consultantId: string, projectId: string) => void
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void
  columns: ProjectStatus[]
}

export function ProjectDetailsModal({
  project,
  consultants,
  isOpen,
  onClose,
  onAssign,
  onUpdateStatus,
  columns
}: ProjectDetailsModalProps) {
  const [localProject, setLocalProject] = useState(project)

  useEffect(() => {
    setLocalProject(project)
  }, [project])

  const handleAssignmentChange = async (consultant: Consultant, isChecked: boolean) => {
    try {
      const consultantId = consultant._id || consultant.id;
      const isAssigned = localProject?.assignedConsultants.some(ac => ac.id === consultant.id);
      
      if (isChecked && !isAssigned) {
        await onAssign(consultantId, localProject!.id);
      } else if (!isChecked) {
        const response = await fetch(`/api/projects/${localProject!.id}/unassign`, {
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
      
      setLocalProject(prev => {
        if (!prev) return null;
        return {
          ...prev,
          assignedConsultants: isChecked 
            ? [...prev.assignedConsultants, consultant]
            : prev.assignedConsultants.filter(c => c.id !== consultant.id)
        }
      });
    } catch (error) {
      console.error('Error updating team assignment:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {localProject && (
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{localProject.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(localProject.startDate).toLocaleDateString()} - {new Date(localProject.endDate).toLocaleDateString()}
            </p>
          </DialogHeader>

          <div className="grid gap-6">
            {/* Skills Section */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {localProject.requiredSkills.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>

            {/* Team Section */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Project Team</h4>
              <div className="grid gap-2">
                {localProject.assignedConsultants.length > 0 ? (
                  localProject.assignedConsultants.map(consultant => (
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
                <Select value={undefined}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Manage team" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {consultants.map(consultant => {
                      const isAssigned = localProject.assignedConsultants.some(ac => ac.id === consultant.id);
                      const isAvailable = isConsultantAvailable(consultant, localProject, []);
                      
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
                            onChange={(e) => handleAssignmentChange(consultant, e.target.checked)}
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
                  value={localProject.status} 
                  onValueChange={(value) => onUpdateStatus(localProject.id, value as ProjectStatus)}
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
  )
}