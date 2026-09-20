'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar({
  profile,
  balance = 0,
  onClose,
}: {
  profile: any
  balance?: number
  onClose?: () => void
}) {
  const pathname = usePathname()
  const role = profile?.role

  const getMenuItems = () => {
    const common = [
      { icon: '🏠', label: 'Ana səhifə', href: '/dashboard' },
      { icon: '👤', label: 'Şəxsi məlumatlar', href: '/dashboard/profile' },
    ]

    if (role === 'student') {
      return [
        ...common,
        { icon: '💳', label: 'Balansım', href: '/dashboard/balance', badge: `${balance.toFixed(2)} AZN` },
        { icon: '📝', label: 'İmtahanlar', href: '/dashboard/exams' },
        { icon: '📋', label: 'İmtahan nəticələrim', href: '/dashboard/results' },
        { icon: '📊', label: 'İmtahan statistikam', href: '/dashboard/statistics' },
        { icon: '📈', label: 'Mənim inkişaf dinamikam', href: '/dashboard/progress' },
        { icon: '🏆', label: 'Reytinq', href: '/dashboard/leaderboard' },
        { icon: '🎓', label: 'Sertifikatlarım', href: '/dashboard/certificates' },
        { icon: '📬', label: 'Məktub qutusu', href: '/dashboard/inbox' },
        { icon: '🔒', label: 'Şifrəni dəyiş', href: '/dashboard/settings' },
      ]
    }

    if (role === 'teacher') {
      return [
        ...common,
        { icon: '📝', label: 'İmtahanlarım', href: '/dashboard/exams' },
        { icon: '➕', label: 'Yeni imtahan', href: '/dashboard/exams/new' },
        { icon: '📊', label: 'Nəticələr', href: '/dashboard/results' },
        { icon: '👥', label: 'Siniflərim', href: '/dashboard/classes' },
        { icon: '📈', label: 'Statistikam', href: '/dashboard/statistics' },
        { icon: '📬', label: 'Məktub qutusu', href: '/dashboard/inbox' },
        { icon: '🔒', label: 'Şifrəni dəyiş', href: '/dashboard/settings' },
      ]
    }

    if (role === 'director') {
      return [
        ...common,
        { icon: '📊', label: 'Məktəb statistikası', href: '/dashboard/school' },
        { icon: '👨‍🏫', label: 'Müəllim performansı', href: '/dashboard/teachers' },
        { icon: '👨‍🎓', label: 'Şagird statistikası', href: '/dashboard/students' },
        { icon: '🏫', label: 'Siniflər', href: '/dashboard/classes' },
        { icon: '🏆', label: 'Rayon reytinqi', href: '/dashboard/ranking' },
        { icon: '📈', label: 'Hesabatlar', href: '/dashboard/reports' },
        { icon: '📬', label: 'Məktub qutusu', href: '/dashboard/inbox' },
        { icon: '🔒', label: 'Şifrəni dəyiş', href: '/dashboard/settings' },
      ]
    }

    if (role === 'parent') {
      return [
        ...common,
        { icon: '👶', label: 'Övladlarım', href: '/dashboard/children' },
        { icon: '📊', label: 'Nəticələr', href: '/dashboard/results' },
        { icon: '📈', label: 'İnkişaf', href: '/dashboard/statistics' },
        { icon: '📬', label: 'Məktub qutusu', href: '/dashboard/inbox' },
        { icon: '🔒', label: 'Şifrəni dəyiş', href: '/dashboard/settings' },
      ]
    }

    return common
  }

  const items = getMenuItems()

  const roleLabel =
    role === 'student' ? 'Şagird' :
    role === 'teacher' ? 'Müəllim' :
    role === 'director' ? 'Direktor' :
    role === 'parent' ? 'Valideyn' :
    role === 'admin' ? 'Admin' : 'İstifadəçi'

  const roleColor =
    role === 'student' ? 'bg-green-100 text-green-700' :
    role === 'teacher' ? 'bg-blue-100 text-blue-700' :
    role === 'director' ? 'bg-purple-100 text-purple-700' :
    role === 'parent' ? 'bg-pink-100 text-pink-700' :
    role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'

  function handleClick() {
    if (onClose) onClose()
  }

  // ⚡ ƏSAS DÜZƏLİŞ: mobil drawer üçün `flex`, desktop üçün `hidden lg:flex`
  const asideClass = onClose
    ? "flex flex-col w-full h-full bg-white overflow-y-auto"
    : "hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 min-h-[calc(100vh-64px)] sticky top-16"

  return (
    <aside className={asideClass}>
      {/* Tədris ili */}
      <div className="p-4 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-500 mb-2">TƏDRİS İLİ</div>
        <select className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-800 border border-gray-100 outline-none">
          <option>2026-2027 (cari tədris ili)</option>
          <option>2025-2026</option>
          <option>2024-2025</option>
        </select>
      </div>

      {/* Rol göstəricisi */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${roleColor}`}>
            {roleLabel}
          </span>
          <span className="text-xs text-gray-500">kimi daxil olmusunuz</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item: any) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleClick}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition min-h-[44px] ${
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
          onClick={handleClick}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition mt-2 min-h-[44px]"
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
