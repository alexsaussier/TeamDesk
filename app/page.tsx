import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Users, Calendar, TrendingUp } from 'lucide-react'
import SignInButton from '@/components/SignInButton'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">TeamDesk</div>
          <div className="space-x-4">
            <SignInButton />
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Optimize Your Resource Allocation
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your consulting firm&apos;s resource management with our intuitive and powerful allocation tool.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Button size="lg" asChild>
              <Link href="/demo">Get Started</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<BarChart className="h-6 w-6 text-blue-500" />}
              title="Project Dashboard"
              description="Visualize your projects in a Kanban board for easy management and tracking."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-blue-500" />}
              title="Consultant Management"
              description="Efficiently manage your consultants, their skills, and assignments."
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6 text-blue-500" />}
              title="Timeline View"
              description="Get a clear overview of project timelines and resource allocation."
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-blue-500" />}
              title="Utilization Insights"
              description="Track and optimize your team's utilization with powerful analytics."
            />
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2023 ResourcePro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}



