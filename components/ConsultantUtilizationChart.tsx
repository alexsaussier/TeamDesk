import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Consultant, Project } from '@/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ConsultantUtilizationChartProps {
  consultant: Consultant | null
  projects: Project[]
}

export default function ConsultantUtilizationChart({ consultant, projects }: ConsultantUtilizationChartProps) {
  // Calculate monthly utilization for the past 12 months
  const calculateMonthlyUtilization = () => {
    if (!consultant || !projects.length) return []

    const months = []
    const today = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
      let assignedDays = 0

      consultant.assignments.forEach(assignment => {
        const project = projects.find(p => p.id === assignment.projectId)
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
          
          assignedDays += Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24))
        }
      })

      months.push({
        month: month.toLocaleString('default', { month: 'short' }),
        utilization: Math.round((assignedDays / daysInMonth) * 100)
      })
    }

    return months
  }

  const data = calculateMonthlyUtilization()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Utilization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Utilization']}
                cursor={{ fill: 'transparent' }}
              />
              <Bar 
                dataKey="utilization" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 