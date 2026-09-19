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

  // Statistika
  let examCount = 0
  let attemptCount = 0
  let avgScore = '—'

  if (isTeacher) {
    const { count } = await supabase
      .from('exams')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', user.id)
    examCount = count || 0
  }

  if (isStudent) {
    const { count } = await supabase
      .from('attempts')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .eq('status', 'completed')
    attemptCount = count || 0
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
                Rol: <span className="font-semibold text-blue-600">{profile?.role}</span>
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
              <p className="text-sm text-blue-600 font-medium">İmtahanlar</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{examCount}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl">
              <p className="text-sm text-indigo-600 font-medium">Nəticələr</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{attemptCount}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl">
              <p className="text-sm text-purple-600 font-medium">Orta bal</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{avgScore}</p>
            </div>
          </div>

          {/* Sürətli keçidlər */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sürətli keçidlər</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link href="/dashboard/exams"
                className="flex items-center gap-3 bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50 p-4 rounded-xl transition">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="font-semibold text-gray-900">İmtahanlar</p>
                  <p className="text-sm text-gray-500">
                    {isTeacher ? 'İmtahanlarınızı idarə edin' : 'Mövcud imtahanları görün'}
                  </p>
                </div>
              </Link>

              {isTeacher && (
                <Link href="/dashboard/exams/new"
                  className="flex items-center gap-3 bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50 p-4 rounded-xl transition">
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
      </div>
    </div>
  )
}
