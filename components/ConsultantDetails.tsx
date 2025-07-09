"use client"

import { Consultant, Project } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Briefcase, TrendingUp, Users, Pencil, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ConsultantUtilizationChart from '@/components/ConsultantUtilizationChart'
import ConsultantProjectTimeline from '@/components/ConsultantProjectTimeline'
import ConsultantProjectHistory from '@/components/ConsultantProjectHistory'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOrganizationLevels } from '@/contexts/OrganizationContext'
import { createLevelNameResolver } from '@/lib/levelUtils'
import ConsultantEditModal from '@/components/ConsultantEditModal'

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
  
  return projects.find(project => {
    if (!project?.id) return false
    
    const matchingAssignment = consultant.assignments.find(assignment => {
      if (!assignment?.projectId) return false
      
      // Try different comparison methods
      const matches = [
        project.id === assignment.projectId,
        project.id === String(assignment.projectId),
        String(project.id) === String(assignment.projectId)
      ].some(Boolean)
      
      
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

export default function ConsultantDetails({ consultant: initialConsultant, projects }: ConsultantDetailsProps) {
  const router = useRouter()
  const [consultant, setConsultant] = useState(initialConsultant)
  const [showSalary, setShowSalary] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { levels } = useOrganizationLevels()

  // Get level name resolver function
  const getLevelName = createLevelNameResolver(levels)

  const handleConsultantUpdate = (updatedConsultant: Consultant) => {
    setConsultant(updatedConsultant)
  }

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

      {/* Main Card Container */}
      <Card className="bg-gradient-to-l from-blue-300 to-blue-500 text-white overflow-hidden">
        <CardContent className="p-6 space-y-6">
          {/* Consultant Profile Section */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border border-white">
                <AvatarImage src={consultant?.picture} alt={consultant?.name} />
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold">{consultant?.name}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white hover:text-blue-500"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-white/80 capitalize">Level: {getLevelName(consultant?.level || '')}</div>
                <div className="flex flex-wrap gap-2">
                  Skills: {consultant?.skills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 w-full sm:w-auto">
              <Label className="text-white">Salary</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {showSalary ? (
                    <span className="text-base sm:text-lg">
                      $ {Intl.NumberFormat('en-US').format(consultant.salary)} /year
                    </span>
                  ) : (
                    <span className="text-base sm:text-lg">$ •••••••</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white hover:text-blue-500"
                    onClick={() => setShowSalary(!showSalary)}
                  >
                    {showSalary ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
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
              subtitle={getNextProject(consultant, projects)
                ? `In ${Math.ceil((new Date(getNextProject(consultant, projects)!.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days - ${new Date(getNextProject(consultant, projects)!.startDate).toLocaleDateString()}`
                : undefined}
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

          {/* Detailed Content in White Card */}
          <div className="bg-white text-gray-900 rounded-lg p-6 overflow-hidden">
            <Tabs defaultValue="utilization" className="space-y-6">
              <TabsList className="bg-blue-50 space-x-1">
                <TabsTrigger 
                  value="utilization"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Utilization
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Timeline
                </TabsTrigger>
                <TabsTrigger 
                  value="history"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Project History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="utilization" className="mt-6 overflow-visible">
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

              <TabsContent value="history" className="mt-6">
                <ConsultantProjectHistory 
                  consultant={consultant}
                  projects={projects}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <ConsultantEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        consultant={consultant}
        onUpdate={handleConsultantUpdate}
      />
    </div>
  )
}

// Modified Stats Card to look better in the enclosing blue gradient card
function StatsCard({ 
  icon, 
  title, 
  value, 
  subtitle 
}: { 
  icon: React.ReactNode, 
  title: string, 
  value: string, 
  subtitle?: string 
}) {
  return (
    <div className="bg-white text-black rounded-lg p-4 backdrop-blur-sm border border-white/20">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <div className="text-sm mt-1">{subtitle}</div>}
    </div>
  )
} 