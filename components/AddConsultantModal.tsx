"use client"

import { useState, useEffect } from 'react'
import { Consultant, ConsultantLevel } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AddConsultantModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (consultant: Omit<Consultant, 'id'>) => void
}

export default function AddConsultantModal({ isOpen, onClose, onAdd }: AddConsultantModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    level: 'junior' as ConsultantLevel,
    skills: '',
    salary: 0,
    picture: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        level: 'junior' as ConsultantLevel,
        skills: '',
        salary: 0,
        picture: ''
      })
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setError(null)
    
    const submitData = {
      name: formData.name,
      skills: formData.skills.split(',').map(skill => skill.trim()),
      picture: formData.picture || 'https://www.gravatar.com/avatar/?d=mp',
      level: formData.level,
      salary: formData.salary
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/workforce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add consultant')
      }

      await onAdd(data)
      onClose()
    } catch (error) {
      console.error('Error adding consultant:', error)
      setError(error instanceof Error ? error.message : 'Failed to add consultant')
    } finally {
      setIsSubmitting(false)
    }
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
              value={formData.name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                name: e.target.value
              }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="level">Level</Label>
            <Select value={formData.level} onValueChange={(value: ConsultantLevel) => setFormData(prev => ({
              ...prev,
              level: value
            }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                skills: e.target.value
              }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Salary ($)</Label>
            <Input
              id="salary"
              type="number"
              min="0"
              value={formData.salary}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                salary: Number(e.target.value)
              }))}
            />
          </div>
          <div>
            <Label htmlFor="picture">Picture URL</Label>
            <Input
              id="picture"
              type="url"
              value={formData.picture}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                picture: e.target.value
              }))}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Adding...
                </>
              ) : (
                'Add Consultant'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

