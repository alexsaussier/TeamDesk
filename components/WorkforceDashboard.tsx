"use client"

import { useState, useEffect } from 'react'
import { Consultant } from '@/types'
import ConsultantList from './ConsultantList'
import AddConsultantModal from './AddConsultantModal'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react' // Assuming you're using next-auth



export default function ConsultantDashboard() {
  const { data: session } = useSession()
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!session) return

    const fetchConsultants = async () => {
      try {
        const response = await fetch(`/api/consultants`)
        if (!response.ok) throw new Error('Failed to fetch consultants')
        const data = await response.json()
        setConsultants(data)
      } catch (error) {
        console.error('Error fetching consultants:', error)
      }
    }

    fetchConsultants()
  }, [session])

  const handleAddConsultant = async (newConsultant: Omit<Consultant, 'id'>) => {
    try {
      const response = await fetch('/api/consultants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConsultant),
      })

      if (!response.ok) {
        throw new Error('Failed to add consultant')
      }

      const addedConsultant: Consultant = await response.json()
      setConsultants([...consultants, addedConsultant])
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error adding consultant:', error)
      // Handle error (e.g., show an error message to the user)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workforce</h2>
        <Button onClick={() => setIsModalOpen(true)}>Add Team Member</Button>
      </div>
      <div className="relative w-64">
        <input
          type="text"
          placeholder="Search team members..."
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            // TODO: Implement search functionality
            console.log(e.target.value)
          }}
        />
        <svg
          className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <ConsultantList consultants={consultants} />
      <AddConsultantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddConsultant}
      />
    </div>
  )
}

