import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function SchoolStatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role !== 'director' && profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Ümumi statistika
  const { count: totalStudents } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')

  const { count: totalTeachers } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher')

  const { count: totalExams } = await supabase
    .from('exams').select('*', { count: 'exact', head: true })

  const { count: publishedExams } = await supabase
    .from('exams').select('*', { count: 'exact', head: true }).eq('is_published', true)

  const { data: attempts } = await supabase
    .from('attempts')
    .select('percentage, student_id, exams(subjects(name, icon))')
    .eq('status', 'completed')

  const totalAttempts = attempts?.length || 0
  const avgScore = totalAttempts > 0
    ? Math.round(attempts!.reduce((s, a) => s + Number(a.percentage || 0), 0) / totalAttempts)
    : 0

  // Sinif üzrə statistika
  const { data: students } = await supabase
    .from('profiles').select('grade_level').eq('role', 'student')

  const gradeStats: Record<number, number> = {}
  students?.forEach(s => {
    if (s.grade_level) {
      gradeStats[s.grade_level] = (gradeStats[s.grade_level] || 0) + 1
    }
  })

  // Fənn üzrə statistika
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

  // Fəaliyyət üzrə statistika
  const { data: recentAttempts } = await supabase
    .from('attempts')
    .select('finished_at')
    .eq('status', 'completed')
    .gte('finished_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const weekAttempts = recentAttempts?.length || 0

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/dashboard" className="text-purple-600 hover:underline mb-4 inline-block text-sm">
        ← Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📊 Məktəb statistikası</h1>
        <p className="text-gray-500 mt-1">Məktəbinizin ümumi göstəriciləri</p>
      </div>

      {/* 4 əsas kart */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">👨‍🎓</span>
            <div className="text-xs opacity-90">Şagirdlər</div>
          </div>
          <div className="text-3xl font-bold">{totalStudents || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">👨‍🏫</span>
            <div className="text-xs opacity-90">Müəllimlər</div>
          </div>
          <div className="text-3xl font-bold">{totalTeachers || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📝</span>
            <div className="text-xs opacity-90">İmtahanlar</div>
          </div>
          <div className="text-3xl font-bold">{totalExams || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📈</span>
            <div className="text-xs opacity-90">Orta bal</div>
          </div>
          <div className="text-3xl font-bold">{avgScore}%</div>
        </div>
      </div>

      {/* Aktivlik + İmtahanlar */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">📅 Bu həftə</h3>
          <div className="text-3xl font-bold text-purple-600">{weekAttempts}</div>
          <p className="text-xs text-gray-500 mt-1">imtahan tamamlandı</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">✅ Yayımlanmış</h3>
          <div className="text-3xl font-bold text-green-600">{publishedExams || 0}</div>
          <p className="text-xs text-gray-500 mt-1">imtahan aktivdir</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">📊 Tamamlanmış</h3>
          <div className="text-3xl font-bold text-indigo-600">{totalAttempts}</div>
          <p className="text-xs text-gray-500 mt-1">ümumi cəhd</p>
        </div>
      </div>

      {/* Sinif üzrə şagirdlər */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">👥 Siniflər üzrə şagirdlər</h2>
        {Object.keys(gradeStats).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Hələ məlumat yoxdur</p>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => {
              const count = gradeStats[g] || 0
              return (
                <div key={g} className={`rounded-xl p-3 text-center border-2 ${
                  count > 0 ? 'border-purple-200 bg-purple-50' : 'border-gray-100 bg-gray-50'
                }`}>
                  <div className="text-xs text-gray-500 font-medium">{g}-ci sinif</div>
                  <div className={`text-2xl font-bold mt-1 ${count > 0 ? 'text-purple-600' : 'text-gray-300'}`}>
                    {count}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Fənn üzrə orta bal */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4">📚 Fənlər üzrə orta bal</h2>
        {subjectList.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Hələ məlumat yoxdur</p>
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
  )
}
