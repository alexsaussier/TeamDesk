"use client"

import { useState, useEffect } from 'react'
import { Consultant } from '@/types'
import WorkforceList from './WorkforceList'
import AddConsultantModal from './AddConsultantModal'
import SearchBar from './SearchBar'
import { GradientButton } from "@/components/GradientButton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from 'lucide-react'
import { BatchUploadModal } from './BatchUploadModal'

export default function WorkforceDashboard() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false)

  const fetchConsultants = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/workforce')
      if (!response.ok) throw new Error('Failed to fetch consultants')
      const data = await response.json()
      setConsultants(data)
    } catch (error) {
      console.error('Error fetching consultants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConsultants()
  }, [])

  const handleAddConsultant = async () => {
    try {
      await fetchConsultants() // Fetch fresh data after adding
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error in handleAddConsultant:', error)
      throw error // Re-throw to be handled by the modal
    }
  }

  const handleConsultantDeleted = async (id: string) => {
    try {
      const response = await fetch(`/api/workforce/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete consultant')
      }

      setConsultants(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error deleting consultant:', error)
    }
  }

  const filteredConsultants = consultants.filter(consultant => {
    const matchesSearch = searchQuery.toLowerCase().trim() === "" || 
      consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesLevel = levelFilter === "all" || consultant.level === levelFilter

    return matchesSearch && matchesLevel
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workforce</h1>
        <div className="flex gap-2">
          <GradientButton 
            onClick={() => setIsModalOpen(true)}
            label="Add Consultant"
          />
          <GradientButton 
            onClick={() => setIsBatchUploadOpen(true)}
            label="Batch Upload"
            icon={Upload}
            variant="gray"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar 
            onSearch={setSearchQuery}
            placeholder="Search by name or skills..."
          />
        </div>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="junior">Junior</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : (
        <WorkforceList 
          consultants={filteredConsultants}
          onConsultantDeleted={handleConsultantDeleted}
        />
      )}

      <AddConsultantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddConsultant}
      />

      <BatchUploadModal
        isOpen={isBatchUploadOpen}
        onClose={() => setIsBatchUploadOpen(false)}
        onSuccess={() => {
          setIsBatchUploadOpen(false)
          fetchConsultants()
        }}
      />
    </div>
  )
}

