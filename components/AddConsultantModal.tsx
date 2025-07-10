"use client"

import { useState, useEffect } from 'react'
import { Consultant } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from "@/hooks/use-toast"
import ImageUpload from './ImageUpload'
import { useOrganizationLevels } from '@/contexts/OrganizationContext'

interface AddConsultantModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (consultant: Omit<Consultant, 'id'>) => void
}

export default function AddConsultantModal({ isOpen, onClose, onAdd }: AddConsultantModalProps) {
  const { toast } = useToast()
  const { levels, isLoading: levelsLoading } = useOrganizationLevels()
  
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    skills: '',
    salary: 0,
    picture: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set default level when levels are loaded
  useEffect(() => {
    if (levels.length > 0 && !formData.level) {
      // Set to the first (most junior) level by default
      const defaultLevel = levels.sort((a, b) => a.order - b.order)[0]
      setFormData(prev => ({
        ...prev,
        level: defaultLevel.id
      }))
    }
  }, [levels, formData.level])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      const defaultLevel = levels.length > 0 ? levels.sort((a, b) => a.order - b.order)[0]?.id || '' : ''
      setFormData({
        name: '',
        level: defaultLevel,
        skills: '',
        salary: 0,
        picture: ''
      })
      setError(null)
    }
  }, [isOpen, levels])

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      picture: imageUrl
    }))
  }

  const validateForm = () => {
    const missingFields = []
    
    if (!formData.name.trim()) {
      missingFields.push('Name')
    }
    
    if (!formData.skills.trim()) {
      missingFields.push('Skills')
    }
    
    if (!formData.level) {
      missingFields.push('Level')
    }
    
    return missingFields
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setError(null)
    
    // Client-side validation
    const missingFields = validateForm()
    if (missingFields.length > 0) {
      const fieldList = missingFields.join(', ')
      toast({
        title: "Required Fields Missing",
        description: `Please fill in the following required fields: ${fieldList}`,
        variant: "destructive"
      })
      return
    }
    
    const submitData = {
      name: formData.name.trim(),
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
      picture: formData.picture || 'https://www.gravatar.com/avatar/?d=mp',
      level: formData.level,
      salary: formData.salary
    }

    // Validate skills array
    if (submitData.skills.length === 0) {
      toast({
        title: "Invalid Skills",
        description: "Please enter at least one skill (comma-separated)",
        variant: "destructive"
      })
      return
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
        // Check if it's a free plan limit error
        if (response.status === 403 && data.error?.includes('Free plan is limited')) {
          toast({
            title: "Free Plan Limit Reached",
            description: "Your free plan is limited to 10 consultants. Please upgrade to premium for unlimited consultants.",
            variant: "destructive"
          })
        } else if (response.status === 400) {
          // Handle validation errors from the server
          if (data.error?.includes('name already exists')) {
            toast({
              title: "Duplicate Name",
              description: "A consultant with this name already exists in your organization. Please use a different name.",
              variant: "destructive"
            })
          } else {
            toast({
              title: "Validation Error",
              description: data.error || "Please check your input and try again.",
              variant: "destructive"
            })
          }
        } else {
          toast({
            title: "Error Adding Consultant",
            description: data.error || "Failed to add consultant. Please try again.",
            variant: "destructive"
          })
        }
        throw new Error(data.error || 'Failed to add consultant')
      }

      await onAdd(data)
      onClose()
      toast({
        title: "Consultant Added",
        description: `${formData.name} has been added successfully.`,
      })
    } catch (error) {
      console.error('Error adding consultant:', error)
      setError(error instanceof Error ? error.message : 'Failed to add consultant')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Consultant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                name: e.target.value
              }))}
              required
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <Label>Profile Picture</Label>
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              currentImageUrl={formData.picture}
            />
          </div>

          <div>
            <Label htmlFor="level">Level</Label>
            <Select 
              value={formData.level} 
              onValueChange={(value: string) => setFormData(prev => ({
                ...prev,
                level: value
              }))}
              disabled={levelsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={levelsLoading ? "Loading levels..." : "Select level"} />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="skills">
              Skills <span className="text-red-500">*</span>
            </Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                skills: e.target.value
              }))}
              required
              placeholder="React, Node.js, TypeScript"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter skills separated by commas
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="salary">Annual Salary ($)</Label>
            <Input
              id="salary"
              type="number"
              min="0"
              value={formData.salary}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                salary: Number(e.target.value)
              }))}
              placeholder="75000"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting || levelsLoading}>
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
      </DialogContent>
    </Dialog>
  )
}

