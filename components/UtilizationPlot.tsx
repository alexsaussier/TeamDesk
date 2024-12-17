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

  console.log("Calculating utilization at date: ", date)

  //NEED TO CHANGE THIS METHOD - ITERATE BY PROJECT AND INCREMENT FTEE NEED, INSTEAD OF ITERATING CONSULTANTS
  consultants.forEach(consultant => {
    if (consultant.assignments) {
      console.log("consultant: ", consultant)
      consultant.assignments.forEach(assignmentId => {
        const project = projects.find(p => p.id.toString() === assignmentId.toString())
        console.log("looking for project with id: ", assignmentId, " ", project?.name)
        console.log("project start date: ", project?.startDate)
        console.log("project end date: ", project?.endDate)
        console.log("date: ", date)
        
        if (project && 
            new Date(project.startDate) <= date && 
            new Date(project.endDate) >= date) {
          // For current month's official utilization, only count 'started' projects
          if (isCurrentMonth && !includeExpected && project.status === 'Started') {
            assignedConsultants++
            console.log("incremented assignedConsultants")
          }
          // For future official utilization, count 'started' projects
          else if (!isCurrentMonth && !includeExpected && ['Started'].includes(project.status)) {
            assignedConsultants++
            console.log("incremented assignedConsultants")
          }
          // For expected utilization, count all three states
          else if (includeExpected && ['Started', 'Sold', 'Discussion'].includes(project.status)) {
            assignedConsultants++
            console.log("incremented assignedConsultants for expected utilization")
          }
        }
      })
    }
  })

  console.log("assignedConsultants at this date: ", assignedConsultants)
  console.log("totalConsultants: ", totalConsultants)
  console.log("utilization: ", (assignedConsultants / totalConsultants) * 100)
  console.log("--------------NEXT DATE------------------")

  return (assignedConsultants / totalConsultants) * 100
}

const generateUtilizationData = (consultants: Consultant[], projects: Project[]): UtilizationData[] => {
  const today = new Date()
  const data: UtilizationData[] = []

  // Start with today
  data.push({
    date: today.toISOString().split('T')[0],
    officialUtilization: calculateUtilization(consultants, projects, today, false),
    expectedUtilization: calculateUtilization(consultants, projects, today, true)
  })

  // Then add first day of next 6 months
  for (let i = 1; i <= 6; i++) {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth() + i, 2)
   
    
    data.push({
      date: firstOfMonth.toISOString().split('T')[0],
      officialUtilization: calculateUtilization(consultants, projects, firstOfMonth, false),
      expectedUtilization: calculateUtilization(consultants, projects, firstOfMonth, true)
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
            officialUtilization: {
              label: "Official Utilization",
              color: "#2563eb",
            },
            expectedUtilization: {
              label: "Expected Utilization",
              color: "#93c5fd",
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
                stroke="#2563eb"
                name="Official Utilization" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="expectedUtilization" 
                stroke="#93c5fd"
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

