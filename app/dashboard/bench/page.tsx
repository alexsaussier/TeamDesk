"use client"

import { useState, useEffect } from 'react'
import { Consultant, Project } from '@/types'
import CurrentBenchList from '@/components/CurrentBenchList'
import UpcomingBenchList from '@/components/UpcomingBenchList'
import BenchCalendar from '@/components/BenchCalendar'
import { Loading } from "@/components/ui/loading"

export default function BenchPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [consultantsRes, projectsRes] = await Promise.all([
          fetch('/api/workforce'),
          fetch('/api/projects')
        ])

        const [consultantsData, projectsData] = await Promise.all([
          consultantsRes.json(),
          projectsRes.json()
        ])

        setConsultants(consultantsData)
        setProjects(projectsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <Loading fullPage text="Loading bench data..." />
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Bench Management</h1>
      
      <div className="space-y-8">
        <BenchCalendar 
          consultants={consultants}
          projects={projects}
        />

        <CurrentBenchList 
          consultants={consultants} 
          projects={projects} 
        />

        <UpcomingBenchList 
          consultants={consultants} 
          projects={projects}
        />
      </div>
    </div>
  )
}
