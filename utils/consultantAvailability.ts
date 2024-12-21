import { Project, Consultant } from '@/types'

export const checkConsultantAvailability = (
  consultant: Consultant,
  project: Project,
  allProjects: Project[]
): { isAvailable: boolean; hasConflicts: boolean } => {
  const projectStart = new Date(project.startDate)
  const projectEnd = new Date(project.endDate)

  // Get all projects assigned to this consultant
  const consultantProjects = allProjects.filter(p => 
    p.assignedConsultants.some(ac => ac.id === consultant._id || ac.id === consultant.id)
  )

  const hasConflicts = consultantProjects.some(assignedProject => {
    const assignedStart = new Date(assignedProject.startDate)
    const assignedEnd = new Date(assignedProject.endDate)

    return (
      (projectStart <= assignedEnd && projectEnd >= assignedStart) ||
      (assignedStart <= projectEnd && assignedEnd >= projectStart)
    )
  })

  return {
    isAvailable: !hasConflicts,
    hasConflicts
  }
} 