"use client"

import { useEffect, useState } from "react"
import { Project } from "@/types"
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"

interface ProjectSelectorProps {
  onProjectSelect: (project: Project) => void
  selectedProjectId?: string
}

export function ProjectSelector({ onProjectSelect, selectedProjectId }: ProjectSelectorProps) {
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

  // Group projects by status
  const groupedProjects = projects.reduce((acc, project) => {
    if (!acc[project.status]) {
      acc[project.status] = []
    }
    acc[project.status].push(project)
    return acc
  }, {} as Record<string, Project[]>)

  // Sort project groups by status priority
  const statusOrder = ['Started', 'Sold', 'Discussions', 'Completed']
  const sortedGroups = Object.keys(groupedProjects).sort(
    (a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b)
  )

  const handleSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      onProjectSelect(project)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-20">
        <Spinner className="h-6 w-6" />
        <span className="ml-2">Loading projects...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-destructive p-4 border border-destructive rounded-md">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Select
        value={selectedProjectId}
        onValueChange={handleSelect}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.length === 0 ? (
            <div className="text-muted-foreground p-2">No projects found</div>
          ) : (
            sortedGroups.map(status => (
              <SelectGroup key={status}>
                <SelectLabel className="capitalize">{status} Projects</SelectLabel>
                {groupedProjects[status].map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{project.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {project.client}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}