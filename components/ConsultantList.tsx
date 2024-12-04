import { Consultant } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ConsultantListProps {
  consultants: Consultant[]
}

function calculateUtilization(consultant: Consultant): number {
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  let assignedDays = 0
  let totalDays = 30

  if (consultant.assignments) {
    const endDate = new Date(consultant.assignments[0].endDate)
    if (endDate > today) {
      assignedDays += Math.min(30, (endDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
    }
  }

  consultant.assignments?.slice(1).forEach(assignment => {
    const startDate = new Date(assignment.startDate)
    const endDate = new Date(assignment.endDate)
    if (startDate < thirtyDaysFromNow && endDate > today) {
      const assignmentStart = startDate > today ? startDate : today
      const assignmentEnd = endDate < thirtyDaysFromNow ? endDate : thirtyDaysFromNow
      assignedDays += (assignmentEnd.getTime() - assignmentStart.getTime()) / (24 * 60 * 60 * 1000)
    }
  })

  return Math.round((assignedDays / totalDays) * 100)
}

export default function ConsultantList({ consultants }: ConsultantListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {consultants.map(consultant => {
        const utilization = calculateUtilization(consultant)
        const isCurrentlyAssigned = !!consultant.assignments

        return (
          <Card key={consultant.id} className={isCurrentlyAssigned ? 'bg-gray-100' : ''}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{consultant.name}</span>
                <img 
                  src={consultant.picture} 
                  alt={`${consultant.name}'s picture`} 
                  className="w-10 h-10 rounded-full"
                />
              </CardTitle>
              <div className="flex">
                <Badge 
                  variant={utilization > 75 ? 'destructive' : utilization > 50 ? 'default' : 'secondary'}
                  className="inline-flex"
                >
                  {utilization}% Utilized
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold">Skills:</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {consultant.skills.map(skill => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
                {consultant.assignments && (
                  <div>
                    <h4 className="font-semibold">Current Project:</h4>
                    <p>{consultant.assignments[0].name}</p>
                    <p className="text-sm text-muted-foreground">
                      Ends on: {new Date(consultant.assignments[0].endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {consultant.assignments && consultant.assignments.length > 1 && (
                  <div>
                    <h4 className="font-semibold">Future Assignments:</h4>
                    <ul className="list-disc list-inside">
                      {consultant.assignments.slice(1).map(assignment => (
                        <li key={assignment.id} className="text-sm">
                          {assignment.name} (Starts: {new Date(assignment.startDate).toLocaleDateString()})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

