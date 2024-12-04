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
  utilization: number
}

const calculateUtilization = (consultants: Consultant[], projects: Project[], date: Date): number => {
  const totalConsultants = consultants.length
  let assignedConsultants = 0

  consultants.forEach(consultant => {
    if (consultant.assignments && 
        new Date(consultant.assignments[0].startDate) <= date && 
        new Date(consultant.assignments[0].endDate) >= date) {
      assignedConsultants++
    } else {
      consultant.assignments?.slice(1).forEach(assignment => {
        if (new Date(assignment.startDate) <= date && new Date(assignment.endDate) >= date) {
          assignedConsultants++
        }
      })
    }
  })

  return (assignedConsultants / totalConsultants) * 100
}

const generateUtilizationData = (consultants: Consultant[], projects: Project[]): UtilizationData[] => {
  const today = new Date()
  const sixMonthsLater = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate())
  const data: UtilizationData[] = []

  for (let d = new Date(today); d <= sixMonthsLater; d.setDate(d.getDate() + 1)) {
    data.push({
      date: d.toISOString().split('T')[0],
      utilization: calculateUtilization(consultants, projects, d)
    })
  }

  return data
}

export default function UtilizationPlot({ consultants, projects }: UtilizationPlotProps) {
  const utilizationData = useMemo(() => generateUtilizationData(consultants, projects), [consultants, projects])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Utilization Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            utilization: {
              label: "Utilization",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={utilizationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="utilization" 
                stroke="var(--color-utilization)" 
                name="Utilization" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

