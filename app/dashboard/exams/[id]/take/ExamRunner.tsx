'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { submitExam } from '@/lib/exams/actions'

type Question = {
  id: string
  type: string
  body: string
  options: { id: string; text: string }[]
  points: number
}

export default function ExamRunner({
  examId,
  examTitle,
  attemptId,
  durationMinutes,
  questions,
}: {
  examId: string
  examTitle: string
  attemptId: string
  durationMinutes: number
  questions: Question[]
}) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length

  // Vaxt sayğacı
  useEffect(() => {
    if (result) return
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer)
          handleSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [result])

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting || result) return
    if (!auto && !confirm('İmtahanı bitirmək istədiyinizə əminsiniz?')) return

    setSubmitting(true)
    const timeSpent = durationMinutes * 60 - timeLeft
    const res = await submitExam(attemptId, answers, timeSpent)
    setSubmitting(false)
    if (res?.success) {
      setResult(res)
    } else {
      alert('Xəta: ' + res?.error)
    }
  }, [answers, attemptId, durationMinutes, timeLeft, submitting, result])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // NƏTİCƏ EKRANI
  if (result) {
    const percent = Math.round(result.percentage || 0)
    const isPassed = percent >= 60
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-6xl mb-4">{isPassed ? '🎉' : '💪'}</p>
          <h1 className="text-2xl font-bold mb-2">
            {isPassed ? 'Təbriklər!' : 'Yaxşı cəhd!'}
          </h1>
          <p className="text-gray-500 mb-6">İmtahan tamamlandı</p>

          <div className={`rounded-2xl p-6 mb-6 ${
            isPassed ? 'bg-green-50' : 'bg-yellow-50'
          }`}>
            <p className="text-sm text-gray-600 font-medium mb-1">Nəticəniz</p>
            <p className={`text-5xl font-bold ${
              isPassed ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {percent}%
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {result.score} / {result.maxScore} bal
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/dashboard/exams/${examId}`)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition"
            >
              ← İmtahana qayıt
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // İMTAHAN EKRANI
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / totalQuestions) * 100
  const timeWarning = timeLeft < 60

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="font-bold text-gray-900">{examTitle}</h1>
            <p className="text-sm text-gray-500">
              {answeredCount} / {totalQuestions} cavablandı
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-mono font-bold ${
            timeWarning ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'
          }`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* SUAL */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex justify-between items-start mb-6">
            <span className="text-sm font-medium text-blue-600">
              Sual {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-sm text-gray-500">{currentQuestion.points} bal</span>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.body}
          </h2>

          {/* ÇOXSEÇİMLİ */}
          {currentQuestion.type === 'multiple_choice' && (
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => (
                <label key={opt.id}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
                    answers[currentQuestion.id] === opt.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    checked={answers[currentQuestion.id] === opt.id}
                    onChange={() => handleAnswer(currentQuestion.id, opt.id)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-gray-900 w-6">{opt.id})</span>
                  <span className="text-gray-800">{opt.text}</span>
                </label>
              ))}
            </div>
          )}

          {/* DOĞRU/YANLIŞ */}
          {currentQuestion.type === 'true_false' && (
            <div className="space-y-3">
              {[
                { val: 'true', label: '✓ Doğru' },
                { val: 'false', label: '✗ Yanlış' },
              ].map((opt) => (
                <label key={opt.val}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
                    answers[currentQuestion.id] === opt.val
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    checked={answers[currentQuestion.id] === opt.val}
                    onChange={() => handleAnswer(currentQuestion.id, opt.val)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-gray-900">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {/* BOŞLUQ DOLDUR */}
          {currentQuestion.type === 'fill_blank' && (
            <input
              type="text"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              placeholder="Cavabı yazın..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-gray-900"
            />
          )}
        </div>

        {/* NAVİQASİYA */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-lg transition disabled:opacity-30">
            ← Əvvəlki
          </button>

          {/* Suallara sürətli keçid */}
          <div className="hidden md:flex gap-1.5">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                  i === currentIndex
                    ? 'bg-blue-600 text-white'
                    : answers[q.id] !== undefined
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>

          {currentIndex === totalQuestions - 1 ? (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50">
              {submitting ? 'Göndərilir...' : '✓ Bitir'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">
              Növbəti →
            </button>
          )}
        </div>

        {/* Bitirmə düyməsi (sonuncu sual deyilsə) */}
        {currentIndex !== totalQuestions - 1 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="text-sm text-gray-500 hover:text-red-600 underline">
              İmtahanı bitir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
