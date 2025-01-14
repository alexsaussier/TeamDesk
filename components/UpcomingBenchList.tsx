import { useState } from 'react'
import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ConsultantBenchCard from './ConsultantBenchCard'
import { getCurrentAssignment, getNextAssignment } from '@/lib/consultantUtils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UpcomingBenchListProps {
  consultants: Consultant[]
  projects: Project[]
}

export default function UpcomingBenchList({ consultants, projects }: UpcomingBenchListProps) {
  const [levelFilter, setLevelFilter] = useState<string>("all")

  const upcomingBench = consultants
    .map(consultant => {
      const currentAssignment = getCurrentAssignment(consultant, projects)
      const nextAssignment = getNextAssignment(consultant, projects)
      
      if (!currentAssignment) return null
      
      const availableFrom = new Date(currentAssignment.endDate)
      const gapDuration = nextAssignment 
        ? new Date(nextAssignment.startDate).getTime() - availableFrom.getTime()
        : Infinity
      
      const gapDays = gapDuration / (1000 * 60 * 60 * 24)
      
      if (gapDays < 7) return null
      
      // Apply level filter
      if (levelFilter !== "all" && consultant.level !== levelFilter) return null

      return {
        consultant,
        availableFrom,
        nextAssignment
      }
    })
    .filter((item): item is NonNullable<typeof item> => 
      item !== null && 
      item.availableFrom > new Date()
    )
    .sort((a, b) => a.availableFrom.getTime() - b.availableFrom.getTime())

  // Group by month
  const groupedByMonth = upcomingBench.reduce((acc, item) => {
    const monthYear = item.availableFrom.toLocaleString('default', { 
      month: 'long', 
      year: 'numeric' 
    })
    
    if (!acc[monthYear]) {
      acc[monthYear] = []
    }
    
    acc[monthYear].push(item)
    return acc
  }, {} as Record<string, typeof upcomingBench>)

  return (
    <div className="space-y-6">
      <Card className="">
        <CardHeader >
          <CardTitle className="flex items-center justify-between">
            <span>Coming to Bench</span>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.keys(groupedByMonth).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No consultants coming to bench soon
            </p>
          ) : (
            Object.entries(groupedByMonth).map(([monthYear, consultants]) => (
              <div key={monthYear}>
                <h3 className="text-lg font-semibold mb-4">{monthYear}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {consultants.map(({ consultant, availableFrom, nextAssignment }) => (
                    <ConsultantBenchCard
                      key={consultant._id}
                      consultant={consultant}
                      availableFrom={availableFrom}
                      nextAssignment={nextAssignment}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
