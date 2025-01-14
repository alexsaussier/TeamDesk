import { useState } from 'react'
import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ConsultantBenchCard from '@/components/ConsultantBenchCard'
import { getCurrentAssignment, getNextAssignment } from '@/lib/consultantUtils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CurrentBenchListProps {
  consultants: Consultant[]
  projects: Project[]
}

export default function CurrentBenchList({ consultants, projects }: CurrentBenchListProps) {
  const [levelFilter, setLevelFilter] = useState<string>("all")

  const benchConsultants = consultants.filter(consultant => {
    const currentAssignment = getCurrentAssignment(consultant, projects)
    const matchesLevel = levelFilter === "all" || consultant.level === levelFilter
    return !currentAssignment && matchesLevel
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Currently on Bench</span>
          <div className="flex items-center gap-4">
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
            <span className="text-muted-foreground text-sm">
              {benchConsultants.length} consultant{benchConsultants.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {benchConsultants.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No consultants currently on bench
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benchConsultants.map(consultant => (
              <ConsultantBenchCard
                key={consultant._id}
                consultant={consultant}
                nextAssignment={getNextAssignment(consultant, projects)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
