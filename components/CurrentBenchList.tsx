import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ConsultantBenchCard from '@/components/ConsultantBenchCard'
import { getCurrentAssignment, getNextAssignment } from '@/lib/consultantUtils'

interface CurrentBenchListProps {
  consultants: Consultant[]
  projects: Project[]
}

export default function CurrentBenchList({ consultants, projects }: CurrentBenchListProps) {
  const benchConsultants = consultants.filter(consultant => {
    const currentAssignment = getCurrentAssignment(consultant, projects)
    return !currentAssignment
  })

  if (benchConsultants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Currently on Bench</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No consultants currently on bench
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Currently on Bench</span>
          <span className="text-muted-foreground text-sm">
            {benchConsultants.length} consultant{benchConsultants.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benchConsultants.map(consultant => (
            <ConsultantBenchCard
              key={consultant._id}
              consultant={consultant}
              nextAssignment={getNextAssignment(consultant, projects)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
