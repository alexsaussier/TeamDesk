import { useState } from 'react'
import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Briefcase, Sofa } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getConsultantAvailabilityAtDate, getNextAssignment } from '@/lib/consultantUtils'

interface BenchCalendarProps {
  consultants: Consultant[]
  projects: Project[]
}

interface BenchDate {
  date: Date
  consultants: Array<{
    consultant: Consultant
    nextAssignment: Project | null
    type: 'starting' | 'ending'
  }>
}

export default function BenchCalendar({ consultants, projects }: BenchCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Get all bench dates for the current month
  const getBenchDates = (): BenchDate[] => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    // Get all bench transitions (both starting and ending projects)
    const benchTransitions = consultants.flatMap(consultant => {
      const transitions: Array<{
        date: Date;
        consultant: Consultant;
        nextAssignment: Project | null;
        type: 'starting' | 'ending';
      }> = [];

      // Get all assignment end dates that result in availability changes
      consultant.assignments.forEach(assignment => {
        const project = projects.find(p => p.id === assignment.projectId)
        if (!project) return

        const endDate = new Date(project.endDate)
        const dayBefore = new Date(endDate.getTime() - 24 * 60 * 60 * 1000)
        const dayAfter = new Date(endDate.getTime() + 24 * 60 * 60 * 1000)

        const availabilityBefore = getConsultantAvailabilityAtDate(consultant, projects, dayBefore)
        const availabilityAfter = getConsultantAvailabilityAtDate(consultant, projects, dayAfter)

        if (availabilityAfter > availabilityBefore) {
          transitions.push({
            date: endDate,
            consultant,
            nextAssignment: getNextAssignment(consultant, projects),
            type: 'ending'
          })
        }

        // Also check project start dates
        const startDate = new Date(project.startDate)
        const startDayBefore = new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
        const startDayAfter = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)

        const availabilityBeforeStart = getConsultantAvailabilityAtDate(consultant, projects, startDayBefore)
        const availabilityAfterStart = getConsultantAvailabilityAtDate(consultant, projects, startDayAfter)

        if (availabilityBeforeStart > availabilityAfterStart) {
          transitions.push({
            date: startDate,
            consultant,
            nextAssignment: project,
            type: 'starting'
          })
        }
      })

      return transitions
    })
    
    // Map days to consultants transitions
    return daysInMonth.map(date => ({
      date,
      consultants: benchTransitions
        .filter(transition => isSameDay(transition.date, date))
        .map(({ consultant, nextAssignment, type }) => ({ consultant, nextAssignment, type }))
    }))
  }

  const benchDates = getBenchDates()
  const weeks: (BenchDate | null)[][] = []
  let currentWeek: (BenchDate | null)[] = []
  
  // Add padding for first week
  const firstDay = startOfMonth(currentMonth).getDay()
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(null)
  }
  
  // Build calendar weeks
  benchDates.forEach((benchDate) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(benchDate)
  })
  
  // Add padding for last week
  while (currentWeek.length < 7) {
    currentWeek.push(null)
  }
  weeks.push(currentWeek)

  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bench Calendar</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-muted-foreground text-lg w-[160px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-3 rounded-md bg-green-100 border border-green-500" />
            <span>Starting Project</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-3 rounded-md bg-red-100 border border-red-500" />
            <span>Ending Project</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-3 rounded-md bg-amber-100 border border-amber-500" />
            <span>Both</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-muted">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="bg-background p-2 text-center text-sm font-medium"
            >
              {day}
            </div>
          ))}
          
          {weeks.map((week, weekIndex) => (
            week.map((benchDate, dayIndex) => {
              if (!benchDate) {
                return (
                  <div
                    key={`empty-${weekIndex}-${dayIndex}`}
                    className="bg-background p-2 text-center text-muted-foreground"
                  />
                )
              }

              const hasConsultantsStarting = benchDate.consultants.some(c => c.type === 'starting')
              const hasConsultantsEnding = benchDate.consultants.some(c => c.type === 'ending')
              const hasEvents = hasConsultantsStarting || hasConsultantsEnding

              return hasEvents ? (
                <HoverCard key={benchDate.date.toISOString()} openDelay={100} closeDelay={50}>
                  <HoverCardTrigger asChild>
                    <div
                      className={`
                        bg-background p-2 text-center relative rounded-md
                        ${hasConsultantsStarting && !hasConsultantsEnding ? 'bg-green-200 hover:bg-green-300' : ''}
                        ${!hasConsultantsStarting && hasConsultantsEnding ? 'bg-red-200 hover:bg-red-300' : ''}
                        ${hasConsultantsStarting && hasConsultantsEnding ? 'bg-amber-200 hover:bg-amber-300' : ''}
                        ${isToday(benchDate.date) ? 'ring-2 ring-sky-300 rounded-full' : ''}
                      `}
                    >
                      {hasConsultantsStarting && (
                        <Briefcase className="absolute top-2 left-2 h-4 w-4 text-green-800" />
                      )}
                      {hasConsultantsEnding && (
                        <Sofa className="absolute top-2 left-2 h-4 w-4 text-red-800" />
                      )}
                      <span className="text-sm">
                        {format(benchDate.date, 'd')}
                      </span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-4">
                      {hasConsultantsEnding && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Coming on bench on {format(benchDate.date, 'MMM d, yyyy')}:
                          </p>
                          {benchDate.consultants
                            .filter(c => c.type === 'ending')
                            .map(({ consultant, nextAssignment }) => {
                              const dayBefore = new Date(benchDate.date.getTime() - 24 * 60 * 60 * 1000)
                              const dayAfter = new Date(benchDate.date.getTime() + 24 * 60 * 60 * 1000)
                              const availabilityBefore = getConsultantAvailabilityAtDate(consultant, projects, dayBefore)
                              const availabilityAfter = getConsultantAvailabilityAtDate(consultant, projects, dayAfter)
                              const delta = availabilityAfter - availabilityBefore

                              return (
                                <div
                                  key={`ending-${consultant._id}`}
                                  className="flex items-center gap-2"
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={consultant.picture} />
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {consultant.name}
                                      <span className="ml-2 text-xs text-red-600">Avail.: +{delta}%</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {nextAssignment 
                                        ? `Next project starts ${format(new Date(nextAssignment.startDate), 'MMM d')}`
                                        : 'No next project scheduled'
                                      }
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      )}
                      
                      {hasConsultantsStarting && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Starting projects on {format(benchDate.date, 'MMM d, yyyy')}:
                          </p>
                          {benchDate.consultants
                            .filter(c => c.type === 'starting')
                            .map(({ consultant, nextAssignment }) => {
                              const dayBefore = new Date(benchDate.date.getTime() - 24 * 60 * 60 * 1000)
                              const dayAfter = new Date(benchDate.date.getTime() + 24 * 60 * 60 * 1000)
                              const availabilityBefore = getConsultantAvailabilityAtDate(consultant, projects, dayBefore)
                              const availabilityAfter = getConsultantAvailabilityAtDate(consultant, projects, dayAfter)
                              const delta = availabilityAfter - availabilityBefore

                              return (
                                <div
                                  key={`starting-${consultant._id}`}
                                  className="flex items-center gap-2"
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={consultant.picture} />
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {consultant.name}
                                      <span className="ml-2 text-xs text-green-600">Avail.: {delta}%</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Starting: {nextAssignment?.name}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <div
                  key={benchDate.date.toISOString()}
                  className={`
                    bg-background p-2 text-center relative
                    ${isToday(benchDate.date) ? 'ring-2 ring-sky-600 rounded-md' : ''}
                  `}
                >
                  <span className="text-sm">
                    {format(benchDate.date, 'd')}
                  </span>
                </div>
              )
            })
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
