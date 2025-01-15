import { useState } from 'react'
import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ConsultantBenchCard from '@/components/ConsultantBenchCard'
import { getNextAssignment, getConsultantAvailability } from '@/lib/consultantUtils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CurrentBenchListProps {
  consultants: Consultant[]
  projects: Project[]
}

export default function CurrentBenchList({ consultants, projects }: CurrentBenchListProps) {
  const [levelFilter, setLevelFilter] = useState<string>("all")

  const availableConsultants = consultants.filter(consultant => {
    const availabilityPercentage = getConsultantAvailability(consultant, projects)
    const matchesLevel = levelFilter === "all" || consultant.level === levelFilter
    return availabilityPercentage > 0 && matchesLevel
  }).map(consultant => ({
    consultant,
    availabilityPercentage: getConsultantAvailability(consultant, projects),
    nextAssignment: getNextAssignment(consultant, projects)
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Currently Available Workforce</span>
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
      <CardContent>
        {availableConsultants.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No consultants currently available
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableConsultants.map(({ consultant, availabilityPercentage, nextAssignment }) => (
              <ConsultantBenchCard
                key={consultant._id}
                consultant={consultant}
                availabilityPercentage={availabilityPercentage}
                nextAssignment={nextAssignment}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
