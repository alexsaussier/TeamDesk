"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Consultant } from '@/types'
import WorkforceList from './WorkforceList'
import AddConsultantModal from './AddConsultantModal'
import { Button } from '@/components/ui/button'
import SearchBar from './SearchBar'

export default function WorkforceDashboard() {
  const { data: session, status } = useSession()
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
    
    if (status !== 'authenticated') return

    const fetchConsultants = async () => {
      try {
        const response = await fetch('/api/workforce')
        if (!response.ok) throw new Error('Failed to fetch consultants')
        const data = await response.json()
        setConsultants(data)
      } catch (error) {
        console.error('Error fetching consultants:', error)
      }
    }

    fetchConsultants()
  }, [session, status])

  const handleConsultantDeleted = async (id: string) => {
    try {
      const response = await fetch(`/api/workforce/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete consultant')
      }

      setConsultants(prev => prev.filter(c => c._id !== id))
    } catch (error) {
      console.error('Error deleting consultant:', error)
    }
  }

  const handleAddConsultant = async (newConsultant: Omit<Consultant, 'id'>) => {
    try {
      const response = await fetch('/api/workforce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConsultant),
      })

      if (!response.ok) {
        throw new Error('Failed to add consultant')
      }

      const addedConsultant = await response.json()
      setConsultants(prev => [...prev, addedConsultant])
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error adding consultant:', error)
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
        <Button onClick={() => setIsModalOpen(true)}>Add Consultant</Button>
      </div>

      <SearchBar 
        onSearch={setSearchQuery}
        placeholder="Search by name or skills..."
      />

      <WorkforceList 
        consultants={filteredConsultants}
        onConsultantDeleted={handleConsultantDeleted}
      />

      <AddConsultantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddConsultant}
      />
    </div>
  )
}

