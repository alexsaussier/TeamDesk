"use client"

import { useState } from 'react'
import { Consultant, Project, ProjectStatus } from '@/types'
import ConsultantCarousel from './ConsultantCarousel'
import ProjectKanban from './ProjectKanban'



export default function Dashboard() {
  const [consultants, setConsultants] = useState<Consultant[]>(mockConsultants)
  const [projects, setProjects] = useState<Project[]>(mockProjects)

  const assignConsultant = (consultantId: string, projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    setConsultants(prevConsultants =>
      prevConsultants.map(consultant => {
        if (consultant.id === consultantId) {
          const newAssignment: Assignment = {
            projectId,
            projectName: project.name,
            startDate: project.startDate,
            endDate: project.endDate,
          }

          if (!consultant.assignments) {
            return {
              ...consultant,
              currentAssignment: newAssignment,
            }
          } else {
            return {
              ...consultant,
              futureAssignments: [...consultant.futureAssignments, newAssignment],
            }
          }
        }
        return consultant
      })
    )

    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId
          ? { ...p, assignedConsultants: [...p.assignedConsultants, consultantId] }
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

  return (
    <div className="flex gap-6">
      <div className="w-1/3">
        <ConsultantCarousel consultants={consultants} />
      </div>
      <div className="w-2/3">
        <ProjectKanban 
          projects={projects} 
          consultants={consultants} 
          onAssign={assignConsultant}
          onUpdateStatus={updateProjectStatus}
        />
      </div>
    </div>
  )
}

