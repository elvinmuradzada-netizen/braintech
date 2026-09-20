import Link from 'next/link'
import { logout } from '@/lib/auth/actions'

export default function Header({ profile }: { profile: any }) {
  const initials = (profile?.full_name || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
            BT
          </div>
          <div className="hidden md:block">
            <div className="font-bold text-gray-900 leading-tight text-sm">BRAIN</div>
            <div className="text-xs text-gray-500 leading-tight">TECH</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {[
            { label: 'Biz kimik', href: '/' },
            { label: 'Platformalar', href: '/#platformalar' },
            { label: 'İmtahanlar', href: '/dashboard/exams' },
            { label: 'Xəbərlər', href: '/#xeberler' },
            { label: 'Əlaqə', href: '/#elaqe' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button className="relative w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
            <span className="text-lg">🔔</span>
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              0
            </span>
          </button>

          {/* User chip */}
          <Link href="/dashboard/profile" className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-gray-900 leading-tight">
                {profile?.full_name?.split(' ')[0] || 'İstifadəçi'} {profile?.full_name?.split(' ')[1]?.charAt(0) || ''}.
              </div>
            </div>
          </Link>

          {/* Logout */}
          <form action={logout}>
            <button
              type="submit"
              className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 px-2 py-1 rounded-lg transition"
            >
              <span>↪</span>
              <span className="hidden md:inline">Çıxış</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
