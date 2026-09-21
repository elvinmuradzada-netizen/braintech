import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import QuestionForm from './QuestionForm'

export default async function NewQuestionPage({
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
  if (exam.teacher_id !== user.id) redirect('/dashboard/exams')

  // Sual bankı statistikası
  const { count: totalQuestions } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id)

  const { count: examQuestions } = await supabase
    .from('exam_questions')
    .select('*', { count: 'exact', head: true })
    .eq('exam_id', id)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/dashboard/exams" className="hover:text-indigo-600">İmtahanlarım</Link>
        <span>→</span>
        <Link href={`/dashboard/exams/${id}/edit`} className="hover:text-indigo-600 truncate">
          {exam.title}
        </Link>
        <span>→</span>
        <span className="text-gray-900 font-bold">Sual əlavə et</span>
      </div>

      <QuestionForm
        examId={id}
        gradeLevel={exam.grade_level}
        subjectId={exam.subject_id}
        totalQuestions={totalQuestions || 0}
        examQuestionsCount={examQuestions || 0}
      />
    </div>
  )
}
