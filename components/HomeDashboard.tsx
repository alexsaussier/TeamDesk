"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Consultant, Project } from '@/types'
import UtilizationForecastPlot from './UtilizationForecastPlot'
import StatsGrid from './StatsGrid'
import { UtilizationMetrics } from './UtilizationMetrics'
import { Spinner } from '@/components/ui/spinner'
import { UtilizationHistoricalChart } from './UtilizationHistoricalChart'

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
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-semibold mb-6">General Team Stats</h2>
        <StatsGrid consultants={consultants} projects={projects} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Utilization Of Your Team</h2>
        <UtilizationMetrics consultants={consultants} projects={projects} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Utilization Forecast</h2>
        <p className="text-sm text-gray-500 mb-6">What you should expect your utilization to look like in the coming months, if your projects start and end as expected.</p>
        <UtilizationForecastPlot consultants={consultants} projects={projects} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Historical Performance</h2>
        <p className="text-sm text-gray-500 mb-6">Your team&apos;s utilization in the past.</p>
        <UtilizationHistoricalChart consultants={consultants} projects={projects} />
      </section>
    </div>
  )
}

