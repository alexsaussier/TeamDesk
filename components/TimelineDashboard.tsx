"use client"

import { useState, useEffect } from 'react'
import { Project, Consultant } from '@/types'
import Timeline from './Timeline'
import { Button } from '@/components/ui/button'
import AddProjectModal from './AddProjectModal'
import { useSession } from 'next-auth/react'
import { useProjectModal } from '@/hooks/useProjectModal'

export default function TimelineDashboard() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const { isOpen, openModal, closeModal } = useProjectModal()

  useEffect(() => {
    if (!session) return

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
  }, [session])

  const handleAddProject = async (newProject: Omit<Project, 'id'>) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      })

      if (!response.ok) {
        throw new Error('Failed to add project')
      }

      const addedProject: Project = await response.json()
      setProjects([...projects, addedProject])
      closeModal()
    } catch (error) {
      console.error('Error adding project:', error)
    }
  }

  const handleAssign = async (consultantId: string, projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consultantId }),
      })
      if (!response.ok) {
        throw new Error('Failed to assign consultant')
      }
      
      // Refresh data after assignment
      const projectsResponse = await fetch('/api/projects')
      const projectsData = await projectsResponse.json()
      setProjects(projectsData)
    } catch (error) {
      console.error('Error assigning consultant:', error)
    }
  }

  const handleStatusUpdate = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Refresh projects after status update
      const projectsResponse = await fetch('/api/projects')
      const projectsData = await projectsResponse.json()
      setProjects(projectsData)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Timeline</h2>
      <Timeline 
        projects={projects} 
        consultants={consultants}
        columns={['Discussions', 'Sold', 'Started', 'Completed']}
      />
      <div className="flex justify-start">
        <Button onClick={() => openModal()}>Add Project</Button>
      </div>
      <AddProjectModal
        isOpen={isOpen}
        onClose={closeModal}
        onAdd={handleAddProject}
      />
    </div>
  )
}

