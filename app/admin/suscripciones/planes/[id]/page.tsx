import { PlanForm } from '@/components/admin/PlanForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarPlanPage({ params }: Props) {
  const { id } = await params
  return <PlanForm planId={id} />
}
