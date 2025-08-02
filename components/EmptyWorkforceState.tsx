import { Card, CardContent } from '@/components/ui/card'
import { GradientButton } from "@/components/GradientButton"
import { Users, Calendar, TrendingUp, Upload, UserPlus } from 'lucide-react'

interface EmptyWorkforceStateProps {
  onAddConsultant: () => void
  onBatchUpload: () => void
}

export default function EmptyWorkforceState({ 
  onAddConsultant, 
  onBatchUpload 
}: EmptyWorkforceStateProps) {
  
  const content = {
    title: "No consultants in your workforce",
    description: "Start building your team by adding consultants to track their timeline, manage assignments, and monitor utilization. You can add them one by one or upload multiple at once.",
    primaryButton: "Add First Consultant",
    features: [
      {
        icon: UserPlus,
        title: "Add Consultants",
        description: "Create detailed profiles with skills, experience levels, and contact information",
        color: "blue"
      },
      {
        icon: Calendar,
        title: "Track Timeline",
        description: "View consultant availability and project assignments across time",
        color: "green"
      },
      {
        icon: TrendingUp,
        title: "Monitor Utilization",
        description: "Keep track of consultant workload and project performance metrics",
        color: "purple"
      }
    ]
  }

  const getIconColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600"
    }
    return colorMap[color as keyof typeof colorMap] || "bg-gray-100 text-gray-600"
  }

  return (
    <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {content.title}
        </h3>
        
        <p className="text-gray-600 text-center max-w-md mb-8">
          {content.description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <GradientButton 
            onClick={onAddConsultant}
            label={content.primaryButton}
            className="px-6 py-3"
          />
          <GradientButton 
            onClick={onBatchUpload}
            label="Batch Upload"
            icon={Upload}
            variant="gray"
            className="px-6 py-3"
          />
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl">
          {content.features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full mx-auto mb-3 ${getIconColorClasses(feature.color)}`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 