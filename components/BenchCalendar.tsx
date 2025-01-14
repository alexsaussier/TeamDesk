import { useState } from 'react'
import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { getCurrentAssignment, getNextAssignment } from '@/lib/consultantUtils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
      const transitions = []
      const currentAssignment = getCurrentAssignment(consultant, projects)
      const nextAssignment = getNextAssignment(consultant, projects)
      
      // Coming onto bench (ending current project)
      if (currentAssignment) {
        const availableFrom = new Date(currentAssignment.endDate)
        const gapDuration = nextAssignment 
          ? new Date(nextAssignment.startDate).getTime() - availableFrom.getTime()
          : Infinity
        
        const gapDays = gapDuration / (1000 * 60 * 60 * 24)
        
        if (gapDays >= 7) {
          transitions.push({
            date: availableFrom,
            consultant,
            nextAssignment,
            type: 'ending' as const
          })
        }
      }

      // Coming off bench (starting next project)
      if (nextAssignment) {
        transitions.push({
          date: new Date(nextAssignment.startDate),
          consultant,
          nextAssignment,
          type: 'starting' as const
        })
      }

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bench Calendar</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-muted-foreground min-w-[120px] text-center">
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
            <span>Coming on bench</span>
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
                        ${hasConsultantsStarting && !hasConsultantsEnding ? 'bg-green-100 hover:bg-green-200 border border-green-500' : ''}
                        ${!hasConsultantsStarting && hasConsultantsEnding ? 'bg-red-100 hover:bg-red-200 border border-red-500' : ''}
                        ${hasConsultantsStarting && hasConsultantsEnding ? 'bg-amber-100 hover:bg-amber-200 border border-amber-500' : ''}
                        
                        ${isToday(benchDate.date) ? 'ring-2 ring-blue-500 rounded-full' : ''}
                      `}
                    >
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
                            Coming to bench on {format(benchDate.date, 'MMM d, yyyy')}:
                          </p>
                          {benchDate.consultants
                            .filter(c => c.type === 'ending')
                            .map(({ consultant, nextAssignment }) => (
                              <div
                                key={`ending-${consultant._id}`}
                                className="flex items-center gap-2"
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={consultant.picture} />
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{consultant.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {nextAssignment 
                                      ? `Next project starts ${format(new Date(nextAssignment.startDate), 'MMM d')}`
                                      : 'No next project scheduled'
                                    }
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                      
                      {hasConsultantsStarting && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Starting projects on {format(benchDate.date, 'MMM d, yyyy')}:
                          </p>
                          {benchDate.consultants
                            .filter(c => c.type === 'starting')
                            .map(({ consultant, nextAssignment }) => (
                              <div
                                key={`starting-${consultant._id}`}
                                className="flex items-center gap-2"
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={consultant.picture} />
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{consultant.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Starting: {nextAssignment?.name}
                                  </p>
                                </div>
                              </div>
                            ))}
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
                    ${isToday(benchDate.date) ? 'ring-2 ring-blue-500 rounded-full' : ''}
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
