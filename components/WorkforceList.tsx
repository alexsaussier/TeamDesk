import { useState, useEffect } from 'react'
import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteWorkerModal from './DeleteWorkerModal'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface ConsultantListProps {
  consultants: Consultant[]
  onConsultantDeleted: (id: string) => void
}

export default function ConsultantList({ consultants, onConsultantDeleted }: ConsultantListProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [projectDetails, setProjectDetails] = useState<Record<string, Project>>({})
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  // Fetch project details for all assignments
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await fetch('/api/projects')
        if (!response.ok) throw new Error('Failed to fetch projects')
        const projects = await response.json()
        
        // Create a map of project details by ID
        const projectMap = projects.reduce((acc: Record<string, Project>, project: Project) => {
          acc[project.id] = project
          return acc
        }, {})
        
        setProjectDetails(projectMap)
      } catch (error) {
        console.error('Error fetching project details:', error)
      }
    }

    fetchProjectDetails()
  }, [consultants])

  const handleDeleteClick = (consultant: Consultant) => {
    setSelectedConsultant(consultant)
    setDeleteModalOpen(true)
  }

  // Trailing 12 months
  const calculateUtilization = (consultant: Consultant): number => {
    if (!projectDetails || !consultant.assignments?.length) return 0

    const today = new Date()
    const twelveMonthsAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
    
    let assignedDays = 0
    const totalDays = 365

    consultant.assignments.forEach(assignment => {
      const project = projectDetails[assignment.projectId.toString()]
      if (!project) return

      const startDate = new Date(project.startDate)
      const endDate = new Date(project.endDate)
      if (startDate < today && endDate > twelveMonthsAgo) {
        const assignmentStart = startDate > twelveMonthsAgo ? startDate : twelveMonthsAgo
        const assignmentEnd = endDate < today ? endDate : today
        assignedDays += (assignmentEnd.getTime() - assignmentStart.getTime()) / (24 * 60 * 60 * 1000) * (assignment.percentage / 100)
      }
    })

    return Math.round((assignedDays / totalDays) * 100)
  }

  // Next three months
  const calculateForecastedUtilization = (consultant: Consultant): number => {
    if (!projectDetails || !consultant.assignments?.length) return 0

    const today = new Date()
    const threeMonthsFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
    
    let assignedDays = 0
    const totalDays = 90

    consultant.assignments.forEach(assignment => {
      const project = projectDetails[assignment.projectId]
      if (!project) return

      const startDate = new Date(project.startDate)
      const endDate = new Date(project.endDate)
      
      // Only consider assignments that overlap with next 3 months
      if (startDate < threeMonthsFromNow && endDate > today) {
        const assignmentStart = startDate > today ? startDate : today
        const assignmentEnd = endDate < threeMonthsFromNow ? endDate : threeMonthsFromNow
        assignedDays += (assignmentEnd.getTime() - assignmentStart.getTime()) / (24 * 60 * 60 * 1000)
      }
    })

    return Math.round((assignedDays / totalDays) * 100)
  }

  const getCurrentAssignment = (consultant: Consultant) => {
    if (!projectDetails || !consultant.assignments?.length) return null
    
    const today = new Date()
    const project = projectDetails[consultant.assignments[0].projectId]
    if (!project) return null
    
    const startDate = new Date(project.startDate)
    const endDate = new Date(project.endDate)
    return startDate <= today && endDate >= today ? project : null
  }

  const getFutureAssignments = (consultant: Consultant) => {
    if (!projectDetails || !consultant.assignments?.length) return []
    
    const today = new Date()
    return consultant.assignments
      .map(assignment => projectDetails[assignment.projectId])
      .filter(project => {
        if (!project) return false
        return new Date(project.startDate) > today
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }

  const handleDeleteConfirm = async () => {
    if (selectedConsultant) {
      try {
        setIsDeleting(true)
        await onConsultantDeleted(selectedConsultant._id)
      } finally {
        setIsDeleting(false)
        setDeleteModalOpen(false)
        setSelectedConsultant(null)
      }
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {consultants.map(consultant => {
          const utilization = calculateUtilization(consultant)
          const currentAssignment = getCurrentAssignment(consultant)
          const futureAssignments = getFutureAssignments(consultant)

          return (
            <Card 
              key={consultant._id} 
              className="bg-gray-100 cursor-pointer hover:shadow-md transition-shadow relative"
              onClick={() => router.push(`/dashboard/workforce/${consultant._id}`)}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span>{consultant.name}</span>
                    <span className="text-sm font-normal text-gray-500 capitalize">
                      {consultant.level}
                    </span>
                  </div>
                  <Image 
                    src={consultant.picture} 
                    alt={`${consultant.name}'s picture`} 
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </CardTitle>
                <Badge 
                  variant="secondary"
                  className="inline-flex items-center"
                >
                  <span className="text-gray-500 text-xs mr-1">Utilization</span>
                  <span className="text-gray-300 mx-2">|</span>
                  <span className="text-gray-700">12M:</span> 
                  <span className={`ml-1 ${utilization >= 100 ? 'text-green-600' : utilization > 50 ? 'text-lime-800' : 'text-red-600'}`}>
                    {utilization}%
                  </span>
                  <span className="text-gray-300 mx-2">|</span>
                  <span className="text-gray-700">3M:</span> 
                  <span className={`ml-1 ${calculateForecastedUtilization(consultant) >= 100 ? 'text-green-600' : calculateForecastedUtilization(consultant) > 50 ? 'text-lime-800' : 'text-red-600'}`}>
                    {calculateForecastedUtilization(consultant)}%
                  </span>
                </Badge>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Skills:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {consultant.skills.map(skill => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-3 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Current Project</h4>
                      {currentAssignment ? (
                        <div className="space-y-1 ml-3">
                          <p className="font-medium text-gray-900">{currentAssignment.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                            Ends {new Date(currentAssignment.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div className="mx-20">
                          <div className="h-0.5 bg-red-200 bg-gradient-to-r from-transparent via-red-300 to-transparent" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Future Assignments</h4>
                      {futureAssignments.length > 0 ? (
                        <div className="space-y-2 ml-3">
                          {futureAssignments.map(project => (
                            <div key={project.id} className="flex items-center gap-2">
                              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                              <div>
                                <p className="font-medium text-gray-900">{project.name}</p>
                                <p className="text-sm text-gray-500">
                                  Starts {new Date(project.startDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mx-20">
                          <div className="h-0.5 bg-red-200 bg-gradient-to-r from-transparent via-red-300 to-transparent" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-2 right-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation() // Prevent card click when clicking delete
                    handleDeleteClick(consultant)
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {selectedConsultant && (
        <DeleteWorkerModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false)
            setSelectedConsultant(null)
          }}
          onConfirm={handleDeleteConfirm}
          consultantName={selectedConsultant.name}
          isDeleting={isDeleting}
        />
      )}
    </>
  )
}

