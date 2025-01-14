import { Consultant, Project } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ConsultantBenchCardProps {
  consultant: Consultant
  availableFrom?: Date
  nextAssignment?: Project | null
}

export default function ConsultantBenchCard({ 
  consultant, 
  availableFrom, 
  nextAssignment 
}: ConsultantBenchCardProps) {
  const router = useRouter()

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer bg-sky-50"
      onClick={() => router.push(`/dashboard/workforce/${consultant._id}`)}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={consultant.picture} alt={consultant.name} />
          </Avatar>
          
          <div className="space-y-2 flex-1">
            <div>
              <h3 className="font-semibold">{consultant.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {consultant.level}
              </p>
            </div>

            <div className="flex flex-wrap gap-1">
              {consultant.skills.slice(0, 3).map(skill => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
              {consultant.skills.length > 3 && (
                <Badge variant="outline">
                  +{consultant.skills.length - 3}
                </Badge>
              )}
            </div>

            <div className="space-y-1 pt-2">
              {availableFrom && (
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Available from {availableFrom.toLocaleDateString()}</span>
                </div>
              )}
              
              {nextAssignment && (
                <div className="text-sm text-muted-foreground">
                  Next project: {nextAssignment.name} 
                  <span className="text-xs">
                    (starts {new Date(nextAssignment.startDate).toLocaleDateString()})
                  </span>
                </div>
              )}
              
              {!availableFrom && !nextAssignment && (
                <Badge variant="destructive">
                  No upcoming assignments
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
