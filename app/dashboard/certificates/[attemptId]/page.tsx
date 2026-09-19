import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PrintButton from './PrintButton'

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ attemptId: string }>
}) {
  const { attemptId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: attempt } = await supabase
    .from('attempts')
    .select('*, exams(id, title, subjects(name, icon))')
    .eq('id', attemptId)
    .single()

  if (!attempt) notFound()
  if (attempt.student_id !== user.id) redirect('/dashboard/certificates')

  const percent = Math.round(Number(attempt.percentage) || 0)
  if (percent < 70) redirect('/dashboard/certificates')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const exam = attempt.exams as any
  const issueDate = attempt.finished_at
    ? new Date(attempt.finished_at).toLocaleDateString('az-AZ', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  const certNumber = attempt.id.slice(0, 8).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link href="/dashboard/certificates" className="text-indigo-600 hover:underline">
            ← Sertifikatlar
          </Link>
          <PrintButton />
        </div>

        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="h-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>

          <div className="p-12 md:p-16 text-center relative">
            <div className="absolute top-8 left-8 text-yellow-300 opacity-30 text-6xl">🏆</div>
            <div className="absolute top-8 right-8 text-yellow-300 opacity-30 text-6xl">🏆</div>
            <div className="absolute bottom-8 left-8 text-yellow-300 opacity-30 text-6xl">🎓</div>
            <div className="absolute bottom-8 right-8 text-yellow-300 opacity-30 text-6xl">🎓</div>

            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                BT
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900 text-lg leading-tight">BRAIN</div>
                <div className="text-sm text-gray-500 leading-tight">TECH</div>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm uppercase tracking-widest text-yellow-600 font-bold mb-2">
                Uğur Sertifikatı
              </p>
              <div className="w-24 h-1 bg-yellow-500 mx-auto"></div>
            </div>

            <p className="text-gray-500 mb-2">Bu sertifikat təqdim olunur</p>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {profile?.full_name || 'Şagird'}
            </h1>

            <p className="text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
              <strong className="text-gray-900">
                {exam?.subjects?.icon} {exam?.title}
              </strong>{' '}
              imtahanında <strong className="text-indigo-600 text-xl">{percent}%</strong> nəticə
              göstərərək yüksək nailiyyət əldə etdiyi üçün
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">Bal</div>
                <div className="text-2xl font-bold text-gray-900">
                  {attempt.score}/{attempt.max_score}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">Faiz</div>
                <div className="text-2xl font-bold text-indigo-600">{percent}%</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">Sinif</div>
                <div className="text-2xl font-bold text-gray-900">
                  {profile?.grade_level || '—'}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end max-w-2xl mx-auto border-t-2 border-gray-100 pt-6">
              <div className="text-left">
                <div className="text-xs text-gray-400 mb-1">Tarix</div>
                <div className="text-sm font-semibold text-gray-700">{issueDate}</div>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-1">🏅</div>
                <div className="text-xs text-gray-400">Rəsmi möhür</div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">Sertifikat №</div>
                <div className="text-sm font-mono font-semibold text-gray-700">
                  BT-{certNumber}
                </div>
              </div>
            </div>

            <div className="mt-8 text-xs text-gray-400">
              BrainTech onlayn təhsil platforması tərəfindən verilmişdir
              <br />
              braintech.az
            </div>
          </div>

          <div className="h-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 print:hidden">
          💡 Sertifikatı yadda saxlamaq üçün "Çap et" düyməsinə basın → "Save as PDF" seçin
        </p>
      </div>
    </div>
  )
}
