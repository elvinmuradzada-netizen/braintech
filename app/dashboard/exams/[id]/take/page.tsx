import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ExamRunner from './ExamRunner'

export default async function TakeExamPage({
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

  if (!exam.is_published) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md text-center">
          <p className="text-2xl mb-4">⚠️</p>
          <h1 className="text-xl font-bold mb-2">İmtahan yayımlanmayıb</h1>
          <p className="text-gray-500 mb-4">Bu imtahana hələ başlaya bilməzsiniz.</p>
          <Link href={`/dashboard/exams/${exam.id}`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            ← Geri qayıt
          </Link>
        </div>
      </div>
    )
  }

  // Sualları götür
  const { data: examQuestions } = await supabase
    .from('exam_questions')
    .select('question_id, points, order_index, questions(id, type, body, options)')
    .eq('exam_id', id)
    .order('order_index')

  if (!examQuestions || examQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md text-center">
          <p className="text-2xl mb-4">📭</p>
          <h1 className="text-xl font-bold mb-2">Suallar yoxdur</h1>
          <p className="text-gray-500 mb-4">Bu imtahanda hələ sual yoxdur.</p>
          <Link href={`/dashboard/exams/${exam.id}`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            ← Geri qayıt
          </Link>
        </div>
      </div>
    )
  }

  // Sualları formatla
  const questions = examQuestions
    .filter((eq: any) => eq.questions)
    .map((eq: any) => ({
      id: eq.questions.id,
      type: eq.questions.type,
      body: eq.questions.body,
      options: eq.questions.options || [],
      points: eq.points,
    }))

  // Yeni cəhd yarat
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .insert({
      exam_id: id,
      student_id: user.id,
      status: 'in_progress',
    })
    .select()
    .single()

  if (attemptError || !attempt) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md text-center">
          <p className="text-2xl mb-4">❌</p>
          <h1 className="text-xl font-bold mb-2">Xəta baş verdi</h1>
          <p className="text-gray-500 mb-4">{attemptError?.message}</p>
          <Link href={`/dashboard/exams/${exam.id}`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            ← Geri qayıt
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ExamRunner
      examId={exam.id}
      examTitle={exam.title}
      attemptId={attempt.id}
      durationMinutes={exam.duration_minutes}
      questions={questions}
    />
  )
}
