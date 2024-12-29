import ConsultantDetails from '@/components/ConsultantDetails'

type Props = {
  params: { id: string }
}

export default async function ConsultantPage({ params }: Props) {
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ConsultantDetails consultantId={params.id} />
    </div>
  )
} 