"use client"

import { useState } from 'react'
import { Project, Consultant, ProjectStatus } from '@/types'
import ProjectKanban from './ProjectKanban'
import AddProjectModal from './AddProjectModal'
import { Button } from '@/components/ui/button'
import { mockProjects, mockConsultants } from '@/lib/mockData'



export default function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [consultants] = useState<Consultant[]>(mockConsultants)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const updateProjectStatus = (projectId: string, newStatus: ProjectStatus) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId ? { ...project, status: newStatus } : project
      )
    )
  }

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
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error adding project:', error)
      // Handle error (e.g., show an error message to the user)
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

