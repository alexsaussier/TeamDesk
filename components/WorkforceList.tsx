import { useState, useEffect } from 'react'
import { Consultant } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteWorkerModal from './DeleteWorkerModal'

interface ConsultantListProps {
  consultants: Consultant[]
  onConsultantDeleted: (id: string) => void
}

export default function ConsultantList({ consultants, onConsultantDeleted }: ConsultantListProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [projectDetails, setProjectDetails] = useState<Record<string, any>>({})

  // Fetch project details for all assignments
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await fetch('/api/projects')
        if (!response.ok) throw new Error('Failed to fetch projects')
        const projects = await response.json()
        
        // Create a map of project details by ID
        const projectMap = projects.reduce((acc: Record<string, any>, project: any) => {
          acc[project._id] = project
          return acc
        }, {})
        
        setProjectDetails(projectMap)
      } catch (error) {
        console.error('Error fetching project details:', error)
      }
    }

    fetchProjectDetails()
  }, [])

  const handleDeleteClick = (consultant: Consultant) => {
    setSelectedConsultant(consultant)
    setDeleteModalOpen(true)
  }

  const calculateUtilization = (consultant: Consultant): number => {
    if (!projectDetails || !consultant.assignments?.length) return 0

    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    let assignedDays = 0
    let totalDays = 30

    consultant.assignments.forEach(assignmentId => {
      const project = projectDetails[assignmentId]
      if (!project) return

      const startDate = new Date(project.startDate)
      const endDate = new Date(project.endDate)
      if (startDate < thirtyDaysFromNow && endDate > today) {
        const assignmentStart = startDate > today ? startDate : today
        const assignmentEnd = endDate < thirtyDaysFromNow ? endDate : thirtyDaysFromNow
        assignedDays += (assignmentEnd.getTime() - assignmentStart.getTime()) / (24 * 60 * 60 * 1000)
      }
    })

    return Math.round((assignedDays / totalDays) * 100)
  }

  const getCurrentAssignment = (consultant: Consultant) => {
    if (!projectDetails || !consultant.assignments?.length) return null
    
    const today = new Date()
    return consultant.assignments
      .map(assignmentId => projectDetails[assignmentId])
      .find(project => {
        if (!project) return false
        const startDate = new Date(project.startDate)
        const endDate = new Date(project.endDate)
        return startDate <= today && endDate >= today
      })
  }

  const getFutureAssignments = (consultant: Consultant) => {
    if (!projectDetails || !consultant.assignments?.length) return []
    
    const today = new Date()
    return consultant.assignments
      .map(assignmentId => projectDetails[assignmentId])
      .filter(project => {
        if (!project) return false
        const startDate = new Date(project.startDate)
        return startDate > today
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {consultants.map(consultant => {
          const utilization = calculateUtilization(consultant)
          const currentAssignment = getCurrentAssignment(consultant)
          const futureAssignments = getFutureAssignments(consultant)

          return (
            <Card key={consultant._id} className={`${currentAssignment ? 'bg-gray-100' : ''} relative`}>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                onClick={() => handleDeleteClick(consultant)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{consultant.name}</span>
                  <img 
                    src={consultant.picture} 
                    alt={`${consultant.name}'s picture`} 
                    className="w-10 h-10 rounded-full"
                  />
                </CardTitle>
                <div className="flex">
                  <Badge 
                    variant={utilization > 75 ? 'destructive' : utilization > 50 ? 'default' : 'secondary'}
                    className="inline-flex"
                  >
                    {utilization}% Utilized
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <h4 className="font-semibold">Skills:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {consultant.skills.map(skill => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  {currentAssignment && (
                    <div>
                      <h4 className="font-semibold">Current Project:</h4>
                      <p>{currentAssignment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Ends on: {new Date(currentAssignment.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {futureAssignments.length > 0 && (
                    <div>
                      <h4 className="font-semibold">Future Assignments:</h4>
                      <ul className="list-disc list-inside">
                        {futureAssignments.map(project => (
                          <li key={project._id} className="text-sm">
                            {project.name} (Starts: {new Date(project.startDate).toLocaleDateString()})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
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
        />
      )}
    </>
  )
}

