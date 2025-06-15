import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Consultant, Project } from '@/types'
import { calculateUtilizationMetrics } from '@/utils/utilizationMetrics'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useMemo } from 'react'

interface UtilizationMetricsProps {
  consultants: Consultant[]
  projects: Project[]
}

export function UtilizationMetrics({ consultants, projects }: UtilizationMetricsProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

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
  const today = new Date()
  const startOfWeek = new Date(today.getTime() - ((today.getDay() || 7) - 1) * 24 * 60 * 60 * 1000) //To make it start on Monday
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  const periods = [
    { 
      id: 'week',
      label: (
        <div>
          <div>This week</div>
          <div className="text-xs italic text-muted-foreground">
            {startOfWeek.toLocaleString('default', { month: 'long', day: 'numeric' })}
          </div>
        </div>
      ),
      ...metrics.wtd 
    },
    { 
      id: 'month',
      label: (
        <div>
          <div>Month to date</div>
          <div className="text-xs italic text-muted-foreground">
            {startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      ),
      ...metrics.mtd 
    },
    { 
      id: 'quarter',
      label: (
        <div>
          <div>Quarter to date</div>
          <div className="text-xs italic text-muted-foreground">
            {`Q${Math.floor(today.getMonth() / 3) + 1} ${today.getFullYear()}`}
          </div>
        </div>
      ),
      ...metrics.qtd 
    },
    { 
      id: 'year',
      label: (
        <div>
          <div>Year to date</div>
          <div className="text-xs italic text-muted-foreground">
            {today.getFullYear()}
          </div>
        </div>
      ),
      ...metrics.ytd 
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-start mb-4">
        
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-[180px]">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {periods.map((period) => (
          <Card key={period.id} className="transition-all duration-200 bg-gray-50 border-2 border-blue-800 text-blue-800 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium h-[40px]">{period.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold">{period.current.toFixed(1)}%</div>
                <div className="flex items-center gap-4">
                  {/* Target indicator disabled
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      period.current >= period.target ? 'bg-green-500' :
                      period.current >= period.target * 0.9 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
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
                  </div>
                  */}
                </div>
              </div>
              {/* Target text disabled
              <p className="text-xs text-muted-foreground">
                Target: {period.target}%
              </p>
              */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 