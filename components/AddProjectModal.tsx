"use client"

import { useState, useEffect, useCallback } from 'react'
import { Project, ProjectStatus, Consultant, TeamSize } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ConsultantSuggestions from './ConsultantSuggestions'
import { useSession } from 'next-auth/react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from "@/hooks/use-toast"
import { useOrganizationLevels } from "@/contexts/OrganizationContext"


interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (project: Partial<Project>) => Promise<Project>
  onEdit?: (project: Project) => void
  consultants: Consultant[]
  allProjects: Project[]
}

const projectStatuses: ProjectStatus[] = ['Discussions', 'Sold', 'Started', 'Completed']

const defaultHourlyRates = {
  junior: 100, // Default values - adjust as needed
  manager: 180,
  partner: 250
};

export function AddProjectModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  consultants,
  allProjects 
}: AddProjectModalProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { levels } = useOrganizationLevels()
  const [step, setStep] = useState(1)
  
  // Initialize teamSize with all available levels set to 0
  const getInitialTeamSize = () => {
    const teamSize: TeamSize = {}
    levels.forEach(level => {
      teamSize[level.id] = 0
    })
    return teamSize
  }

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    requiredSkills: '',
    startDate: '',
    endDate: '',
    status: 'Discussions' as ProjectStatus,
    chanceToClose: 2,
    teamSize: getInitialTeamSize()
  })
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)

  // Update teamSize when levels change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      teamSize: getInitialTeamSize()
    }))
  }, [levels])

  // Memoized function to reset the modal's internal state
  const resetModalState = useCallback(() => {
    setStep(1);
    setCreatedProjectId(null);
    setFormData({
      name: '',
      client: '',
      requiredSkills: '',
      startDate: '',
      endDate: '',
      status: 'Discussions',
      teamSize: getInitialTeamSize(),
      chanceToClose: 100
    });
  }, [setStep, setCreatedProjectId, setFormData, levels]);

  // Memoized function to trigger the closing process
  const triggerClose = useCallback(() => {
    resetModalState(); // Reset internal state
    onClose();        // Call parent's onClose to update isOpen
  }, [onClose, resetModalState]);

  // useEffect to reset internal state if isOpen prop changes to false
  useEffect(() => {
    if (!isOpen) {
      resetModalState();
    }
  }, [isOpen, resetModalState]);

  // Handler for the Dialog's onOpenChange prop
  const handleOpenChange = (newOpenState: boolean) => {
    if (!newOpenState) {
      triggerClose();
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'status') {
      setFormData(prev => ({
        ...prev,
        [field]: value as ProjectStatus,
        chanceToClose: value !== 'Discussions' ? 100 : prev.chanceToClose
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newProject = {
      name: formData.name,
      client: formData.client,
      requiredSkills: formData.requiredSkills
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean),
      startDate: formData.startDate,
      endDate: formData.endDate,
      assignedConsultants: [],
      status: formData.status,
      organizationId: session?.user?.organizationId || '',
      teamSize: formData.teamSize,
      chanceToClose: parseInt(formData.chanceToClose.toString())
    }

    try {
      const createdProject = await onAdd(newProject)
      setCreatedProjectId(createdProject.id)
      setStep(2)
    } catch (error: unknown) {
      console.error("Error creating project: ", error)
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as {message: unknown}).message)
          : 'An unexpected error occurred';
      
      if (errorMessage.includes('Free plan is limited')) {
        toast({
          title: "Free Plan Limit Reached",
          description: "Your free plan is limited to 3 projects. Please upgrade to premium for unlimited projects.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error Creating Project",
          description: errorMessage,
          variant: "destructive"
        })
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Add New Project' : '(Optional) - Assign Team Members'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === 1 ? (
            <form id="new-project-form" onSubmit={handleNext} className="mx-2 my-2 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">Client Name *</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => handleChange('client', e.target.value)}
                    placeholder="Enter client name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredSkills">Required Skills (comma-separated) *</Label>
                  <Input
                    id="requiredSkills"
                    value={formData.requiredSkills}
                    onChange={(e) => handleChange('requiredSkills', e.target.value)}
                    placeholder="e.g., Strategy, Finance, Technology"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: ProjectStatus) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chanceToClose">Chance to Close (%)</Label>
                  <Input
                    id="chanceToClose"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.chanceToClose}
                    onChange={(e) => handleChange('chanceToClose', e.target.value)}
                    disabled={formData.status !== 'Discussions'}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Estimated Team Structure</Label>
                    <p className="text-sm text-gray-500 mb-2">You can add fractional team members, e.g. 0.5 for half a consultant&apos;s time.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      {levels.map((level) => (
                        <div key={level.id}>
                          <Label className="text-sm">{level.name}</Label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.teamSize[level.id] || 0}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              teamSize: {
                                ...prev.teamSize,
                                [level.id]: parseFloat(e.target.value) || 0
                              }
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <ConsultantSuggestions
                consultants={consultants}
                projectRequirements={{
                  startDate: formData.startDate,
                  endDate: formData.endDate,
                  requiredSkills: formData.requiredSkills
                    .split(',')
                    .map(skill => skill.trim())
                    .filter(Boolean),
                  teamSize: formData.teamSize
                }}
                allProjects={allProjects}
                projectId={createdProjectId!}
                defaultHourlyRates={defaultHourlyRates}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-1">
              <div className={`h-2 w-2 rounded-full relative top-[1px] ${step === 1 ? 'bg-black border border-black' : 'bg-muted border border-black'}`} />
              <div className="h-[1px] w-4 bg-black" />
              <div className={`h-2 w-2 rounded-full relative top-[1px] ${step === 2 ? 'bg-black border border-black' : 'bg-muted border border-black'}`} />
            </div>
          </div>

          <div className="flex space-x-2">
            {step === 1 ? (
              <>
                <Button type="button" variant="outline" onClick={triggerClose}>
                  Cancel
                </Button>
                <Button type="submit" form="new-project-form">Create Project</Button>
              </>
            ) : (
              <>
               
                <Button onClick={triggerClose}>
                  Done
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

