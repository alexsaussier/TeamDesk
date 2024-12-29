import ConsultantDetails from '@/components/ConsultantDetails'

export default async function ConsultantPage({ params: { id } }: { params: { id: string } }) {
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ConsultantDetails consultantId={id} />
    </div>
  )
} 