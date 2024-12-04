"use client"

import { useState } from 'react'
import { Consultant, Project, Assignment, ProjectStatus } from '@/types'
import ConsultantCarousel from './ConsultantCarousel'
import ProjectKanban from './ProjectKanban'

const mockConsultants: Consultant[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    skills: ['Strategy', 'Finance'],
    currentAssignment: {
      projectId: '1',
      projectName: 'Strategic Review',
      startDate: '2023-06-15',
      endDate: '2023-07-31',
    },
    futureAssignments: [
      {
        projectId: '3',
        projectName: 'Financial Analysis',
        startDate: '2023-08-15',
        endDate: '2023-09-30',
      },
    ],
  },
  {
    id: '2',
    name: 'Bob Smith',
    skills: ['Technology', 'Operations'],
    currentAssignment: null,
    futureAssignments: [
      {
        projectId: '2',
        projectName: 'Tech Transformation',
        startDate: '2023-07-15',
        endDate: '2023-09-15',
      },
    ],
  },
  {
    id: '3',
    name: 'Charlie Brown',
    skills: ['Marketing', 'Digital'],
    currentAssignment: null,
    futureAssignments: [],
  },
]

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Strategic Review',
    requiredSkills: ['Strategy', 'Finance'],
    startDate: '2023-06-15',
    endDate: '2023-07-31',
    assignedConsultants: ['1'],
    status: 'Started',
  },
  {
    id: '2',
    name: 'Tech Transformation',
    requiredSkills: ['Technology', 'Operations'],
    startDate: '2023-07-15',
    endDate: '2023-09-15',
    assignedConsultants: ['2'],
    status: 'Sold',
  },
  {
    id: '3',
    name: 'Financial Analysis',
    requiredSkills: ['Finance', 'Strategy'],
    startDate: '2023-08-15',
    endDate: '2023-09-30',
    assignedConsultants: ['1'],
    status: 'Discussions',
  },
  {
    id: '4',
    name: 'Digital Marketing Campaign',
    requiredSkills: ['Marketing', 'Digital'],
    startDate: '2023-06-01',
    endDate: '2023-06-30',
    assignedConsultants: ['3'],
    status: 'Completed',
  },
]

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

          if (!consultant.currentAssignment) {
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

