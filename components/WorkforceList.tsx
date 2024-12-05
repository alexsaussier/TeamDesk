import { useState, useEffect } from 'react'
import { Consultant, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteWorkerModal from './DeleteWorkerModal'

interface ConsultantListProps {
  consultants: Consultant[]
  projects: Project[]
  onConsultantDeleted: (id: string) => void
}

// Add type for populated consultant data
interface PopulatedConsultant extends Omit<Consultant, 'assignments'> {
  assignments: Project[]
}

export default function ConsultantList({ consultants, projects, onConsultantDeleted }: ConsultantListProps) {
  const [populatedConsultants, setPopulatedConsultants] = useState<PopulatedConsultant[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)

  // Populate consultants with project data
  useEffect(() => {
    const populated = consultants.map(consultant => {
      const populatedAssignments = consultant.assignments
        .map(id => projects.find(p => p.id === id))
        .filter((p): p is Project => p !== undefined)
      
      return {
        ...consultant,
        assignments: populatedAssignments
      }
    })
    setPopulatedConsultants(populated)
  }, [consultants, projects])

  const handleDeleteClick = (consultant: PopulatedConsultant) => {
    // Convert assignments back to IDs
    const consultantWithIds: Consultant = {
      ...consultant,
      assignments: consultant.assignments.map(assignment => assignment.id)
    }
    setSelectedConsultant(consultantWithIds)
    setDeleteModalOpen(true)
  }

  const calculateUtilization = (consultant: PopulatedConsultant): number => {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    let assignedDays = 0
    let totalDays = 30

    if (consultant.assignments[0]) {
      const endDate = new Date(consultant.assignments[0].endDate)
      if (endDate > today) {
        assignedDays += Math.min(30, (endDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
      }
    }

    consultant.assignments.slice(1).forEach(assignment => {
      const startDate = new Date(assignment.startDate)
      const endDate = new Date(assignment.endDate)
      if (startDate < thirtyDaysFromNow && endDate > today) {
        const assignmentStart = startDate > today ? startDate : today
        const assignmentEnd = endDate < thirtyDaysFromNow ? endDate : thirtyDaysFromNow
        assignedDays += (assignmentEnd.getTime() - assignmentStart.getTime()) / (24 * 60 * 60 * 1000)
      }
    })

    return Math.round((assignedDays / totalDays) * 100)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedConsultant) return

    try {
      const consultantId = selectedConsultant._id
      const response = await fetch(`/api/workforce/${consultantId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete consultant')
      }

      onConsultantDeleted(consultantId)
      setDeleteModalOpen(false)
      setSelectedConsultant(null)
    } catch (error) {
      console.error('Error deleting consultant:', error)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {populatedConsultants.map(consultant => {
          const utilization = calculateUtilization(consultant)
          const isCurrentlyAssigned = consultant.assignments.length > 0

          return (
            <Card key={consultant._id} className={`${isCurrentlyAssigned ? 'bg-gray-100' : ''} relative`}>
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
                  {consultant.assignments[0] && (
                    <div>
                      <h4 className="font-semibold">Current Project:</h4>
                      <p>{consultant.assignments[0].name}</p>
                      <p className="text-sm text-muted-foreground">
                        Ends on: {new Date(consultant.assignments[0].endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {consultant.assignments.length > 1 && (
                    <div>
                      <h4 className="font-semibold">Future Assignments:</h4>
                      <ul className="list-disc list-inside">
                        {consultant.assignments.slice(1).map(assignment => (
                          <li key={assignment.id} className="text-sm">
                            {assignment.name} (Starts: {new Date(assignment.startDate).toLocaleDateString()})
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

