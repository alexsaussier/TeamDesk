"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Loading } from "@/components/ui/loading"

import { Organization } from "@/types"
import { Loader2, Pencil, Save, X } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState({
    name: false,
    description: false,
    perks: false
  })
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    perks: ""
  })

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch('/api/organization')
        if (!response.ok) {
          throw new Error('Failed to fetch organization')
        }
        const data = await response.json()
        setOrganization(data)
        setFormData({
          name: data.name || "",
          description: data.description || "",
          perks: data.perks || ""
        })
      } catch (error) {
        console.error('Error fetching organization:', error)
        toast({
          title: "Error",
          description: "Failed to load organization data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrganization()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const toggleEditMode = (field: 'name' | 'description' | 'perks') => {
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
    
    // If canceling edit, reset the field value to original
    if (editMode[field]) {
      setFormData(prev => ({
        ...prev,
        [field]: organization?.[field] || ""
      }))
    }
  }

  const saveField = async (field: 'name' | 'description' | 'perks') => {
    setSaving(true)

    try {
      const response = await fetch('/api/organization', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: formData[field] }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update ${field}`)
      }

      const updatedOrg = await response.json()
      
      // Update the organization state
      setOrganization(prev => prev ? { ...prev, ...updatedOrg } : updatedOrg)
      
      // Update the form data
      setFormData(prev => ({
        ...prev,
        [field]: updatedOrg[field]
      }))
      
      // Exit edit mode
      setEditMode(prev => ({
        ...prev,
        [field]: false
      }))
      
      toast({
        title: "Success",
        description: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`,
      })
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
      toast({
        title: "Error",
        description: `Failed to update ${field}`,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/organization', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update organization')
      }

      const updatedOrg = await response.json()
      setOrganization(prev => prev ? { ...prev, ...updatedOrg } : updatedOrg)
      
      toast({
        title: "Success",
        description: "Organization settings updated successfully",
      })
      
      // Reset all edit modes
      setEditMode({
        name: false,
        description: false,
        perks: false
      })
      
      // Refresh the page data
      router.refresh()
    } catch (error) {
      console.error('Error updating organization:', error)
      toast({
        title: "Error",
        description: "Failed to update organization settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading fullPage />
  }

  return (
    <div className="container mx-auto py-10">
      <Toaster />
      <h1 className="text-2xl font-bold mb-6">Organization Settings</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            Update your organization&apos;s basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="name">Organization Name</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleEditMode('name')}
                disabled={saving}
              >
                {editMode.name ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </Button>
            </div>
            
            {editMode.name ? (
              <div className="flex gap-2">
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter organization name"
                  className="flex-1"
                />
                <Button 
                  onClick={() => saveField('name')} 
                  disabled={saving}
                  size="sm"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <div className="p-2 border rounded-md bg-gray-50">{formData.name}</div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description">
                Organization Description
                <span className="text-sm text-gray-500 ml-2">
                  (Used in job descriptions)
                </span>
              </Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleEditMode('description')}
                disabled={saving}
              >
                {editMode.description ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </Button>
            </div>
            
            {editMode.description ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your organization (this will be used in the 'About the Company' section of job descriptions)"
                  rows={5}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={() => saveField('description')} 
                    disabled={saving}
                    size="sm"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 border rounded-md bg-gray-50 min-h-[100px] whitespace-pre-wrap">
                {formData.description || <span className="text-gray-400">No description provided</span>}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="perks">
                Benefits and Perks
                <span className="text-sm text-gray-500 ml-2">
                  (Used in job descriptions)
                </span>
              </Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleEditMode('perks')}
                disabled={saving}
              >
                {editMode.perks ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </Button>
            </div>
            
            {editMode.perks ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  id="perks"
                  name="perks"
                  value={formData.perks}
                  onChange={handleChange}
                  placeholder="List the benefits and perks your organization offers (this will be used in the 'Benefits and Perks' section of job descriptions)"
                  rows={5}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={() => saveField('perks')} 
                    disabled={saving}
                    size="sm"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 border rounded-md bg-gray-50 min-h-[100px] whitespace-pre-wrap">
                {formData.perks || <span className="text-gray-400">No benefits or perks listed</span>}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={saving || Object.values(editMode).some(mode => mode)}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save All Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 