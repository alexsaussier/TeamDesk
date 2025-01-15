"use client"

import { useMemo } from 'react'
import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

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

const FORECAST_PERIODS = {
  '3': 3,
  '6': 6,
  '12': 12,
} as const

type ForecastPeriod = keyof typeof FORECAST_PERIODS

const calculateUtilization = (
  consultants: Consultant[], 
  projects: Project[], 
  date: Date,
  includeExpected: boolean
): number => {
  const totalConsultants = consultants.length
  if (totalConsultants === 0) return 0
  let weightedAssignedConsultants = 0
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
            weightedAssignedConsultants += (assignment.percentage / 100)
          }
          // For future official utilization, count 'started' projects
          else if (!isCurrentMonth && !includeExpected && ['Started'].includes(project.status)) {
            weightedAssignedConsultants += (assignment.percentage / 100)
          }
          // For expected utilization, count all three states with weighting
          else if (includeExpected && ['Discussions','Started', 'Sold'].includes(project.status)) {
            const weight = project.status === 'Discussions' ? (project.chanceToClose / 100) : 1
            weightedAssignedConsultants += (assignment.percentage / 100) * weight
          }
        }
      })
    }
  })

  return (weightedAssignedConsultants / totalConsultants) * 100
}

const generateUtilizationData = (
  consultants: Consultant[], 
  projects: Project[],
  monthsToForecast: number
): UtilizationData[] => {
  const today = new Date()
  const data: UtilizationData[] = []
  const target = 75

  // Start with today
  data.push({
    date: today.toISOString().split('T')[0],
    officialUtilization: calculateUtilization(consultants, projects, today, false),
    expectedUtilization: calculateUtilization(consultants, projects, today, true),
    target: target
  })
  

  // Then add first day of next X months
  for (let i = 1; i <= monthsToForecast; i++) {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth() + i, 2)
    const officialUtilization = calculateUtilization(consultants, projects, firstOfMonth, false)
    const expectedUtilization = calculateUtilization(consultants, projects, firstOfMonth, true)
    
    data.push({
      date: firstOfMonth.toISOString().split('T')[0],
      officialUtilization: officialUtilization,
      expectedUtilization: expectedUtilization,
      target: target
    })
    
  }

  return data
}

export default function UtilizationPlot({ consultants, projects }: UtilizationPlotProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>('6')

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

  const utilizationData = useMemo(
    () => generateUtilizationData(filteredConsultants, projects, FORECAST_PERIODS[forecastPeriod]),
    [filteredConsultants, projects, forecastPeriod]
  )

  return (
    <div className="space-y-4">
      <Card className="border-blue-100">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <CardTitle className="text-lg">Next {forecastPeriod} Months</CardTitle>
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

              <Select value={forecastPeriod} onValueChange={(value: ForecastPeriod) => setForecastPeriod(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Forecast period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
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
              >
                <LineChart 
                  data={utilizationData} 
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
              </ChartContainer>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards - Now always shown below the chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-md flex items-center gap-2 text-blue-700">
              <div className="w-3 h-3 rounded-lg bg-blue-600" />
              Official Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm text-blue-900">
              Percentage of team members assigned to confirmed projects 
              (status: &quot;Started&quot;). 
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-md flex items-center gap-2 text-blue-600">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              Expected Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm text-blue-800">
              Includes both confirmed projects and potential upcoming work 
              (status: &quot;Discussions&quot;, &quot;Sold&quot;, or &quot;Started&quot;). 
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

