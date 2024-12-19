"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Consultant, Project } from '@/types'
import UtilizationPlot from './UtilizationPlot'
import StatsGrid from './StatsGrid'
import { Spinner } from '@/components/ui/spinner'

export default function HomeDashboard() {
  const { data: session, status } = useSession()
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
    
    if (status === 'loading') return
    if (status !== 'authenticated') {
      console.error('Not authenticated after loading')
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Fetch projects and consultants in parallel
        const [projectsResponse, consultantsResponse] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/workforce')
        ])

        if (!projectsResponse.ok) throw new Error('Failed to fetch projects')
        if (!consultantsResponse.ok) throw new Error('Failed to fetch consultants')

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
  }, [session, status])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner className="h-8 w-8" />
        <p>Loading...</p>
      </div>
    )
  }

  if (status !== 'authenticated') {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p>Please log in to access this page</p>
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

