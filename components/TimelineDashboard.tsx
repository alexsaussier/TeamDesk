"use client"

import { useState, useEffect } from 'react'
import { Project, Consultant } from '@/types'
import Timeline from './Timeline'
import { AddProjectModal } from './AddProjectModal'
import { useSession } from 'next-auth/react'
import { useProjectModal } from '@/hooks/useProjectModal'
import { GradientButton } from '@/components/GradientButton'
import { useProjectDelete } from '@/hooks/useProjectDelete'
import { Spinner } from "@/components/ui/spinner"
import { BatchUploadModal } from './BatchUploadModal'
import { Upload } from 'lucide-react'

export default function TimelineDashboard() {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isOpen, openModal, closeModal } = useProjectModal()
  const { deleteProject } = useProjectDelete(
    (projectId) => {
      setProjects(prev => prev.filter(p => p.id !== projectId))
      console.log('Project deleted:', projectId)
    }
  )
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false)

  useEffect(() => {
    
    if (status !== 'authenticated') return

    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Fetch projects and consultants in parallel
        const [projectsResponse, consultantsResponse] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/workforce')
        ])

        if (!projectsResponse.ok) throw new Error('Failed to fetch projects')
        if (!consultantsResponse.ok) throw new Error('Failed to fetch consultants')

        const projectsData = await projectsResponse.json()
        const consultantsData = await consultantsResponse.json()

        setProjects(projectsData)
        setConsultants(consultantsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session, status])

  const handleAddProject = async (newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>): Promise<Project> => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      })

      if (!response.ok) throw new Error('Failed to add project')

      const data = await response.json()
      const addedProject: Project = {
        ...data,
        id: data.id || data._id, // Convert _id to id if needed
      }
      setProjects([...projects, addedProject])
      closeModal()
      return addedProject  // Return the added project
    } catch (error) {
      console.error('Error adding project:', error)
      throw error  // Re-throw the error to be handled by the caller
    }
  }

  const unassignConsultant = async (consultantId: string, projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/unassign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consultantId }),
      })

      if (!response.ok) {
        throw new Error('Failed to unassign consultant')
      }

      // Refresh data
      const [projectsResponse, consultantsResponse] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/workforce')
      ])

      const projectsData = await projectsResponse.json()
      const consultantsData = await consultantsResponse.json()

      setProjects(projectsData)
      setConsultants(consultantsData)
    } catch (error) {
      console.error('Error unassigning consultant:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Timeline</h2>
        <div className="flex gap-2">
          <GradientButton 
            onClick={() => openModal()} 
            label="Add Project" 
          />
          <GradientButton 
            onClick={() => setIsBatchUploadOpen(true)}
            label="Batch Upload"
            icon={Upload}
            variant="gray"
          />
        </div>
      </div>      
      
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Spinner className="h-8 w-8" />
              <p className="text-sm text-gray-600">Loading projects...</p>
            </div>
          </div>
        )}
        
        <Timeline 
          projects={projects} 
          consultants={consultants}
          columns={['Discussions', 'Sold', 'Started', 'Completed']}
          onDelete={async (projectId) => {
            await deleteProject(projectId)
          }}
          onUnassign={unassignConsultant}
        />
        <div className="flex justify-start mt-4">
          <GradientButton 
            onClick={() => openModal()} 
            label="Add Project" 
          />
        </div>
        <AddProjectModal
          isOpen={isOpen}
          onClose={closeModal}
          onAdd={handleAddProject}
          consultants={consultants}
          allProjects={projects}
        />
      </div>
      <BatchUploadModal
        isOpen={isBatchUploadOpen}
        onClose={() => setIsBatchUploadOpen(false)}
        onSuccess={() => {
          setIsBatchUploadOpen(false)
        }}
      />
    </div>
  )
}

