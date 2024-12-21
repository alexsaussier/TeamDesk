import { useState } from 'react'
import { Project } from '@/types'

interface UseProjectDeleteReturn {
  isDeleting: boolean
  deleteProject: (projectId: string) => Promise<boolean>
}

export function useProjectDelete(
  onProjectDeleted?: (projectId: string) => void
): UseProjectDeleteReturn {
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteProject = async (projectId: string): Promise<boolean> => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      onProjectDeleted?.(projectId)
      return true
    } catch (error) {
      console.error('Error deleting project:', error)
      return false
    } finally {
      setIsDeleting(false)
    }
  }

  return { isDeleting, deleteProject }
} 