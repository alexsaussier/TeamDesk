"use client"

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateFinancialMetrics, type FinancialMetrics } from '@/utils/financialMetrics'
import { Consultant, Project } from '@/types'
import { DollarSign, TrendingUp, Users, ArrowUpIcon, ArrowDownIcon, Calculator, BarChart2 } from 'lucide-react'

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table"
import { calculateUtilizationMetrics } from '@/utils/utilizationMetrics'
import { SalaryMetricCard } from "@/components/SalaryMetricCard"
import { Loading } from "@/components/ui/loading"

export default function FinancialsDashboard() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string>("all")

  // Get unique consultant levels
  const consultantLevels = useMemo(() => {
    const levels = new Set(consultants.map(c => c.level))
    return Array.from(levels)
  }, [consultants])

  // Filter consultants based on selected level
  const filteredConsultants = useMemo(() => {
    if (selectedLevel === "all") return consultants
    return consultants.filter(c => c.level === selectedLevel)
  }, [consultants, selectedLevel])

  // Calculate metrics for filtered consultants
  const filteredMetrics = useMemo(() => 
    calculateFinancialMetrics(filteredConsultants, projects),
    [filteredConsultants, projects]
  )

  useEffect(() => {
    const fetchData = async () => {
      const [consultantsRes, projectsRes] = await Promise.all([
        fetch('/api/workforce'),
        fetch('/api/projects')
      ])
      
      const [consultantsData, projectsData] = await Promise.all([
        consultantsRes.json(),
        projectsRes.json()
      ])

      setConsultants(consultantsData)
      setProjects(projectsData)
      setMetrics(calculateFinancialMetrics(consultantsData, projectsData))
    }

    fetchData()
  }, [])

  if (!metrics) return <Loading fullPage text="Loading financial metrics..." />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financial Metrics</h1>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-l from-blue-500 to-blue-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workforce Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Intl.NumberFormat('en-US').format(Math.round(metrics.totalWorkforceCost.annual))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Monthly: ${Intl.NumberFormat('en-US').format(Math.round(metrics.totalWorkforceCost.monthly))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-l from-blue-500 to-blue-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Burn Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Intl.NumberFormat('en-US').format(Math.round(metrics.monthlyBurnRate))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-l from-blue-500 to-blue-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Intl.NumberFormat('en-US').format(Math.round(metrics.averageSalary))}
            </div>
          </CardContent>
        </Card> 
      </div>

     

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-blue-800">Team Overview</CardTitle>
          <Select defaultValue="all" onValueChange={(level) => setSelectedLevel(level)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {consultantLevels.map(level => (
                <SelectItem key={level} value={level} className="capitalize">
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SalaryMetricCard
              title="Highest Salary"
              amount={filteredMetrics.highestSalary.amount}
              icon={ArrowUpIcon}
              iconColor="text-blue-800"
              consultantName={filteredMetrics.highestSalary.consultant.name}
              consultantLevel={filteredMetrics.highestSalary.consultant.level}
            />

            <SalaryMetricCard
              title="Average Salary"
              amount={filteredMetrics.averageSalary}
              icon={Calculator}
              iconColor="text-blue-800"
              workerCount={filteredConsultants.length}
              selectedLevel={selectedLevel}
            />

            <SalaryMetricCard
              title="Median Salary"
              amount={filteredMetrics.medianSalary}
              icon={BarChart2}
              iconColor="text-blue-800"
              workerCount={filteredConsultants.length}
              selectedLevel={selectedLevel}
            />

            <SalaryMetricCard
              title="Lowest Salary"
              amount={filteredMetrics.lowestSalary.amount}
              icon={ArrowDownIcon}
              iconColor="text-blue-800"
              consultantName={filteredMetrics.lowestSalary.consultant.name}
              consultantLevel={filteredMetrics.lowestSalary.consultant.level}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-blue-800">Team Performance</CardTitle>
          <div className="flex gap-2">
            <Select defaultValue="all" onValueChange={(level) => setSelectedLevel(level)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {consultantLevels.map(level => (
                  <SelectItem key={level} value={level} className="capitalize">
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Salary</TableHead>
                <TableHead className="text-right">Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...filteredConsultants]
                .sort((a, b) => a.salary - b.salary)
                .map((consultant) => {
                  const utilization = calculateUtilizationMetrics([consultant], projects).averageLastYear
                  return (
                    <TableRow key={consultant._id}>
                      <TableCell className="font-medium">{consultant.name}</TableCell>
                      <TableCell className="capitalize">{consultant.level}</TableCell>
                      <TableCell className="text-right">
                        ${Intl.NumberFormat('en-US').format(consultant.salary)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium text-gray-700">
                          {utilization.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  
    </div>
  )
} 