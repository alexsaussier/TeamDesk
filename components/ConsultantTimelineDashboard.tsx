"use client"

import { useState, useEffect } from 'react'
import { Project, Consultant, ProjectStatus } from '@/types'
import ConsultantTimeline from './ConsultantTimeline' // We will create this next
import { useSession } from 'next-auth/react'
import { Spinner } from "@/components/ui/spinner"
import { ProjectDetailsModal } from './ProjectDetailsModal'
import { useProjectDelete } from '@/hooks/useProjectDelete' // Assuming we might want to delete/edit projects from here
import { GradientButton } from "@/components/GradientButton"
import { Upload } from 'lucide-react'
import AddConsultantModal from './AddConsultantModal'
import { BatchUploadModal } from './BatchUploadModal'
import EmptyWorkforceState from './EmptyWorkforceState'

export default function ConsultantTimelineDashboard() {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null) // For ProjectDetailsModal
  const [isAddConsultantModalOpen, setIsAddConsultantModalOpen] = useState(false)
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false)

  // Placeholder for project deletion logic, adapt if needed
  const { deleteProject } = useProjectDelete(
    (projectId) => {
      setProjects(prev => prev.filter(p => p.id !== projectId))
      // Potentially refresh consultant data or projects list if an assignment changes
      fetchData() // Re-fetch all data for simplicity
    }
  )

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [projectsResponse, consultantsResponse] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/workforce')
      ])

      if (!projectsResponse.ok) throw new Error('Failed to fetch projects')
      if (!consultantsResponse.ok) throw new Error('Failed to fetch consultants')

      const [projectsData, consultantsData] = await Promise.all([
        projectsResponse.json(),
        consultantsResponse.json()
      ])

      setProjects(projectsData)
      setConsultants(consultantsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [session, status])

  const handleAddConsultant = async () => {
    try {
      await fetchData() // Fetch fresh data after adding
      setIsAddConsultantModalOpen(false)
    } catch (error) {
      console.error('Error in handleAddConsultant:', error)
      // Error handling can be more specific if needed
    }
  }

  // Placeholder handlers for modal interactions - adapt as needed from ProjectDetailsModal
  const handleAssignConsultantToProject = async (consultantId: string, projectId: string) => {
    // Logic to assign a consultant to a project
    // This might involve an API call and then refreshing data
    console.log(`Assign consultant ${consultantId} to project ${projectId}`)
    await fetch(`/api/projects/${projectId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultantId }),
    });
    fetchData(); // Re-fetch to update UI
  }

  const handleUnassignConsultantFromProject = async (consultantId: string, projectId: string) => {
    // Logic to unassign a consultant
    console.log(`Unassign consultant ${consultantId} from project ${projectId}`)
    await fetch(`/api/projects/${projectId}/unassign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultantId }),
    });
    fetchData(); // Re-fetch
  }

  const handleUpdateProjectStatus = async (projectId: string, newStatus: ProjectStatus) => {
    // Logic to update project status
    console.log(`Update project ${projectId} to status ${newStatus}`)
    await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchData(); // Re-fetch
  }
  
  const handleUpdateProjectChanceToClose = async (projectId: string, chanceToClose: number) => {
    console.log(`Update project ${projectId} chance to close ${chanceToClose}%`)
    await fetch(`/api/projects/${projectId}/chance-to-close`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chanceToClose })
    });
    fetchData(); // Re-fetch
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workforce Timeline</h2>
        <div className="flex gap-2">
          <GradientButton 
            onClick={() => setIsAddConsultantModalOpen(true)}
            label="Add Consultant"
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
              <p className="text-sm text-gray-600">Loading workforce data...</p>
            </div>
          </div>
        )}
        
        {!isLoading && consultants.length === 0 && (
          <EmptyWorkforceState 
            variant="timeline"
            onAddConsultant={() => setIsAddConsultantModalOpen(true)}
            onBatchUpload={() => setIsBatchUploadOpen(true)}
          />
        )}
        
        {!isLoading && consultants.length > 0 && (
          <ConsultantTimeline 
            consultants={consultants} 
            projects={projects}
            onProjectClick={(project) => setSelectedProject(project)}
          />
        )}
      </div>

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          consultants={consultants} // Full list of consultants for assignment suggestions
          allProjects={projects}    // Full list of projects
          isOpen={selectedProject !== null}
          onClose={() => setSelectedProject(null)}
          onAssign={handleAssignConsultantToProject}
          onUpdateStatus={handleUpdateProjectStatus}
          onDelete={async (projectId) => {
            await deleteProject(projectId)
            setSelectedProject(null) // Close modal after delete
          }}
          onUnassign={handleUnassignConsultantFromProject}
          columns={['Discussions', 'Sold', 'Started', 'Completed']} // Or fetch dynamically
          onUpdateChanceToClose={handleUpdateProjectChanceToClose}
        />
      )}

      <AddConsultantModal
        isOpen={isAddConsultantModalOpen}
        onClose={() => setIsAddConsultantModalOpen(false)}
        onAdd={handleAddConsultant}
      />

      <BatchUploadModal
        isOpen={isBatchUploadOpen}
        onClose={() => setIsBatchUploadOpen(false)}
        onSuccess={() => {
          setIsBatchUploadOpen(false)
          fetchData()
        }}
      />
    </div>
  )
} 