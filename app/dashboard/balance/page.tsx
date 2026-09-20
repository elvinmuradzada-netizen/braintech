import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BalanceForm from './BalanceForm'

export default async function BalancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  // Ödənişlər
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  const allPayments = payments || []
  const paidPayments = allPayments.filter(p => p.status === 'paid')
  const balance = paidPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)

  // Bu ay artırılan
  const now = new Date()
  const thisMonthPaid = paidPayments.filter(p => {
    const d = new Date(p.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const thisMonthTotal = thisMonthPaid.reduce((s, p) => s + Number(p.amount || 0), 0)

  // Ümumi əməliyyatlar
  const totalTransactions = allPayments.length

  return (
    <div className="max-w-5xl mx-auto">
      {/* ═══ YAŞIL BANNER ═══ */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
            💳
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold opacity-80 uppercase tracking-wider mb-1">
              Ödəniş və əməliyyatlar
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Balansım</h1>
            <p className="text-sm opacity-90">
              Balansını artırın və uğurlu ödəniş tarixçənizi ayrıca tabdan izləyin.
            </p>
          </div>

          {/* Cari balans kartı */}
          <div className="hidden md:block bg-white/15 backdrop-blur rounded-xl px-5 py-4 text-center min-w-[140px]">
            <div className="flex items-center gap-2 justify-center mb-1">
              <span className="text-sm">💰</span>
              <span className="text-xs opacity-90">Cari balans</span>
            </div>
            <div className="text-2xl font-bold">{balance.toFixed(2)}</div>
            <div className="text-xs opacity-80">AZN</div>
          </div>
        </div>

        {/* Dekor */}
        <div className="absolute right-4 bottom-0 text-8xl opacity-10">💵</div>
      </div>

      {/* ═══ CƏRİ BALANS + YAN STATLAR ═══ */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Böyük balans kartı */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">
            💵
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium mb-1">Cari balansınız</p>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {balance.toFixed(2)} AZN
            </div>
            <p className="text-xs text-gray-500">
              {profile?.full_name} hesabı üçün istifadə oluna bilən məbləğ.
            </p>
          </div>
        </div>

        {/* Yan statlar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg">
              📈
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Bu ay artırılıb</p>
              <p className="text-lg font-bold text-gray-900">{thisMonthTotal.toFixed(2)} AZN</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-lg">
              ⭐
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Uğurlu əməliyyat</p>
              <p className="text-lg font-bold text-gray-900">{totalTransactions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ÖDƏNİŞ FORMU ═══ */}
      <BalanceForm balance={balance} />

      {/* ═══ SON ÖDƏNİŞLƏR ═══ */}
      {allPayments.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
          <h2 className="font-bold text-gray-900 mb-4">Son ödənişlər</h2>
          <div className="space-y-2">
            {allPayments.slice(0, 5).map((p) => {
              const statusColors: Record<string, string> = {
                paid: 'bg-green-100 text-green-700',
                pending: 'bg-yellow-100 text-yellow-700',
                failed: 'bg-red-100 text-red-700',
                refunded: 'bg-gray-100 text-gray-700',
              }
              const statusLabels: Record<string, string> = {
                paid: 'Ödənilib',
                pending: 'Gözləyir',
                failed: 'Uğursuz',
                refunded: 'Qaytarılıb',
              }
              return (
                <div key={p.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {Number(p.amount).toFixed(2)} AZN
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(p.created_at).toLocaleString('az-AZ')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[p.status] || statusColors.pending}`}>
                    {statusLabels[p.status] || p.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
