import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ExamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin'

  let exams: any[] = []
  if (isTeacher) {
    const { data } = await supabase
      .from('exams')
      .select('*, subjects(name, icon)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
    exams = data || []
  } else {
    const { data } = await supabase
      .from('exams')
      .select('*, subjects(name, icon)')
      .eq('is_published', true)
      .eq('grade_level', profile?.grade_level)
      .order('created_at', { ascending: false })
    exams = data || []
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">İmtahanlar 📚</h1>
            <p className="text-gray-500 mt-1">
              {isTeacher ? 'Yaratdığınız imtahanlar' : 'Sizin üçün mövcud imtahanlar'}
            </p>
          </div>
          {isTeacher && (
            <Link href="/dashboard/exams/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
              + Yeni imtahan
            </Link>
          )}
        </div>

        {exams.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <p className="text-gray-500 text-lg">Hələ imtahan yoxdur</p>
            {isTeacher && (
              <Link href="/dashboard/exams/new"
                className="inline-block mt-4 text-blue-600 hover:underline">
                İlk imtahanı yarat →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Link key={exam.id} href={`/dashboard/exams/${exam.id}`}
                className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition block">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{exam.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{exam.description}</p>
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="text-gray-600">
                        {exam.subjects?.icon} {exam.subjects?.name}
                      </span>
                      <span className="text-gray-600">{exam.grade_level}-ci sinif</span>
                      <span className="text-gray-600">⏱ {exam.duration_minutes} dəq</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    exam.is_published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {exam.is_published ? 'Yayımlanıb' : 'Qaralama'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
