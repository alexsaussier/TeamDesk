"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Users, Calendar, TrendingUp } from 'lucide-react'
import SignInButton from '@/components/SignInButton'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'
import { useSession } from 'next-auth/react'

export default function LandingPage() {
  const { data: session, status } = useSession()
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">TeamDesk</div>
          <div className="space-x-4">
            {status === 'authenticated' && session.user ? (
              <div className="flex items-center space-x-3">
                <span className="text-blue-700">Welcome, {session.user.name || session.user.email}</span>
                <Button asChild variant="outline">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </div>
            ) : (
              <SignInButton />
            )}
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Manage your projects and teams in one place
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Teamdesk is the all-in-one tool for your consulting team or agency.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-200 shadow-md hover:shadow-lg">
              <Link href="/request-demo">Request a Demo</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            
          <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-blue-500" />}
              title="Utilization Data Insights"
              description="Track your utilization data against your targets."
            />
            <FeatureCard
              icon={<BarChart className="h-6 w-6 text-blue-500" />}
              title="Project Pipeline Management"
              description="Visualize your projects and staff them optimally."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-blue-500" />}
              title="Consultant Management"
              description="Efficiently manage your consultants, their skills, and assignments."
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6 text-blue-500" />}
              title="AI Tools"
              description="Intelligent tools to create optimal project teams and create RFP responses."
            />
            
          </div>
        </div>

        <section className="mt-24 space-y-28">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Powerful Features for Your Team
          </h2>

          {/* Utilization Metrics Feature */}
          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border-2 border-sky-100">
            <div className="grid md:grid-cols-[2fr_3fr] gap-12 items-center">

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Utilization Metrics Dashboard
                </h3>
                <p className="text-gray-600">
                  Track all your utilization metrics in one centralized place. 
                  Monitor team performance and identify optimization opportunities in real-time.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Real-time utilization tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Target vs. actual analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Customizable KPI dashboards</span>
                  </li>
                </ul>
              </div>
              <Card className="overflow-hidden h-[300px]">
                <Carousel className="h-full">
                  <CarouselContent className="h-full">
                    <CarouselItem className="h-full">
                      <Image
                        src="/images/home-dashboard/home1.png"
                        alt="Project Pipeline"
                        width={800}
                        height={533}
                        className="rounded-lg w-full h-full object-cover"
                      />
                    </CarouselItem>
                    <CarouselItem>
                      <Image
                        src="/images/home-dashboard/home2.png"
                        alt="Project Pipeline"
                        width={800}
                        height={533}
                        className="rounded-lg w-full h-auto object-cover"
                      />
                    </CarouselItem>
                    <CarouselItem>
                      <Image
                        src="/images/home-dashboard/home3.png"
                        alt="Project Pipeline"
                        width={800}
                        height={533}
                        className="rounded-lg w-full h-auto object-cover"
                      />
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="bg-white border-2 border-gray-800 hover:bg-gray-100 z-50" />
                  <CarouselNext className="bg-white border-2 border-gray-800 hover:bg-gray-100 z-50" />
                </Carousel>
              </Card>
            </div>
          </div>

          {/* Project Pipeline Feature */}
          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border-2 border-sky-100">
            <div className="grid md:grid-cols-[3fr_2fr] gap-12 items-center md:flex-row-reverse">
              <div className="space-y-4 md:order-2">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Project Pipeline Management
                </h3>
                <p className="text-gray-600">
                  Get a clear view of your project pipeline and manage resources effectively.
                  Track upcoming projects and plan capacity with confidence.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Project Timeline overview</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Detailed project sheets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Kanban board to manage projects</span>
                  </li>
                </ul>
              </div>
              <Card className="overflow-hidden h-[300px]">
                <Carousel className="h-full">
                  <CarouselContent className="h-full">
                    <CarouselItem className="h-full">
                      <Image
                        src="/images/projects-dashboard/timeline1.png"
                        alt="Project Pipeline"
                        width={800}
                        height={533}
                        className="rounded-lg w-full h-full object-cover"
                      />
                    </CarouselItem>
                    <CarouselItem className="h-full">
                      <Image
                        src="/images/projects-dashboard/timeline2.png"
                        alt="Project Pipeline"
                        width={800}
                        height={533}
                        className="rounded-lg w-full h-full object-cover"
                      />
                    </CarouselItem>
                    <CarouselItem className="h-full">
                      <Image
                        src="/images/projects-dashboard/kanban1.png"
                        alt="Project Pipeline"
                        width={800}
                        height={533}
                        className="rounded-lg w-full h-full object-cover"
                      />
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="bg-white border-2 border-gray-800 hover:bg-gray-100 z-50" />
                  <CarouselNext className="bg-white border-2 border-gray-800 hover:bg-gray-100 z-50" />
                </Carousel>
              </Card>
            </div>
          </div>

          {/* Optimal Resourcing Feature */}
          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border-2 border-sky-100">
            <div className="grid md:grid-cols-[2fr_3fr] gap-12 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Smart Staffing Suggestions & AI enhancements
                </h3>
                <p className="text-gray-600">
                  We help you find the optimal resourcing models for your projects.
                  Balance skills, availability, and project requirements automatically.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Smart project staffing optimization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Coming soon: AI-powered RFP responses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Coming soon: Generate optimal project structures (team and duration)</span>
                  </li>
                </ul>
              </div>
              <Card className="overflow-hidden">
                <Image
                  src="/images/projects-dashboard/staffing1.png"
                  alt="Resource Optimization"
                  width={800}
                  height={533}
                  className="rounded-lg"
                />
              </Card>
            </div>
          </div>

          {/* Team Visualization Feature */}
          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border-2 border-sky-100">
            <div className="grid md:grid-cols-[3fr_2fr] gap-12 items-center md:flex-row-reverse">
              <div className="space-y-4 md:order-2">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Team & Skills Visualization
                </h3>
                <p className="text-gray-600">
                  Get a comprehensive view of your team&apos;s perfromance, skills and availabilities.
                  Identify gaps and opportunities in your talent pool.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>View individual utilization metrics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>View current and upcoming assignments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Get individual fact sheets about your workforce</span>
                  </li>
                </ul>
              </div>
              <Card className="overflow-hidden">
                <Carousel>
                  <CarouselContent>
                    <CarouselItem>
                      <Image
                        src="/images/workforce-dashboard/workforce1.png"
                        alt="Project Pipeline"
                        width={800}
                        height={533}
                        className="rounded-lg w-full h-auto object-cover"
                      />
                    </CarouselItem>
                    <CarouselItem>
                      <Image
                        src="/images/workforce-dashboard/workforce2.png"
                        alt="Project Pipeline"
                        width={800}
                        height={533}
                        className="rounded-lg w-full h-auto object-cover"
                      />
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="bg-white border-2 border-gray-800 hover:bg-gray-100 z-50" />
                  <CarouselNext className="bg-white border-2 border-gray-800 hover:bg-gray-100 z-50" />
                </Carousel>
              </Card>
            </div>
          </div>
        </section>

        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <Button size="lg" asChild className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-200 shadow-md hover:shadow-lg">
            <Link href="/request-demo">Request a Demo</Link>
          </Button>
        </div>
        
      </main>

      <footer className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 TeamDesk. All rights reserved.
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



