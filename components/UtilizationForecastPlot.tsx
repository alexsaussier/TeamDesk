"use client"

import { useMemo } from 'react'
import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import ConsultantUtilizationChart from './ConsultantUtilizationChart'

interface UtilizationPlotProps {
  consultants: Consultant[]
  projects: Project[]
}

interface UtilizationData {
  date: string
  officialUtilization: number
  expectedUtilization: number
  target: number
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


  //NEED TO CHANGE THIS METHOD - ITERATE BY PROJECT AND INCREMENT FTEE NEED, INSTEAD OF ITERATING CONSULTANTS
  consultants.forEach(consultant => {
    if (consultant.assignments) {
      consultant.assignments.forEach(assignment => {
        const project = projects.find(p => p.id.toString() === assignment.projectId.toString())
        
        if (project && 
          new Date(project.startDate) <= date && 
          new Date(project.endDate) >= date) {

          // For current month's official utilization, only count 'started' projects
          if (isCurrentMonth && !includeExpected && project.status === 'Started') {
            assignedConsultants++
          }
          // For future official utilization, count 'started' projects
          else if (!isCurrentMonth && !includeExpected && ['Started'].includes(project.status)) {
            assignedConsultants++
            
          }
          // For expected utilization, count all three states
          else if (includeExpected && ['Discussions','Started', 'Sold'].includes(project.status)) {
            assignedConsultants++
            
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
  const target = 85

  // Start with today
  data.push({
    date: today.toISOString().split('T')[0],
    officialUtilization: calculateUtilization(consultants, projects, today, false),
    expectedUtilization: calculateUtilization(consultants, projects, today, true),
    target: target
  })
  

  // Then add first day of next 6 months
  for (let i = 1; i <= 6; i++) {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth() + i, 2)
    const officialUtilization = calculateUtilization(consultants, projects, firstOfMonth, false)
    const expectedUtilization = calculateUtilization(consultants, projects, firstOfMonth, true)
    
    data.push({
      date: firstOfMonth.toISOString().split('T')[0],
      officialUtilization: officialUtilization,
      expectedUtilization: expectedUtilization,
      target: target
    })
    console.log("generating utilization data with for ", firstOfMonth)
    console.log("officialUtilization: ", officialUtilization)
    console.log("expectedUtilization: ", expectedUtilization)

    

  }

  return data
}

export default function UtilizationPlot({ consultants, projects }: UtilizationPlotProps) {
  console.log("generating utilization data with consultants: ", consultants, "\n and projects: ", projects)
  const utilizationData = useMemo(() => generateUtilizationData(consultants, projects), [
    JSON.stringify(consultants),
    JSON.stringify(projects)
  ])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <Card className="lg:col-span-3 border-blue-100">
        <CardHeader>
          <CardTitle>Next 6 Months Forecast</CardTitle>
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
              target: {
                label: "Target",
                color: "#dc2626",
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
                />
                <Line 
                  type="monotone" 
                  dataKey="expectedUtilization" 
                  stroke="#93c5fd"
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                  name="Expected Utilization" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#dc2626" 
                  strokeDasharray="3 3"
                  name="Target"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2 text-blue-700">
              <div className="w-3 h-3 rounded-lg bg-blue-600" />
              Official Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-900">
              Percentage of team members assigned to confirmed projects 
              (status: &quot;Started&quot;). 
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2 text-blue-600">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              Expected Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800">
              Includes both confirmed projects and potential upcoming work 
              (status: &quot;Discussions&quot;, &quot;Sold&quot;, or &quot;Started&quot;). 
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

