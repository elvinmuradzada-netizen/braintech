import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function TeachersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role !== 'director' && profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Bütün müəllimlər
  const { data: teachers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'teacher')
    .order('full_name')

  // Hər müəllim üçün statistika
  const teacherStats = await Promise.all(
    (teachers || []).map(async (t) => {
      const { count: examCount } = await supabase
        .from('exams').select('*', { count: 'exact', head: true }).eq('teacher_id', t.id)

      const { count: publishedCount } = await supabase
        .from('exams').select('*', { count: 'exact', head: true })
        .eq('teacher_id', t.id).eq('is_published', true)

      const { data: exams } = await supabase
        .from('exams').select('id').eq('teacher_id', t.id)

      let attemptCount = 0
      let avgScore = 0

      if (exams && exams.length > 0) {
        const ids = exams.map(e => e.id)
        const { count } = await supabase
          .from('attempts').select('*', { count: 'exact', head: true })
          .in('exam_id', ids).eq('status', 'completed')
        attemptCount = count || 0

        const { data: allAttempts } = await supabase
          .from('attempts').select('percentage')
          .in('exam_id', ids).eq('status', 'completed')

        if (allAttempts && allAttempts.length > 0) {
          avgScore = Math.round(allAttempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / allAttempts.length)
        }
      }

      return {
        ...t,
        examCount: examCount || 0,
        publishedCount: publishedCount || 0,
        attemptCount,
        avgScore,
      }
    })
  )

  // Performansa görə sırala
  const sorted = [...teacherStats].sort((a, b) => b.avgScore - a.avgScore || b.attemptCount - a.attemptCount)

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/dashboard" className="text-purple-600 hover:underline mb-4 inline-block text-sm">
        ← Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">👨‍🏫 Müəllim performansı</h1>
        <p className="text-gray-500 mt-1">Müəllimlərin fəaliyyət göstəriciləri</p>
      </div>

      {/* Stat kartlar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">👨‍🏫</span>
            <span className="text-xs text-gray-500 font-medium">Ümumi müəllim</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{teachers?.length || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📝</span>
            <span className="text-xs text-gray-500 font-medium">Ümumi imtahan</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {teacherStats.reduce((s, t) => s + t.examCount, 0)}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">👨‍🎓</span>
            <span className="text-xs text-gray-500 font-medium">Şagird cəhdləri</span>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {teacherStats.reduce((s, t) => s + t.attemptCount, 0)}
          </div>
        </div>
      </div>

      {/* Müəllim cədvəli */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Reytinq cədvəli</h2>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">👨‍🏫</p>
            <p className="text-gray-500">Hələ müəllim yoxdur</p>
          </div>
        ) : (
          <>
            {/* Desktop cədvəl */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">#</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Müəllim</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">İmtahanlar</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Yayımlanmış</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Cəhdlər</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Orta bal</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((t, i) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            {(t.full_name || 'M').charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{t.full_name}</p>
                            <p className="text-xs text-gray-500">{t.institution_name || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{t.examCount}</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                          {t.publishedCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{t.attemptCount}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${
                          t.avgScore >= 80 ? 'text-green-600' :
                          t.avgScore >= 60 ? 'text-purple-600' : 'text-orange-500'
                        }`}>
                          {t.attemptCount > 0 ? `${t.avgScore}%` : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobil kartlar */}
            <div className="md:hidden divide-y divide-gray-100">
              {sorted.map((t, i) => (
                <div key={t.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {(t.full_name || 'M').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{t.full_name}</p>
                      <p className="text-xs text-gray-500">{t.institution_name || '—'}</p>
                    </div>
                    <span className="text-xs text-gray-400 font-bold">#{i + 1}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">İmtahan</div>
                      <div className="font-bold text-gray-900">{t.examCount}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Cəhdlər</div>
                      <div className="font-bold text-gray-900">{t.attemptCount}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Orta bal</div>
                      <div className={`font-bold ${
                        t.avgScore >= 80 ? 'text-green-600' :
                        t.avgScore >= 60 ? 'text-purple-600' : 'text-orange-500'
                      }`}>{t.attemptCount > 0 ? `${t.avgScore}%` : '—'}</div>
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
