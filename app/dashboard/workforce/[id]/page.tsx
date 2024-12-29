import ConsultantDetails from '@/components/ConsultantDetails'

export default function ConsultantPage({
  params
}: {
  params: { id: string }
}) {
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ConsultantDetails consultantId={params.id} />
    </div>
  )
} 