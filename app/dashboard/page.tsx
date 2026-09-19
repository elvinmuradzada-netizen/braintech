import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/auth/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin'
  const isStudent = profile?.role === 'student'

  let examCount = 0
  let attemptCount = 0
  let avgScore = 0
  let recentAttempts: any[] = []

  if (isTeacher) {
    const { count: eCount } = await supabase
      .from('exams')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', user.id)
    examCount = eCount || 0

    const { data: tExams } = await supabase
      .from('exams')
      .select('id')
      .eq('teacher_id', user.id)

    if (tExams && tExams.length > 0) {
      const examIds = tExams.map(e => e.id)
      const { count: aCount } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .in('exam_id', examIds)
        .eq('status', 'completed')
      attemptCount = aCount || 0

      const { data: allAttempts } = await supabase
        .from('attempts')
        .select('percentage')
        .in('exam_id', examIds)
        .eq('status', 'completed')

      if (allAttempts && allAttempts.length > 0) {
        avgScore = Math.round(
          allAttempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / allAttempts.length
        )
      }
    }
  }

  if (isStudent) {
    const { data: attempts } = await supabase
      .from('attempts')
      .select('*, exams(id, title, subjects(name, icon))')
      .eq('student_id', user.id)
      .eq('status', 'completed')
      .order('finished_at', { ascending: false })

    recentAttempts = attempts || []
    attemptCount = recentAttempts.length

    if (attemptCount > 0) {
      avgScore = Math.round(
        recentAttempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / attemptCount
      )
    }

    const { count: eCount } = await supabase
      .from('exams')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .eq('grade_level', profile?.grade_level)
    examCount = eCount || 0
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Salam, {profile?.full_name || user.email}! 👋
              </h1>
              <p className="text-gray-500 mt-2">
                Rol: <span className="font-semibold text-indigo-600">{profile?.role}</span>
                {profile?.grade_level && (
                  <> • Sinif: <span className="font-semibold">{profile.grade_level}</span></>
                )}
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Çıxış
              </button>
            </form>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-6 rounded-xl">
              <p className="text-sm text-blue-600 font-medium">
                {isTeacher ? 'İmtahanlarım' : 'Mövcud imtahanlar'}
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{examCount}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl">
              <p className="text-sm text-green-600 font-medium">
                {isTeacher ? 'Şagird cəhdləri' : 'Nəticələrim'}
              </p>
              <p className="text-3xl font-bold text-green-900 mt-2">{attemptCount}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl">
              <p className="text-sm text-purple-600 font-medium">Orta bal</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {attemptCount > 0 ? `${avgScore}%` : '—'}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sürətli keçidlər</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link href="/dashboard/exams"
                className="flex items-center gap-3 bg-white border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 p-4 rounded-xl transition">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="font-semibold text-gray-900">İmtahanlar</p>
                  <p className="text-sm text-gray-500">
                    {isTeacher ? 'İmtahanlarınızı idarə edin' : 'Mövcud imtahanları görün'}
                  </p>
                </div>
              </Link>

              {isStudent && (
                <Link href="/dashboard/statistics"
                  className="flex items-center gap-3 bg-white border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 p-4 rounded-xl transition">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-semibold text-gray-900">Statistikam</p>
                    <p className="text-sm text-gray-500">Nəticələrin və inkişafın</p>
                  </div>
                </Link>
              )}

              {isStudent && (
                <Link href="/dashboard/leaderboard"
                  className="flex items-center gap-3 bg-white border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 p-4 rounded-xl transition">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="font-semibold text-gray-900">Reytinq</p>
                    <p className="text-sm text-gray-500">Digər şagirdlərlə yarış</p>
                  </div>
                </Link>
              )}

              {isStudent && (
                <Link href="/dashboard/certificates"
                  className="flex items-center gap-3 bg-white border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 p-4 rounded-xl transition">
                  <span className="text-2xl">🎓</span>
                  <div>
                    <p className="font-semibold text-gray-900">Sertifikatlarım</p>
                    <p className="text-sm text-gray-500">Qazandığın sertifikatlar</p>
                  </div>
                </Link>
              )}

              {isTeacher && (
                <Link href="/dashboard/exams/new"
                  className="flex items-center gap-3 bg-white border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 p-4 rounded-xl transition">
                  <span className="text-2xl">➕</span>
                  <div>
                    <p className="font-semibold text-gray-900">Yeni imtahan</p>
                    <p className="text-sm text-gray-500">İmtahan və suallar yaradın</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {isStudent && recentAttempts.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Son nəticələriniz
            </h2>
            <div className="space-y-3">
              {recentAttempts.slice(0, 5).map((attempt) => {
                const percent = Math.round(Number(attempt.percentage) || 0)
                return (
                  <Link
                    key={attempt.id}
                    href={`/dashboard/exams/${attempt.exams?.id}`}
                    className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{(attempt.exams as any)?.subjects?.icon || '📝'}</span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {(attempt.exams as any)?.title || 'İmtahan'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {attempt.finished_at
                            ? new Date(attempt.finished_at).toLocaleDateString('az-AZ')
                            : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        percent >= 80 ? 'text-green-600' :
                        percent >= 60 ? 'text-indigo-600' : 'text-orange-500'
                      }`}>
                        {percent}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {attempt.score}/{attempt.max_score} bal
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
