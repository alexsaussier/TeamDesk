import { Consultant, Project } from '@/types'
import { calculateUtilizationMetrics } from './utilizationMetrics'

export interface FinancialMetrics {
  totalAnnualSalaries: number
  averageSalary: number
  medianSalary: number
  highestSalary: {
    amount: number
    consultant: Consultant
  }
  lowestSalary: {
    amount: number
    consultant: Consultant
  }
  salaryByLevel: {
    [key: string]: {
      total: number
      average: number
      count: number
    }
  }
  utilizationCorrelation: {
    highUtilization: {
      averageSalary: number
      consultantCount: number
    }
    lowUtilization: {
      averageSalary: number
      consultantCount: number
    }
  }
  totalWorkforceCost: {
    annual: number
    monthly: number
    breakdown: {
      salaries: number
      benefits: number
      overhead: number
    }
  }
  monthlyBurnRate: number
}

//const BENEFIT_RATE = 0.30  // 30% of salary for benefits
//const OVERHEAD_RATE = 0.20 // 20% of salary for overhead costs

export const calculateTotalWorkforceCost = (consultants: Consultant[]): {
  annual: number
  monthly: number
  breakdown: {
    salaries: number
    benefits: number
    overhead: number
  }
} => {
  const totalSalaries = consultants.reduce((sum, c) => sum + c.salary, 0)
  const totalBenefits = 0 // totalSalaries * BENEFIT_RATE
  const totalOverhead = 0 // totalSalaries * OVERHEAD_RATE
  const annualTotal = totalSalaries + totalBenefits + totalOverhead

  return {
    annual: annualTotal,
    monthly: annualTotal / 12,
    breakdown: {
      salaries: totalSalaries,
      benefits: totalBenefits,
      overhead: totalOverhead
    }
  }
}

export const calculateFinancialMetrics = (
  consultants: Consultant[],
  projects: Project[]
): FinancialMetrics => {
  if (!consultants.length) {
    return {
      totalAnnualSalaries: 0,
      averageSalary: 0,
      medianSalary: 0,
      highestSalary: { amount: 0, consultant: {} as Consultant },
      lowestSalary: { amount: 0, consultant: {} as Consultant },
      salaryByLevel: {},
      utilizationCorrelation: {
        highUtilization: { averageSalary: 0, consultantCount: 0 },
        lowUtilization: { averageSalary: 0, consultantCount: 0 }
      },
      totalWorkforceCost: {
        annual: 0,
        monthly: 0,
        breakdown: {
          salaries: 0,
          benefits: 0,
          overhead: 0
        }
      },
      monthlyBurnRate: 0
    }
  }

  // Sort consultants by salary for various calculations
  const sortedBySalary = [...consultants].sort((a, b) => a.salary - b.salary)

  // Calculate median salary
  const mid = Math.floor(sortedBySalary.length / 2)
  const medianSalary = sortedBySalary.length % 2 === 0
    ? (sortedBySalary[mid - 1].salary + sortedBySalary[mid].salary) / 2
    : sortedBySalary[mid].salary

  // Calculate salary by level
  const salaryByLevel = consultants.reduce((acc, consultant) => {
    if (!acc[consultant.level]) {
      acc[consultant.level] = { total: 0, count: 0, average: 0 }
    }
    acc[consultant.level].total += consultant.salary
    acc[consultant.level].count++
    acc[consultant.level].average = acc[consultant.level].total / acc[consultant.level].count
    return acc
  }, {} as FinancialMetrics['salaryByLevel'])

  // Calculate total workforce cost
  const totalWorkforceCost = calculateTotalWorkforceCost(consultants)

  // Use existing utilization calculation
  const utilizationMetrics = calculateUtilizationMetrics(consultants, projects)
  const utilizationThreshold = 75

  // Group consultants by utilization using the yearly average
  const consultantsWithUtilization = consultants.map(consultant => ({
    ...consultant,
    utilization: calculateUtilizationMetrics([consultant], projects).averageLastYear
  }))

  const highUtilizationConsultants = consultantsWithUtilization
    .filter(c => c.utilization >= utilizationThreshold)
  const lowUtilizationConsultants = consultantsWithUtilization
    .filter(c => c.utilization < utilizationThreshold)

  return {
    totalAnnualSalaries: consultants.reduce((sum, c) => sum + c.salary, 0),
    averageSalary: consultants.reduce((sum, c) => sum + c.salary, 0) / consultants.length,
    medianSalary,
    highestSalary: {
      amount: sortedBySalary[sortedBySalary.length - 1].salary,
      consultant: sortedBySalary[sortedBySalary.length - 1]
    },
    lowestSalary: {
      amount: sortedBySalary[0].salary,
      consultant: sortedBySalary[0]
    },
    salaryByLevel,
    utilizationCorrelation: {
      highUtilization: {
        averageSalary: highUtilizationConsultants.reduce((sum, c) => sum + c.salary, 0) / 
                      (highUtilizationConsultants.length || 1),
        consultantCount: highUtilizationConsultants.length
      },
      lowUtilization: {
        averageSalary: lowUtilizationConsultants.reduce((sum, c) => sum + c.salary, 0) / 
                      (lowUtilizationConsultants.length || 1),
        consultantCount: lowUtilizationConsultants.length
      }
    },
    totalWorkforceCost,
    monthlyBurnRate: totalWorkforceCost.monthly
  }
} 