import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import QuestionForm from './QuestionForm'
import PublishButton from './PublishButton'

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: exam } = await supabase
    .from('exams')
    .select('*, subjects(name, icon)')
    .eq('id', id)
    .single()

  if (!exam) notFound()

  const { data: examQuestions } = await supabase
    .from('exam_questions')
    .select('*, questions(*)')
    .eq('exam_id', id)
    .order('order_index')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard/exams" className="text-blue-600 hover:underline mb-4 inline-block">
          ← İmtahanlar
        </Link>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{exam.title}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {exam.subjects?.icon} {exam.subjects?.name} • {exam.grade_level}-ci sinif • {exam.duration_minutes} dəq
              </p>
            </div>
            {!exam.is_published && <PublishButton examId={exam.id} />}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Suallar ({examQuestions?.length || 0})
          </h2>

          {examQuestions && examQuestions.length > 0 ? (
            <div className="space-y-3">
              {examQuestions.map((eq, idx) => (
                <div key={eq.question_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">
                        <span className="text-blue-600">#{idx + 1}</span>{' '}
                        {eq.questions.body}
                      </p>
                      {eq.questions.options && eq.questions.options.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          {eq.questions.options.map((o: any) => (
                            <li key={o.id}>
                              <span className="font-medium">{o.id})</span> {o.text}
                              {eq.questions.correct_answer?.id === o.id && (
                                <span className="text-green-600 ml-2">✓</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 ml-4">
                      {eq.points} bal
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Hələ sual yoxdur</p>
          )}
        </div>

        <QuestionForm examId={exam.id} gradeLevel={exam.grade_level} />
      </div>
    </div>
  )
}
