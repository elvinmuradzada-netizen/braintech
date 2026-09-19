import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function StatisticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: attempts } = await supabase
    .from('attempts')
    .select('*, exams(id, title, subjects(name, icon))')
    .eq('student_id', user.id)
    .eq('status', 'completed')
    .order('finished_at', { ascending: true })

  const allAttempts = attempts || []
  const totalAttempts = allAttempts.length

  const avgPercentage = totalAttempts > 0
    ? allAttempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / totalAttempts
    : 0
  const bestPercentage = totalAttempts > 0
    ? Math.max(...allAttempts.map(a => Number(a.percentage || 0)))
    : 0
  const passedCount = allAttempts.filter(a => Number(a.percentage || 0) >= 60).length
  const failedCount = totalAttempts - passedCount

  const last10 = allAttempts.slice(-10)

  const subjectStats: Record<string, { name: string; icon: string; total: number; sum: number; count: number }> = {}
  allAttempts.forEach(a => {
    const subj = (a.exams as any)?.subjects
    if (!subj) return
    const key = subj.name
    if (!subjectStats[key]) {
      subjectStats[key] = { name: subj.name, icon: subj.icon, total: 0, sum: 0, count: 0 }
    }
    subjectStats[key].count++
    subjectStats[key].sum += Number(a.percentage || 0)
  })
  Object.values(subjectStats).forEach(s => {
    s.total = Math.round(s.sum / s.count)
  })
  const subjectList = Object.values(subjectStats).sort((a, b) => b.total - a.total)

  const maxHeight = 200
  const barWidth = last10.length === 1 ? 80 : Math.min(80, Math.floor(700 / last10.length))

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard" className="text-indigo-600 hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistikam 📊</h1>
        <p className="text-gray-500 mb-6">
          {profile?.full_name} • {profile?.grade_level}-ci sinif
        </p>

        {/* 4 əsas statistika kartı */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-500 font-medium">İmtahanlar</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalAttempts}</p>
            <p className="text-xs text-gray-400 mt-1">ümumi cəhd</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-500 font-medium">Orta bal</p>
            <p className={`text-3xl font-bold mt-1 ${
              avgPercentage >= 80 ? 'text-green-600' :
              avgPercentage >= 60 ? 'text-indigo-600' : 'text-orange-500'
            }`}>
              {Math.round(avgPercentage)}%
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-500 font-medium">Ən yüksək</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {Math.round(bestPercentage)}%
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-500 font-medium">Keçid nisbəti</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">
              {totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0}%
            </p>
          </div>
        </div>

        {totalAttempts === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <p className="text-5xl mb-4">📊</p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Hələ statistika yoxdur</h2>
            <p className="text-gray-500 mb-6">İlk imtahanını ver və statistikan burada görünsün</p>
            <Link href="/dashboard/exams"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition">
              İmtahanlara bax →
            </Link>
          </div>
        ) : (
          <>
            {/* Bar chart - son 10 cəhd */}
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Son {last10.length} imtahan nəticəsi
                </h2>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-indigo-500"></div>
                    <span className="text-gray-600">Keçdi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-orange-400"></div>
                    <span className="text-gray-600">Kəsildi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-gray-600">Keçid xətti (60%)</span>
                  </div>
                </div>
              </div>

              <div className="relative" style={{ height: `${maxHeight + 50}px` }}>
                {/* 60% keçid xətti */}
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed border-green-400 z-0"
                  style={{ bottom: `${(60 / 100) * maxHeight + 35}px` }}
                >
                  <span className="absolute -top-5 right-0 text-xs text-green-600 font-medium bg-white px-2">
                    60%
                  </span>
                </div>

                {/* Barlar */}
                <div className="flex items-end justify-center gap-3 h-full pb-8">
                  {last10.map((attempt, i) => {
                    const percent = Math.round(Number(attempt.percentage) || 0)
                    const height = (percent / 100) * maxHeight
                    const passed = percent >= 60
                    return (
                      <div
                        key={attempt.id}
                        className="flex flex-col items-center group"
                        style={{ width: `${barWidth}px` }}
                      >
                        <div className="text-xs font-bold text-gray-700 mb-1 opacity-0 group-hover:opacity-100 transition">
                          {percent}%
                        </div>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            passed
                              ? 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                              : 'bg-gradient-to-t from-orange-500 to-orange-400'
                          } group-hover:scale-105 origin-bottom`}
                          style={{ height: `${height}px`, minHeight: '8px' }}
                        />
                        <div className="text-xs text-gray-400 mt-2">
                          #{i + 1}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Ümumi nəticə + Fənlər */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Dairəvi qrafik */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Ümumi nəticə
                </h2>
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                      <circle
                        cx="64" cy="64" r="56"
                        stroke="#10B981"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(passedCount / totalAttempts) * 352} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round((passedCount / totalAttempts) * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">keçid</div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">✓ Keçdi</span>
                      <span className="font-bold text-green-600">{passedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">✗ Kəsildi</span>
                      <span className="font-bold text-red-500">{failedCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fənn üzrə */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Fənlər üzrə orta bal
                </h2>
                {subjectList.length === 0 ? (
                  <p className="text-gray-400 text-sm">Məlumat yoxdur</p>
                ) : (
                  <div className="space-y-3">
                    {subjectList.map((s, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {s.icon} {s.name}
                          </span>
                          <span className={`text-sm font-bold ${
                            s.total >= 80 ? 'text-green-600' :
                            s.total >= 60 ? 'text-indigo-600' : 'text-orange-500'
                          }`}>
                            {s.total}%
                          </span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              s.total >= 80 ? 'bg-green-500' :
                              s.total >= 60 ? 'bg-indigo-500' : 'bg-orange-400'
                            }`}
                            style={{ width: `${s.total}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {s.count} imtahan
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bütün nəticələr cədvəli */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Bütün nəticələr
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">#</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">İmtahan</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Fənn</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Bal</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Faiz</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Tarix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...allAttempts].reverse().map((attempt, idx) => {
                      const percent = Math.round(Number(attempt.percentage) || 0)
                      return (
                        <tr key={attempt.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {(attempt.exams as any)?.title || 'İmtahan'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {(attempt.exams as any)?.subjects?.icon}{' '}
                            {(attempt.exams as any)?.subjects?.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {attempt.score}/{attempt.max_score}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-semibold ${
                              percent >= 80 ? 'text-green-600' :
                              percent >= 60 ? 'text-indigo-600' : 'text-orange-500'
                            }`}>
                              {percent}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {attempt.finished_at
                              ? new Date(attempt.finished_at).toLocaleDateString('az-AZ')
                              : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
