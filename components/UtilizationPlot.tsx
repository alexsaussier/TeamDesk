"use client"

import { useMemo } from 'react'
import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

interface UtilizationPlotProps {
  consultants: Consultant[]
  projects: Project[]
}

interface UtilizationData {
  date: string
  officialUtilization: number
  expectedUtilization: number
}

const calculateUtilization = (
  consultants: Consultant[], 
  projects: Project[], 
  date: Date,
  includeExpected: boolean
): number => {
  const totalConsultants = consultants.length
  let assignedConsultants = 0
  const today = new Date()
  const isCurrentMonth = date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()

  consultants.forEach(consultant => {
    if (consultant.assignments) {
      consultant.assignments.forEach(assignmentId => {
        const project = projects.find(p => p.id.toString() === assignmentId.toString())
        
        //if the worker is assigned to a project and the project is active
        if (project && 
            new Date(project.startDate) <= date && 
            new Date(project.endDate) >= date) {
          // For current month's official utilization, only count 'started' projects
          console.log("project status: ", project.status)
          console.log("isCurrentMonth: ", isCurrentMonth)
          if (isCurrentMonth && !includeExpected && project.status === 'Started') {
            assignedConsultants++
            console.log("assignedConsultants: ", assignedConsultants)
            return
          }
          // For future official utilization, count 'started' projects
          if (!isCurrentMonth && !includeExpected && ['Started'].includes(project.status)) {
            assignedConsultants++
            return
          }
          // For expected utilization, count all three states
          if (includeExpected && ['Started', 'Sold', 'Discussion'].includes(project.status)) {
            assignedConsultants++
            return
          }
        }
      })
    }
  })

  return (assignedConsultants / totalConsultants) * 100
}

const generateUtilizationData = (consultants: Consultant[], projects: Project[]): UtilizationData[] => {
  const today = new Date()
  const data: UtilizationData[] = []

  // Generate data for the current month and next 6 months
  for (let i = 0; i <= 6; i++) {
    const currentDate = new Date(today.getFullYear(), today.getMonth() + i, 1) // First day of each month
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      officialUtilization: calculateUtilization(consultants, projects, currentDate, false),
      expectedUtilization: calculateUtilization(consultants, projects, currentDate, true)
    })
  }

  return data
}

export default function UtilizationPlot({ consultants, projects }: UtilizationPlotProps) {
  const utilizationData = useMemo(() => generateUtilizationData(consultants, projects), [consultants, projects])

  console.log('Utilization data:', utilizationData)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Utilization Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            officialUtilization: {
              label: "Official Utilization",
              color: "var(--color-utilization)",
            },
            expectedUtilization: {
              label: "Expected Utilization",
              color: "var(--color-utilization)",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={utilizationData} 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleString('default', { month: 'short' })
                }}
              />
              <YAxis 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="officialUtilization" 
                stroke="var(--color-utilization)" 
                name="Official Utilization" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="expectedUtilization" 
                stroke="var(--color-utilization)" 
                strokeDasharray="5 5"
                strokeOpacity={0.5}
                name="Expected Utilization" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

