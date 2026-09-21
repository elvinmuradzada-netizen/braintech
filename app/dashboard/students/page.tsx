import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function StudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role !== 'director' && profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Bütün şagirdlər
  const { data: students } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('grade_level', { ascending: true })
    .order('full_name')

  // Hər şagirdin nəticələri
  const studentStats = await Promise.all(
    (students || []).map(async (s) => {
      const { data: attempts } = await supabase
        .from('attempts')
        .select('percentage')
        .eq('student_id', s.id)
        .eq('status', 'completed')

      const count = attempts?.length || 0
      const avg = count > 0
        ? Math.round(attempts!.reduce((sum, a) => sum + Number(a.percentage || 0), 0) / count)
        : 0

      const { count: certCount } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', s.id)
        .eq('status', 'completed')
        .gte('percentage', 70)

      return {
        ...s,
        attemptCount: count,
        avgScore: avg,
        certCount: certCount || 0,
      }
    })
  )

  // Performansa görə sırala
  const sorted = [...studentStats].sort((a, b) => b.avgScore - a.avgScore || b.attemptCount - a.attemptCount)

  // Sinif seçimi üçün filter
  const gradeCounts: Record<number, number> = {}
  students?.forEach(s => {
    if (s.grade_level) {
      gradeCounts[s.grade_level] = (gradeCounts[s.grade_level] || 0) + 1
    }
  })

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/dashboard" className="text-purple-600 hover:underline mb-4 inline-block text-sm">
        ← Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">👨‍🎓 Şagird statistikası</h1>
        <p className="text-gray-500 mt-1">Şagirdlərin fəaliyyət göstəriciləri</p>
      </div>

      {/* Stat kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">👥</span>
            <span className="text-xs text-gray-500 font-medium">Ümumi şagird</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{students?.length || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✅</span>
            <span className="text-xs text-gray-500 font-medium">Aktiv şagird</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {studentStats.filter(s => s.attemptCount > 0).length}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📊</span>
            <span className="text-xs text-gray-500 font-medium">Orta bal</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {studentStats.filter(s => s.attemptCount > 0).length > 0
              ? Math.round(
                  studentStats.filter(s => s.attemptCount > 0)
                    .reduce((sum, s) => sum + s.avgScore, 0) /
                  studentStats.filter(s => s.attemptCount > 0).length
                )
              : 0}%
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎓</span>
            <span className="text-xs text-gray-500 font-medium">Sertifikatlar</span>
          </div>
          <div className="text-3xl font-bold text-yellow-600">
            {studentStats.reduce((sum, s) => sum + s.certCount, 0)}
          </div>
        </div>
      </div>

      {/* Siniflər üzrə bölgü */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">📚 Siniflər üzrə bölgü</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => {
            const count = gradeCounts[g] || 0
            return (
              <div key={g} className={`rounded-xl p-3 text-center border-2 ${
                count > 0 ? 'border-purple-200 bg-purple-50' : 'border-gray-100 bg-gray-50'
              }`}>
                <div className="text-xs text-gray-500 font-medium">{g}-ci</div>
                <div className={`text-2xl font-bold mt-1 ${count > 0 ? 'text-purple-600' : 'text-gray-300'}`}>
                  {count}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Şagird reytinqi */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">🏆 Şagird reytinqi</h2>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">👨‍🎓</p>
            <p className="text-gray-500">Hələ şagird yoxdur</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">#</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Şagird</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Sinif</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Cəhdlər</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Sertifikat</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Orta bal</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.slice(0, 50).map((s, i) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-700">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                            {(s.full_name || 'Ş').charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{s.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.grade_level || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{s.attemptCount}</td>
                      <td className="px-6 py-4">
                        {s.certCount > 0 ? (
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
                            🎓 {s.certCount}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${
                          s.avgScore >= 80 ? 'text-green-600' :
                          s.avgScore >= 60 ? 'text-purple-600' : 'text-orange-500'
                        }`}>
                          {s.attemptCount > 0 ? `${s.avgScore}%` : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobil */}
            <div className="md:hidden divide-y divide-gray-100">
              {sorted.slice(0, 20).map((s, i) => (
                <div key={s.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                      {(s.full_name || 'Ş').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{s.full_name}</p>
                      <p className="text-xs text-gray-500">{s.grade_level}-ci sinif</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Cəhdlər</div>
                      <div className="font-bold">{s.attemptCount}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Sertifikat</div>
                      <div className="font-bold">🎓 {s.certCount}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Orta</div>
                      <div className={`font-bold ${
                        s.avgScore >= 80 ? 'text-green-600' :
                        s.avgScore >= 60 ? 'text-purple-600' : 'text-orange-500'
                      }`}>{s.attemptCount > 0 ? `${s.avgScore}%` : '—'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
