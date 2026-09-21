'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Exam = {
  id: string
  title: string
  description: string
  grade_level: number
  duration_minutes: number
  passing_score: number
  is_published: boolean
  is_paid: boolean
  price: number
  created_at: string
  subjects: { name: string; icon: string }
  profiles?: { full_name: string }
}

type Tab = 'all' | 'diagnostic' | 'competition' | 'sample' | 'monitoring' | 'final'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'all', label: 'Hamısı', icon: '☰' },
  { id: 'diagnostic', label: 'Diaqnostik', icon: '📊' },
  { id: 'competition', label: 'Bilik yarışları', icon: '🏆' },
  { id: 'sample', label: 'Sınaq imtahanları', icon: '📝' },
  { id: 'monitoring', label: 'Monitorinq', icon: '📈' },
  { id: 'final', label: 'Buraxılış', icon: '🎓' },
]

function detectType(exam: Exam): Tab {
  const t = exam.title.toLowerCase()
  if (t.includes('diaqnostik') || t.includes('diagnostik')) return 'diagnostic'
  if (t.includes('bilik yarışı') || t.includes('yarış')) return 'competition'
  if (t.includes('buraxılış') || t.includes('buraxilis')) return 'final'
  if (t.includes('monitoring') || t.includes('monitorinq')) return 'monitoring'
  if (t.includes('sınaq') || t.includes('sinac')) return 'sample'
  return 'sample'
}

const TYPE_STYLES: Record<Tab, { badge: string; color: string; icon: string; label: string }> = {
  all: { badge: 'bg-gray-100 text-gray-700', color: 'from-gray-400 to-gray-500', icon: '📚', label: 'İmtahan' },
  diagnostic: { badge: 'bg-orange-100 text-orange-700', color: 'from-orange-400 to-orange-500', icon: '📊', label: 'Diaqnostik' },
  competition: { badge: 'bg-purple-100 text-purple-700', color: 'from-purple-400 to-purple-500', icon: '🏆', label: 'Bilik yarışı' },
  sample: { badge: 'bg-green-100 text-green-700', color: 'from-green-400 to-green-500', icon: '📝', label: 'Sınaq imtahanı' },
  monitoring: { badge: 'bg-blue-100 text-blue-700', color: 'from-blue-400 to-blue-500', icon: '📈', label: 'Monitorinq' },
  final: { badge: 'bg-red-100 text-red-700', color: 'from-red-400 to-red-500', icon: '🎓', label: 'Buraxılış' },
}

export default function ExamsFilters({
  exams,
  role,
  attempts,
  payments,
}: {
  exams: Exam[]
  role: string
  attempts: any[]
  payments: any[]
}) {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const isStudent = role === 'student'
  const isTeacher = role === 'teacher' || role === 'admin'

  const examsWithType = useMemo(
    () => exams.map(e => ({ ...e, type: detectType(e) })),
    [exams]
  )

  const filtered = useMemo(() => {
    if (activeTab === 'all') return examsWithType
    return examsWithType.filter(e => e.type === activeTab)
  }, [examsWithType, activeTab])

  const tabCounts = useMemo(() => {
    const counts: Record<Tab, number> = {
      all: examsWithType.length,
      diagnostic: 0, competition: 0, sample: 0, monitoring: 0, final: 0,
    }
    examsWithType.forEach(e => {
      if (e.type in counts) counts[e.type as Tab]++
    })
    return counts
  }, [examsWithType])

  function hasPaid(examId: string) {
    return payments.some(p => p.exam_id === examId && p.status === 'paid')
  }

  function getAttempt(examId: string) {
    return attempts.find(a => a.exam_id === examId && a.status === 'completed')
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }

  if (exams.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
        <p className="text-5xl mb-4">📭</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isTeacher ? 'Hələ imtahan yaratmamısınız' : 'Hələ imtahan yoxdur'}
        </h2>
        <p className="text-gray-500 mb-6">
          {isTeacher ? 'İlk imtahanınızı yaradın' : 'İmtahanlar yayımlandıqda burada görünəcək'}
        </p>
        {isTeacher && (
          <Link href="/dashboard/exams/new"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition">
            ➕ İlk imtahanı yarat
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      {/* ═══ TABLAR ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id
              const count = tabCounts[tab.id]
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition min-h-[44px] ${
                    isActive
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
                viewMode === 'grid' ? 'bg-white shadow text-green-600' : 'text-gray-400'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
                viewMode === 'list' ? 'bg-white shadow text-green-600' : 'text-gray-400'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ NƏTİCƏ ═══ */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500">Bu kateqoriyada imtahan yoxdur</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((exam) => {
            const style = TYPE_STYLES[exam.type]
            const paid = hasPaid(exam.id)
            const attempt = getAttempt(exam.id)
            const isLocked = isStudent && exam.is_paid && !paid

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className={`relative bg-gradient-to-br ${style.color} p-4 pb-6`}>
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`${style.badge} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase`}>
                      {style.icon} {style.label}
                    </span>
                  </div>

                  {exam.is_paid && (
                    <div className="absolute top-3 right-3 z-10">
                      {paid ? (
                        <span className="bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          ✓ Ödənilib
                        </span>
                      ) : (
                        <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          💰 {exam.price} AZN
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-center mt-4 mb-2">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/30 backdrop-blur border-2 border-white/50">
                      <Image
                        src={
                          exam.grade_level <= 3 ? '/images/sagird-3.jpg' :
                          exam.grade_level <= 6 ? '/images/sagird-1.jpg' :
                          '/images/hero-1.jpg'
                        }
                        alt={exam.title}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 min-h-[40px]">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {exam.subjects?.icon} {exam.subjects?.name} • {exam.grade_level}-ci sinif
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span>📅</span>
                      <span>{formatDate(exam.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span>📝</span>
                      <span>{exam.duration_minutes} dəq</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span>🎯</span>
                      <span>Keçid: {exam.passing_score}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span>📚</span>
                      <span>{exam.is_published ? 'Yayımlanıb' : 'Qaralama'}</span>
                    </div>
                  </div>

                  {attempt && isStudent && (
                    <div className={`mb-3 text-xs font-bold px-3 py-2 rounded-lg text-center ${
                      Number(attempt.percentage) >= 60
                        ? 'bg-green-50 text-green-700'
                        : 'bg-orange-50 text-orange-700'
                    }`}>
                      Nəticəniz: {Math.round(Number(attempt.percentage))}%
                    </div>
                  )}

                  <div className="mt-auto space-y-2">
                    {isTeacher ? (
                      <>
                        <Link
                          href={`/dashboard/exams/${exam.id}/edit`}
                          className="block text-center bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-xl font-bold transition"
                        >
                          ✏️ Redaktə et →
                        </Link>
                        <Link
                          href={`/dashboard/exams/${exam.id}/results`}
                          className="block text-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-2 rounded-xl font-bold transition"
                        >
                          📊 Nəticələrə bax
                        </Link>
                      </>
                    ) : isLocked ? (
                      <Link
                        href={`/dashboard/exams/${exam.id}`}
                        className="block text-center bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-2.5 rounded-xl font-bold transition"
                      >
                        🔒 Ödəniş et →
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/exams/${exam.id}/take`}
                        className="block text-center bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-xl font-bold transition"
                      >
                        {attempt ? '🔄 Yenidən cəhd et' : 'İmtahana başla'} →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((exam) => {
            const style = TYPE_STYLES[exam.type]
            const paid = hasPaid(exam.id)
            const attempt = getAttempt(exam.id)
            const isLocked = isStudent && exam.is_paid && !paid

            return (
              <div key={exam.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${style.color} flex-shrink-0 flex items-center justify-center`}>
                    <span className="text-3xl">{style.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`${style.badge} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase`}>
                        {style.label}
                      </span>
                      {exam.is_paid && (
                        paid ? (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ✓ Ödənilib
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            💰 {exam.price} AZN
                          </span>
                        )
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">{exam.title}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                      <span>{exam.subjects?.icon} {exam.subjects?.name}</span>
                      <span>•</span>
                      <span>{exam.grade_level}-ci sinif</span>
                      <span>•</span>
                      <span>⏱ {exam.duration_minutes} dəq</span>
                      <span>•</span>
                      <span>🎯 {exam.passing_score}%</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 md:flex-shrink-0">
                    {isTeacher ? (
                      <>
                        <Link href={`/dashboard/exams/${exam.id}/edit`}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2.5 rounded-xl font-bold transition text-center">
                          ✏️ Redaktə
                        </Link>
                        <Link href={`/dashboard/exams/${exam.id}/results`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2.5 rounded-xl font-bold transition text-center">
                          📊 Nəticələr
                        </Link>
                      </>
                    ) : isLocked ? (
                      <Link href={`/dashboard/exams/${exam.id}`}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-5 py-2.5 rounded-xl font-bold transition text-center">
                        🔒 Ödəniş et
                      </Link>
                    ) : (
                      <Link href={`/dashboard/exams/${exam.id}/take`}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2.5 rounded-xl font-bold transition text-center whitespace-nowrap">
                        {attempt ? '🔄 Yenidən cəhd et' : 'İmtahana başla'} →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
