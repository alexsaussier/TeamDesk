"use client"

import { useState, useEffect } from 'react'
import { Project, Consultant } from '@/types'
import Timeline from './Timeline'
import { Button } from '@/components/ui/button'
import AddProjectModal from './AddProjectModal'
import { useSession } from 'next-auth/react'
import { useProjectModal } from '@/hooks/useProjectModal'
import { PlusCircle } from 'lucide-react'

export default function TimelineDashboard() {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const { isOpen, openModal, closeModal } = useProjectModal()

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
      <h2 className="text-2xl font-bold">Timeline</h2>
      <Timeline 
        projects={projects} 
        consultants={consultants}
        columns={['Discussions', 'Sold', 'Started', 'Completed']}
      />
      <div className="flex justify-start">
        <Button onClick={() => openModal()}> <PlusCircle /> Add Project</Button>
      </div>
      <AddProjectModal
        isOpen={isOpen}
        onClose={closeModal}
        onAdd={handleAddProject}
      />
    </div>
  )
}

