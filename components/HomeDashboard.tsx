"use client"

import { useState } from 'react'
import { Consultant, Project } from '@/types'
import UtilizationPlot from './UtilizationPlot'
import StatsGrid from './StatsGrid'

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
    startDate: '2023-10-01',
    endDate: '2023-11-30',
    assignedConsultants: ['3'],
    status: 'Discussions',
  },
]

export default function HomeDashboard() {
  const [consultants] = useState<Consultant[]>(mockConsultants)
  const [projects] = useState<Project[]>(mockProjects)

  return (
    <div className="space-y-6">
      <StatsGrid consultants={consultants} projects={projects} />
      <UtilizationPlot consultants={consultants} projects={projects} />
    </div>
  )
}

