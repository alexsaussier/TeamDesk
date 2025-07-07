"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Users, Calendar, TrendingUp, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'
import PublicNavbar from '@/components/PublicNavbar'

// Floating Background Component
function FloatingBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes */}
      
      {/* Large background circles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-cyan-300/5 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute top-32 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-300/5 rounded-full blur-lg animate-float-medium" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-indigo-400/8 to-blue-300/4 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '4s' }}></div>
      
      {/* Medium geometric shapes */}
      <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-gradient-to-br from-cyan-400/15 to-blue-300/8 rounded-lg rotate-45 animate-float-medium blur-sm"></div>
      <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-to-br from-violet-400/12 to-purple-300/6 rounded-full animate-drift-horizontal blur-sm" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/3 right-1/3 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-teal-300/5 animate-rotate-slow blur-md" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', animationDelay: '3s' }}></div>
      
      {/* Small accent shapes */}
      <div className="absolute top-1/3 right-1/5 w-8 h-8 bg-gradient-to-br from-rose-400/20 to-pink-300/10 rounded-full animate-float-fast blur-sm"></div>
      <div className="absolute top-3/4 left-1/5 w-6 h-6 bg-gradient-to-br from-amber-400/15 to-yellow-300/8 animate-pulse-geometric blur-sm" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}></div>
      <div className="absolute top-1/2 left-1/6 w-10 h-10 bg-gradient-to-br from-sky-400/12 to-cyan-300/6 rounded-full animate-morph blur-sm" style={{ animationDelay: '2.5s' }}></div>
      
      {/* Floating rectangles */}
      <div className="absolute top-16 right-1/3 w-14 h-8 bg-gradient-to-r from-blue-400/8 to-indigo-300/4 rounded-md animate-drift-horizontal blur-sm" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute bottom-1/4 left-1/2 w-12 h-16 bg-gradient-to-b from-purple-400/10 to-violet-300/5 rounded-lg animate-float-medium blur-sm" style={{ animationDelay: '3.5s' }}></div>
      
      {/* Additional floating elements */}
      <div className="absolute top-2/3 right-1/6 w-18 h-18 bg-gradient-to-tr from-teal-400/12 to-emerald-300/6 animate-float-slow blur-md" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)', animationDelay: '5s' }}></div>
      <div className="absolute bottom-16 right-1/5 w-8 h-20 bg-gradient-to-b from-indigo-400/10 to-blue-300/5 rounded-full animate-float-fast blur-sm" style={{ animationDelay: '2s' }}></div>
      
      {/* Morphing blob */}
      <div className="absolute top-1/4 right-1/2 w-28 h-28 bg-gradient-to-br from-cyan-400/8 to-blue-400/4 animate-morph blur-lg" style={{ animationDelay: '1s' }}></div>
      
      {/* Large background gradient overlays */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-blue-400/5 via-transparent to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-indigo-400/5 via-transparent to-transparent blur-3xl"></div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}></div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      <FloatingBackground />
      <PublicNavbar />

      <main className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">        
        <div className="text-center backdrop-blur-sm py-8">
          <span className="text-4xl font-medium bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent sm:text-5xl md:text-6xl">
            Manage your Project Teams
          </span>
          <div className="text-4xl font-medium sm:text-5xl md:text-6xl mt-6 sm:mt-8">
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm border border-blue-400/30">
              More Efficiently
            </span>
          </div>
          <p className="pt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            The first agency planning tool that you&apos;ll love. Staff projects better, faster, smarter.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Button 
              asChild 
              size="lg"
              className="backdrop-blur-md bg-blue-100/50 font-bold text-lg border border-blue-300/30 hover:bg-blue-100 transition-colors"
            >
              <Link href="/auth/signup" className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent">
                  Get Started For Free
                </span>
              </Link>
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
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-sky-100/50">
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
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-sky-100/50">
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
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-sky-100/50">
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
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-sky-100/50">
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

       
        <section className="py-12 md:py-23 lg:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center bg-gradient-to-r from-blue-600/90 to-indigo-700/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
              <h2 className="text-white text-3xl font-bold tracking-tighter sm:text-5xl">
                Ready to streamline your team management?
              </h2>
              <p className="max-w-[700px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Get started with TeamDesk today. No credit card required.
              </p>
              <div className="mt-6">
                <Button 
                  asChild 
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 border border-white font-semibold"
                >
                  <Link href="/auth/signup" className="flex items-center gap-2">
                    Try For Free <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
      </main>

      <footer className="relative z-10 bg-white/80 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-6">
              <Link 
                href="/privacy-policy" 
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms-of-service" 
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Terms of Service
              </Link>
            </div>
            <p className="text-center text-gray-500 text-sm">
              © 2024 TeamDesk. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
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



