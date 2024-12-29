"use client"

import { useState, useEffect } from 'react'
import { Project, Consultant, ProjectStatus } from '@/types'
import ProjectKanban from './ProjectKanban'
import { AddProjectModal } from './AddProjectModal'
import { useSession } from 'next-auth/react'
import { useProjectModal } from '@/hooks/useProjectModal'
import { GradientButton } from '@/components/GradientButton'
import { useProjectDelete } from '@/hooks/useProjectDelete'

export default function ProjectDashboard() {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const { isOpen, openModal, closeModal } = useProjectModal()
  const { deleteProject: deleteProjectAction } = useProjectDelete(
    (projectId) => setProjects(prev => prev.filter(p => p.id !== projectId))
  )

  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
    
    if (status !== 'authenticated') return

    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsResponse = await fetch('/api/projects')
        if (!projectsResponse.ok) throw new Error('Failed to fetch projects')
        const projectsData = await projectsResponse.json()
        console.log('Fetched projects:', projectsData)

        // Fetch consultants
        const consultantsResponse = await fetch('/api/workforce')
        if (!consultantsResponse.ok) throw new Error('Failed to fetch consultants')
        const consultantsData = await consultantsResponse.json()
        console.log('Fetched consultants:', consultantsData)

        setProjects(projectsData)
        setConsultants(consultantsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [session, status])

  const assignConsultant = async (consultantId: string, projectId: string) => {
    try {
      console.log('Making API request with:', { consultantId, projectId });
      
      const response = await fetch(`/api/projects/${projectId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consultantId }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.log('API error response:', error);
        throw new Error(error.error)
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
      console.error('Error assigning consultant:', error)
      // You might want to add error handling UI here
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

      const data = await response.json()
      const addedProject: Project = {
        ...data,
        id: data.id || data._id, // Convert _id to id if needed
      }
      setProjects([...projects, addedProject])
      closeModal()
    } catch (error) {
      console.error('Error adding project:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Kanban</h2>
        <GradientButton 
          onClick={() => openModal()} 
          label="Add Project" 
        />
      </div>
      <ProjectKanban 
        projects={projects} 
        consultants={consultants} 
        onAssign={assignConsultant}
        onUnassign={unassignConsultant}
        onUpdateStatus={updateProjectStatus}
        onDelete={async (projectId) => {
          await deleteProjectAction(projectId)
        }}
      />
      <AddProjectModal
        isOpen={isOpen}
        onClose={closeModal}
        onAdd={handleAddProject}
      />
    </div>
  )
}

