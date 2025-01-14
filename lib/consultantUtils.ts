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