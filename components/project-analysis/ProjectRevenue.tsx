"use client"

import { Project } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calendar } from "lucide-react"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { differenceInWeeks, parseISO } from "date-fns"
import { useCurrency } from "@/contexts/CurrencyContext"

interface ProjectRevenueProps {
  project: Project
}

interface ConsultantRevenue {
  id: string
  name: string
  level: string
  picture?: string
  hourlyRate: number
  percentage: number
  hoursPerWeek: number
  totalHours: number
  totalRevenue: number
  revenuePercentage: number
}

export function ProjectRevenue({ project }: ProjectRevenueProps) {
  const [consultantRevenues, setConsultantRevenues] = useState<ConsultantRevenue[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [projectWeeks, setProjectWeeks] = useState(0)
  const [weeklyRevenue, setWeeklyRevenue] = useState(0)
  const { formatCurrency, getCurrencySymbol } = useCurrency()

  useEffect(() => {
    // Calculate project duration in weeks
    const startDate = parseISO(project.startDate)
    const endDate = parseISO(project.endDate)
    const weeks = Math.max(1, differenceInWeeks(endDate, startDate))
    setProjectWeeks(weeks)

    if (project.assignedConsultants.length === 0) {
      setConsultantRevenues([])
      setTotalRevenue(0)
      setWeeklyRevenue(0)
      return
    }

    // Calculate revenue for each consultant
    const revenues = project.assignedConsultants.map(consultant => {
      const hourlyRate = consultant.hourlyRate || 0
      const percentage = consultant.percentage
      const hoursPerWeek = (percentage / 100) * 40 // 40 hours per week standard
      const totalHours = hoursPerWeek * weeks
      const totalRevenue = hourlyRate * totalHours

      return {
        id: consultant._id || consultant.id,
        name: consultant.name,
        level: consultant.level,
        picture: consultant.picture,
        hourlyRate,
        percentage,
        hoursPerWeek,
        totalHours,
        totalRevenue,
        revenuePercentage: 0 // Will be calculated after total
      }
    })

    // Calculate total revenue
    const calculatedTotalRevenue = revenues.reduce((sum, c) => sum + c.totalRevenue, 0)
    
    // Calculate revenue percentage for each consultant
    const revenuesWithPercentages = revenues.map(revenue => ({
      ...revenue,
      revenuePercentage: calculatedTotalRevenue > 0 
        ? (revenue.totalRevenue / calculatedTotalRevenue) * 100 
        : 0
    }))

    // Sort by total revenue (highest first)
    const sortedRevenues = revenuesWithPercentages.sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    )

    setConsultantRevenues(sortedRevenues)
    setTotalRevenue(calculatedTotalRevenue)
    setWeeklyRevenue(calculatedTotalRevenue / weeks)
  }, [project])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Project Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue, { decimalPlaces: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(weeklyRevenue, { decimalPlaces: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Project Duration</p>
                <p className="text-2xl font-bold">{projectWeeks} weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Breakdown By Consultant</h3>

          {consultantRevenues.length === 0 ? (
            <div className="text-muted-foreground p-4 text-center">
              No consultants with hourly rates assigned to this project.
            </div>
          ) : (
            <>
              <div className="mb-6">
                {consultantRevenues.map(revenue => (
                  <div key={revenue.id} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden mr-2">
                          {revenue.picture ? (
                            <img 
                              src={revenue.picture} 
                              alt={revenue.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs">{revenue.name.charAt(0)}</span>
                          )}
                        </div>
                        <span className="font-medium">{revenue.name}</span>
                        <span className="text-xs ml-2 text-muted-foreground capitalize">
                          ({revenue.level})
                        </span>
                      </div>
                      <div className="flex items-center">
                                          <span className="text-sm font-medium">
                    {formatCurrency(revenue.totalRevenue, { decimalPlaces: 2 })}
                  </span>
                        <span className="text-xs ml-2 text-muted-foreground">
                          ({revenue.revenuePercentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={revenue.revenuePercentage} className="h-2 bg-gray-100">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${revenue.revenuePercentage}%` }}
                      />
                    </Progress>
                  </div>
                ))}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Hours/Week</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Total Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultantRevenues.map(revenue => (
                    <TableRow key={revenue.id}>
                      <TableCell className="font-medium">{revenue.name}</TableCell>
                      <TableCell className="capitalize">{revenue.level}</TableCell>
                      <TableCell>{getCurrencySymbol()}{revenue.hourlyRate}</TableCell>
                      <TableCell>{revenue.percentage}%</TableCell>
                      <TableCell>{revenue.hoursPerWeek.toFixed(1)}</TableCell>
                      <TableCell>{revenue.totalHours.toLocaleString(undefined, { maximumFractionDigits: 1 })}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(revenue.totalRevenue, { decimalPlaces: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={6} className="font-bold text-right">Total Project Revenue</TableCell>
                    <TableCell className="font-bold">{formatCurrency(totalRevenue, { decimalPlaces: 2 })}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-3">Revenue Calculation Methodology</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium">Hours Per Week:</span> Assignment Percentage × 40 hours
            </p>
            <p>
              <span className="font-medium">Total Hours:</span> Hours Per Week × {projectWeeks} weeks
            </p>
            <p>
              <span className="font-medium">Total Revenue:</span> Hourly Rate × Total Hours
            </p>
            <p className="text-xs mt-4">
              Note: Revenue is calculated based on the hourly rates of consultants, their assignment percentages, 
              and a standard 40-hour work week. The total project duration is {projectWeeks} weeks.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 