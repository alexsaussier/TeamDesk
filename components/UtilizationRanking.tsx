import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Consultant, Project } from '@/types'
import { calculateUtilizationRanking } from '@/utils/utilizationMetrics'
import { Badge } from '@/components/ui/badge'

interface UtilizationRankingProps {
  consultants: Consultant[]
  projects: Project[]
}

export function UtilizationRanking({ consultants, projects }: UtilizationRankingProps) {
  const rankings = calculateUtilizationRanking(consultants, projects)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilization Ranking by Level (Over past 12 months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {rankings.map((levelData) => (
            <div key={levelData.level} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold capitalize">{levelData.level}</h3>
                  <Badge variant="secondary">
                    {levelData.consultantCount} consultant{levelData.consultantCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="text-sm font-medium">
                  Avg: {levelData.averageUtilization.toFixed(1)}%
                </div>
              </div>
              
              <div className="space-y-2">
                {levelData.consultants.map((consultant) => (
                  <div 
                    key={consultant.name}
                    className="flex items-center justify-between text-sm border-b border-gray-100 pb-1"
                  >
                    <span>{consultant.name}</span>
                    <span className={`font-medium ${
                      consultant.utilization >= 75 ? 'text-green-600' :
                      consultant.utilization >= 65 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {consultant.utilization.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 