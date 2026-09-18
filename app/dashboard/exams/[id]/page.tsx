import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: exam } = await supabase
    .from('exams')
    .select('*, subjects(name, icon)')
    .eq('id', id)
    .single()

  if (!exam) notFound()

  const isTeacher = exam.teacher_id === user.id
  const isStudent = profile?.role === 'student'

  // Suallar sayı
  const { count: questionCount } = await supabase
    .from('exam_questions')
    .select('*', { count: 'exact', head: true })
    .eq('exam_id', id)

  // Şagirdin əvvəlki cəhdləri
  let attempts: any[] = []
  if (isStudent) {
    const { data } = await supabase
      .from('attempts')
      .select('*')
      .eq('exam_id', id)
      .eq('student_id', user.id)
      .order('started_at', { ascending: false })
    attempts = data || []
  }

  const bestAttempt = attempts.reduce((best, a) => {
    if (a.status !== 'completed') return best
    if (!best || (a.percentage || 0) > (best.percentage || 0)) return a
    return best
  }, null as any)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard/exams" className="text-blue-600 hover:underline mb-4 inline-block">
          ← İmtahanlar
        </Link>

        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
              {exam.description && (
                <p className="text-gray-500 mt-2">{exam.description}</p>
              )}
            </div>
            {isTeacher && (
              <Link href={`/dashboard/exams/${exam.id}/edit`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition text-sm">
                ✏️ Redaktə et
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium">Fənn</p>
              <p className="text-lg font-bold text-blue-900 mt-1">
                {exam.subjects?.icon} {exam.subjects?.name}
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 font-medium">Sinif</p>
              <p className="text-lg font-bold text-green-900 mt-1">{exam.grade_level}-ci</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-purple-600 font-medium">Müddət</p>
              <p className="text-lg font-bold text-purple-900 mt-1">⏱ {exam.duration_minutes} dəq</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4">
              <p className="text-xs text-yellow-600 font-medium">Sual sayı</p>
              <p className="text-lg font-bold text-yellow-900 mt-1">{questionCount || 0}</p>
            </div>
          </div>

          {/* ŞAGİRD ÜÇÜN */}
          {isStudent && (
            <div className="border-t pt-6">
              {bestAttempt && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-green-700 font-medium">Ən yaxşı nəticəniz</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {Math.round(bestAttempt.percentage || 0)}%
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {bestAttempt.score} / {bestAttempt.max_score} bal
                  </p>
                </div>
              )}

              <Link href={`/dashboard/exams/${exam.id}/take`}
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition text-lg">
                {attempts.length > 0 ? '🔄 Yenidən cəhd et' : '🚀 İmtahana başla'}
              </Link>

              {attempts.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Əvvəlki cəhdlər ({attempts.length})
                  </p>
                  <div className="space-y-2">
                    {attempts.slice(0, 5).map((a) => (
                      <div key={a.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-2 text-sm">
                        <span className="text-gray-500">
                          {new Date(a.started_at).toLocaleString('az-AZ')}
                        </span>
                        <span className={`font-semibold ${
                          a.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {a.status === 'completed'
                            ? `${Math.round(a.percentage || 0)}%`
                            : 'Davam edir'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MÜƏLLİM ÜÇÜN */}
          {isTeacher && (
            <div className="border-t pt-6">
              <Link href={`/dashboard/exams/${exam.id}/results`}
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl transition">
                📊 Nəticələrə bax
              </Link>
            </div>
          )}

          {!exam.is_published && !isTeacher && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
              ⚠️ Bu imtahan hələ yayımlanmayıb
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
