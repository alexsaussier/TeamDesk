import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Consultant, Project } from '@/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface ConsultantUtilizationChartProps {
  consultant: Consultant | null
  projects: Project[]
}

export default function ConsultantUtilizationChart({ consultant, projects }: ConsultantUtilizationChartProps) {
  const calculateMonthlyData = () => {
    if (!consultant || !projects.length) return []

    const months = []
    const today = new Date()
    
    // Start from 6 months ago
    for (let i = -6; i <= 5; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() + i, 1)
      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
      let officialDays = 0
      let expectedDays = 0

      consultant.assignments.forEach(assignment => {
        if (!assignment?.projectId) return

        const project = projects.find(p => 
          p.id === assignment.projectId ||
          p.id === String(assignment.projectId) ||
          (p.id && assignment.projectId && p.id.toString() === assignment.projectId.toString())
        )
        
        if (!project) return

        const projectStart = new Date(project.startDate)
        const projectEnd = new Date(project.endDate)
        
        // Check if project overlaps with this month
        if (projectStart <= new Date(month.getFullYear(), month.getMonth() + 1, 0) &&
            projectEnd >= new Date(month.getFullYear(), month.getMonth(), 1)) {
          
          const overlapStart = projectStart > month ? projectStart : month
          const overlapEnd = projectEnd < new Date(month.getFullYear(), month.getMonth() + 1, 0) 
            ? projectEnd 
            : new Date(month.getFullYear(), month.getMonth() + 1, 0)
          
          const daysInPeriod = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24))
          
          // For official utilization, only count 'Started' projects
          if (project.status === 'Started') {
            officialDays += daysInPeriod * (assignment.percentage / 100)
          }
          
          // For expected utilization, count all relevant statuses
          if (['Discussions', 'Started', 'Sold'].includes(project.status)) {
            expectedDays += daysInPeriod * (assignment.percentage / 100)
          }
        }
      })

      months.push({
        month: month.toLocaleString('default', { month: 'short' }),
        officialUtilization: Math.round((officialDays / daysInMonth) * 100),
        expectedUtilization: Math.round((expectedDays / daysInMonth) * 100),
        target: 75,
        isCurrentMonth: i === 0
      })
    }

    return months
  }

  const data = calculateMonthlyData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>12-Month Utilization View</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ChartContainer
            config={{
              expectedUtilization: {
                label: "Expected Utilization",
                color: "#93c5fd",
              },
              officialUtilization: {
                label: "Official Utilization",
                color: "#2563eb",
              },
              target: {
                label: "Target",
                color: "#dc2626",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={({ x, y, payload }) => (
                    <text
                      x={x}
                      y={y + 10}
                      textAnchor="middle"
                      fill={data[payload.index].isCurrentMonth ? "#2563eb" : "currentColor"}
                      fontWeight={data[payload.index].isCurrentMonth ? "bold" : "normal"}
                    >
                      {payload.value}
                    </text>
                  )}
                />
                <YAxis domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine
                  x={data.find(d => d.isCurrentMonth)?.month}
                  stroke="#2563eb"
                  strokeDasharray="3 3"
                  label={{ value: 'Current', position: 'top', fill: '#2563eb' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expectedUtilization" 
                  stroke="#93c5fd" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="officialUtilization" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#dc2626" 
                  strokeDasharray="3 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
} 