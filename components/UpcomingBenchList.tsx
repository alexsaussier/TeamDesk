import { useState } from 'react'
import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ConsultantBenchCard from './ConsultantBenchCard'
import { getCurrentAssignment, getNextAssignment, getConsultantAvailability, getConsultantAvailabilityAtDate } from '@/lib/consultantUtils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UpcomingBenchListProps {
  consultants: Consultant[]
  projects: Project[]
}

export default function UpcomingBenchList({ consultants, projects }: UpcomingBenchListProps) {
  const [levelFilter, setLevelFilter] = useState<string>("all")

  const upcomingBench = consultants
    .map(consultant => {
      // Get all dates where availability changes
      const availabilityChanges = consultant.assignments
        .map(assignment => {
          const project = projects.find(p => p.id === assignment.projectId)
          if (!project) return null
          return {
            date: new Date(project.endDate),
            type: 'increase' as const
          }
        })
        .filter((change): change is NonNullable<typeof change> => 
          change !== null && 
          change.date > new Date()
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime())

      if (!availabilityChanges.length) return null

      // For each change date, calculate availability before and after
      const changes = availabilityChanges.map(change => {
        const dateBefore = new Date(change.date.getTime() - 24 * 60 * 60 * 1000) // 1 day before
        const dateAfter = new Date(change.date.getTime() + 24 * 60 * 60 * 1000) // 1 day after
        
        const availabilityBefore = getConsultantAvailabilityAtDate(consultant, projects, dateBefore)
        const availabilityAfter = getConsultantAvailabilityAtDate(consultant, projects, dateAfter)
        
        if (availabilityAfter <= availabilityBefore) return null

        return {
          consultant,
          availableFrom: change.date,
          nextAssignment: getNextAssignment(consultant, projects),
          currentAvailability: availabilityBefore,
          futureAvailability: availabilityAfter,
          availabilityChange: availabilityAfter - availabilityBefore
        }
      }).filter((change): change is NonNullable<typeof change> => 
        change !== null && 
        change.availabilityChange > 0
      )

      return changes.length > 0 ? changes[0] : null
    })
    .filter((item): item is NonNullable<typeof item> => 
      item !== null && 
      (levelFilter === "all" || item.consultant.level === levelFilter)
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upcoming Availability Changes</span>
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
          {Object.entries(groupedByMonth).map(([monthYear, consultants]) => (
            <div key={monthYear}>
              <h3 className="text-lg font-semibold mb-4">{monthYear}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {consultants.map(({ 
                  consultant, 
                  availableFrom, 
                  nextAssignment, 
                  currentAvailability,
                  futureAvailability,
                  availabilityChange 
                }) => (
                  <ConsultantBenchCard
                    key={consultant._id}
                    consultant={consultant}
                    availableFrom={availableFrom}
                    nextAssignment={nextAssignment}
                    currentAvailability={currentAvailability}
                    futureAvailability={futureAvailability}
                    availabilityChange={availabilityChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
