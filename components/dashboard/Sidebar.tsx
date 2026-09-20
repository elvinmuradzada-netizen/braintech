'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar({ profile, balance = 0 }: { profile: any; balance?: number }) {
  const pathname = usePathname()
  const isStudent = profile?.role === 'student'

  const items = [
    { icon: '🏠', label: 'Ana səhifə', href: '/dashboard' },
    { icon: '👤', label: 'Şəxsi məlumatlar', href: '/dashboard/profile' },
    ...(isStudent ? [
      { icon: '💳', label: 'Balansım', href: '/dashboard/balance', badge: `${balance.toFixed(2)} AZN` },
    ] : []),
    { icon: '📝', label: 'İmtahanlar', href: '/dashboard/exams' },
    ...(isStudent ? [
      { icon: '📋', label: 'İmtahan nəticələrim', href: '/dashboard/results' },
      { icon: '📊', label: 'İmtahan statistikam', href: '/dashboard/statistics' },
      { icon: '📈', label: 'Mənim inkişaf dinamikam', href: '/dashboard/progress' },
      { icon: '🏆', label: 'Reytinq', href: '/dashboard/leaderboard' },
      { icon: '🎓', label: 'Sertifikatlarım', href: '/dashboard/certificates' },
    ] : []),
    { icon: '📬', label: 'Məktub qutusu', href: '/dashboard/inbox' },
    { icon: '🔒', label: 'Şifrəni dəyiş', href: '/dashboard/settings' },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 min-h-[calc(100vh-64px)] sticky top-16">
      {/* Tədris ili */}
      <div className="p-4 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-500 mb-2">TƏDRİS İLİ</div>
        <select className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-800 border border-gray-100 outline-none">
          <option>2026-2027 (cari tədris ili)</option>
          <option>2025-2026</option>
          <option>2024-2025</option>
        </select>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-xs text-green-600 font-bold">{item.badge}</span>
              )}
            </Link>
          )
        })}

        {/* Çıxış */}
        <Link
          href="/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition mt-2"
        >
          <span className="text-lg">🚪</span>
          <span>Çıxış</span>
        </Link>
      </nav>

      {/* Promo */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 text-center">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-xs font-bold text-gray-900 leading-tight mb-1">
            Daha çox öyrən, daha çox nailiyyət qazan!
          </p>
          <p className="text-[11px] text-gray-500 leading-tight">
            Nəticələrini təhlil et və inkişafını izlə.
          </p>
        </div>
      </div>
    </aside>
  )
}
