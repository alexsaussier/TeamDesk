"use client"

import { useEffect, useState } from "react"
import { Project, Consultant } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Users, CalendarDays } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useOrganizationLevels } from '@/contexts/OrganizationContext'
import { createLevelNameResolver } from '@/lib/levelUtils'

interface ProjectCostsProps {
  project: Project
}

interface ConsultantWithCost extends Consultant {
  assignmentPercentage: number
  costPerDay: number
  totalCost: number
  costPercentage: number
}

export function ProjectCosts({ project }: ProjectCostsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [consultantsWithCosts, setConsultantsWithCosts] = useState<ConsultantWithCost[]>([])
  const [totalCost, setTotalCost] = useState(0)
  const [showSalaries, setShowSalaries] = useState(false)
  const { levels } = useOrganizationLevels()

  // Get level name resolver function
  const getLevelName = createLevelNameResolver(levels)

  // Calculate project duration in days
  const startDate = new Date(project.startDate)
  const endDate = new Date(project.endDate)
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const workingDays = Math.round(durationDays * 5 / 7) // Approximate working days excluding weekends

  useEffect(() => {
    const fetchConsultantDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Create an array of promises to fetch all consultant details
        const fetchPromises = project.assignedConsultants.map(async (assignedConsultant) => {
          const consultantId = assignedConsultant._id || assignedConsultant.id
          const response = await fetch(`/api/workforce/${consultantId}`)
          
          if (!response.ok) {
            throw new Error(`Failed to fetch consultant ${consultantId}`)
          }
          
          return await response.json()
        })

        // Wait for all consultant details to be fetched
        const consultantDetails = await Promise.all(fetchPromises)
        
        // Calculate costs for each consultant
        const consultantsWithCostData = consultantDetails.map(consultant => {
          const assignedConsultant = project.assignedConsultants.find(
            ac => ac._id === consultant._id || ac._id === consultant.id || ac.id === consultant._id || ac.id === consultant.id
          )
          
          if (!assignedConsultant) {
            throw new Error(`Could not find assignment details for consultant ${consultant._id || consultant.id}`)
          }
          
          const assignmentPercentage = assignedConsultant.percentage
          const dailySalary = consultant.salary / 252 // 252 working days in a year
          const costPerDay = dailySalary * (assignmentPercentage / 100)
          const totalCost = costPerDay * workingDays
          
          return {
            ...consultant,
            assignmentPercentage,
            costPerDay,
            totalCost,
            costPercentage: 0 // This will be calculated after we know the total
          }
        })
        
        // Calculate total cost
        const calculatedTotalCost = consultantsWithCostData.reduce(
          (sum, consultant) => sum + consultant.totalCost, 
          0
        )
        
        // Calculate percentage of total cost for each consultant
        const consultantsWithPercentages = consultantsWithCostData.map(consultant => ({
          ...consultant,
          costPercentage: calculatedTotalCost > 0 
            ? (consultant.totalCost / calculatedTotalCost) * 100 
            : 0
        }))
        
        // Sort consultants by total cost (highest first)
        const sortedConsultants = consultantsWithPercentages.sort(
          (a, b) => b.totalCost - a.totalCost
        )
        
        setConsultantsWithCosts(sortedConsultants)
        setTotalCost(calculatedTotalCost)
      } catch (error) {
        console.error('Error calculating project costs:', error)
        setError('Failed to calculate project costs. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchConsultantDetails()
  }, [project])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Calculating project costs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-destructive p-4 border border-destructive rounded-md">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Project Cost</p>
                <p className="text-2xl font-bold">${totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{consultantsWithCosts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Working Days</p>
                <p className="text-2xl font-bold">{workingDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Cost Breakdown By Consultant</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSalaries(!showSalaries)}
            >
              {showSalaries ? 'Hide Salaries' : 'Show Salaries'}
            </Button>
          </div>

          {consultantsWithCosts.length === 0 ? (
            <p className="text-muted-foreground">No consultants assigned to this project yet.</p>
          ) : (
            <>
              <div className="mb-6">
                {consultantsWithCosts.map(consultant => (
                  <div key={consultant._id || consultant.id} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden mr-2">
                          {consultant.picture ? (
                            <img 
                              src={consultant.picture} 
                              alt={consultant.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs">{consultant.name.charAt(0)}</span>
                          )}
                        </div>
                        <span className="font-medium">{consultant.name}</span>
                        <span className="text-xs ml-2 text-muted-foreground capitalize">
                          ({getLevelName(consultant.level)})
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">
                          ${consultant.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs ml-2 text-muted-foreground">
                          ({consultant.costPercentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={consultant.costPercentage} className="h-2" />
                  </div>
                ))}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Assignment</TableHead>
                    {showSalaries && <TableHead>Annual Salary</TableHead>}
                    <TableHead>Daily Cost</TableHead>
                    <TableHead>Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultantsWithCosts.map(consultant => (
                    <TableRow key={consultant._id || consultant.id}>
                      <TableCell className="font-medium">{consultant.name}</TableCell>
                      <TableCell className="capitalize">{getLevelName(consultant.level)}</TableCell>
                      <TableCell>{consultant.assignmentPercentage}%</TableCell>
                      {showSalaries && (
                        <TableCell>${consultant.salary.toLocaleString()}</TableCell>
                      )}
                      <TableCell>${consultant.costPerDay.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>${consultant.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={showSalaries ? 5 : 4} className="font-bold text-right">Total Project Cost</TableCell>
                    <TableCell className="font-bold">${totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-3">Cost Calculation Methodology</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium">Daily Cost:</span> (Annual Salary ÷ 252 working days) × Assignment Percentage
            </p>
            <p>
              <span className="font-medium">Total Cost:</span> Daily Cost × {workingDays} working days
            </p>
            <p className="text-xs mt-4">
              Note: Costs are calculated based on the consultants&apos; annual salaries and their assignment percentages to this project.
              We assume 252 working days per year and have calculated {workingDays} working days for this project.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 