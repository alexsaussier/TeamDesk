import { Project, Consultant } from '@/types'

interface UtilizationMetrics {
  current: number
  target: number
  delta: number
}

interface UtilizationPeriods {
  ytd: UtilizationMetrics
  qtd: UtilizationMetrics
  mtd: UtilizationMetrics
  wtd: UtilizationMetrics
  lastTwelveMonths: number[]
  averageLastYear: number
}

export const calculatePeriodUtilization = (
  consultants: Consultant[],
  projects: Project[],
  startDate: Date,
  endDate: Date
): number => {
  const totalConsultants = consultants.length
  if (totalConsultants === 0) return 0

  let totalAssignedDays = 0
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)

  consultants.forEach(consultant => {
    consultant.assignments.forEach(assignment => {
      const project = projects.find(p => p.id.toString() === assignment.projectId.toString())
      if (!project || project.status !== 'Started') return

      const projectStart = new Date(project.startDate)
      const projectEnd = new Date(project.endDate)
      
      if (projectStart <= endDate && projectEnd >= startDate) {
        const overlapStart = projectStart > startDate ? projectStart : startDate
        const overlapEnd = projectEnd < endDate ? projectEnd : endDate
        const assignedDays = Math.max(1, Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1) * (assignment.percentage / 100)
        totalAssignedDays += assignedDays
      }
    })
  })

  return (totalAssignedDays / (totalConsultants * totalDays)) * 100
}

export const calculateUtilizationMetrics = (
  consultants: Consultant[],
  projects: Project[],
  targetUtilization: number = 75 // Default target
): UtilizationPeriods => {
  const today = new Date()
  
  // Calculate period start dates
  const startOfYear = new Date(today.getFullYear(), 0, 1)
  const startOfQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startOfWeek = new Date(today.getTime() - ((today.getDay() || 7) - 1) * 24 * 60 * 60 * 1000)

  // Calculate historical monthly utilization
  const lastTwelveMonths = Array.from({ length: 12 }, (_, i) => {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0)
    return calculatePeriodUtilization(consultants, projects, monthStart, monthEnd)
  }).reverse()

  const averageLastYear = lastTwelveMonths.reduce((a, b) => a + b, 0) / 12

  // Helper function to calculate metrics for a period
  const calculateMetrics = (startDate: Date) => {
    const current = calculatePeriodUtilization(consultants, projects, startDate, today)
    return {
      current,
      target: targetUtilization,
      delta: current - targetUtilization
    }
  }

  return {
    ytd: calculateMetrics(startOfYear),
    qtd: calculateMetrics(startOfQuarter),
    mtd: calculateMetrics(startOfMonth),
    wtd: calculateMetrics(startOfWeek),
    lastTwelveMonths,
    averageLastYear
  }
} 