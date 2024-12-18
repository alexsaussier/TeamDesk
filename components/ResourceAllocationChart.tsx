"use client"

import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts'

interface ResourceAllocationChartProps {
  consultants: Consultant[]
  projects: Project[]
}

export default function ResourceAllocationChart({ consultants, projects }: ResourceAllocationChartProps) {
  const data = consultants.map(consultant => {
    const assignedProjects = projects.filter(project =>
      project.assignedConsultants.includes(consultant.id)
    )

    return {
      name: consultant.name,
      assignedDays: assignedProjects.reduce((total, project) => {
        const start = new Date(project.startDate)
        const end = new Date(project.endDate)
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        return total + days
      }, 0),
      availableDays: (() => {
        if (!consultant.currentAssignment?.endDate || !consultant.futureAssignments[0]?.startDate) {
          return 0
        }
        const start = new Date(consultant.currentAssignment.endDate)
        const end = new Date(consultant.futureAssignments[0].startDate)
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      })(),
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            assignedDays: {
              label: "Assigned Days",
              color: "hsl(var(--chart-1))",
            },
            availableDays: {
              label: "Available Days",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="assignedDays" fill="var(--color-assignedDays)" name="Assigned Days" />
              <Bar dataKey="availableDays" fill="var(--color-availableDays)" name="Available Days" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

