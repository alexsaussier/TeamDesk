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
import OrganizationLevelsSetup from "@/components/OrganizationLevelsSetup"
import { useOrganizationLevels } from "@/contexts/OrganizationContext"

import { Organization, ConsultantLevelDefinition, User, SubscriptionInfo } from "@/types"
import { Loader2, Pencil, Save, X, Settings, UserPlus, Trash2, Crown, CreditCard, Calendar, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { levels, refreshLevels } = useOrganizationLevels()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [admins, setAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [levelsModalOpen, setLevelsModalOpen] = useState(false)
  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false)
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
  const [newAdminData, setNewAdminData] = useState({
    name: "",
    email: "",
    password: ""
  })
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [managingSubscription, setManagingSubscription] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgResponse, adminsResponse, subscriptionResponse] = await Promise.all([
          fetch('/api/organization'),
          fetch('/api/organization/admins'),
          fetch('/api/stripe/subscription-info')
        ])

        if (!orgResponse.ok) {
          throw new Error('Failed to fetch organization')
        }
        if (!adminsResponse.ok) {
          throw new Error('Failed to fetch admins')
        }

        const [orgData, adminsData, subscriptionData] = await Promise.all([
          orgResponse.json(),
          adminsResponse.json(),
          subscriptionResponse.ok ? subscriptionResponse.json() : null
        ])

        setOrganization(orgData)
        setAdmins(adminsData.admins)
        setSubscriptionInfo(subscriptionData)
        setFormData({
          name: orgData.name || "",
          description: orgData.description || "",
          perks: orgData.perks || ""
        })
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load organization data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  const handleSaveLevels = async (newLevels: ConsultantLevelDefinition[]) => {
    try {
      const response = await fetch('/api/organization/levels', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ levels: newLevels }),
      })

      if (!response.ok) {
        throw new Error('Failed to update consultant levels')
      }

      await refreshLevels()
      toast({
        title: "Success",
        description: "Consultant levels updated successfully",
      })
    } catch (error) {
      console.error('Error updating levels:', error)
      toast({
        title: "Error",
        description: "Failed to update consultant levels",
        variant: "destructive"
      })
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingAdmin(true)

    try {
      const response = await fetch('/api/organization/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdminData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          toast({
            title: "Plan Limit Reached",
            description: data.error,
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error Adding Admin",
            description: data.error || "Failed to add admin",
            variant: "destructive"
          })
        }
        return
      }

      // Refresh admins list
      const adminsResponse = await fetch('/api/organization/admins')
      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json()
        setAdmins(adminsData.admins)
      }

      toast({
        title: "Success",
        description: "Admin added successfully",
      })

      setAddAdminModalOpen(false)
      setNewAdminData({ name: "", email: "", password: "" })
    } catch (error) {
      console.error('Error adding admin:', error)
      toast({
        title: "Error",
        description: "Failed to add admin",
        variant: "destructive"
      })
    } finally {
      setAddingAdmin(false)
    }
  }

  const handleRemoveAdmin = async (adminId: string) => {
    try {
      const response = await fetch(`/api/organization/admins?id=${adminId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to remove admin",
          variant: "destructive"
        })
        return
      }

      // Refresh admins list
      const adminsResponse = await fetch('/api/organization/admins')
      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json()
        setAdmins(adminsData.admins)
      }

      toast({
        title: "Success",
        description: "Admin removed successfully",
      })
    } catch (error) {
      console.error('Error removing admin:', error)
      toast({
        title: "Error",
        description: "Failed to remove admin",
        variant: "destructive"
      })
    }
  }

  const handleManageSubscription = async () => {
    setManagingSubscription(true)
    
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to open subscription management",
          variant: "destructive"
        })
        return
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url
    } catch (error) {
      console.error('Error opening customer portal:', error)
      toast({
        title: "Error",
        description: "Failed to open subscription management",
        variant: "destructive"
      })
    } finally {
      setManagingSubscription(false)
    }
  }

  if (loading) {
    return <Loading fullPage />
  }

  const maxAdmins = organization?.planType === 'premium' ? 5 : 1
  const canAddMoreAdmins = admins.length < maxAdmins

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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Admin Management
          </CardTitle>
          <CardDescription>
            Manage administrators for your organization. {organization?.planType === 'free' ? 'Free plan allows 1 admin.' : 'Premium plan allows up to 5 admins.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Current admins ({admins.length}/{maxAdmins}):
              </div>
              <Button 
                onClick={() => setAddAdminModalOpen(true)}
                disabled={!canAddMoreAdmins}
                size="sm"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
            </div>
            
            <div className="space-y-2">
              {admins.map((admin) => (
                <div key={admin._id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div>
                    <div className="font-medium">{admin.name}</div>
                    <div className="text-sm text-gray-500">{admin.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-400">
                      Joined {new Date(admin.createdAt).toLocaleDateString()}
                    </div>
                    {admins.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAdmin(admin._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!canAddMoreAdmins && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-sm text-orange-800">
                  <strong>Plan Limit Reached:</strong> Your {organization?.planType} plan is limited to {maxAdmins} admin{maxAdmins > 1 ? 's' : ''}.
                  {organization?.planType === 'free' && ' Upgrade to premium to add up to 5 admins.'}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Management
          </CardTitle>
          <CardDescription>
            Manage your TeamDesk subscription, billing, and payment methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Plan Display */}
            <div className="flex justify-between items-center p-4 border rounded-lg bg-gray-50">
              <div>
                <div className="font-medium text-lg">
                  {organization?.planType === 'premium' ? 'Premium Plan' : 'Free Plan'}
                </div>
                <div className="text-sm text-gray-600">
                  {organization?.planType === 'premium' 
                    ? 'Access to all premium features'
                    : 'Basic features with limitations'
                  }
                </div>
              </div>
              <div className="text-right">
                                 {organization?.planType === 'premium' && subscriptionInfo?.hasActiveSubscription && subscriptionInfo.subscription && (
                   <div className="text-sm text-gray-600">
                     <div className="flex items-center gap-1">
                       <Calendar className="h-4 w-4" />
                       Next billing: {new Date(subscriptionInfo.subscription.currentPeriodEnd).toLocaleDateString()}
                     </div>
                     <div className="font-medium">
                       ${(subscriptionInfo.subscription.amount / 100).toFixed(2)} per{' '}
                       {subscriptionInfo.subscription.interval}
                     </div>
                   </div>
                 )}
              </div>
            </div>

            {/* Payment Method Display */}
            {organization?.planType === 'premium' && subscriptionInfo?.paymentMethod && (
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Payment Method</div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {subscriptionInfo.paymentMethod.card?.brand?.toUpperCase()} ending in {subscriptionInfo.paymentMethod.card?.last4}
                      <span className="text-gray-400">
                        • Expires {subscriptionInfo.paymentMethod.card?.expMonth}/{subscriptionInfo.paymentMethod.card?.expYear}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

                         {/* Subscription Status */}
             {organization?.planType === 'premium' && subscriptionInfo?.hasActiveSubscription && subscriptionInfo.subscription && (
               <div className="p-4 border rounded-lg">
                 <div className="flex items-center justify-between">
                   <div>
                     <div className="font-medium">Subscription Status</div>
                     <div className="text-sm text-gray-600">
                       Status: <span className="capitalize text-green-600">{subscriptionInfo.subscription.status}</span>
                       {subscriptionInfo.subscription.cancelAtPeriodEnd && (
                         <span className="ml-2 text-orange-600">• Cancels at period end</span>
                       )}
                     </div>
                   </div>
                 </div>
               </div>
             )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {organization?.planType === 'free' ? (
                <Button 
                  onClick={() => window.location.href = '/pricing'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Upgrade to Premium
                </Button>
              ) : (
                <Button 
                  onClick={handleManageSubscription}
                  disabled={managingSubscription}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {managingSubscription ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  Manage Subscription
                </Button>
              )}
            </div>

            {/* Info Text */}
            <div className="text-sm text-gray-500 p-3 bg-blue-50 rounded-lg">
              <strong>Note:</strong> The "Manage Subscription" button will take you to a secure Stripe portal where you can:
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Update your payment method</li>
                <li>View billing history and download invoices</li>
                <li>Cancel your subscription</li>
                <li>Update billing address</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Consultant Levels</CardTitle>
          <CardDescription>
            Configure the seniority levels used throughout your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Current levels (from junior to senior):
            </div>
            <div className="flex flex-wrap gap-2">
              {levels.map((level, index) => (
                <div key={level.id} className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-sm">
                  <span className="text-blue-800 font-medium">{index + 1}.</span>
                  <span className="text-blue-700">{level.name}</span>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLevelsModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configure Levels
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addAdminModalOpen} onOpenChange={setAddAdminModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>
              Create a new admin account for your organization.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAdmin}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-name">Name</Label>
                <Input
                  id="admin-name"
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter admin name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter admin email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter admin password"
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddAdminModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addingAdmin}>
                {addingAdmin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Admin
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <OrganizationLevelsSetup
        isOpen={levelsModalOpen}
        onClose={() => setLevelsModalOpen(false)}
        onSave={handleSaveLevels}
        initialLevels={levels}
      />
    </div>
  )
} 