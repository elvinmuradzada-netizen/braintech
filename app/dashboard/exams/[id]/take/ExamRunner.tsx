'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { submitExam } from '@/lib/exams/actions'

type Question = {
  id: string
  type: string
  body: string
  options: any
  correct_answer: any
  metadata?: any
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

  // ═══ NƏTİCƏ EKRANI ═══
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
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ═══ İMTAHAN EKRANI ═══
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== null && answers[k] !== ''
  ).length
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
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* SUAL */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex justify-between items-start mb-6">
            <span className="text-sm font-medium text-indigo-600">
              Sual {currentIndex + 1} / {totalQuestions}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                {getTypeLabel(currentQuestion.type)}
              </span>
              <span className="text-sm text-gray-500">{currentQuestion.points} bal</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.body}
          </h2>

          {/* TİPƏ GÖRƏ FORM */}
          <QuestionRenderer
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(val) => handleAnswer(currentQuestion.id, val)}
          />
        </div>

        {/* NAVİQASİYA */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-lg transition disabled:opacity-30"
          >
            ← Əvvəlki
          </button>

          <div className="hidden md:flex gap-1.5">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                  i === currentIndex
                    ? 'bg-indigo-600 text-white'
                    : answers[q.id] !== undefined && answers[q.id] !== null
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentIndex === totalQuestions - 1 ? (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Göndərilir...' : '✓ Bitir'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Növbəti →
            </button>
          )}
        </div>

        {currentIndex !== totalQuestions - 1 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="text-sm text-gray-500 hover:text-red-600 underline"
            >
              İmtahanı bitir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// KÖMƏKÇİ: Tip etiketi
// ═══════════════════════════════════════════════════════
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    single_choice: '◉ Tək seçim',
    multiple_choice: '☑ Çox seçim',
    true_false: '✓✗ Doğru/Yanlış',
    fill_blank: '___ Boşluq',
    matching: '⇄ Uyğunlaşdırma',
    sorting: '↕ Sıralama',
    reading: '📖 Oxuma',
    image: '🖼 Şəkil',
    // Köhnə tiplər
    multiple_choice_old: '☑ Çox seçim',
  }
  return labels[type] || type
}

// ═══════════════════════════════════════════════════════
// KÖMƏKÇİ: Sual Renderer
// ═══════════════════════════════════════════════════════
function QuestionRenderer({
  question,
  value,
  onChange,
}: {
  question: Question
  value: any
  onChange: (v: any) => void
}) {
  switch (question.type) {
    case 'single_choice':
    case 'multiple_choice':
      return (
        <SingleChoiceRenderer
          options={question.options}
          value={value}
          onChange={onChange}
          multiple={question.type === 'multiple_choice'}
        />
      )
    case 'true_false':
      return <TrueFalseRenderer value={value} onChange={onChange} />
    case 'fill_blank':
      return <FillBlankRenderer value={value} onChange={onChange} />
    case 'matching':
      return <MatchingRenderer question={question} value={value} onChange={onChange} />
    case 'sorting':
      return <SortingRenderer question={question} value={value} onChange={onChange} />
    case 'reading':
      return <ReadingRenderer question={question} value={value} onChange={onChange} />
    case 'image':
      return (
        <ImageRenderer
          question={question}
          value={value}
          onChange={onChange}
        />
      )
    default:
      return <p className="text-gray-500 text-sm">Bu sual tipi dəstəklənmir</p>
  }
}

// ═══ TƏK/ÇOX SEÇİM ═══
function SingleChoiceRenderer({
  options,
  value,
  onChange,
  multiple,
}: {
  options: any[]
  value: any
  onChange: (v: any) => void
  multiple: boolean
}) {
  if (!options || options.length === 0) {
    return <p className="text-gray-400 text-sm">Variantlar yoxdur</p>
  }

  const selectedIds = multiple
    ? Array.isArray(value) ? value : []
    : null

  function toggle(id: string) {
    if (multiple) {
      const current = selectedIds || []
      const newIds = current.includes(id)
        ? current.filter((x: string) => x !== id)
        : [...current, id]
      onChange(newIds)
    } else {
      onChange(id)
    }
  }

  function isSelected(id: string) {
    if (multiple) return (selectedIds || []).includes(id)
    return value === id
  }

  return (
    <div className="space-y-3">
      {multiple && (
        <p className="text-xs text-gray-500 mb-2">
          ☑ Bir və ya bir neçə düzgün cavab seçə bilərsiniz
        </p>
      )}
      {options.map((opt) => (
        <label
          key={opt.id}
          className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
            isSelected(opt.id)
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type={multiple ? 'checkbox' : 'radio'}
            name={question?.id || 'option'}
            checked={isSelected(opt.id)}
            onChange={() => toggle(opt.id)}
            className="w-4 h-4"
          />
          <span className="font-medium text-gray-900 w-6">{opt.id})</span>
          <span className="text-gray-800 flex-1">{opt.text}</span>
        </label>
      ))}
    </div>
  )
}

// ═══ DOĞRU/YANLIŞ ═══
function TrueFalseRenderer({
  value,
  onChange,
}: {
  value: any
  onChange: (v: any) => void
}) {
  return (
    <div className="space-y-3">
      {[
        { val: true, label: '✓ Doğru', color: 'green' },
        { val: false, label: '✗ Yanlış', color: 'red' },
      ].map((opt) => {
        const isSelected = value === opt.val
        return (
          <label
            key={String(opt.val)}
            className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
              isSelected
                ? opt.color === 'green'
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              checked={isSelected}
              onChange={() => onChange(opt.val)}
              className="w-4 h-4"
            />
            <span className="font-semibold text-gray-900 text-lg">{opt.label}</span>
          </label>
        )
      })}
    </div>
  )
}

// ═══ BOŞLUQ DOLDUR ═══
function FillBlankRenderer({
  value,
  onChange,
}: {
  value: any
  onChange: (v: any) => void
}) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Cavabı yazın..."
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-gray-900 text-base"
    />
  )
}

// ═══ UYĞUNLAŞDIRMA ═══
function MatchingRenderer({
  question,
  value,
  onChange,
}: {
  question: Question
  value: any
  onChange: (v: any) => void
}) {
  const pairs = question.correct_answer?.pairs || []
  if (pairs.length === 0) {
    return <p className="text-gray-400 text-sm">Məlumat yoxdur</p>
  }

  const leftItems = pairs.map((p: any, i: number) => ({ id: i, text: p.left }))
  const rightItems = pairs
    .map((p: any, i: number) => ({ id: i, text: p.right }))
    .sort(() => 0.5 - Math.random())

  const current = value || {}

  function setMatch(leftId: number, rightText: string) {
    onChange({ ...current, [leftId]: rightText })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 mb-2">
        Sol tərəflə uyğun sağ tərəfi seçin
      </p>
      {leftItems.map((left) => (
        <div key={left.id} className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-sm text-gray-900">
            {left.text}
          </div>
          <span className="text-gray-400 font-bold">⇄</span>
          <select
            value={current[left.id] || ''}
            onChange={(e) => setMatch(left.id, e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-sm text-gray-900 outline-none focus:border-indigo-500"
          >
            <option value="">Seçin...</option>
            {rightItems.map((r) => (
              <option key={r.id} value={r.text}>{r.text}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}

// ═══ SIRALAMA ═══
function SortingRenderer({
  question,
  value,
  onChange,
}: {
  question: Question
  value: any
  onChange: (v: any) => void
}) {
  const items = question.correct_answer?.items || []
  if (items.length === 0) return <p className="text-gray-400 text-sm">Məlumat yoxdur</p>

  // İstifadəçinin cari sırası (yoxsa qarışıq)
  const [currentOrder, setCurrentOrder] = useState<string[]>(
    value || [...items].sort(() => 0.5 - Math.random())
  )

  function moveUp(idx: number) {
    if (idx === 0) return
    const newOrder = [...currentOrder]
    ;[newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]]
    setCurrentOrder(newOrder)
    onChange(newOrder)
  }

  function moveDown(idx: number) {
    if (idx === currentOrder.length - 1) return
    const newOrder = [...currentOrder]
    ;[newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]]
    setCurrentOrder(newOrder)
    onChange(newOrder)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 mb-2">
        Elementləri düzgün ardıcıllıqla sıralayın (yuxarı ox ▲ ilə dəyişdirin)
      </p>
      {currentOrder.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl bg-white">
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => moveUp(idx)}
              disabled={idx === 0}
              className="text-gray-400 hover:text-indigo-600 disabled:opacity-30 text-xs"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => moveDown(idx)}
              disabled={idx === currentOrder.length - 1}
              className="text-gray-400 hover:text-indigo-600 disabled:opacity-30 text-xs"
            >
              ▼
            </button>
          </div>
          <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
            {idx + 1}
          </span>
          <span className="text-gray-900 font-medium">{item}</span>
        </div>
      ))}
    </div>
  )
}

// ═══ OXUMA ═══
function ReadingRenderer({
  question,
  value,
  onChange,
}: {
  question: Question
  value: any
  onChange: (v: any) => void
}) {
  const passage = question.metadata?.passage || ''
  const subQuestions = question.correct_answer?.subQuestions || []

  if (!passage) return <p className="text-gray-400 text-sm">Mətn yoxdur</p>

  const answers = value || {}

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-700 font-bold mb-2">📖 MƏTN</p>
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{passage}</p>
      </div>

      <div className="space-y-4">
        <p className="text-xs text-gray-500 font-bold">ALT SUALLAR ({subQuestions.length})</p>
        {subQuestions.map((q: string, idx: number) => (
          <div key={idx}>
            <p className="text-sm font-medium text-gray-900 mb-2">
              {idx + 1}. {q}
            </p>
            <textarea
              value={answers[idx] || ''}
              onChange={(e) => onChange({ ...answers, [idx]: e.target.value })}
              rows={2}
              placeholder="Cavabınızı yazın..."
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══ ŞƏKİL ═══
function ImageRenderer({
  question,
  value,
  onChange,
}: {
  question: Question
  value: any
  onChange: (v: any) => void
}) {
  const options = question.options || []

  return (
    <div className="space-y-4">
      {/* Şəkil */}
      {question.media_url ? (
        <div className="rounded-xl overflow-hidden border-2 border-gray-200">
          <Image
            src={question.media_url}
            alt="Sual şəkli"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      ) : question.metadata?.imageUrl ? (
        <div className="rounded-xl overflow-hidden border-2 border-gray-200">
          <Image
            src={question.metadata.imageUrl}
            alt="Sual şəkli"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      ) : (
        <div className="bg-gray-100 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
          <p className="text-4xl mb-2">🖼</p>
          <p className="text-sm text-gray-500">Şəkil yüklənməyib</p>
        </div>
      )}

      {/* Variantlar */}
      <div className="space-y-3">
        {options.map((opt: any) => (
          <label
            key={opt.id}
            className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
              value === opt.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
              className="w-4 h-4"
            />
            <span className="font-medium text-gray-900 w-6">{opt.id})</span>
            <span className="text-gray-800 flex-1">{opt.text}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
