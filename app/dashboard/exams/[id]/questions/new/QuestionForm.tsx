'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import SingleChoiceForm from './forms/SingleChoiceForm'
import MultipleChoiceForm from './forms/MultipleChoiceForm'
import TrueFalseForm from './forms/TrueFalseForm'
import FillBlankForm from './forms/FillBlankForm'
import MatchingForm from './forms/MatchingForm'
import SortingForm from './forms/SortingForm'
import ReadingForm from './forms/ReadingForm'
import ImageQuestionForm from './forms/ImageQuestionForm'

type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'matching'
  | 'sorting'
  | 'reading'
  | 'image'

const QUESTION_TYPES: {
  id: QuestionType
  label: string
  icon: string
  desc: string
}[] = [
  { id: 'single_choice', label: 'Tək seçim', icon: '◉', desc: 'Bir düzgün cavab' },
  { id: 'multiple_choice', label: 'Çox seçim', icon: '☑', desc: 'Bir neçə düzgün cavab' },
  { id: 'true_false', label: 'Doğru/Yanlış', icon: '✓✗', desc: 'İki variantdan biri' },
  { id: 'fill_blank', label: 'Boşluq doldur', icon: '___', desc: 'Mətn cavabı' },
  { id: 'matching', label: 'Uyğunlaşdırma', icon: '⇄', desc: 'Cütləri uyğunlaşdır' },
  { id: 'sorting', label: 'Sıralama', icon: '↕', desc: 'Düzgün sırala' },
  { id: 'reading', label: 'Oxuma', icon: '📖', desc: 'Mətn + suallar' },
  { id: 'image', label: 'Şəkil əsaslı', icon: '🖼', desc: 'Şəkil + sual' },
]

export default function QuestionForm({
  examId,
  gradeLevel,
  subjectId,
  totalQuestions,
  examQuestionsCount,
}: {
  examId: string
  gradeLevel: number
  subjectId: number
  totalQuestions: number
  examQuestionsCount: number
}) {
  const router = useRouter()
  const supabase = createClient()

  const [type, setType] = useState<QuestionType>('single_choice')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Ümumi sahələr
  const [body, setBody] = useState('')
  const [explanation, setExplanation] = useState('')
  const [difficulty, setDifficulty] = useState('2')
  const [points, setPoints] = useState('1')
  const [topic, setTopic] = useState('')

  // Tip-spesifik cavab məlumatları (child komponentdən gələcək)
  const [answerData, setAnswerData] = useState<any>(null)
  const [mediaFile, setMediaFile] = useState<File | null>(null)

  // ═══ YADDA SAXLA ═══
  async function handleSave(addNew: boolean = false) {
    if (!body.trim()) {
      setError('Sual mətni boş ola bilməz')
      return
    }

    if (!answerData || !answerData.correctAnswer) {
      setError('Düzgün cavab təyin edilməyib')
      return
    }

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('İstifadəçi tapılmadı')
      setLoading(false)
      return
    }

    // 1. Sualı yarat
    const { data: question, error: qErr } = await supabase
      .from('questions')
      .insert({
        teacher_id: user.id,
        type,
        body,
        explanation,
        topic,
        difficulty: parseInt(difficulty),
        grade_level: gradeLevel,
        options: answerData.options || [],
        correct_answer: answerData.correctAnswer,
        metadata: answerData.metadata || {},
      })
      .select()
      .single()

    if (qErr || !question) {
      setError(qErr?.message || 'Sual yaradıla bilmədi')
      setLoading(false)
      return
    }

    // 2. İmtahana bağla
    const { error: linkErr } = await supabase
      .from('exam_questions')
      .insert({
        exam_id: examId,
        question_id: question.id,
        points: parseInt(points) || 1,
      })

    if (linkErr) {
      setError(linkErr.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)

    // Formu təmizlə
    if (addNew) {
      setBody('')
      setExplanation('')
      setAnswerData(null)
      setMediaFile(null)
      setTopic('')
      setSuccess(false)
      router.refresh()
      // Scroll top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.push(`/dashboard/exams/${examId}/edit`)
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6">
      {/* ═══ SOL: ƏSAS FORM ═══ */}
      <div className="space-y-6">
        {/* Sual tipi */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-lg">📋</span>
            Sual tipi
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUESTION_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setType(t.id)
                  setAnswerData(null)
                }}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition text-center min-h-[90px] ${
                  type === t.id
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <span className={`text-xl ${
                  type === t.id ? 'text-indigo-600' : 'text-gray-600'
                }`}>{t.icon}</span>
                <span className={`text-xs font-bold ${
                  type === t.id ? 'text-indigo-700' : 'text-gray-700'
                }`}>{t.label}</span>
                <span className="text-[9px] text-gray-400 leading-tight">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sual mətni */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-lg">✏️</span>
            Sual mətni
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block uppercase tracking-wider">
                SUAL *
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="Sual mətnini yazın..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-indigo-500 focus:bg-white transition resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block uppercase tracking-wider">
                İZAHAT (cavab sonrası göstərilir)
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={2}
                placeholder="Düzgün cavabın izahatı..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-indigo-500 focus:bg-white transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* Tip-spesifik cavab forması */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-lg">💡</span>
            Cavab
          </h3>

          {type === 'single_choice' && (
            <SingleChoiceForm value={answerData} onChange={setAnswerData} />
          )}
          {type === 'multiple_choice' && (
            <MultipleChoiceForm value={answerData} onChange={setAnswerData} />
          )}
          {type === 'true_false' && (
            <TrueFalseForm value={answerData} onChange={setAnswerData} />
          )}
          {type === 'fill_blank' && (
            <FillBlankForm value={answerData} onChange={setAnswerData} />
          )}
          {type === 'matching' && (
            <MatchingForm value={answerData} onChange={setAnswerData} />
          )}
          {type === 'sorting' && (
            <SortingForm value={answerData} onChange={setAnswerData} />
          )}
          {type === 'reading' && (
            <ReadingForm value={answerData} onChange={setAnswerData} />
          )}
          {type === 'image' && (
            <ImageQuestionForm
              value={answerData}
              onChange={setAnswerData}
              mediaFile={mediaFile}
              setMediaFile={setMediaFile}
            />
          )}
        </div>

        {/* Xəta/success */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-bold">
            ✓ Sual uğurla əlavə edildi!
          </div>
        )}
      </div>

      {/* ═══ SAĞ: PARAMETRLƏR PANELİ ═══ */}
      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        {/* Parametrlər */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Parametrlər</h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block uppercase tracking-wider">
                MÖVZU
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Mövzu seçin..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                ÇƏTİNLİK
              </label>
              <div className="grid grid-cols-3 gap-1 bg-gray-50 rounded-lg p-1">
                {[
                  { val: '1', label: 'Asan', color: 'green' },
                  { val: '2', label: 'Orta', color: 'yellow' },
                  { val: '3', label: 'Çətin', color: 'red' },
                ].map((d) => (
                  <button
                    key={d.val}
                    onClick={() => setDifficulty(d.val)}
                    className={`py-2 rounded-md text-xs font-bold transition ${
                      difficulty === d.val
                        ? d.color === 'green' ? 'bg-green-100 text-green-700' :
                          d.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block uppercase tracking-wider">
                BAL
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                min={1}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Statistika */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">İmtahan xülasəsi</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Ümumi sual (banka)</span>
              <span className="font-bold text-gray-900">{totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Bu imtahanda</span>
              <span className="font-bold text-indigo-600">{examQuestionsCount}</span>
            </div>
          </div>
        </div>

        {/* Düymələr */}
        <div className="space-y-2">
          <button
            onClick={() => handleSave(true)}
            disabled={loading}
            className="w-full bg-white border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 font-bold py-3 rounded-xl transition disabled:opacity-50 text-sm"
          >
            {loading ? 'Yadda saxlanılır...' : '📥 Yadda saxla + Yeni sual'}
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-sm"
          >
            {loading ? 'Yadda saxlanılır...' : '✓ Yadda saxla'}
          </button>
          <button
            onClick={() => router.push(`/dashboard/exams/${examId}/edit`)}
            className="w-full text-center text-gray-500 hover:text-gray-700 text-xs font-bold py-2"
          >
            Ləğv et
          </button>
        </div>
      </div>
    </div>
  )
}
