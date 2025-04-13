import { Consultant, Project } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, ArrowRightIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ConsultantBenchCardProps {
  consultant: Consultant
  availableFrom?: Date
  nextAssignment?: Project | null
  // For current bench list
  availabilityPercentage?: number
  // For upcoming bench list
  currentAvailability?: number
  futureAvailability?: number
  availabilityChange?: number
}

export default function ConsultantBenchCard({ 
  consultant, 
  availableFrom, 
  nextAssignment,
  availabilityPercentage,
  currentAvailability,
  futureAvailability,
  availabilityChange 
}: ConsultantBenchCardProps) {
  const router = useRouter()

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={() => router.push(`/dashboard/workforce/${consultant._id}`)}
    >
      <CardContent className="pt-6 space-y-4">
        {/* Header: Avatar + Name/Level */}
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={consultant.picture} alt={consultant.name} />
          </Avatar>
          <div>
            <h3 className="font-semibold leading-tight">{consultant.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{consultant.level}</p>
          </div>
        </div>

        {/* Availability Badge */}
        <div>
          {availabilityPercentage !== undefined ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 w-full justify-center text-center py-1">
              {availabilityPercentage}% Available
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-green-100 text-green-800 w-full justify-center text-center py-1">
              {currentAvailability}% → {futureAvailability}%
              <span className="ml-1 text-xs">(+{availabilityChange}%)</span>
            </Badge>
          )}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {consultant.skills.slice(0, 3).map(skill => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {consultant.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{consultant.skills.length - 3}
            </Badge>
          )}
        </div>

        {/* Dates Information */}
        <div className="space-y-1 text-sm border-t border-blue-500 pt-3">
          {/* Show availability information */}
          {availableFrom ? (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Available from {availableFrom.toLocaleDateString()}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-green-600 font-medium">Immediately available</span>
            </div>
          )}
          
          {nextAssignment && (
            <div className="flex items-center gap-2">
              <ArrowRightIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>
                Next: {nextAssignment.name}
                <span className="text-xs ml-1 text-muted-foreground">
                  (starts {new Date(nextAssignment.startDate).toLocaleDateString()})
                </span>
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
