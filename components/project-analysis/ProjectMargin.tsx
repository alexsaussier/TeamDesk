"use client"

import { useEffect, useState } from "react"
import { Project } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { PieChart, AlertTriangle } from "lucide-react"
import { differenceInWeeks, parseISO } from "date-fns"
import { useCurrency } from "@/contexts/CurrencyContext"

interface ProjectMarginProps {
  project: Project
}

interface ConsultantMarginData {
  id: string
  name: string
  level: string
  picture?: string
  hourlyRate: number
  percentage: number
  dailySalary: number
  revenue: number
  cost: number
  profit: number
  margin: number // as percentage
}

export function ProjectMargin({ project }: ProjectMarginProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [consultantMargins, setConsultantMargins] = useState<ConsultantMarginData[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [totalMargin, setTotalMargin] = useState(0)
  const [projectWeeks, setProjectWeeks] = useState(0)
  const [workingDays, setWorkingDays] = useState(0)
  const { formatCurrency, getCurrencySymbol } = useCurrency()

  useEffect(() => {
    const calculateMargins = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Calculate project duration
        const startDate = parseISO(project.startDate)
        const endDate = parseISO(project.endDate)
        const weeks = Math.max(1, differenceInWeeks(endDate, startDate))
        const days = Math.round(weeks * 5) // 5 working days per week
        
        setProjectWeeks(weeks)
        setWorkingDays(days)

        if (project.assignedConsultants.length === 0) {
          setConsultantMargins([])
          setTotalRevenue(0)
          setTotalCost(0)
          setTotalProfit(0)
          setTotalMargin(0)
          setIsLoading(false)
          return
        }

        // Fetch all consultant details to get salaries
        const fetchPromises = project.assignedConsultants.map(async (assignedConsultant) => {
          const consultantId = assignedConsultant._id || assignedConsultant.id
          const response = await fetch(`/api/workforce/${consultantId}`)
          
          if (!response.ok) {
            throw new Error(`Failed to fetch consultant ${consultantId}`)
          }
          
          return await response.json()
        })

        const consultantDetails = await Promise.all(fetchPromises)
        
        // Calculate margin data for each consultant
        const marginData = consultantDetails.map(consultant => {
          const assignedConsultant = project.assignedConsultants.find(
            ac => ac._id === consultant._id || ac._id === consultant.id || ac.id === consultant._id || ac.id === consultant.id
          )
          
          if (!assignedConsultant) {
            throw new Error(`Could not find assignment details for consultant ${consultant._id || consultant.id}`)
          }
          
          const percentage = assignedConsultant.percentage
          const hourlyRate = assignedConsultant.hourlyRate || 0
          
          // Cost calculation
          const dailySalary = consultant.salary / 252 // 252 working days in a year
          const costPerDay = dailySalary * (percentage / 100)
          const totalCost = costPerDay * days
          
          // Revenue calculation
          const hoursPerWeek = (percentage / 100) * 40 // 40 hours per week standard
          const totalHours = hoursPerWeek * weeks
          const totalRevenue = hourlyRate * totalHours
          
          // Profit and margin
          const profit = totalRevenue - totalCost
          const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0
          
          return {
            id: consultant._id || consultant.id,
            name: consultant.name,
            level: consultant.level,
            picture: consultant.picture,
            hourlyRate,
            percentage,
            dailySalary,
            revenue: totalRevenue,
            cost: totalCost,
            profit,
            margin
          }
        })
        
        // Calculate project totals
        const projectRevenue = marginData.reduce((sum, c) => sum + c.revenue, 0)
        const projectCost = marginData.reduce((sum, c) => sum + c.cost, 0)
        const projectProfit = projectRevenue - projectCost
        const projectMargin = projectRevenue > 0 ? (projectProfit / projectRevenue) * 100 : 0
        
        // Sort by margin (highest first)
        const sortedMargins = marginData.sort((a, b) => b.margin - a.margin)
        
        setConsultantMargins(sortedMargins)
        setTotalRevenue(projectRevenue)
        setTotalCost(projectCost)
        setTotalProfit(projectProfit)
        setTotalMargin(projectMargin)
      } catch (error) {
        console.error('Error calculating project margins:', error)
        setError('Failed to calculate project margins. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    calculateMargins()
  }, [project])

  const getMarginColor = (margin: number) => {
    if (margin < 0) return 'bg-red-500'
    if (margin < 15) return 'bg-yellow-500'
    if (margin < 30) return 'bg-green-500'
    return 'bg-emerald-500'
  }

  const getMarginStatus = (margin: number) => {
    if (margin < 0) return { text: 'Loss', color: 'text-red-500' }
    if (margin < 15) return { text: 'Low', color: 'text-yellow-500' }
    if (margin < 30) return { text: 'Good', color: 'text-green-500' }
    return { text: 'Excellent', color: 'text-emerald-500' }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Calculating project margins...</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <PieChart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Project Margin</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold">{totalMargin.toFixed(1)}%</p>
                    <span className={`ml-2 text-sm ${getMarginStatus(totalMargin).color}`}>
                      {getMarginStatus(totalMargin).text}
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-20 w-20 relative">
                <div 
                  className="absolute inset-0 rounded-full border-8 border-gray-100"
                ></div>
                <div 
                  className={`absolute inset-0 rounded-full border-8 ${getMarginColor(totalMargin)}`}
                  style={{ 
                    clipPath: `polygon(0 0, 50% 0, 50% 100%, 0 100%, 0 0, ${Math.min(Math.max(totalMargin, 0), 100)}% 0, ${Math.min(Math.max(totalMargin, 0), 100)}% 100%, 0 100%)`
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{totalMargin.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold">
                  {formatCurrency(totalRevenue, { decimalPlaces: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-xl font-bold">
                  {formatCurrency(totalCost, { decimalPlaces: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground text-green-600">Profit</p>
                              <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalProfit, { decimalPlaces: 2 })}
              </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profit Per Week</p>
                              <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalProfit / projectWeeks, { decimalPlaces: 2 })}
              </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {consultantMargins.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center p-4">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <p>No consultants assigned to this project or missing hourly rates.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3">Margin By Consultant</h3>
              <div className="space-y-4">
                {consultantMargins.map(consultant => (
                  <div key={consultant.id} className="border rounded-md p-3">
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden mr-3">
                          {consultant.picture ? (
                            <img 
                              src={consultant.picture} 
                              alt={consultant.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>{consultant.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{consultant.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{consultant.level}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center">
                          <span className={`text-sm font-semibold ${consultant.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {consultant.margin.toFixed(1)}% margin
                          </span>
                          <span className={`ml-2 text-xs ${getMarginStatus(consultant.margin).color}`}>
                            {getMarginStatus(consultant.margin).text}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatCurrency(consultant.profit, { decimalPlaces: 0 })} profit
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={100} className="h-2 bg-gray-100">
                        <div className={`h-full ${getMarginColor(consultant.margin)} rounded-full`} style={{ width: `${Math.max(0, consultant.margin)}%` }} />
                      </Progress>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Revenue: </span>
                        <span className="font-medium">{formatCurrency(consultant.revenue, { decimalPlaces: 0 })}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cost: </span>
                        <span className="font-medium">{formatCurrency(consultant.cost, { decimalPlaces: 0 })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Detailed Margin Analysis</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Daily Cost</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Margin %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultantMargins.map(consultant => (
                    <TableRow key={consultant.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <span>{consultant.name}</span>
                          <span className="text-xs ml-2 text-muted-foreground capitalize">
                            ({consultant.level})
                          </span>
                        </div>
                      </TableCell>
                                              <TableCell>{getCurrencySymbol()}{consultant.hourlyRate}</TableCell>
                                              <TableCell>{formatCurrency(consultant.dailySalary * (consultant.percentage / 100), { decimalPlaces: 2 })}</TableCell>
                                              <TableCell>{formatCurrency(consultant.revenue, { decimalPlaces: 2 })}</TableCell>
                        <TableCell>{formatCurrency(consultant.cost, { decimalPlaces: 2 })}</TableCell>
                                              <TableCell className={consultant.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(consultant.profit, { decimalPlaces: 2 })}
                      </TableCell>
                      <TableCell>
                        <span className={getMarginStatus(consultant.margin).color}>
                          {consultant.margin.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>TOTALS</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{formatCurrency(totalRevenue, { decimalPlaces: 2 })}</TableCell>
                    <TableCell>{formatCurrency(totalCost, { decimalPlaces: 2 })}</TableCell>
                    <TableCell className={totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(totalProfit, { decimalPlaces: 2 })}
                    </TableCell>
                    <TableCell className={getMarginStatus(totalMargin).color}>
                      {totalMargin.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3">Margin Calculation Methodology</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">Cost Calculation:</span> (Annual Salary ÷ 252 working days) × Assignment Percentage × {workingDays} days
                </p>
                <p>
                  <span className="font-medium">Revenue Calculation:</span> Hourly Rate × (Assignment Percentage × 40 hrs/week) × {projectWeeks} weeks
                </p>
                <p>
                  <span className="font-medium">Profit Calculation:</span> Revenue - Cost
                </p>
                <p>
                  <span className="font-medium">Margin Calculation:</span> (Profit ÷ Revenue) × 100%
                </p>
                <p className="text-xs mt-4">
                  Note: Margin ratings are categorized as follows:
                  <span className="text-red-500 ml-1">Loss (&lt;0%)</span>,
                  <span className="text-yellow-500 ml-1">Low (0-15%)</span>,
                  <span className="text-green-500 ml-1">Good (15-30%)</span>,
                  <span className="text-emerald-500 ml-1">Excellent (&gt;30%)</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 