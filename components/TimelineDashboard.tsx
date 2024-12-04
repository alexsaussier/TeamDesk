"use client"

import { useState } from 'react'
import { Consultant, Project } from '@/types'
import Timeline from './Timeline'
import { mockConsultants, mockProjects } from '@/lib/mockData'
import { Button } from '@/components/ui/button'
import AddProjectModal from './AddProjectModal'



export default function TimelineDashboard() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Timeline</h2>
      <Timeline projects={projects} />
      <div className="flex justify-start">
        <Button onClick={() => setIsModalOpen(true)}>Add Project</Button>
      </div>
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProject}
      />
    </div>
  )
}

