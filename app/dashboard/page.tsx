import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const role = profile?.role
  const initial = (profile?.full_name || 'U').charAt(0).toUpperCase()

  // ═══════════════════════════════════════════════════════
  // DİREKTOR PANELI
  // ═══════════════════════════════════════════════════════
  if (role === 'director') {
    const { count: totalStudents } = await supabase
      .from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')
    const { count: totalTeachers } = await supabase
      .from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher')
    const { count: totalExams } = await supabase
      .from('exams').select('*', { count: 'exact', head: true })
    const { count: totalAttempts } = await supabase
      .from('attempts').select('*', { count: 'exact', head: true }).eq('status', 'completed')
    const { data: attempts } = await supabase
      .from('attempts').select('percentage, student_id').eq('status', 'completed')

    const avgScore = attempts && attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / attempts.length)
      : 0
    const uniqueStudents = new Set(attempts?.map(a => a.student_id)).size

    const { data: recentExams } = await supabase
      .from('exams')
      .select('*, subjects(name, icon), profiles:teacher_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(5)

    return (
      <div className="max-w-6xl mx-auto">
        {/* Purple Banner */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-3xl p-6 md:p-8 mb-6 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold border-4 border-white/40">
              {initial}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{profile?.full_name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">👨‍💼 Direktor</span>
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs">📍 Bakı, Azərbaycan</span>
              </div>
            </div>
            <div className="hidden md:block text-7xl opacity-20">🏫</div>
          </div>
        </div>

        {/* 4 stat kart */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: '👨‍🎓', label: 'Şagirdlər', value: totalStudents || 0, color: 'purple' },
            { icon: '👨‍🏫', label: 'Müəllimlər', value: totalTeachers || 0, color: 'blue' },
            { icon: '📝', label: 'İmtahanlar', value: totalExams || 0, color: 'green' },
            { icon: '📊', label: 'Orta bal', value: `${avgScore}%`, color: 'yellow' },
          ].map((s, i) => {
            const colors: Record<string, { bg: string; icon: string; text: string }> = {
              purple: { bg: 'bg-purple-50', icon: 'bg-purple-100', text: 'text-purple-600' },
              blue: { bg: 'bg-blue-50', icon: 'bg-blue-100', text: 'text-blue-600' },
              green: { bg: 'bg-green-50', icon: 'bg-green-100', text: 'text-green-600' },
              yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100', text: 'text-yellow-600' },
            }
            const c = colors[s.color]
            return (
              <div key={i} className={`${c.bg} rounded-2xl p-5 border border-white shadow-sm hover:shadow-lg transition-all`}>
                <div className={`w-12 h-12 rounded-full ${c.icon} flex items-center justify-center text-2xl mb-3`}>
                  {s.icon}
                </div>
                <div className="text-xs text-gray-500 font-medium mb-1">{s.label}</div>
                <div className={`text-3xl font-bold ${c.text}`}>{s.value}</div>
              </div>
            )
          })}
        </div>

        {/* Məktəb statistikası */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            📊 Məktəb statistikası
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Aktiv şagirdlər', value: uniqueStudents, total: totalStudents || 1, color: 'purple' },
              { label: 'Tamamlanmış imtahanlar', value: totalAttempts, total: 100, color: 'green' },
              { label: 'Orta bal', value: avgScore, total: 100, color: 'indigo', suffix: '%' },
            ].map((s, i) => {
              const pct = Math.min((s.value / s.total) * 100, 100)
              const colors: Record<string, string> = {
                purple: 'from-purple-500 to-purple-600',
                green: 'from-green-500 to-emerald-500',
                indigo: 'from-indigo-500 to-purple-500',
              }
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 font-medium">{s.label}</span>
                    <span className="font-bold text-gray-900">{s.value}{s.suffix || ''}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${colors[s.color]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Son imtahanlar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            📝 Son imtahanlar
          </h2>
          {recentExams && recentExams.length > 0 ? (
            <div className="space-y-2">
              {recentExams.map((e: any) => (
                <Link key={e.id} href={`/dashboard/exams/${e.id}`}
                  className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-purple-300 hover:bg-purple-50/30 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-xl">
                      {e.subjects?.icon || '📝'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{e.title}</p>
                      <p className="text-xs text-gray-500">{e.profiles?.full_name} • {e.grade_level}-ci sinif</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    e.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {e.is_published ? 'Yayımlanıb' : 'Qaralama'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">Hələ imtahan yoxdur</p>
          )}
        </div>

        {/* Sürətli keçidlər */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sürətli keçidlər</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '📊', label: 'Məktəb statistikası', href: '/dashboard/school', color: 'purple' },
              { icon: '👨‍🏫', label: 'Müəllim performansı', href: '/dashboard/teachers', color: 'blue' },
              { icon: '👨‍🎓', label: 'Şagird statistikası', href: '/dashboard/students', color: 'green' },
              { icon: '🏆', label: 'Rayon reytinqi', href: '/dashboard/ranking', color: 'yellow' },
            ].map((item) => {
              const colors: Record<string, string> = {
                purple: 'bg-purple-50 text-purple-600 hover:border-purple-300',
                blue: 'bg-blue-50 text-blue-600 hover:border-blue-300',
                green: 'bg-green-50 text-green-600 hover:border-green-300',
                yellow: 'bg-yellow-50 text-yellow-600 hover:border-yellow-300',
              }
              return (
                <Link key={item.href} href={item.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-100 hover:shadow-md transition">
                  <div className={`w-14 h-14 rounded-2xl ${colors[item.color].split(' ')[0]} flex items-center justify-center text-2xl`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-gray-700 text-center">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════
  // MÜƏLLİM PANELİ
  // ═══════════════════════════════════════════════════════
  if (role === 'teacher') {
    const { count: examCount } = await supabase
      .from('exams').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id)
    const { data: tExams } = await supabase
      .from('exams').select('id').eq('teacher_id', user.id)

    let attemptCount = 0
    let avgScore = 0
    let recentAttempts: any[] = []

    if (tExams && tExams.length > 0) {
      const examIds = tExams.map(e => e.id)
      const { count } = await supabase
        .from('attempts').select('*', { count: 'exact', head: true })
        .in('exam_id', examIds).eq('status', 'completed')
      attemptCount = count || 0

      const { data: allAttempts } = await supabase
        .from('attempts')
        .select('*, exams(id, title, subjects(name, icon))')
        .in('exam_id', examIds).eq('status', 'completed')
        .order('finished_at', { ascending: false }).limit(5)
      recentAttempts = allAttempts || []

      const { data: allForAvg } = await supabase
        .from('attempts').select('percentage')
        .in('exam_id', examIds).eq('status', 'completed')
      if (allForAvg && allForAvg.length > 0) {
        avgScore = Math.round(allForAvg.reduce((s, a) => s + Number(a.percentage || 0), 0) / allForAvg.length)
      }
    }

    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 md:p-8 mb-6 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold border-4 border-white/40">
              {initial}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{profile?.full_name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">👨‍🏫 Müəllim</span>
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs">📍 Bakı, Azərbaycan</span>
              </div>
            </div>
            <div className="hidden md:block text-7xl opacity-20">📚</div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: '📝', label: 'İmtahanlarım', value: examCount || 0, color: 'blue' },
            { icon: '👨‍🎓', label: 'Şagird cəhdləri', value: attemptCount, color: 'green' },
            { icon: '📊', label: 'Orta bal', value: `${avgScore}%`, color: 'purple' },
            { icon: '➕', label: 'Yeni imtahan', value: 'Yarat', color: 'yellow', href: '/dashboard/exams/new' },
          ].map((s, i) => {
            const colors: Record<string, { bg: string; icon: string; text: string }> = {
              blue: { bg: 'bg-blue-50', icon: 'bg-blue-100', text: 'text-blue-600' },
              green: { bg: 'bg-green-50', icon: 'bg-green-100', text: 'text-green-600' },
              purple: { bg: 'bg-purple-50', icon: 'bg-purple-100', text: 'text-purple-600' },
              yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100', text: 'text-yellow-600' },
            }
            const c = colors[s.color]
            const content = (
              <>
                <div className={`w-12 h-12 rounded-full ${c.icon} flex items-center justify-center text-2xl mb-3`}>
                  {s.icon}
                </div>
                <div className="text-xs text-gray-500 font-medium mb-1">{s.label}</div>
                <div className={`text-2xl font-bold ${c.text}`}>{s.value}</div>
              </>
            )
            return s.href ? (
              <Link key={i} href={s.href} className={`${c.bg} rounded-2xl p-5 border border-white shadow-sm hover:shadow-lg transition-all`}>
                {content}
              </Link>
            ) : (
              <div key={i} className={`${c.bg} rounded-2xl p-5 border border-white shadow-sm hover:shadow-lg transition-all`}>
                {content}
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            📊 Son şagird nəticələri
          </h2>
          {recentAttempts.length > 0 ? (
            <div className="space-y-2">
              {recentAttempts.map((a: any) => {
                const percent = Math.round(Number(a.percentage) || 0)
                return (
                  <Link key={a.id} href={`/dashboard/exams/${a.exams?.id}/results`}
                    className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                        {a.exams?.subjects?.icon || '📝'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{a.exams?.title}</p>
                        <p className="text-xs text-gray-500">
                          {a.finished_at ? new Date(a.finished_at).toLocaleDateString('az-AZ') : '—'}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold text-lg ${
                      percent >= 80 ? 'text-green-600' :
                      percent >= 60 ? 'text-blue-600' : 'text-orange-500'
                    }`}>{percent}%</span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm text-gray-400">Hələ şagird cəhdi yoxdur</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sürətli keçidlər</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '➕', label: 'Yeni imtahan', href: '/dashboard/exams/new', color: 'blue' },
              { icon: '📝', label: 'İmtahanlarım', href: '/dashboard/exams', color: 'indigo' },
              { icon: '📊', label: 'Nəticələr', href: '/dashboard/results', color: 'green' },
              { icon: '👥', label: 'Siniflərim', href: '/dashboard/classes', color: 'purple' },
            ].map((item) => {
              const colors: Record<string, string> = {
                blue: 'bg-blue-50 text-blue-600',
                indigo: 'bg-indigo-50 text-indigo-600',
                green: 'bg-green-50 text-green-600',
                purple: 'bg-purple-50 text-purple-600',
              }
              return (
                <Link key={item.href} href={item.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-md transition">
                  <div className={`w-14 h-14 rounded-2xl ${colors[item.color]} flex items-center justify-center text-2xl`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-gray-700 text-center">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════
  // ŞAGİRD PANELİ (TAM YENİ DİZAYN)
  // ═══════════════════════════════════════════════════════
  let activeExam: any = null
  let nextExam: any = null
  let totalAttempts = 0
  let certificatesCount = 0
  let recentAttempts: any[] = []
  let chartData: { month: string; value: number }[] = []

  const { data: availableExams } = await supabase
    .from('exams')
    .select('*, subjects(name, icon)')
    .eq('is_published', true)
    .eq('grade_level', profile?.grade_level)
    .order('created_at', { ascending: false })

  const { data: inProgress } = await supabase
    .from('attempts')
    .select('*, exams(title, duration_minutes, subjects(name, icon))')
    .eq('student_id', user.id).eq('status', 'in_progress')
    .order('started_at', { ascending: false }).limit(1).single()

  if (inProgress) activeExam = inProgress
  if (availableExams && availableExams.length > 0) nextExam = availableExams[0]

  const { data: attempts } = await supabase
    .from('attempts')
    .select('*, exams(id, title, subjects(name, icon))')
    .eq('student_id', user.id).eq('status', 'completed')
    .order('finished_at', { ascending: false })

  recentAttempts = attempts || []
  totalAttempts = recentAttempts.length
  certificatesCount = recentAttempts.filter(a => Number(a.percentage || 0) >= 70).length

  if (totalAttempts > 0) {
    const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek']
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthAttempts = recentAttempts.filter(a => {
        const ad = new Date(a.finished_at)
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear()
      })
      const avg = monthAttempts.length > 0
        ? Math.round(monthAttempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / monthAttempts.length)
        : 0
      chartData.push({ month: monthNames[d.getMonth()], value: avg })
    }
  }

  const avgScore = totalAttempts > 0
    ? Math.round(recentAttempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / totalAttempts)
    : 0

  // İmtahana uyğun şəkil seç
  const studentImg = (profile?.grade_level || 1) <= 4
    ? '/images/sagird-3.jpg'
    : (profile?.grade_level || 1) <= 7
    ? '/images/sagird-1.jpg'
    : '/images/hero-1.jpg'

  return (
    <div className="max-w-6xl mx-auto">
      {/* ═══ BANNER ═══ */}
      <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-6 md:p-8 mb-6 text-white overflow-hidden shadow-xl">
        {/* Dekor */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white/40 shadow-lg bg-white">
              <Image src={studentImg} alt={profile?.full_name} width={96} height={96} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-xs border-4 border-white">
              ✓
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{profile?.full_name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
                👨‍🎓 {profile?.grade_level || '?'}-ci sinif
              </span>
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs">
                📍 Bakı, Azərbaycan
              </span>
            </div>
            <p className="text-sm opacity-90 mt-2 hidden md:block">
              Xoş gəldin! Bugün yeni bir nailiyyət qazanmağa hazırsan? 💪
            </p>
          </div>
          <div className="hidden lg:block text-8xl opacity-20">🎓</div>
        </div>
      </div>

      {/* ═══ 4 STAT KART ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg shadow-md">
              ▶️
            </div>
            <span className="text-xs text-blue-700 font-bold">Aktiv imtahanım</span>
          </div>
          <div className="text-base font-bold text-blue-900 line-clamp-2 min-h-[44px]">
            {activeExam ? activeExam.exams?.title : 'Yoxdur'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border border-purple-200 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center text-lg shadow-md">
              ⏰
            </div>
            <span className="text-xs text-purple-700 font-bold">Növbəti imtahan</span>
          </div>
          <div className="text-base font-bold text-purple-900">
            {nextExam ? nextExam.title.slice(0, 20) + '...' : 'Tezliklə'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-lg shadow-md">
              📝
            </div>
            <span className="text-xs text-green-700 font-bold">Ümumi imtahan</span>
          </div>
          <div className="text-3xl font-bold text-green-900">{totalAttempts}</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-100/50 rounded-2xl p-5 border border-yellow-200 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center text-lg shadow-md">
              🏆
            </div>
            <span className="text-xs text-yellow-700 font-bold">Sertifikatlarım</span>
          </div>
          <div className="text-3xl font-bold text-yellow-900">{certificatesCount}</div>
        </div>
      </div>

      {/* ═══ 3 ƏSAS KART ═══ */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Balans */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col">
          <h3 className="font-bold text-gray-900 mb-4 text-center">💰 Balansım</h3>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-4xl shadow-lg">
              💵
            </div>
          </div>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-gray-900 mb-1">0.00</div>
            <div className="text-xs text-gray-500 font-medium">AZN</div>
            <p className="text-[10px] text-gray-400 mt-1">Cari balans</p>
          </div>
          <div className="flex gap-2 mt-auto">
            <Link href="/dashboard/balance" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs py-2.5 rounded-xl font-bold transition text-center shadow-md">
              Balansı artır
            </Link>
            <Link href="/dashboard/balance" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-2.5 rounded-xl font-bold transition text-center">
              Tarixçə
            </Link>
          </div>
        </div>

        {/* Son nəticə */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col">
          <h3 className="font-bold text-gray-900 mb-4 text-center">🏆 Son nəticəm</h3>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center text-4xl shadow-lg">
              🏆
            </div>
          </div>
          {totalAttempts > 0 ? (
            <>
              <div className="text-center mb-4">
                <div className={`text-4xl font-bold mb-1 ${
                  avgScore >= 80 ? 'text-green-600' :
                  avgScore >= 60 ? 'text-emerald-600' : 'text-orange-500'
                }`}>{avgScore}%</div>
                <div className="text-xs text-gray-500 font-medium">Orta bal</div>
                <p className="text-[10px] text-gray-400 mt-1">{totalAttempts} imtahandan</p>
              </div>
            </>
          ) : (
            <div className="text-center mb-4 flex-1 flex items-center justify-center">
              <p className="text-xs text-gray-500 leading-relaxed px-4">
                Hələ tamamlanmış imtahan yoxdur.<br />
                İlk imtahanı ver və nəticəni gör!
              </p>
            </div>
          )}
          <Link href="/dashboard/exams" className="block bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-2.5 rounded-xl font-bold transition text-center mt-auto">
            İmtahanlara bax →
          </Link>
        </div>

        {/* İnkişaf dinamikam */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col">
          <h3 className="font-bold text-gray-900 mb-4 text-center">📈 İnkişaf dinamikam</h3>
          {chartData.length > 0 && chartData.some(d => d.value > 0) ? (
            <>
              <div className="flex-1 flex items-end gap-1.5 h-32 mb-4">
                {chartData.map((d, i) => {
                  const h = Math.max(d.value * 1.1, 6)
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group">
                      <div className="text-[9px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition mb-1">
                        {d.value}%
                      </div>
                      <div className="w-full bg-gradient-to-t from-green-500 via-emerald-400 to-teal-300 rounded-t-lg transition-all duration-500 hover:opacity-80"
                        style={{ height: `${h}px`, minHeight: '6px' }} />
                      <div className="text-[9px] text-gray-400 mt-1">{d.month}</div>
                    </div>
                  )
                })}
              </div>
              <Link href="/dashboard/statistics" className="block text-center text-xs text-green-600 font-bold hover:underline mt-auto">
                Daha ətraflı statistika →
              </Link>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-gray-500 text-center">
                Hələ məlumat yoxdur.<br />
                İmtahan verdikcə burada qrafik görünəcək.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ SON FƏALİYYƏTLƏR ═══ */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            📋 Son fəaliyyətlər
          </h2>
          {recentAttempts.length > 0 && (
            <Link href="/dashboard/results" className="text-xs text-green-600 font-bold hover:underline">
              Hamısına bax →
            </Link>
          )}
        </div>
        {recentAttempts.length > 0 ? (
          <div className="space-y-2">
            {recentAttempts.slice(0, 3).map((a) => {
              const percent = Math.round(Number(a.percentage) || 0)
              return (
                <Link key={a.id} href={`/dashboard/exams/${(a.exams as any)?.id}`}
                  className="flex justify-between items-center p-3 border border-gray-100 rounded-2xl hover:border-green-300 hover:bg-green-50/30 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-xl">
                      {(a.exams as any)?.subjects?.icon || '📝'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{(a.exams as any)?.title}</p>
                      <p className="text-xs text-gray-500">
                        {a.finished_at ? new Date(a.finished_at).toLocaleDateString('az-AZ') : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${
                      percent >= 80 ? 'text-green-600' :
                      percent >= 60 ? 'text-emerald-600' : 'text-orange-500'
                    }`}>{percent}%</div>
                    <div className="text-[10px] text-gray-400">{a.score}/{a.max_score} bal</div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm text-gray-400 font-medium">Hələlik heç bir fəaliyyət yoxdur</p>
            <Link href="/dashboard/exams" className="inline-block mt-3 text-xs text-green-600 font-bold hover:underline">
              İlk imtahanı ver →
            </Link>
          </div>
        )}
      </div>

      {/* ═══ TEZ KEÇİDLƏR ═══ */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Tez keçidlər</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { icon: '📝', label: 'İmtahanlarım', href: '/dashboard/exams', bg: 'bg-gradient-to-br from-green-100 to-emerald-100', color: 'text-green-600' },
            { icon: '📊', label: 'Statistikam', href: '/dashboard/statistics', bg: 'bg-gradient-to-br from-blue-100 to-cyan-100', color: 'text-blue-600' },
            { icon: '📋', label: 'Nəticələrim', href: '/dashboard/results', bg: 'bg-gradient-to-br from-purple-100 to-violet-100', color: 'text-purple-600' },
            { icon: '📈', label: 'İnkişafım', href: '/dashboard/progress', bg: 'bg-gradient-to-br from-orange-100 to-amber-100', color: 'text-orange-600' },
            { icon: '🎓', label: 'Sertifikatlarım', href: '/dashboard/certificates', bg: 'bg-gradient-to-br from-yellow-100 to-amber-100', color: 'text-yellow-600' },
            { icon: '⚙️', label: 'Məlumatlarım', href: '/dashboard/profile', bg: 'bg-gradient-to-br from-pink-100 to-rose-100', color: 'text-pink-600' },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-gray-100 hover:border-green-300 hover:shadow-md transition min-h-[100px] justify-center">
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center text-2xl shadow-sm`}>
                {item.icon}
              </div>
              <span className="text-[11px] font-bold text-gray-700 text-center leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ MOTIVASİYA + XƏBƏR BANNERLƏRİ ═══ */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Motivasiya */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold opacity-80 mb-2">💡 BRAINTECH TÖVSİYƏSİ</p>
            <p className="text-lg font-bold leading-tight mb-2">
              "Müvəffəqiyyət kiçik addımların böyük nəticəsidir."
            </p>
            <p className="text-xs opacity-90">Bugün 15 dəqiqə əlavə öyrənməyə başla!</p>
          </div>
          <div className="absolute right-3 bottom-2 text-6xl opacity-20">💡</div>
        </div>

        {/* Xəbərlər */}
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-6 border-2 border-green-200 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold text-green-700 mb-2">📢 PLATFORMA XƏBƏRLƏRİ</p>
            <p className="text-sm font-bold text-gray-900 mb-1">Yeni funksiyalar əlavə olundu!</p>
            <p className="text-xs text-gray-600 mb-3">
              İmtahan hazırlığı prosesini daha da asanlaşdıracaq yeniliklər artıq aktivdir.
            </p>
            <Link href="/#xeberler" className="inline-block bg-white text-green-700 text-xs font-bold px-4 py-2 rounded-xl border-2 border-green-300 hover:bg-green-50 transition">
              Yenilikləri kəşf et →
            </Link>
          </div>
          <div className="absolute right-3 bottom-2 text-6xl">🎁</div>
        </div>
      </div>
    </div>
  )
}
