import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Consultant, Project } from '@/types'
import { calculateUtilizationMetrics } from '@/utils/utilizationMetrics'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

interface UtilizationMetricsProps {
  consultants: Consultant[]
  projects: Project[]
}

export function UtilizationMetrics({ consultants, projects }: UtilizationMetricsProps) {
  const metrics = calculateUtilizationMetrics(consultants, projects)
  const today = new Date()
  const startOfWeek = new Date(today.getTime() - ((today.getDay() || 7) - 1) * 24 * 60 * 60 * 1000) //To make it start on Monday
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  const periods = [
    { 
      label: `Week: ${startOfWeek.getDate()} to ${today.getDate()} ${startOfWeek.toLocaleString('default', { month: 'long' })}`, 
      ...metrics.wtd 
    },
    { 
      label: `Month: ${startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`, 
      ...metrics.mtd 
    },
    { 
      label: `Quarter: Q${Math.floor(today.getMonth() / 3) + 1} ${today.getFullYear()}`, 
      ...metrics.qtd 
    },
    { 
      label: `Year: ${today.getFullYear()}`, 
      ...metrics.ytd 
    },
  ]


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {periods.map((period) => (
          <Card key={period.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium h-[40px]">{period.label}</CardTitle>
              
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold">{period.current.toFixed(1)}%</div>
                <div className="flex items-center gap-4">
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
                </div>
              </div>
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