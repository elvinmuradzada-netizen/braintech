import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PayExamButton from './PayExamButton'

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

  // ═══ ÖDƏNİŞ YOXLAMASI ═══
  let hasPaid = true
  let isPendingPayment = false

  if (!isTeacher && isStudent && exam.is_paid) {
    const { data: paidPayment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('student_id', user.id)
      .eq('exam_id', id)
      .eq('status', 'paid')
      .maybeSingle()

    hasPaid = !!paidPayment

    // Gözləyən ödəniş var?
    if (!hasPaid) {
      const { data: pendingPayment } = await supabase
        .from('payments')
        .select('id, status, created_at')
        .eq('student_id', user.id)
        .eq('exam_id', id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (pendingPayment) {
        const created = new Date(pendingPayment.created_at).getTime()
        const now = Date.now()
        // Son 10 dəqiqə ərzində yaradılıbsa, gözləyir
        isPendingPayment = (now - created) < 10 * 60 * 1000
      }
    }
  }

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
        <Link href="/dashboard/exams" className="text-indigo-600 hover:underline mb-4 inline-block">
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

          {/* ═══ ÖDƏNİŞLİ BADGE ═══ */}
          {exam.is_paid && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-sm font-bold text-yellow-900">Ödənişli imtahan</p>
                  <p className="text-xs text-yellow-700">
                    Qiymət: <strong>{exam.price} AZN</strong>
                  </p>
                </div>
              </div>
              {isStudent && hasPaid && (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  ✓ Ödənilib
                </span>
              )}
            </div>
          )}

          {/* Statistikalar */}
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

          {/* ═══ ŞAGİRD ÜÇÜN ═══ */}
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

              {/* ═══ ÖDƏNİŞ YOXLAMASI ═══ */}
              {exam.is_paid && !hasPaid ? (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
                  <div className="text-5xl mb-3">🔒</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Bu imtahan ödənişlidir
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    İmtahana başlamaq üçün <strong className="text-indigo-600 text-lg">{exam.price} AZN</strong> ödəməlisiniz
                  </p>

                  {isPendingPayment && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-left">
                      <p className="text-xs text-blue-800">
                        ⏳ <strong>Ödəniş gözləyir</strong> — Payriff səhifəsindən ödənişi tamamlayın.
                        Ödəniş təsdiqləndikdən sonra bu səhifə avtomatik yenilənəcək.
                      </p>
                    </div>
                  )}

                  <PayExamButton examId={exam.id} price={Number(exam.price)} />
                </div>
              ) : (
                <Link href={`/dashboard/exams/${exam.id}/take`}
                  className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition text-lg">
                  {attempts.length > 0 ? '🔄 Yenidən cəhd et' : '🚀 İmtahana başla'}
                </Link>
              )}

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

          {/* ═══ MÜƏLLİM ÜÇÜN ═══ */}
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
