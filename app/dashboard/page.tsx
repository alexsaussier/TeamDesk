import HomeDashboard from '@/components/HomeDashboard'
import { Suspense } from 'react'

export default function Home() {
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold">Home Dashboard</h1>
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <HomeDashboard />
      </Suspense>
    </div>
  )
} 