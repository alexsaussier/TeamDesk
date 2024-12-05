import { Project, Consultant } from '@/types'

interface BaseProject {
  id: string
  startDate: string
  endDate: string
}

export const isConsultantAvailable = (
  consultant: Consultant,
  project: BaseProject,
  allProjects: BaseProject[]
): boolean => {
  const projectStart = new Date(project.startDate)
  const projectEnd = new Date(project.endDate)

  // Get all projects assigned to this consultant
  const consultantProjects = allProjects.filter(p => 
    consultant.assignments?.includes(p.id)
  )

  // Check for overlap with any existing assignments
  return !consultantProjects.some(assignedProject => {
    const assignedStart = new Date(assignedProject.startDate)
    const assignedEnd = new Date(assignedProject.endDate)

    return (
      (projectStart <= assignedEnd && projectEnd >= assignedStart) ||
      (assignedStart <= projectEnd && assignedEnd >= projectStart)
    )
  })
} 