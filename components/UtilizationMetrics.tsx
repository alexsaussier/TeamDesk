import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Consultant, Project } from '@/types'
import { calculateUtilizationMetrics } from '@/utils/utilizationMetrics'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

interface UtilizationMetricsProps {
  consultants: Consultant[]
  projects: Project[]
}

export function UtilizationMetrics({ consultants, projects }: UtilizationMetricsProps) {
  const metrics = calculateUtilizationMetrics(consultants, projects)
  
  const periods = [
    { label: 'Week to Date', ...metrics.wtd },
    { label: 'Month to Date', ...metrics.mtd },
    { label: 'Quarter to Date', ...metrics.qtd },
    { label: 'Year to Date', ...metrics.ytd },
  ]

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {periods.map((period) => (
          <Card key={period.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{period.label}</CardTitle>
              <div className={`flex items-center text-sm ${
                period.delta >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {period.delta >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                {Math.abs(period.delta).toFixed(1)}%
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{period.current.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Target: {period.target}%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 