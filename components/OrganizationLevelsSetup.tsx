"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { ConsultantLevelDefinition } from '@/types'
import { useToast } from "@/hooks/use-toast"

interface OrganizationLevelsSetupProps {
  isOpen: boolean
  onClose: () => void
  onSave: (levels: ConsultantLevelDefinition[]) => void
  initialLevels?: ConsultantLevelDefinition[]
}

export default function OrganizationLevelsSetup({ 
  isOpen, 
  onClose, 
  onSave, 
  initialLevels 
}: OrganizationLevelsSetupProps) {
  const { toast } = useToast()
  const [levels, setLevels] = useState<ConsultantLevelDefinition[]>(
    initialLevels || [
      { id: 'junior', name: 'Junior', order: 1, isActive: true },
      { id: 'senior', name: 'Senior', order: 2, isActive: true },
      { id: 'lead', name: 'Lead', order: 3, isActive: true }
    ]
  )

  const addLevel = () => {
    const newOrder = Math.max(...levels.map(l => l.order)) + 1
    setLevels([...levels, {
      id: `level_${Date.now()}`,
      name: '',
      order: newOrder,
      isActive: true
    }])
  }

  const updateLevel = (index: number, field: keyof ConsultantLevelDefinition, value: string | number | boolean) => {
    const updated = [...levels]
    updated[index] = { ...updated[index], [field]: value }
    setLevels(updated)
  }

  const removeLevel = (index: number) => {
    if (levels.length <= 1) {
      toast({
        title: "Cannot Remove Level",
        description: "You must have at least one consultant level.",
        variant: "destructive"
      })
      return
    }
    setLevels(levels.filter((_, i) => i !== index))
  }

  const moveLevel = (index: number, direction: 'up' | 'down') => {
    const newLevels = [...levels]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newLevels.length) return
    
    [newLevels[index], newLevels[targetIndex]] = [newLevels[targetIndex], newLevels[index]]
    setLevels(newLevels)
  }

  const handleSave = () => {
    // Validate levels
    const validLevels = levels.filter(level => level.name.trim())
    
    if (validLevels.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one level with a name is required.",
        variant: "destructive"
      })
      return
    }

    // Check for duplicate names
    const names = validLevels.map(l => l.name.trim().toLowerCase())
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
    
    if (duplicates.length > 0) {
      toast({
        title: "Duplicate Names",
        description: "All level names must be unique.",
        variant: "destructive"
      })
      return
    }

    // Clean up and reorder
    const cleanedLevels = validLevels.map((level, index) => ({
      ...level,
      id: level.id.startsWith('level_') ? 
        level.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : 
        level.id,
      name: level.name.trim(),
      order: index + 1,
      isActive: true
    }))
    
    onSave(cleanedLevels)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Consultant Levels</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Define the seniority levels for your organization. These will be used throughout the system for consultants and project planning.
          </p>
          
          <div className="space-y-2">
            {levels.map((level, index) => (
              <div key={level.id} className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-8 p-0"
                    onClick={() => moveLevel(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-8 p-0"
                    onClick={() => moveLevel(index, 'down')}
                    disabled={index === levels.length - 1}
                  >
                    ↓
                  </Button>
                </div>
                
                <GripVertical className="h-4 w-4 text-gray-400" />
                
                <div className="flex-1">
                  <Input
                    placeholder="Level name (e.g., Junior Developer)"
                    value={level.name}
                    onChange={(e) => updateLevel(index, 'name', e.target.value)}
                    className="bg-white"
                  />
                </div>
                
                <div className="text-sm text-gray-500 min-w-[60px] text-center">
                  Order: {index + 1}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLevel(index)}
                  disabled={levels.length <= 1}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <Button variant="outline" onClick={addLevel} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Level
          </Button>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Levels are ordered from most junior (top) to most senior (bottom). 
              Existing consultants will keep their current level assignments.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Levels</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 