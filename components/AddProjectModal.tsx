"use client"

import { useState, useEffect } from 'react'
import { Project, ProjectStatus, Consultant } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ConsultantSuggestions from './ConsultantSuggestions'
import { useSession } from 'next-auth/react'
//import { useProjectModal } from '@/hooks/useProjectModal'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>) => void
  onEdit?: (project: Project) => void
  consultants: Consultant[]
  allProjects: Project[]
}

const projectStatuses: ProjectStatus[] = ['Discussions', 'Sold', 'Started', 'Completed']

export function AddProjectModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  consultants,
  allProjects 
}: AddProjectModalProps) {
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    requiredSkills: '',
    startDate: '',
    endDate: '',
    status: 'Discussions' as ProjectStatus,
    chanceToClose: 2,
    teamSize: {
      junior: 0,
      manager: 0,
      partner: 0
    }
  })
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)

  {/*const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedProject) {
      onEdit?.(selectedProject)
    } else {
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
        teamSize: formData.teamSize
      }
      onAdd(newProject)
    }}
    // Reset form
    setFormData({
      name: '',
      client: '',
      requiredSkills: '',
      startDate: '',
      endDate: '',
      status: 'Discussions',
      teamSize: {
        junior: 0,
        manager: 0,
        partner: 0
      }
    })
  */}

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
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject)
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const createdProject = await response.json()
      setCreatedProjectId(createdProject._id)
      onAdd(createdProject)
      setStep(2)
    } catch (error) {
      console.error("Error creating project: ", error)
    }
  }

  

 

  const handleClose = () => {
    setStep(1)
    setCreatedProjectId(null)
    setFormData({
      name: '',
      client: '',
      requiredSkills: '',
      startDate: '',
      endDate: '',
      status: 'Discussions',
      teamSize: {
        junior: 0,
        manager: 0,
        partner: 0
      },
      chanceToClose: 100
    })
    onClose()
  }

  useEffect(() => {
    if (!isOpen) {
      handleClose()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
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
                    <Label>Team Size</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <Label className="text-sm">Junior</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.teamSize.junior}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            teamSize: {
                              ...prev.teamSize,
                              junior: parseFloat(e.target.value)
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Manager</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.teamSize.manager}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            teamSize: {
                              ...prev.teamSize,
                              manager: parseFloat(e.target.value)
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Partner</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.teamSize.partner}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            teamSize: {
                              ...prev.teamSize,
                              partner: parseFloat(e.target.value)
                            }
                          }))}
                        />
                      </div>
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
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" form="new-project-form">Create Project</Button>
              </>
            ) : (
              <>
               
                <Button onClick={handleClose}>
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

