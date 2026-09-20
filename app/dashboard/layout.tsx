import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MobileLayout from '@/components/dashboard/MobileLayout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  let balance = 0
  if (profile?.role === 'student') {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, status')
      .eq('student_id', user.id)
      .eq('status', 'paid')
    if (payments && payments.length > 0) {
      balance = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    }
  }

  return (
    <MobileLayout profile={profile} balance={balance}>
      {children}
    </MobileLayout>
  )
}
