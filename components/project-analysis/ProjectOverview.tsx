"use client"

import { Calendar, Clock, Briefcase, Users, Tag, LayoutGrid, BarChart3 } from "lucide-react"
import { Project } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useOrganizationLevels } from '@/contexts/OrganizationContext'

interface ProjectOverviewProps {
  project: Project
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const { levels } = useOrganizationLevels()
  
  // Calculate project duration in days
  const startDate = new Date(project.startDate)
  const endDate = new Date(project.endDate)
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // Calculate project duration in weeks
  const durationWeeks = Math.ceil(durationDays / 7)
  
  // Count total team size using dynamic levels
  const totalTeamSize = levels.reduce((sum, level) => {
    return sum + (project.teamSize[level.id] || 0)
  }, 0)
  
  // Count actual assigned consultants
  const assignedCount = project.assignedConsultants.length

  // Format dates
  const formattedStartDate = format(startDate, 'MMM d, yyyy')
  const formattedEndDate = format(endDate, 'MMM d, yyyy')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Client</p>
                  <p className="text-lg font-semibold">{project.client}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Project Timeframe</p>
                  <p className="text-lg font-semibold">
                    {formattedStartDate} - {formattedEndDate}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold">
                    {durationWeeks} weeks ({durationDays} days)
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="flex items-center">
                    <Badge 
                      variant={
                        project.status === 'Completed' ? 'default' :
                        project.status === 'Started' ? 'default' :
                        project.status === 'Sold' ? 'secondary' : 'outline'
                      }
                      className="text-lg font-semibold"
                    >
                      {project.status}
                    </Badge>
                    {project.status === 'Discussions' && (
                      <Badge variant="outline" className="ml-2">
                        {project.chanceToClose}% chance to close
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Composition</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {levels.map(level => {
                      const count = project.teamSize[level.id] || 0
                      if (count > 0) {
                        return (
                          <Badge key={level.id} variant="secondary">
                            {count} {level.name}
                          </Badge>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Assignment</p>
                  <p className="text-lg font-semibold">
                    {assignedCount} / {totalTeamSize} consultants assigned
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Required Skills</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map(skill => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-3">Assigned Team Members</h3>
          {project.assignedConsultants.length === 0 ? (
            <p className="text-muted-foreground">No consultants assigned to this project yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {project.assignedConsultants.map(consultant => (
                <div 
                  key={consultant.id || consultant._id} 
                  className="flex items-center p-3 border rounded-md"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden mr-3">
                    {consultant.picture ? (
                      <img 
                        src={consultant.picture} 
                        alt={consultant.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{consultant.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{consultant.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground capitalize">
                        {consultant.level}
                      </p>
                      <p className="text-xs font-medium">
                        {consultant.percentage}% • ${consultant.hourlyRate || 0}/hr
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 