import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface SalaryMetricCardProps {
  title: string
  amount: number
  icon: LucideIcon
  iconColor?: string
  consultantName?: string
  consultantLevel?: string
  workerCount?: number
  selectedLevel?: string
}

export function SalaryMetricCard({
  title,
  amount,
  icon: Icon,
  iconColor = "text-blue-200",
  consultantName,
  consultantLevel,
  workerCount,
  selectedLevel
}: SalaryMetricCardProps) {
  return (
    <Card className="bg-white text-blue-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-2xl font-bold">
            ${Intl.NumberFormat('en-US').format(Math.round(amount))}
          </p>
          {consultantName ? (
            <>
              <p className="text-sm text-muted-foreground">{consultantName}</p>
              <p className="text-xs text-muted-foreground">
                Level: {consultantLevel}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">-</p>
              {workerCount && (
                <p className="text-xs text-muted-foreground">
                  Based on {workerCount} workers ({selectedLevel === 'all' ? 'All levels' : selectedLevel})
                </p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 