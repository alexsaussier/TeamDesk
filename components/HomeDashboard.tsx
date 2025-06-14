"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Consultant, Project } from '@/types'
import UtilizationForecastPlot from './UtilizationForecastPlot'
import StatsGrid from './StatsGrid'
import { UtilizationMetrics } from './UtilizationMetrics'
import { Spinner } from '@/components/ui/spinner'
import { UtilizationHistoricalChart } from './UtilizationHistoricalChart'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomeDashboard() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessMessage(true)
    }
  }, [searchParams])

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
      {/* Payment Success Message */}
      {showSuccessMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Welcome to TeamDesk Premium! 🎉
                  </h3>
                  <p className="text-green-700">
                    Your subscription is now active. You now have access to all premium features including unlimited consultants, AI-powered insights, and priority support.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuccessMessage(false)}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

