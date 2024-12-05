"use client"

import { useState, useEffect } from 'react'
import { Project, Consultant, ProjectStatus } from '@/types'
import ProjectKanban from './ProjectKanban'
import AddProjectModal from './AddProjectModal'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'

export default function ProjectDashboard() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!session) return

    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsResponse = await fetch('/api/projects')
        if (!projectsResponse.ok) throw new Error('Failed to fetch projects')
        const projectsData = await projectsResponse.json()
        setProjects(projectsData)

        // Fetch consultants
        const consultantsResponse = await fetch('/api/workforce')
        if (!consultantsResponse.ok) throw new Error('Failed to fetch consultants')
        const consultantsData = await consultantsResponse.json()
        setConsultants(consultantsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [session])

  const assignConsultant = (consultantId: string, projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId
          ? { 
              ...p, 
              assignedConsultants: [
                ...p.assignedConsultants, 
                consultants.find(c => c.id === consultantId) as Consultant
              ] 
            }
          : p
      )
    )
  }

  const updateProjectStatus = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update project status')
      }

      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId ? { ...project, status: newStatus } : project
        )
      )
    } catch (error) {
      console.error('Error updating project status:', error)
      // You might want to add error handling UI here
    }
  }

  const handleAddProject = async (newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>) => {
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
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error adding project:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Button onClick={() => setIsModalOpen(true)}>Add Project</Button>
      </div>
      <ProjectKanban 
        projects={projects} 
        consultants={consultants} 
        onAssign={assignConsultant}
        onUpdateStatus={updateProjectStatus}
      />
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProject}
      />
    </div>
  )
}

