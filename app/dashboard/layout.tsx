import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

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

  // Balans (ödənişlər)
  let balance = 0
  if (profile?.role === 'student') {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, status')
      .eq('student_id', user.id)
      .eq('status', 'paid')
    // (Hələ payments cədvəli yoxdursa, xəta verməsin)
    if (payments) balance = 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header profile={profile} />

      {/* Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar profile={profile} balance={balance} />

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-64px)] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
