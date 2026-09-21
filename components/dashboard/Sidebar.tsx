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

  const asideClass = onClose
    ? "flex flex-col w-full h-full bg-white overflow-y-auto"
    : "hidden lg:flex flex-col w-[27rem] bg-white border-r border-gray-100 min-h-[calc(100vh-64px)] sticky top-16"

  return (
    <aside className={asideClass}>
      {/* Tədris ili */}
      <div className="p-5 border-b border-gray-100">
        <div style={{ fontWeight: 800 }} className="text-sm text-gray-600 mb-2 tracking-wider">
          TƏDRİS İLİ
        </div>
        <select
          style={{ fontWeight: 700 }}
          className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-800 border border-gray-100 outline-none cursor-pointer"
        >
          <option>2026-2027 (cari tədris ili)</option>
          <option>2025-2026</option>
          <option>2024-2025</option>
        </select>
      </div>

      {/* Rol göstəricisi */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span
            style={{ fontWeight: 800 }}
            className={`text-sm px-3 py-1.5 rounded-full ${roleColor}`}
          >
            {roleLabel}
          </span>
          <span style={{ fontWeight: 700 }} className="text-xs text-gray-500">
            kimi daxil olmusunuz
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {items.map((item: any) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleClick}
              style={{ fontWeight: 800 }}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base transition min-h-[52px] ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span style={{ fontWeight: 800 }} className="text-sm text-green-600">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}

        {/* Çıxış */}
        <Link
          href="/logout"
          onClick={handleClick}
          style={{ fontWeight: 800 }}
          className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-base text-red-500 hover:bg-red-50 transition mt-2 min-h-[52px]"
        >
          <span className="text-xl">🚪</span>
          <span>Çıxış</span>
        </Link>
      </nav>

      {/* Promo */}
      <div className="p-5 border-t border-gray-100">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 text-center">
          <div className="text-5xl mb-3">📚</div>
          <p
            style={{ fontWeight: 800 }}
            className="text-sm text-gray-900 leading-tight mb-2"
          >
            Daha çox öyrən, daha çox nailiyyət qazan!
          </p>
          <p
            style={{ fontWeight: 600 }}
            className="text-xs text-gray-500 leading-tight"
          >
            Nəticələrini təhlil et və inkişafını izlə.
          </p>
        </div>
      </div>
    </aside>
  )
}
