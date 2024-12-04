"use client"

import { useState } from 'react'
import { Project, ProjectStatus } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (project: Omit<Project, 'id'>) => void
}

const projectStatuses: ProjectStatus[] = ['Discussions', 'Sold', 'Started', 'Completed']

export default function AddProjectModal({ isOpen, onClose, onAdd }: AddProjectModalProps) {
  const [name, setName] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('Discussions')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newProject: Omit<Project, 'id'> = {
      name,
      requiredSkills: requiredSkills.split(',').map(skill => skill.trim()),
      startDate,
      endDate,
      assignedConsultants: [],
      status,
    }
    onAdd(newProject)
    setName('')
    setRequiredSkills('')
    setStartDate('')
    setEndDate('')
    setStatus('Discussions')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="requiredSkills">Required Skills (comma-separated)</Label>
            <Input
              id="requiredSkills"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value: ProjectStatus) => setStatus(value)} value={status}>
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
          <DialogFooter>
            <Button type="submit">Add Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

