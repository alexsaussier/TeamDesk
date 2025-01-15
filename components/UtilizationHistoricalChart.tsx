import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Consultant, Project } from '@/types'
import { calculateUtilizationMetrics } from '@/utils/utilizationMetrics'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useMemo } from 'react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface UtilizationHistoricalChartProps {
  consultants: Consultant[]
  projects: Project[]
}

const HISTORICAL_PERIODS = {
  '3': 3,
  '6': 6,
  '12': 12,
} as const

type HistoricalPeriod = keyof typeof HISTORICAL_PERIODS

export function UtilizationHistoricalChart({ consultants, projects }: UtilizationHistoricalChartProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [historicalPeriod, setHistoricalPeriod] = useState<HistoricalPeriod>('12')

  // Get unique consultant levels
  const consultantLevels = useMemo(() => {
    const levels = new Set(consultants.map(c => c.level))
    return Array.from(levels)
  }, [consultants])

  // Filter consultants based on selected level
  const filteredConsultants = useMemo(() => {
    if (selectedLevel === 'all') return consultants
    return consultants.filter(c => c.level === selectedLevel)
  }, [consultants, selectedLevel])

  const metrics = calculateUtilizationMetrics(filteredConsultants, projects)
  
  const historicalData = useMemo(() => {
    const months = HISTORICAL_PERIODS[historicalPeriod]
    return Array.from({ length: months + 1 }, (_, index) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (months - index))
      
      const dataIndex = metrics.lastTwelveMonths.length - (months + 1) + index
      
      return {
        date: date.toISOString().split('T')[0],
        utilization: metrics.lastTwelveMonths[dataIndex] || 0,
        target: metrics.ytd.target
      }
    })
  }, [historicalPeriod, metrics])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <CardTitle className="text-lg">Historical View</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {consultantLevels.map(level => (
                  <SelectItem key={level} value={level} className="capitalize">
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={historicalPeriod} onValueChange={(value: HistoricalPeriod) => setHistoricalPeriod(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 Months</SelectItem>
                <SelectItem value="6">Last 6 Months</SelectItem>
                <SelectItem value="12">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer
              config={{
                utilization: {
                  label: "Utilization",
                  color: "#2563eb",
                },
                target: {
                  label: "Target",
                  color: "#dc2626",
                },
              }}
            >
              <LineChart 
                data={historicalData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleString('default', { 
                      month: window.innerWidth < 640 ? 'narrow' : 'short' 
                    })
                  }}
                  tick={{ fontSize: window.innerWidth < 640 ? 12 : 14 }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: window.innerWidth < 640 ? 12 : 14 }}
                  width={35}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="utilization" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  name="Utilization"
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
            </ChartContainer>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 