import { redirect } from 'next/navigation'
import Link from 'next/link'
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
  // DİREKTOR PANELI (BƏNÖVŞƏYİ)
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
      .from('attempts')
      .select('percentage, student_id, exams(subjects(name, icon))')
      .eq('status', 'completed')

    const avgScore = attempts && attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / attempts.length)
      : 0

    const uniqueStudents = new Set(attempts?.map(a => a.student_id)).size

    const subjectStats: Record<string, { name: string; icon: string; sum: number; count: number }> = {}
    attempts?.forEach(a => {
      const subj = (a.exams as any)?.subjects
      if (!subj) return
      if (!subjectStats[subj.name]) {
        subjectStats[subj.name] = { name: subj.name, icon: subj.icon, sum: 0, count: 0 }
      }
      subjectStats[subj.name].sum += Number(a.percentage || 0)
      subjectStats[subj.name].count++
    })
    const subjectList = Object.values(subjectStats)
      .map(s => ({ ...s, avg: Math.round(s.sum / s.count) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5)

    const { data: recentExams } = await supabase
      .from('exams')
      .select('*, subjects(name, icon), profiles:teacher_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(5)

    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden">
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold border-4 border-white/30">
              {initial}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{profile?.full_name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full font-medium">
                  👨‍💼 Direktor
                </span>
                <span className="flex items-center gap-1 opacity-90">📍 Bakı, Azərbaycan</span>
              </div>
            </div>
          </div>
          <div className="absolute right-4 bottom-0 text-8xl opacity-10">🏫</div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg">👨‍🎓</div>
              <div className="text-xs text-gray-500 font-medium">Şagirdlər</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalStudents || 0}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">👨‍🏫</div>
              <div className="text-xs text-gray-500 font-medium">Müəllimlər</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalTeachers || 0}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg">📝</div>
              <div className="text-xs text-gray-500 font-medium">İmtahanlar</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalExams || 0}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-lg">📊</div>
              <div className="text-xs text-gray-500 font-medium">Orta bal</div>
            </div>
            <div className={`text-3xl font-bold ${
              avgScore >= 80 ? 'text-green-600' :
              avgScore >= 60 ? 'text-purple-600' : 'text-orange-500'
            }`}>{avgScore}%</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">📊 Məktəb statistikası</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Aktiv şagirdlər</span>
                  <span className="font-bold text-gray-900">{uniqueStudents}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min((uniqueStudents / Math.max(totalStudents || 1, 1)) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Tamamlanmış imtahanlar</span>
                  <span className="font-bold text-gray-900">{totalAttempts}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.min((totalAttempts / Math.max(totalAttempts, 1)) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Orta bal</span>
                  <span className={`font-bold ${
                    avgScore >= 80 ? 'text-green-600' :
                    avgScore >= 60 ? 'text-purple-600' : 'text-orange-500'
                  }`}>{avgScore}%</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div className={`h-full rounded-full ${
                    avgScore >= 80 ? 'bg-green-500' :
                    avgScore >= 60 ? 'bg-purple-500' : 'bg-orange-400'
                  }`} style={{ width: `${avgScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">📚 Fənlər üzrə orta bal</h2>
            {subjectList.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Hələ məlumat yoxdur</p>
            ) : (
              <div className="space-y-3">
                {subjectList.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{s.icon} {s.name}</span>
                      <span className={`font-bold ${
                        s.avg >= 80 ? 'text-green-600' :
                        s.avg >= 60 ? 'text-purple-600' : 'text-orange-500'
                      }`}>{s.avg}%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div className={`h-full rounded-full ${
                        s.avg >= 80 ? 'bg-green-500' :
                        s.avg >= 60 ? 'bg-purple-500' : 'bg-orange-400'
                      }`} style={{ width: `${s.avg}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{s.count} imtahan</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">📝 Son imtahanlar</h2>
          {recentExams && recentExams.length > 0 ? (
            <div className="space-y-2">
              {recentExams.map((e: any) => (
                <Link key={e.id} href={`/dashboard/exams/${e.id}`}
                  className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-purple-300 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{e.subjects?.icon || '📝'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{e.title}</p>
                      <p className="text-xs text-gray-500">
                        {e.profiles?.full_name} • {e.grade_level}-ci sinif
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
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

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Sürətli keçidlər</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '📊', label: 'Məktəb statistikası', href: '/dashboard/school', color: 'purple' },
              { icon: '👨‍🏫', label: 'Müəllim performansı', href: '/dashboard/teachers', color: 'blue' },
              { icon: '👨‍🎓', label: 'Şagird statistikası', href: '/dashboard/students', color: 'green' },
              { icon: '🏆', label: 'Rayon reytinqi', href: '/dashboard/ranking', color: 'yellow' },
            ].map((item) => {
              const colors: Record<string, string> = {
                purple: 'bg-purple-50 text-purple-600',
                blue: 'bg-blue-50 text-blue-600',
                green: 'bg-green-50 text-green-600',
                yellow: 'bg-yellow-50 text-yellow-600',
              }
              return (
                <Link key={item.href} href={item.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                  <div className={`w-12 h-12 rounded-xl ${colors[item.color]} flex items-center justify-center text-xl`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════
  // MÜƏLLİM PANELİ (MAVİ)
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
        .in('exam_id', examIds)
        .eq('status', 'completed')
        .order('finished_at', { ascending: false })
        .limit(5)

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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden">
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold border-4 border-white/30">
              {initial}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{profile?.full_name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full font-medium">👨‍🏫 Müəllim</span>
                <span className="opacity-90">📍 Bakı, Azərbaycan</span>
              </div>
            </div>
          </div>
          <div className="absolute right-4 bottom-0 text-8xl opacity-10">📚</div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">📝</div>
              <div className="text-xs text-gray-500 font-medium">İmtahanlarım</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{examCount || 0}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg">👨‍🎓</div>
              <div className="text-xs text-gray-500 font-medium">Şagird cəhdləri</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{attemptCount}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg">📊</div>
              <div className="text-xs text-gray-500 font-medium">Orta bal</div>
            </div>
            <div className={`text-3xl font-bold ${
              avgScore >= 80 ? 'text-green-600' :
              avgScore >= 60 ? 'text-blue-600' : 'text-orange-500'
            }`}>{avgScore}%</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-lg">➕</div>
              <div className="text-xs text-gray-500 font-medium">Yeni imtahan</div>
            </div>
            <Link href="/dashboard/exams/new" className="text-sm font-bold text-blue-600 hover:underline">
              Yarat →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">📊 Son şagird nəticələri</h2>
          {recentAttempts.length > 0 ? (
            <div className="space-y-2">
              {recentAttempts.map((a: any) => {
                const percent = Math.round(Number(a.percentage) || 0)
                return (
                  <Link key={a.id} href={`/dashboard/exams/${a.exams?.id}/results`}
                    className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-blue-300 transition">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{a.exams?.subjects?.icon || '📝'}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{a.exams?.title}</p>
                        <p className="text-xs text-gray-500">
                          {a.finished_at ? new Date(a.finished_at).toLocaleDateString('az-AZ') : '—'}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold ${
                      percent >= 80 ? 'text-green-600' :
                      percent >= 60 ? 'text-blue-600' : 'text-orange-500'
                    }`}>{percent}%</span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">Hələ şagird cəhdi yoxdur</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Sürətli keçidlər</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '➕', label: 'Yeni imtahan', href: '/dashboard/exams/new', color: 'indigo' },
              { icon: '📝', label: 'İmtahanlarım', href: '/dashboard/exams', color: 'blue' },
              { icon: '📊', label: 'Nəticələr', href: '/dashboard/results', color: 'green' },
              { icon: '👥', label: 'Siniflərim', href: '/dashboard/classes', color: 'purple' },
            ].map((item) => {
              const colors: Record<string, string> = {
                indigo: 'bg-indigo-50 text-indigo-600',
                blue: 'bg-blue-50 text-blue-600',
                green: 'bg-green-50 text-green-600',
                purple: 'bg-purple-50 text-purple-600',
              }
              return (
                <Link key={item.href} href={item.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                  <div className={`w-12 h-12 rounded-xl ${colors[item.color]} flex items-center justify-center text-xl`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════
  // ŞAGİRD PANELİ (YAŞIL)
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Yaşıl Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold border-4 border-white/30">
            {initial}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{profile?.full_name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full font-medium">
                {profile?.grade_level ? `${profile.grade_level}-ci sinif` : role}
              </span>
              <span className="opacity-90">📍 Bakı, Azərbaycan</span>
            </div>
          </div>
        </div>
        <div className="absolute right-4 bottom-0 text-8xl opacity-10">🎓</div>
      </div>

      {/* 4 stat kart */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg">▶️</div>
            <div className="text-xs text-gray-500 font-medium">Aktiv imtahanlarım</div>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {activeExam ? activeExam.exams?.title?.slice(0, 20) : 'Yoxdur'}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">⏰</div>
            <div className="text-xs text-gray-500 font-medium">Növbəti imtahan</div>
          </div>
          <div className="text-xl font-bold text-gray-900">{nextExam ? 'Tezliklə' : 'Yoxdur'}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-lg">📝</div>
            <div className="text-xs text-gray-500 font-medium">Ümumi imtahan</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalAttempts}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-lg">🏆</div>
            <div className="text-xs text-gray-500 font-medium">Sertifikatlar</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{certificatesCount}</div>
        </div>
      </div>

      {/* Balans + Nəticə + Qrafik */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <h3 className="font-bold text-gray-900 mb-3">Balansım</h3>
          <div className="text-5xl mb-3">💰</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">0.00 AZN</div>
          <p className="text-xs text-gray-500 mb-4">Cari balans</p>
          <Link href="/dashboard/balance" className="block bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg font-medium transition">
            Balansı artır
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <h3 className="font-bold text-gray-900 mb-3">Son nəticəm</h3>
          <div className="text-5xl mb-3">🏆</div>
          {totalAttempts > 0 ? (
            <>
              <div className="text-3xl font-bold text-green-600 mb-1">{avgScore}%</div>
              <p className="text-xs text-gray-500 mb-4">Orta bal</p>
            </>
          ) : (
            <p className="text-sm text-gray-500 mb-4">Hələ tamamlanmış imtahan yoxdur</p>
          )}
          <Link href="/dashboard/exams" className="block bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg font-medium transition">
            İmtahanlara bax →
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">İnkişaf dinamikam</h3>
          {chartData.length > 0 && chartData.some(d => d.value > 0) ? (
            <div className="h-24 flex items-end gap-1.5">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t"
                    style={{ height: `${Math.max(d.value * 0.9, 4)}px` }} />
                  <div className="text-[10px] text-gray-400 mt-1">{d.month}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-8">Hələ məlumat yoxdur</p>
          )}
        </div>
      </div>

      {/* Son fəaliyyətlər */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Son fəaliyyətlər</h2>
        {recentAttempts.length > 0 ? (
          <div className="space-y-2">
            {recentAttempts.slice(0, 3).map((a) => {
              const percent = Math.round(Number(a.percentage) || 0)
              return (
                <Link key={a.id} href={`/dashboard/exams/${(a.exams as any)?.id}`}
                  className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-green-300 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{(a.exams as any)?.subjects?.icon || '📝'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{(a.exams as any)?.title}</p>
                      <p className="text-xs text-gray-500">
                        {a.finished_at ? new Date(a.finished_at).toLocaleDateString('az-AZ') : '—'}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${
                    percent >= 80 ? 'text-green-600' :
                    percent >= 60 ? 'text-emerald-600' : 'text-orange-500'
                  }`}>{percent}%</span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-sm text-gray-400">Hələlik heç bir fəaliyyət yoxdur.</p>
          </div>
        )}
      </div>

      {/* Tez keçidlər */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4">Tez keçidlər</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { icon: '📝', label: 'İmtahanlarım', href: '/dashboard/exams', color: 'green' },
            { icon: '📊', label: 'Statistikam', href: '/dashboard/statistics', color: 'emerald' },
            { icon: '📋', label: 'Nəticələrim', href: '/dashboard/results', color: 'teal' },
            { icon: '📈', label: 'İnkişafım', href: '/dashboard/progress', color: 'lime' },
            { icon: '🎓', label: 'Sertifikatlarım', href: '/dashboard/certificates', color: 'indigo' },
            { icon: '⚙️', label: 'Məlumatlarım', href: '/dashboard/profile', color: 'pink' },
          ].map((item) => {
            const colors: Record<string, string> = {
              green: 'bg-green-50 text-green-600',
              emerald: 'bg-emerald-50 text-emerald-600',
              teal: 'bg-teal-50 text-teal-600',
              lime: 'bg-lime-50 text-lime-600',
              indigo: 'bg-indigo-50 text-indigo-600',
              pink: 'bg-pink-50 text-pink-600',
            }
            return (
              <Link key={item.label} href={item.href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition border border-gray-100">
                <div className={`w-12 h-12 rounded-xl ${colors[item.color]} flex items-center justify-center text-xl`}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
