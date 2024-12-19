import { Project, Consultant } from '@/types'

export const isConsultantAvailable = (
  consultant: Consultant,
  project: Project,
  allProjects: Project[]
): boolean => {
  const projectStart = new Date(project.startDate)
  const projectEnd = new Date(project.endDate)

  // Get all projects assigned to this consultant
  const consultantProjects = allProjects.filter(p => 
    p.assignedConsultants.some(ac => ac.id === consultant._id || ac.id === consultant.id)
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