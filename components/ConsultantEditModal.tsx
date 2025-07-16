"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ImageUpload from '@/components/ImageUpload'
import { Consultant } from '@/types'
import { useOrganizationLevels } from '@/contexts/OrganizationContext'

interface ConsultantEditModalProps {
  isOpen: boolean
  onClose: () => void
  consultant: Consultant
  onUpdate: (updatedConsultant: Consultant) => void
}

export default function ConsultantEditModal({ 
  isOpen, 
  onClose, 
  consultant, 
  onUpdate 
}: ConsultantEditModalProps) {
  const [salary, setSalary] = useState(consultant.salary)
  const [level, setLevel] = useState(consultant.level)
  const [picture, setPicture] = useState(consultant.picture || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { levels } = useOrganizationLevels()

  const handleSubmit = async () => {
    try {
      setIsUpdating(true)
      setError(null)

      // Only send fields that have changed
      const updateData: Partial<Pick<Consultant, 'salary' | 'level' | 'picture'>> = {}
      if (salary !== consultant.salary) updateData.salary = salary
      if (level !== consultant.level) updateData.level = level
      if (picture !== consultant.picture) updateData.picture = picture

      // If no changes, just close the modal
      if (Object.keys(updateData).length === 0) {
        onClose()
        return
      }

      const response = await fetch(`/api/workforce/${consultant._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update consultant')
      }

      const updatedConsultant = await response.json()
      onUpdate(updatedConsultant)
      onClose()
    } catch (error) {
      console.error('Error updating consultant:', error)
      setError(error instanceof Error ? error.message : 'Failed to update consultant')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original values
    setSalary(consultant.salary)
    setLevel(consultant.level)
    setPicture(consultant.picture || '')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Consultant</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Picture Upload */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <ImageUpload
              onImageUploaded={setPicture}
              currentImageUrl={picture}
              className="w-full"
            />
          </div>

          {/* Level Selection */}
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {levels
                  .filter(l => l.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map(levelOption => (
                    <SelectItem key={levelOption.id} value={levelOption.id}>
                      {levelOption.name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          {/* Salary Input */}
          <div className="space-y-2">
            <Label htmlFor="salary">Annual Salary</Label>
            <Input
              id="salary"
              type="number"
              min="0"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              placeholder="Enter annual salary"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 