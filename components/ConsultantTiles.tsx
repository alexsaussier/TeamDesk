import { Consultant } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ConsultantTilesProps {
  consultants: Consultant[]
}

function calculateUtilization(consultant: Consultant): number {
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  let assignedDays = 0
  let totalDays = 30

  if (consultant.currentAssignment) {
    const endDate = new Date(consultant.currentAssignment.endDate)
    if (endDate > today) {
      assignedDays += Math.min(30, (endDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
    }
  }

  consultant.futureAssignments.forEach(assignment => {
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

export default function ConsultantTiles({ consultants }: ConsultantTilesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {consultants.map(consultant => {
        const utilization = calculateUtilization(consultant)
        const isCurrentlyAssigned = !!consultant.currentAssignment

        return (
          <Card key={consultant.id} className={isCurrentlyAssigned ? 'bg-gray-100' : ''}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{consultant.name}</span>
                <Badge variant={utilization > 75 ? 'destructive' : utilization > 50 ? 'default' : 'secondary'}>
                  {utilization}% Utilized
                </Badge>
              </CardTitle>
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
                {consultant.currentAssignment && (
                  <div>
                    <h4 className="font-semibold">Current Project:</h4>
                    <p>{consultant.currentAssignment.projectName}</p>
                    <p className="text-sm text-muted-foreground">
                      Ends on: {new Date(consultant.currentAssignment.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {consultant.futureAssignments.length > 0 && (
                  <div>
                    <h4 className="font-semibold">Future Assignments:</h4>
                    <ul className="list-disc list-inside">
                      {consultant.futureAssignments.map(assignment => (
                        <li key={assignment.projectId} className="text-sm">
                          {assignment.projectName} (Starts: {new Date(assignment.startDate).toLocaleDateString()})
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

