'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type MenuItem = {
  label: string
  href?: string
  submenu?: { label: string; href: string; icon?: string }[]
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Biz kimik',
    href: '/#haqqimizda',
  },
  {
    label: 'Platformalar',
    submenu: [
      { label: 'Texno Şagird', href: '/register', icon: '👨‍🎓' },
      { label: 'Texno Müəllim', href: '/register', icon: '👨‍🏫' },
      { label: 'Texno Direktor', href: '/register', icon: '👨‍💼' },
      { label: 'Onlayn imtahanlar', href: '/dashboard/exams', icon: '📝' },
    ],
  },
  {
    label: 'İmtahanlar',
    submenu: [
      { label: 'Məktəbəhazırlıq', href: '/dashboard/exams', icon: '🧒' },
      { label: '1-ci sinif', href: '/dashboard/exams', icon: '1️⃣' },
      { label: '2-ci sinif', href: '/dashboard/exams', icon: '2️⃣' },
      { label: '3-cü sinif', href: '/dashboard/exams', icon: '3️⃣' },
      { label: '4-cü sinif', href: '/dashboard/exams', icon: '4️⃣' },
      { label: '5-ci sinif', href: '/dashboard/exams', icon: '5️⃣' },
      { label: '6-cı sinif', href: '/dashboard/exams', icon: '6️⃣' },
      { label: '7-ci sinif', href: '/dashboard/exams', icon: '7️⃣' },
      { label: '8-ci sinif', href: '/dashboard/exams', icon: '8️⃣' },
      { label: '9-cu sinif', href: '/dashboard/exams', icon: '9️⃣' },
    ],
  },
  {
    label: 'Video həllər',
    submenu: [
      { label: 'Riyaziyyat', href: '#', icon: '🔢' },
      { label: 'Azərbaycan dili', href: '#', icon: '📖' },
      { label: 'İngilis dili', href: '#', icon: '🇬🇧' },
      { label: 'Fizika', href: '#', icon: '⚛️' },
    ],
  },
  {
    label: 'Vəsaitlər',
    submenu: [
      { label: 'PDF materiallar', href: '#', icon: '📄' },
      { label: 'Test bankı', href: '#', icon: '📚' },
      { label: 'Dərsliklər', href: '#', icon: '📕' },
    ],
  },
  {
    label: 'Xəbərlər',
    href: '/#xeberler',
  },
  {
    label: 'Əlaqə',
    href: '/#elaqe',
  },
]

export default function HeaderNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav ref={navRef} className="hidden lg:flex items-center gap-1">
      {MENU_ITEMS.map((item) => {
        const hasSubmenu = !!item.submenu && item.submenu.length > 0
        const isOpen = openMenu === item.label

        return (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => hasSubmenu && setOpenMenu(item.label)}
            onMouseLeave={() => hasSubmenu && setOpenMenu(null)}
          >
            {hasSubmenu ? (
              <button
                style={{ fontWeight: 800 }}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition ${
                  isOpen
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-800 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                <span>{item.label}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              <Link
                href={item.href || '#'}
                style={{ fontWeight: 800 }}
                className="block px-3 py-2 rounded-lg text-sm text-gray-800 hover:text-green-600 hover:bg-gray-50 transition"
              >
                {item.label}
              </Link>
            )}

            {hasSubmenu && isOpen && (
              <div className="absolute top-full left-0 pt-2 z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 min-w-[240px] animate-fadeIn">
                  {item.submenu!.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      onClick={() => setOpenMenu(null)}
                      style={{ fontWeight: 700 }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition"
                    >
                      {sub.icon && <span className="text-lg w-6 text-center">{sub.icon}</span>}
                      <span>{sub.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
