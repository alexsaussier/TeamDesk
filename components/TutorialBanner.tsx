"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, X, Settings, FolderPlus, UserPlus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface OnboardingProgress {
  settingsConfigured: boolean
  projectCreated: boolean
  workforceAdded: boolean
  tutorialCompleted: boolean
}

interface TutorialBannerProps {
  onboardingProgress: OnboardingProgress
  onDismiss?: () => void
}

interface TutorialTask {
  id: keyof OnboardingProgress
  title: string
  description: string
  completed: boolean
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export default function TutorialBanner({ onboardingProgress, onDismiss }: TutorialBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const tasks: TutorialTask[] = [
    {
      id: 'settingsConfigured',
      title: 'Configure your organization settings',
      description: 'Set up your company information and seniority levels',
      completed: onboardingProgress.settingsConfigured,
      href: '/dashboard/settings',
      icon: Settings
    },
    {
      id: 'projectCreated',
      title: 'Create your first project',
      description: 'Add a project to start managing your team assignments',
      completed: onboardingProgress.projectCreated,
      href: '/dashboard/projects',
      icon: FolderPlus
    },
    {
      id: 'workforceAdded',
      title: 'Add your workforce',
      description: 'Add consultants to your team to track utilization',
      completed: onboardingProgress.workforceAdded,
      href: '/dashboard/workforce',
      icon: UserPlus
    }
  ]

  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length
  const allCompleted = completedTasks === totalTasks

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (allCompleted && onboardingProgress.tutorialCompleted) {
    return null
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-blue-900">
                Welcome to TeamDesk! 🎉
              </CardTitle>
              <CardDescription className="text-blue-700">
                Complete these steps to get the most out of your team management platform
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-blue-700 mb-2">
            <span>Setup Progress</span>
            <span>{completedTasks}/{totalTasks} completed</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {tasks.map((task) => {
          const IconComponent = task.icon
          return (
            <div
              key={task.id}
              className={cn(
                "flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200",
                task.completed 
                  ? "bg-green-50 border-green-200 opacity-75" 
                  : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
              )}
            >
              <div className="flex-shrink-0">
                {task.completed ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
              </div>
              
              <div className="flex-grow">
                <h3 className={cn(
                  "font-medium text-sm",
                  task.completed 
                    ? "text-green-800 line-through" 
                    : "text-gray-900"
                )}>
                  {task.title}
                </h3>
                <p className={cn(
                  "text-xs mt-1",
                  task.completed 
                    ? "text-green-600 line-through" 
                    : "text-gray-600"
                )}>
                  {task.description}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                {task.completed ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Done</span>
                  </div>
                ) : (
                  <Button
                    asChild
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link href={task.href} className="flex items-center space-x-1">
                      <IconComponent className="h-4 w-4" />
                      <span>Go</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )
        })}
        
        {allCompleted && (
          <div className="mt-6 p-4 bg-green-100 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">🎉 Setup Complete!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Great job! You're all set up and ready to manage your team effectively.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 