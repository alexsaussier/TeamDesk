"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Consultant, Project } from '@/types'
import UtilizationPlot from './UtilizationPlot'
import StatsGrid from './StatsGrid'
import { Spinner } from '@/components/ui/spinner'

export default function HomeDashboard() {
  const { data: session } = useSession()
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    const fetchData = async () => {
      try {
        // Fetch projects and consultants in parallel
        const [projectsResponse, consultantsResponse] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/workforce')
        ])

        if (!projectsResponse.ok) throw new Error('Failed to fetch projects')
        if (!consultantsResponse.ok) throw new Error('Failed to fetch consultants')

        console.log('Fetched projects and consultants')

        const projectsData = await projectsResponse.json()
        const consultantsData = await consultantsResponse.json()

        setProjects(projectsData)
        setConsultants(consultantsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner className="h-8 w-8" />
        <p>We are fetching your data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StatsGrid consultants={consultants} projects={projects} />
      <UtilizationPlot consultants={consultants} projects={projects} />
    </div>
  )
}

