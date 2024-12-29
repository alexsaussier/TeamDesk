import ConsultantDetails from '@/components/ConsultantDetails'

type PageProps = {
  params: { id: string }
}

export default function ConsultantPage({ params }: PageProps) {
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ConsultantDetails consultantId={params.id} />
    </div>
  )
}