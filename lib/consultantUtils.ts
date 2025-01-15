import { Consultant, Project } from '@/types'

export function getCurrentAssignment(consultant: Consultant, projects: Project[]): Project | null {
  if (!consultant.assignments?.length || !projects.length) return null
  
  const today = new Date()
  
  return projects.find(project => {
    const assignment = consultant.assignments.find(a => a.projectId === project.id)
    if (!assignment) return false
    
    const startDate = new Date(project.startDate)
    const endDate = new Date(project.endDate)
    return startDate <= today && endDate >= today
  }) || null
}

export function getNextAssignment(consultant: Consultant, projects: Project[]): Project | null {
  if (!consultant.assignments?.length || !projects.length) return null
  
  const today = new Date()
  
  return projects
    .filter(project => {
      const assignment = consultant.assignments.find(a => a.projectId === project.id)
      if (!assignment) return false
      
      const startDate = new Date(project.startDate)
      return startDate > today
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0] || null
}

// Calculate the percentage of time the consultant is available for new assignments
export function getConsultantAvailability(consultant: Consultant, projects: Project[]): number {
  if (!consultant.assignments?.length) return 100
  
  const today = new Date()
  let totalPercentage = 0
  
  consultant.assignments.forEach(assignment => {
    const project = projects.find(p => p.id === assignment.projectId)
    if (!project) return
    
    const startDate = new Date(project.startDate)
    const endDate = new Date(project.endDate)
    
    if (startDate <= today && endDate >= today) {
      totalPercentage += assignment.percentage
    }
  })
  
  return Math.max(0, 100 - totalPercentage)
}

export function getConsultantAvailabilityAtDate(
  consultant: Consultant, 
  projects: Project[],
  date: Date
): number {
  if (!consultant.assignments?.length) return 100
  
  let totalPercentage = 0
  
  consultant.assignments.forEach(assignment => {
    const project = projects.find(p => p.id === assignment.projectId)
    if (!project) return
    
    const startDate = new Date(project.startDate)
    const endDate = new Date(project.endDate)
    
    if (startDate <= date && endDate >= date) {
      totalPercentage += assignment.percentage
    }
  })
  
  return Math.max(0, 100 - totalPercentage)
} 