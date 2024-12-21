"use client"

import { useState, useEffect } from 'react'
import { Project, Consultant } from '@/types'
import Timeline from './Timeline'
import AddProjectModal from './AddProjectModal'
import { useSession } from 'next-auth/react'
import { useProjectModal } from '@/hooks/useProjectModal'
import { GradientButton } from '@/components/GradientButton'
import { useProjectDelete } from '@/hooks/useProjectDelete'

export default function TimelineDashboard() {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const { isOpen, openModal, closeModal } = useProjectModal()
  const { isDeleting, deleteProject } = useProjectDelete(
    (projectId) => {
      setProjects(prev => prev.filter(p => p.id !== projectId))
      console.log('Project deleted:', projectId)
    }
  )

  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
    
    if (status !== 'authenticated') return

    const fetchData = async () => {
      try {
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
      }
    }

    fetchData()
  }, [session, status])

  const handleAddProject = async (newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      })

      if (!response.ok) throw new Error('Failed to add project')

      const addedProject: Project = await response.json()
      setProjects([...projects, addedProject])
      closeModal()
    } catch (error) {
      console.error('Error adding project:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Timeline</h2>
        <GradientButton 
          onClick={() => openModal()} 
          label="Add Project" 
        />
      </div>      
        
      <Timeline 
        projects={projects} 
        consultants={consultants}
        columns={['Discussions', 'Sold', 'Started', 'Completed']}
        onDelete={async (projectId) => {
          await deleteProject(projectId)
        }}
      />
      <div className="flex justify-start">
        <GradientButton 
          onClick={() => openModal()} 
          label="Add Project" 
        />
      </div>
      <AddProjectModal
        isOpen={isOpen}
        onClose={closeModal}
        onAdd={handleAddProject}
      />
    </div>
  )
}

