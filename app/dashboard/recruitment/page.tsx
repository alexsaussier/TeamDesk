"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, Settings, Users, MessageSquare, Mic } from "lucide-react"
import JobDescriptionCreator from "@/components/recruitment/JobDescriptionCreator"
import JobSettingsForm from "@/components/recruitment/JobSettingsForm"

export default function RecruitmentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const [currentStep, setCurrentStep] = useState<"description" | "settings">("description")
  const [jobDescription, setJobDescription] = useState<string | null>(null)

  const handleStartJobCreation = () => {
    setIsCreatingJob(true)
    setCurrentStep("description")
    setActiveTab("create")
  }

  const handleJobDescriptionComplete = (description: string) => {
    setJobDescription(description)
    setCurrentStep("settings")
  }

  const handleJobSettingsComplete = () => {
    // Reset the creation flow and go back to overview
    setIsCreatingJob(false)
    setJobDescription(null)
    setActiveTab("overview")
    // In a real implementation, we would save the job and refresh the jobs list
  }

  const handleCancel = () => {
    setIsCreatingJob(false)
    setJobDescription(null)
    setActiveTab("overview")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Recruitment Agent</h1>
        {!isCreatingJob && (
          <Button 
            onClick={handleStartJobCreation}
            className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Job
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create" disabled={!isCreatingJob}>Create Job</TabsTrigger>
          <TabsTrigger value="active">Active Jobs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Interviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Use our AI-powered recruitment agent to automate your hiring process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our AI recruitment agent helps you create job descriptions, screen resumes,
                manage interviews, and generate offers - all with minimal manual effort.
              </p>
              <Button 
                onClick={handleStartJobCreation}
                className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Job
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create" className="space-y-4">
          {currentStep === "description" && (
            <JobDescriptionCreator onComplete={handleJobDescriptionComplete} onCancel={handleCancel} />
          )}
          
          {currentStep === "settings" && jobDescription && (
            <JobSettingsForm 
              jobDescription={jobDescription} 
              onComplete={handleJobSettingsComplete} 
              onCancel={handleCancel} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Jobs</CardTitle>
              <CardDescription>
                Manage your ongoing recruitment processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                No active jobs found. Create a new job to get started.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 