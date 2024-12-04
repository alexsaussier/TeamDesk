"use client"

import { useState } from 'react'
import { Consultant } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AddConsultantModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (consultant: Omit<Consultant, 'id'>) => void
}

export default function AddConsultantModal({ isOpen, onClose, onAdd }: AddConsultantModalProps) {
  const [name, setName] = useState('')
  const [skills, setSkills] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newConsultant: Omit<Consultant, 'id'> = {
      name,
      skills: skills.split(',').map(skill => skill.trim()),
      currentAssignment: null,
      futureAssignments: [],
    }
    onAdd(newConsultant)
    setName('')
    setSkills('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Consultant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Consultant</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

