"use client"

import { useState } from 'react'
import { Project, ProjectStatus } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSession } from 'next-auth/react'
import { useProjectModal } from '@/hooks/useProjectModal'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>) => void
  onEdit?: (project: Project) => void
}

const projectStatuses: ProjectStatus[] = ['Discussions', 'Sold', 'Started', 'Completed']

export function AddProjectModal({ isOpen, onClose, onAdd, onEdit }: AddProjectModalProps) {
  const { data: session } = useSession()
  const { selectedProject } = useProjectModal()
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

  const handleSubmit = (e: React.FormEvent) => {
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
        teamSize: {
          junior: Number(formData.teamSize.junior) || 0,
          manager: Number(formData.teamSize.manager) || 0,
          partner: Number(formData.teamSize.partner) || 0
        }
      }
      onAdd(newProject)
    }
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
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

