"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Project } from "@/types"
import { ProjectSelector } from "@/components/project-analysis/ProjectSelector"
import { ProjectOverview } from "@/components/project-analysis/ProjectOverview"
import { ProjectCosts } from "@/components/project-analysis/ProjectCosts"
import { ProjectRevenue } from "@/components/project-analysis/ProjectRevenue"
import { ProjectMargin } from "@/components/project-analysis/ProjectMargin"
import { Calendar, User, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"

export default function ProjectAnalysisPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/projects')
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }
        
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        console.error('Error fetching projects:', error)
        setError('Failed to load projects. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Started': return 'bg-green-100 text-green-800'
      case 'Sold': return 'bg-blue-100 text-blue-800'
      case 'Discussions': return 'bg-yellow-100 text-yellow-800'
      case 'Completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Group projects by status
  const projectsByStatus = projects.reduce((acc, project) => {
    if (!acc[project.status]) {
      acc[project.status] = []
    }
    acc[project.status].push(project)
    return acc
  }, {} as Record<string, Project[]>)

  // Sort groups by status priority
  const statusOrder = ['Started', 'Sold', 'Discussions', 'Completed']
  const sortedGroups = Object.keys(projectsByStatus).sort(
    (a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b)
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Project Analysis</h1>
        
        {selectedProject && (
          <div className="flex gap-2">
            <ProjectSelector 
              onProjectSelect={handleProjectSelect} 
              selectedProjectId={selectedProject?.id}
            />
            <Button variant="outline" onClick={() => setSelectedProject(null)}>
              View All Projects
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {selectedProject ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="margin">Margin Analysis</TabsTrigger>
              <TabsTrigger value="costs">Costs</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <Card className="bg-gradient-to-l from-blue-300 to-blue-500 text-white">
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                  <CardDescription className="text-white">
                    Basic information and statistics about the project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectOverview project={selectedProject} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="costs" className="mt-4">
              <Card className="bg-gradient-to-l from-blue-300 to-blue-500 text-white">
                <CardHeader>
                  <CardTitle>Project Costs</CardTitle>
                  <CardDescription className="text-white">
                    Analysis of costs based on consultant salaries and allocations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectCosts project={selectedProject} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="mt-4">
              <Card className="bg-gradient-to-l from-blue-300 to-blue-500 text-white">
                <CardHeader>
                  <CardTitle>Project Revenue</CardTitle>
                  <CardDescription className="text-white">
                    Projected revenue based on hourly rates and project duration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectRevenue project={selectedProject} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="margin" className="mt-4">
              <Card className="bg-gradient-to-l from-blue-300 to-blue-500 text-white">
                <CardHeader>
                  <CardTitle>Margin Analysis</CardTitle>
                  <CardDescription className="text-white">
                    Profit margin analysis overall and per consultant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectMargin project={selectedProject} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <Card className="bg-gradient-to-l from-blue-300 to-blue-500 text-white">
              <CardHeader>
                <CardTitle>Select a Project for Analysis</CardTitle>
                <CardDescription className="text-white">
                  Choose a project from the cards below to view detailed financial analysis
                </CardDescription>
              </CardHeader>
             
            </Card>
            
            {isLoading ? (
              <Loading text="Loading projects..." />
            ) : error ? (
              <div className="text-destructive p-4 border border-destructive rounded-md">
                {error}
              </div>
            ) : (
              <div className="space-y-8">
                {sortedGroups.map(status => (
                  <div key={status}>
                    <h2 className="text-xl font-semibold mb-4">{status} Projects</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projectsByStatus[status].map(project => (
                        <Card
                          key={project.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-l from-blue-300 to-blue-500 text-white"
                          onClick={() => handleProjectSelect(project)}
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg font-semibold">{project.name}</h3>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center text-sm">
                                <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{project.client}</span>
                              </div>
                              
                              <div className="flex items-center text-sm">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>
                                  {format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
                                </span>
                              </div>
                              
                              <div className="flex items-center text-sm">
                                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{project.assignedConsultants.length} consultants</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 