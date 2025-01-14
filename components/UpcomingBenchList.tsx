import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ConsultantBenchCard from './ConsultantBenchCard'
import BenchCalendar from './BenchCalendar'
import { getCurrentAssignment, getNextAssignment } from '@/lib/consultantUtils'

interface UpcomingBenchListProps {
  consultants: Consultant[]
  projects: Project[]
}

export default function UpcomingBenchList({ consultants, projects }: UpcomingBenchListProps) {
  const upcomingBench = consultants
    .map(consultant => {
      const currentAssignment = getCurrentAssignment(consultant, projects)
      const nextAssignment = getNextAssignment(consultant, projects)
      
      if (!currentAssignment) return null
      
      // Calculate the gap between current assignment end and next assignment start (if exists)
      const availableFrom = new Date(currentAssignment.endDate)
      const gapDuration = nextAssignment 
        ? new Date(nextAssignment.startDate).getTime() - availableFrom.getTime()
        : Infinity
      
      // Convert gap to days
      const gapDays = gapDuration / (1000 * 60 * 60 * 24)
      
      // Only include if gap is 7 days or more
      if (gapDays < 7) return null
      
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

  if (upcomingBench.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coming to Bench</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No consultants coming to bench soon
          </p>
        </CardContent>
      </Card>
    )
  }

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
      <BenchCalendar 
        consultants={consultants}
        projects={projects}
      />

      <Card>
        <CardHeader>
          <CardTitle>Coming to Bench</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.entries(groupedByMonth).map(([monthYear, consultants]) => (
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
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
