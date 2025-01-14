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
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
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
    
    // Get all consultants coming to bench
    const benchTransitions = consultants
      .map(consultant => {
        const currentAssignment = getCurrentAssignment(consultant, projects)
        const nextAssignment = getNextAssignment(consultant, projects)
        
        if (!currentAssignment) return null
        
        const availableFrom = new Date(currentAssignment.endDate)
        const gapDuration = nextAssignment 
          ? new Date(nextAssignment.startDate).getTime() - availableFrom.getTime()
          : Infinity
        
        const gapDays = gapDuration / (1000 * 60 * 60 * 24)
        
        if (gapDays < 7) return null
        
        return {
          date: availableFrom,
          consultant,
          nextAssignment
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
    
    // Map days to consultants becoming available
    return daysInMonth.map(date => ({
      date,
      consultants: benchTransitions
        .filter(transition => isSameDay(transition.date, date))
        .map(({ consultant, nextAssignment }) => ({ consultant, nextAssignment }))
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

              const hasConsultants = benchDate.consultants.length > 0

              return (
                <HoverCard key={benchDate.date.toISOString()} openDelay={100} closeDelay={50}>
                  <HoverCardTrigger asChild>
                    <div
                      className={`
                        bg-background p-2 text-center relative
                        ${hasConsultants ? 'bg-blue-50 hover:bg-blue-100 rounded-md' : ''}
                        ${isToday(benchDate.date) ? 'ring-2 ring-blue-500 rounded-full' : ''}
                      `}
                    >
                      <span className="text-sm">
                        {format(benchDate.date, 'd')}
                      </span>
                      {hasConsultants && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-1 h-1 rounded-full bg-blue-500" />
                        </div>
                      )}
                    </div>
                  </HoverCardTrigger>
                  
                  {hasConsultants && (
                    <HoverCardContent className="w-80">
                      <div className="space-y-4">
                        <p className="text-sm font-medium">
                          Coming to bench on {format(benchDate.date, 'MMM d, yyyy')}:
                        </p>
                        <div className="space-y-2">
                          {benchDate.consultants.map(({ consultant, nextAssignment }) => (
                            <div
                              key={consultant._id}
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
                      </div>
                    </HoverCardContent>
                  )}
                </HoverCard>
              )
            })
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
