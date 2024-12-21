import ConsultantDetails from '@/components/ConsultantDetails'

interface ConsultantPageProps {
  params: {
    id: string
  }
}

export default function ConsultantPage({ params }: ConsultantPageProps) {
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ConsultantDetails consultantId={params.id} />
    </div>
  )
} 