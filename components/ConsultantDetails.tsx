"use client"

import { Consultant, Project } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Briefcase, TrendingUp, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ConsultantUtilizationChart from '@/components/ConsultantUtilizationChart'
import ConsultantProjectTimeline from '@/components/ConsultantProjectTimeline'
import ConsultantProjectHistory from '@/components/ConsultantProjectHistory'

interface ConsultantDetailsProps {
  consultant: Consultant
  projects: Project[]
}

// Helper functions
const getCurrentProject = (consultant: Consultant | null, projects: Project[]): Project | null => {
  if (!consultant || !projects.length) return null
  const today = new Date()
  
  // Debug logs
  console.log("Consultant assignments:", consultant.assignments)
  console.log("Available projects:", projects.map(p => ({ id: p.id, name: p.name })))
  
  return projects.find(project => {
    if (!project?.id) return false
    
    const matchingAssignment = consultant.assignments.find(assignment => {
      if (!assignment?.projectId) return false
      
      console.log("Project and assignment id comparison:", project.id, assignment.projectId)
      // Try different comparison methods
      const matches = [
        project.id === assignment.projectId,
        project.id === String(assignment.projectId),
        String(project.id) === String(assignment.projectId)
      ].some(Boolean)
      
      if (matches) {
        console.log("Found matching project:", project.name)
        console.log("Project dates:", {
          start: project.startDate,
          end: project.endDate,
          today: today
        })
      }
      
      return matches
    })
    
    if (!matchingAssignment) return false
    
    const isCurrentProject = new Date(project.startDate) <= today && 
                           new Date(project.endDate) >= today
    
    return isCurrentProject
  }) || null
}

const getNextProject = (consultant: Consultant | null, projects: Project[]): Project | null => {
  if (!consultant || !projects.length) return null
  const today = new Date()
  
  return projects
    .filter(project => {
      if (!project?.id) return false
      return consultant.assignments.some(assignment => {
        if (!assignment?.projectId) return false
        return (
          project.id === assignment.projectId ||
          project.id === String(assignment.projectId) ||
          project.id.toString() === assignment.projectId.toString()
        ) &&
        new Date(project.startDate) > today
      })
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0] || null
}

const calculateUtilization = (consultant: Consultant | null, projects: Project[]): number => {
  if (!consultant || !projects.length) return 0

  const today = new Date()
  const twelveMonthsAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
  
  let assignedDays = 0
  const totalDays = 365

  consultant.assignments.forEach(assignment => {
    if (!assignment?.projectId) return

    const project = projects.find(p => 
      p.id === assignment.projectId || 
      p.id === String(assignment.projectId) ||
      (p.id && assignment.projectId && p.id.toString() === assignment.projectId.toString())
    )
    
    if (!project) return

    const startDate = new Date(project.startDate)
    const endDate = new Date(project.endDate)
    if (startDate < today && endDate > twelveMonthsAgo) {
      const assignmentStart = startDate > twelveMonthsAgo ? startDate : twelveMonthsAgo
      const assignmentEnd = endDate < today ? endDate : today
      assignedDays += (assignmentEnd.getTime() - assignmentStart.getTime()) / (24 * 60 * 60 * 1000) * (assignment.percentage / 100)
    }
  })

  return Math.round((assignedDays / totalDays) * 100)
}

export default function ConsultantDetails({ consultant, projects }: ConsultantDetailsProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workforce
        </Button>
      </div>

      {/* Consultant Profile Card */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={consultant?.picture} alt={consultant?.name} />
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{consultant?.name}</h1>
              <div className="text-muted-foreground capitalize">Level: {consultant?.level}</div>
              <div className="flex flex-wrap gap-2">
                Skills: {consultant?.skills.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={<Users className="h-5 w-5" />}
          title="Current Project"
          value={getCurrentProject(consultant, projects)?.name || "Unassigned"}
        />
        <StatsCard
          icon={<Calendar className="h-5 w-5" />}
          title="Next Assignment"
          value={getNextProject(consultant, projects)?.name || "None scheduled"}
        />
        <StatsCard
          icon={<TrendingUp className="h-5 w-5" />}
          title="Past 12M Utilization"
          value={`${calculateUtilization(consultant, projects)}%`}
        />
        <StatsCard
          icon={<Briefcase className="h-5 w-5" />}
          title="Total Projects"
          value={consultant?.assignments?.length.toString() || "0"}
        />
      </div>

      {/* Detailed Content Tabs */}
      <Tabs defaultValue="utilization" className="space-y-6">
        <TabsList className="bg-muted/50 space-x-1 p-1">
          <TabsTrigger 
            value="utilization"
            className="bg-blue-50 data-[state=active]:bg-blue-100 data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Utilization
          </TabsTrigger>
          <TabsTrigger 
            value="timeline"
            className="bg-blue-50 data-[state=active]:bg-blue-100 data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Timeline
          </TabsTrigger>
          <TabsTrigger 
            value="skills"
            className="bg-blue-50 data-[state=active]:bg-blue-100 data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Skills & Experience
          </TabsTrigger>
        </TabsList>

        <TabsContent value="utilization" className="mt-6">
          <ConsultantUtilizationChart 
            consultant={consultant}
            projects={projects}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <ConsultantProjectTimeline 
            consultant={consultant}
            projects={projects}
          />
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <ConsultantProjectHistory 
            consultant={consultant}
            projects={projects}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper component for stats cards
function StatsCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
} 