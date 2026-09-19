import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ExamResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // İmtahanı götür
  const { data: exam } = await supabase
    .from('exams')
    .select('*, subjects(name, icon)')
    .eq('id', id)
    .single()

  if (!exam) notFound()

  // Yalnız müəllim görə bilər
  if (exam.teacher_id !== user.id) {
    redirect(`/dashboard/exams/${id}`)
  }

  // Tamamlanmış cəhdləri götür
  const { data: attempts } = await supabase
    .from('attempts')
    .select(`
      *,
      profiles:student_id (id, full_name, grade_level)
    `)
    .eq('exam_id', id)
    .eq('status', 'completed')
    .order('finished_at', { ascending: false })

  const completedAttempts = attempts || []

  // Statistika
  const totalAttempts = completedAttempts.length
  const uniqueStudents = new Set(completedAttempts.map(a => a.student_id)).size
  const avgPercentage = totalAttempts > 0
    ? completedAttempts.reduce((sum, a) => sum + (Number(a.percentage) || 0), 0) / totalAttempts
    : 0
  const passedCount = completedAttempts.filter(a => (Number(a.percentage) || 0) >= (exam.passing_score || 60)).length
  const passRate = totalAttempts > 0 ? (passedCount / totalAttempts) * 100 : 0
  const bestScore = totalAttempts > 0
    ? Math.max(...completedAttempts.map(a => Number(a.percentage) || 0))
    : 0
  const worstScore = totalAttempts > 0
    ? Math.min(...completedAttempts.map(a => Number(a.percentage) || 0))
    : 0

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Link href={`/dashboard/exams/${id}`} className="text-blue-600 hover:underline mb-4 inline-block">
          ← İmtahana qayıt
        </Link>

        {/* Başlıq */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {exam.subjects?.icon} {exam.subjects?.name} • {exam.grade_level}-ci sinif • Keçid balı: {exam.passing_score}%
              </p>
            </div>
            <Link href={`/dashboard/exams/${id}/edit`}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition">
              ✏️ Redaktə
            </Link>
          </div>
        </div>

        {/* Statistika kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-500 font-medium">Şagird sayı</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{uniqueStudents}</p>
            <p className="text-xs text-gray-400 mt-1">{totalAttempts} cəhd</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-500 font-medium">Orta bal</p>
            <p className={`text-3xl font-bold mt-1 ${
              avgPercentage >= (exam.passing_score || 60) ? 'text-green-600' : 'text-orange-500'
            }`}>
              {Math.round(avgPercentage)}%
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-500 font-medium">Keçən</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{passedCount}</p>
            <p className="text-xs text-gray-400 mt-1">({Math.round(passRate)}%)</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-500 font-medium">Ən yüksək</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{Math.round(bestScore)}%</p>
          </div>
        </div>

        {/* Nəticələr cədvəli */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Nəticələr ({completedAttempts.length})
            </h2>
          </div>

          {completedAttempts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500">Hələ heç bir şagird imtahan verməyib</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">#</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Şagird</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Sinif</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Bal</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Faiz</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Tarix</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Nəticə</th>
                  </tr>
                </thead>
                <tbody>
                  {completedAttempts.map((attempt, idx) => {
                    const percent = Math.round(Number(attempt.percentage) || 0)
                    const passed = percent >= (exam.passing_score || 60)
                    return (
                      <tr key={attempt.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {(attempt.profiles as any)?.full_name || 'Anonim'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {(attempt.profiles as any)?.grade_level || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {attempt.score} / {attempt.max_score}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${
                            percent >= 80 ? 'text-green-600' :
                            percent >= 60 ? 'text-blue-600' :
                            percent >= 40 ? 'text-orange-500' : 'text-red-500'
                          }`}>
                            {percent}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {attempt.finished_at
                            ? new Date(attempt.finished_at).toLocaleDateString('az-AZ', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            passed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {passed ? '✓ Keçdi' : '✗ Kəsildi'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alt hissə - Range info */}
        {totalAttempts > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Nəticə aralığı</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-16">Ən aşağı</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-red-400 rounded-l-full"
                  style={{ width: `${worstScore}%` }} />
                <div className="absolute inset-y-0 bg-gradient-to-r from-red-400 via-yellow-400 to-green-500"
                  style={{ left: `${worstScore}%`, width: `${bestScore - worstScore}%` }} />
              </div>
              <span className="text-xs text-gray-500 w-16 text-right">Ən yüksək</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-16">
              <span>{Math.round(worstScore)}%</span>
              <span>{Math.round(bestScore)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
