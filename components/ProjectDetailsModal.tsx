import { Project, Consultant, ProjectStatus } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { checkConsultantAvailability } from '@/utils/consultantAvailability'
import { Spinner } from '@/components/ui/spinner'
import { Trash2, MinusCircle, AlertTriangle, ClipboardList, Users, LayoutGrid, Calendar, Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteProjectModal from './DeleteProjectModal'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useOrganizationLevels } from '@/contexts/OrganizationContext'
import { createLevelNameResolver } from '@/lib/levelUtils'
import { useCurrency } from '@/contexts/CurrencyContext'

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
  onUpdateChanceToClose: (projectId: string, chanceToClose: number) => Promise<void>
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
  onUnassign,
  onUpdateChanceToClose
}: ProjectDetailsModalProps) {
  const [localProject, setLocalProject] = useState<Project | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditingChanceToClose, setIsEditingChanceToClose] = useState(false)
  const [tempChanceToClose, setTempChanceToClose] = useState<number | null>(null)
  const [isEditingPercentage, setIsEditingPercentage] = useState<Record<string, boolean>>({})
  const [tempPercentage, setTempPercentage] = useState<Record<string, number | null>>({})
  const [tempHourlyRate, setTempHourlyRate] = useState<Record<string, number | null>>({})
  const [isUpdatingPercentage, setIsUpdatingPercentage] = useState<Record<string, boolean>>({})
  const [isUpdatingHourlyRate, setIsUpdatingHourlyRate] = useState<Record<string, boolean>>({})
  const { levels } = useOrganizationLevels()
  const { formatCurrency, getCurrencySymbol } = useCurrency()

  // Get level name resolver function
  const getLevelName = createLevelNameResolver(levels)

  useEffect(() => {
    setLocalProject(project)
  }, [project])

  if (!localProject) return null

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
            assignedConsultants: [...prev.assignedConsultants, { 
              ...newConsultant, 
              percentage,
              level: newConsultant.level
            }]
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

  const handleChanceToCloseChange = async () => {
    if (tempChanceToClose === null) return
    
    try {
      setIsUpdatingStatus(true)
      const numericValue = Math.min(100, Math.max(0, tempChanceToClose))
      
      await onUpdateChanceToClose(localProject.id, numericValue)
      setLocalProject(prev => prev ? { ...prev, chanceToClose: numericValue } : null)
      setIsEditingChanceToClose(false)
      setTempChanceToClose(null)
    } catch (error) {
      console.error('Error updating chance to close:', error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleUpdateAssignment = async (consultantId: string, percentage: number) => {
    try {
      setIsUpdatingPercentage(prev => ({ ...prev, [consultantId]: true }))
      const response = await fetch(`/api/projects/${localProject.id}/update-assignment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consultantId, percentage }),
      })

      if (!response.ok) {
        throw new Error('Failed to update assignment percentage')
      }

      setLocalProject(prev => {
        if (!prev) return null
        return {
          ...prev,
          assignedConsultants: prev.assignedConsultants.map(c => {
            if ((c._id === consultantId || c.id === consultantId)) {
              return { ...c, percentage }
            }
            return c
          })
        }
      })
    } catch (error) {
      console.error('Error updating assignment percentage:', error)
    } finally {
      setIsUpdatingPercentage(prev => ({ ...prev, [consultantId]: false }))
      setIsEditingPercentage(prev => ({ ...prev, [consultantId]: false }))
      setTempPercentage(prev => ({ ...prev, [consultantId]: null }))
    }
  }

  const handleUpdateHourlyRate = async (consultantId: string, hourlyRate: number) => {
    try {
      setIsUpdatingHourlyRate(prev => ({ ...prev, [consultantId]: true }))
      const response = await fetch(`/api/projects/${localProject.id}/update-assignment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consultantId, hourlyRate }),
      })

      if (!response.ok) {
        throw new Error('Failed to update hourly rate')
      }

      setLocalProject(prev => {
        if (!prev) return null
        return {
          ...prev,
          assignedConsultants: prev.assignedConsultants.map(c => {
            if ((c._id === consultantId || c.id === consultantId)) {
              return { ...c, hourlyRate }
            }
            return c
          })
        }
      })
    } catch (error) {
      console.error('Error updating hourly rate:', error)
    } finally {
      setIsUpdatingHourlyRate(prev => ({ ...prev, [consultantId]: false }))
      setIsEditingPercentage(prev => ({ ...prev, [consultantId]: false }))
      setTempHourlyRate(prev => ({ ...prev, [consultantId]: null }))
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
                <div className="grid grid-cols-3">
                  <div>
                    <span className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                      <LayoutGrid className="h-4 w-4" />
                      Status
                    </span>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={localProject.status} 
                        onValueChange={handleStatusChange}
                        disabled={isUpdatingStatus}
                      >
                        <SelectTrigger className="w-[140px]">
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
                      {isUpdatingStatus && <Spinner className="h-4 w-4" />}
                    </div>
                  </div>

                  <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Label 
                              htmlFor="chanceToClose" 
                              className="text-sm text-muted-foreground block mb-2"
                            >
                              Chance to Close (%)
                            </Label>
                            <div className="flex items-center gap-2">
                              {isEditingChanceToClose ? (
                                <>
                                  <Input
                                    id="chanceToClose"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={tempChanceToClose ?? localProject.chanceToClose ?? 1}
                                    onChange={(e) => setTempChanceToClose(parseInt(e.target.value) || 0)}
                                    className="w-[100px]"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-600 hover:text-green-700"
                                    onClick={handleChanceToCloseChange}
                                    disabled={isUpdatingStatus}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700"
                                    onClick={() => {
                                      setIsEditingChanceToClose(false)
                                      setTempChanceToClose(null)
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <div className="w-[100px] h-9 bg-background flex items-center px-3 rounded-md border">
                                    {localProject.status === 'Discussions' 
                                      ? `${localProject.chanceToClose ?? 1}%`
                                      : '100%'
                                    }
                                  </div>
                                  {localProject.status === 'Discussions' && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        setIsEditingChanceToClose(true)
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {localProject.status === 'Discussions' 
                            ? "Estimated probability of winning this project"
                            : "Chance to close is only updateable if the project has not yet been sold"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="flex flex-col items-end">
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
                </div>
              </div>

              {/* Required Skills Section */}
              <div className="bg-sky-50 rounded-lg p-4">
                <span className="text-sm text-muted-foreground block mb-2">Needed Skills</span>
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

            {/* Expected Team Size Section */}
            <div className="bg-sky-50 rounded-lg p-4 mb-6">
              <span className="text-sm text-muted-foreground block mb-2">Expected Team Size</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {levels.map((level) => (
                  <div key={level.id} className="bg-background rounded-md p-3">
                    <p className="text-xs text-muted-foreground">{level.name}</p>
                    <p className="text-2xl font-semibold">{localProject.teamSize?.[level.id] ?? 0}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Assigned Consultants Section */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">
                Assigned Consultants ({assignedConsultants.length})
              </h4>
              <div className="grid gap-2">
                {assignedConsultants.map((consultant) => (
                  <div 
                    key={consultant._id || consultant.id}
                    className="flex items-center gap-3 bg-secondary/10 rounded-lg p-3 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {consultant.picture ? (
                        <img 
                          src={consultant.picture} 
                          alt={consultant.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{consultant.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{consultant.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {getLevelName(consultant.level)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditingPercentage?.[consultant._id || consultant.id] ? (
                        <>
                          <div className="w-24">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={tempPercentage?.[consultant._id || consultant.id] ?? consultant.percentage}
                              onChange={(e) => setTempPercentage(prev => ({
                                ...prev,
                                [consultant._id || consultant.id]: parseInt(e.target.value) || 0
                              }))}
                              className="h-8"
                              placeholder="Percentage"
                            />
                          </div>
                          
                          <div className="w-24">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={tempHourlyRate?.[consultant._id || consultant.id] ?? consultant.hourlyRate ?? 0}
                              onChange={(e) => setTempHourlyRate(prev => ({
                                ...prev,
                                [consultant._id || consultant.id]: parseFloat(e.target.value) || 0
                              }))}
                              className="h-8"
                              placeholder="Rate/hour"
                            />
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700"
                            onClick={() => {
                              const id = consultant._id || consultant.id;
                              // Update both values at once
                              Promise.all([
                                handleUpdateAssignment(id, tempPercentage?.[id] ?? consultant.percentage),
                                handleUpdateHourlyRate(id, tempHourlyRate?.[id] ?? consultant.hourlyRate ?? 0)
                              ]);
                              setIsEditingPercentage(prev => ({ ...prev, [id]: false }));
                              setTempPercentage(prev => ({ ...prev, [id]: null }));
                              setTempHourlyRate(prev => ({ ...prev, [id]: null }));
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => {
                              const id = consultant._id || consultant.id;
                              setIsEditingPercentage(prev => ({ ...prev, [id]: false }));
                              setTempPercentage(prev => ({ ...prev, [id]: null }));
                              setTempHourlyRate(prev => ({ ...prev, [id]: null }));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="w-24 flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">Assignment</span>
                            <div className="flex items-center">
                              <span className="text-sm">{consultant.percentage}%</span>
                              {isUpdatingPercentage?.[consultant._id || consultant.id] && (
                                <Spinner className="h-4 w-4 ml-1" />
                              )}
                            </div>
                          </div>
                          
                          <div className="w-24 flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">Rate</span>
                            <div className="flex items-center">
                              <span className="text-sm">{getCurrencySymbol()}{consultant.hourlyRate ?? 0}/hr</span>
                              {isUpdatingHourlyRate?.[consultant._id || consultant.id] && (
                                <Spinner className="h-4 w-4 ml-1" />
                              )}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              const id = consultant._id || consultant.id;
                              setIsEditingPercentage(prev => ({ ...prev, [id]: true }));
                              // Pre-populate the temp states with current values
                              setTempPercentage(prev => ({ 
                                ...prev, 
                                [id]: consultant.percentage 
                              }));
                              setTempHourlyRate(prev => ({ 
                                ...prev, 
                                [id]: consultant.hourlyRate ?? 0 
                              }));
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Consultant Section */}
            <div className="bg-secondary/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Add New Consultant</span>
                <Select onValueChange={handleAssign} disabled={isAssigning}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Assign consultant" />
                  </SelectTrigger>
                  <SelectContent>
                    {consultants
                      .filter(c => !assignedConsultants.some(ac => 
                        ac._id === c._id || ac.id === c.id
                      ))
                      .map(consultant => {
                        const { hasConflicts } = checkConsultantAvailability(consultant, localProject, allProjects);
                        
                        return (
                          <div key={consultant._id || consultant.id} className="flex items-center px-2 py-1.5">
                            <SelectItem 
                              value={consultant._id || consultant.id}
                              className="flex-1 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                {consultant.name}
                                <span className="text-xs text-muted-foreground capitalize">
                                  ({getLevelName(consultant.level)})
                                </span>
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
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 ml-2 text-muted-foreground hover:text-primary"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      window.open(`/dashboard/workforce/${consultant._id || consultant.id}`, '_blank')
                                    }}
                                  >
                                    <Users className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View profile in new tab</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        );
                      })}
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