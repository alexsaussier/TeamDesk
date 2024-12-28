import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Consultant, Project } from '@/types'
import { calculateUtilizationMetrics } from '@/utils/utilizationMetrics'

interface UtilizationHistoricalChartProps {
  consultants: Consultant[]
  projects: Project[]
}

export function UtilizationHistoricalChart({ consultants, projects }: UtilizationHistoricalChartProps) {
  const metrics = calculateUtilizationMetrics(consultants, projects)
  const historicalData = metrics.lastTwelveMonths.map((value, index) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (11 - index))
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      utilization: value,
      target: metrics.ytd.target
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>12-Month Historical View</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="utilization" 
                stroke="#2563eb" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#dc2626" 
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 