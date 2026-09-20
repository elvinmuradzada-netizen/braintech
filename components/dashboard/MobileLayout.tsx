'use client'

import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function MobileLayout({
  profile,
  balance,
  children,
}: {
  profile: any
  balance: number
  children: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header profile={profile} onMenuClick={() => setMenuOpen(true)} />

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 lg:hidden ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              BT
            </div>
            <span className="font-bold text-gray-900">Menyu</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
            aria-label="Bağla"
          >
            ✕
          </button>
        </div>
        <Sidebar profile={profile} balance={balance} onClose={() => setMenuOpen(false)} />
      </div>

      {/* Desktop Layout */}
      <div className="flex">
        <Sidebar profile={profile} balance={balance} />
        <main className="flex-1 min-h-[calc(100vh-64px)] p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
