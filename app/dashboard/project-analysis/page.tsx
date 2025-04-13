"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Project } from "@/types"
import { ProjectSelector } from "@/components/project-analysis/ProjectSelector"
import { ProjectOverview } from "@/components/project-analysis/ProjectOverview"
import { ProjectCosts } from "@/components/project-analysis/ProjectCosts"
import { ProjectRevenue } from "@/components/project-analysis/ProjectRevenue"
import { ProjectMargin } from "@/components/project-analysis/ProjectMargin"

export default function ProjectAnalysisPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Project Analysis</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Selection</CardTitle>
            <CardDescription>
              Select a project to view detailed financial analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectSelector 
              onProjectSelect={handleProjectSelect} 
              selectedProjectId={selectedProject?.id}
            />
          </CardContent>
        </Card>

        {selectedProject ? (
          <>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="costs">Costs</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="margin">Margin Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Overview</CardTitle>
                    <CardDescription>
                      Basic information and statistics about the project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProjectOverview project={selectedProject} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="costs" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Costs</CardTitle>
                    <CardDescription>
                      Analysis of costs based on consultant salaries and allocations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProjectCosts project={selectedProject} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="revenue" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Revenue</CardTitle>
                    <CardDescription>
                      Projected revenue based on hourly rates and project duration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProjectRevenue project={selectedProject} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="margin" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Margin Analysis</CardTitle>
                    <CardDescription>
                      Profit margin analysis overall and per consultant
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProjectMargin project={selectedProject} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/10">
            <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
            <p className="text-muted-foreground text-center">
              Please select a project from the dropdown above to view the financial analysis
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 