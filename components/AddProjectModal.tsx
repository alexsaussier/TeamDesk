"use client"

import { useState, useEffect } from 'react'
import { Project, ProjectStatus, Consultant } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ConsultantSuggestions from './ConsultantSuggestions'
import { useSession } from 'next-auth/react'
import { useProjectModal } from '@/hooks/useProjectModal'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConsultantLevel } from '@/types'
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
  onEdit,
  consultants,
  allProjects 
}: AddProjectModalProps) {
  const { data: session } = useSession()
  const { selectedProject } = useProjectModal()
  const [step, setStep] = useState(1)
  const [selectedConsultants, setSelectedConsultants] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    requiredSkills: '',
    startDate: '',
    endDate: '',
    status: 'Discussions' as ProjectStatus,
    teamSize: {
      junior: 0,
      manager: 0,
      partner: 0
    }
  })

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
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleConsultantAssign = (consultantId: string) => {
    setSelectedConsultants(prev => [...prev, consultantId])
  }

  const handleFinalSubmit = () => {
    const newProject = {
      name: formData.name,
      client: formData.client,
      requiredSkills: formData.requiredSkills
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean),
      startDate: formData.startDate,
      endDate: formData.endDate,
      assignedConsultants: selectedConsultants.map(id => {
        const consultant = consultants.find(c => c._id === id)
        return {
          id: consultant?._id || '',
          _id: consultant?._id || '',
          name: consultant?.name || '',
          skills: consultant?.skills || [],
          picture: consultant?.picture || '',
          percentage: 100,
          level: (consultant?.level || 'junior') as ConsultantLevel
        }
      }),
      status: formData.status,
      organizationId: session?.user?.organizationId || '',
      teamSize: formData.teamSize
    }
    
    onAdd(newProject)
    handleClose()
  }

  const handleClose = () => {
    setStep(1)
    setSelectedConsultants([])
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
    onClose()
  }

  useEffect(() => {
    if (!isOpen) {
      handleClose()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Add New Project' : '(Optional) - Assign Team Members'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <form id="new-project-form" onSubmit={handleNext} className="space-y-4">
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
            <div className="max-h-[60vh] overflow-y-auto pr-2">
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
                onAssign={handleConsultantAssign}
                allProjects={allProjects}
              />
            </div>
          </div>
        )}

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
                <Button type="submit" form="new-project-form">Next</Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleFinalSubmit}>
                  Create Project
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

