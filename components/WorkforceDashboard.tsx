"use client"

import { useState, useEffect } from 'react'
import { Consultant } from '@/types'
import WorkforceList from './WorkforceList'
import AddConsultantModal from './AddConsultantModal'
import SearchBar from './SearchBar'
import { GradientButton } from "@/components/GradientButton"

export default function WorkforceDashboard() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

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
    const query = searchQuery.toLowerCase()
    return (
      consultant.name.toLowerCase().includes(query) ||
      consultant.skills.some(skill => skill.toLowerCase().includes(query))
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workforce</h1>
        <GradientButton 
          onClick={() => setIsModalOpen(true)}
          label="Add Consultant"
        />
      </div>

      <SearchBar 
        onSearch={setSearchQuery}
        placeholder="Search by name or skills..."
      />

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
    </div>
  )
}

