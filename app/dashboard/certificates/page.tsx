import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: attempts } = await supabase
    .from('attempts')
    .select('*, exams(id, title, subjects(name, icon), passing_score)')
    .eq('student_id', user.id)
    .eq('status', 'completed')
    .gte('percentage', 70)
    .order('finished_at', { ascending: false })

  const certificates = attempts || []

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-indigo-600 hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Sertifikatlarım 🎓</h1>
          <p className="text-gray-500 mt-1">
            70% və yuxarı nəticə göstərdiyiniz imtahanlar
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <p className="text-5xl mb-4">🎓</p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Hələ sertifikat yoxdur</h2>
            <p className="text-gray-500 mb-6">
              70% və yuxarı bal toplayın ki, sertifikat qazanın
            </p>
            <Link href="/dashboard/exams"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition">
              İmtahanlara bax →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {certificates.map((attempt) => {
              const percent = Math.round(Number(attempt.percentage) || 0)
              const exam = attempt.exams as any
              return (
                <Link
                  key={attempt.id}
                  href={`/dashboard/certificates/${attempt.id}`}
                  className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition border-t-4 border-yellow-400"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">🏅</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">{percent}%</div>
                      <div className="text-xs text-gray-500">nəticə</div>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    {exam?.title || 'İmtahan'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {exam?.subjects?.icon} {exam?.subjects?.name}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      📅 {attempt.finished_at
                        ? new Date(attempt.finished_at).toLocaleDateString('az-AZ')
                        : '—'}
                    </span>
                    <span className="text-indigo-600 font-medium">
                      Bax →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
