"use client"

import { useState } from 'react'
import { Consultant } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface ConsultantCarouselProps {
  consultants: Consultant[]
}

function calculateUtilization(consultant: Consultant): number {
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  let assignedDays = 0
  const totalDays = 30

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

export default function ConsultantCarousel({ consultants }: ConsultantCarouselProps) {
  const [startIndex, setStartIndex] = useState(0)
  const visibleConsultants = consultants.slice(startIndex, startIndex + 3)

  const handleScrollUp = () => {
    setStartIndex(Math.max(0, startIndex - 1))
  }

  const handleScrollDown = () => {
    setStartIndex(Math.min(consultants.length - 3, startIndex + 1))
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
        onClick={handleScrollUp}
        disabled={startIndex === 0}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <div className="space-y-4 h-[calc(100vh-12rem)] overflow-hidden">
        {visibleConsultants.map(consultant => {
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
      <Button
        variant="outline"
        size="icon"
        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10"
        onClick={handleScrollDown}
        disabled={startIndex >= consultants.length - 3}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  )
}

