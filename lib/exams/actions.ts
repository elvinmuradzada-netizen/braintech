'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ═══ İMTAHAN YARAT ═══
export async function createExam(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Giriş etməmisiniz' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const subjectId = formData.get('subject_id') as string
  const gradeLevel = formData.get('grade_level') as string
  const duration = formData.get('duration_minutes') as string
  const passingScore = formData.get('passing_score') as string
  const isPaid = formData.get('is_paid') === 'true'
  const price = formData.get('price') as string

  const { data, error } = await supabase
    .from('exams')
    .insert({
      title,
      description,
      subject_id: subjectId ? parseInt(subjectId) : null,
      grade_level: parseInt(gradeLevel),
      teacher_id: user.id,
      duration_minutes: parseInt(duration) || 30,
      passing_score: parseInt(passingScore) || 60,
      is_paid: isPaid,
      price: isPaid ? parseFloat(price) || 0 : 0,
      is_published: false,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/exams')
  redirect(`/dashboard/exams/${data.id}/edit`)
}

// ═══ SUAL YARAT ═══
export async function createQuestion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Giriş etməmisiniz' }

  const examId = formData.get('exam_id') as string
  const body = formData.get('body') as string
  const type = formData.get('type') as string
  const gradeLevel = formData.get('grade_level') as string
  const correctAnswer = formData.get('correct_answer') as string
  const optionsRaw = formData.getAll('options') as string[]
  const points = formData.get('points') as string

  const options = optionsRaw.filter(Boolean).map((o, i) => ({
    id: String.fromCharCode(65 + i),
    text: o,
  }))

  const correctJson = type === 'multiple_choice'
    ? JSON.stringify({ id: correctAnswer, text: options.find(o => o.id === correctAnswer)?.text })
    : JSON.stringify({ value: correctAnswer })

  const { data: question, error: qErr } = await supabase
    .from('questions')
    .insert({
      teacher_id: user.id,
      type,
      body,
      options,
      correct_answer: JSON.parse(correctJson),
      grade_level: parseInt(gradeLevel),
    })
    .select()
    .single()

  if (qErr) return { error: qErr.message }

  const { error: linkErr } = await supabase
    .from('exam_questions')
    .insert({
      exam_id: examId,
      question_id: question.id,
      points: parseInt(points) || 1,
    })

  if (linkErr) return { error: linkErr.message }

  revalidatePath(`/dashboard/exams/${examId}/edit`)
  return { success: true }
}

// ═══ İMTAHANI PUBLİK ET ═══
export async function publishExam(examId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('exams')
    .update({ is_published: true })
    .eq('id', examId)

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/exams/${examId}/edit`)
  revalidatePath('/dashboard/exams')
  return { success: true }
}

// ═══ İMTAHAN VER ═══
export async function startAttempt(examId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Giriş etməmisiniz' }

  const { data, error } = await supabase
    .from('attempts')
    .insert({
      exam_id: examId,
      student_id: user.id,
      status: 'in_progress',
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { success: true, attemptId: data.id }
}

// ═══ İMTAHANI BİTİR ═══
export async function submitExam(attemptId: string, answers: Record<string, any>, timeSpent: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Giriş etməmisiniz' }

  const { data: attempt } = await supabase
    .from('attempts')
    .select('exam_id')
    .eq('id', attemptId)
    .single()

  if (!attempt) return { error: 'Cəhd tapılmadı' }

  const { data: examQs } = await supabase
    .from('exam_questions')
    .select('question_id, points, questions(correct_answer)')
    .eq('exam_id', attempt.exam_id)

  let totalScore = 0
  let maxScore = 0

  for (const eq of examQs || []) {
    maxScore += eq.points
    const studentAnswer = answers[eq.question_id]
    const correct = (eq.questions as any)?.correct_answer

    let isCorrect = false
    if (studentAnswer && correct) {
      if (correct.id) {
        isCorrect = studentAnswer === correct.id
      } else if (correct.value !== undefined) {
        isCorrect = String(studentAnswer).trim().toLowerCase() === String(correct.value).trim().toLowerCase()
      }
    }

    const pointsEarned = isCorrect ? eq.points : 0
    totalScore += pointsEarned

    await supabase.from('answers').insert({
      attempt_id: attemptId,
      question_id: eq.question_id,
      answer: { value: studentAnswer },
      is_correct: isCorrect,
      points_earned: pointsEarned,
    })
  }

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

  await supabase
    .from('attempts')
    .update({
      finished_at: new Date().toISOString(),
      score: totalScore,
      max_score: maxScore,
      percentage,
      status: 'completed',
      time_spent_seconds: timeSpent,
    })
    .eq('id', attemptId)

  revalidatePath('/dashboard')
  return { success: true, score: totalScore, maxScore, percentage }
}
