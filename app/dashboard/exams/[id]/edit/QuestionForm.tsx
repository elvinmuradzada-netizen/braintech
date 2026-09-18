'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createQuestion } from '@/lib/exams/actions'

export default function QuestionForm({
  examId,
  gradeLevel,
}: {
  examId: string
  gradeLevel: number
}) {
  const router = useRouter()
  const [type, setType] = useState('multiple_choice')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)
    formData.set('exam_id', examId)
    formData.set('type', type)
    formData.set('grade_level', String(gradeLevel))

    const result = await createQuestion(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      router.refresh()
      const form = document.getElementById('question-form') as HTMLFormElement
      form?.reset()
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Yeni sual əlavə et</h2>

      <form id="question-form" action={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Sual tipi</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none">
            <option value="multiple_choice">Çoxseçimli (A, B, C, D)</option>
            <option value="true_false">Doğru / Yanlış</option>
            <option value="fill_blank">Boşluğu doldur</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sual mətni *</label>
          <textarea name="body" required rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
            placeholder="Sualı buraya yazın..." />
        </div>

        {type === 'multiple_choice' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Variantlar (düzgün cavabı işarələyin)</label>
            {['A', 'B', 'C', 'D'].map((letter) => (
              <div key={letter} className="flex gap-2 items-center">
                <input type="radio" name="correct_answer" value={letter} required
                  className="w-4 h-4" />
                <span className="font-medium w-6">{letter})</span>
                <input name="options" required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  placeholder={`${letter} variantı`} />
              </div>
            ))}
          </div>
        )}

        {type === 'true_false' && (
          <div>
            <label className="block text-sm font-medium mb-1">Düzgün cavab</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="correct_answer" value="true" required /> Doğru
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="correct_answer" value="false" required /> Yanlış
              </label>
            </div>
          </div>
        )}

        {type === 'fill_blank' && (
          <div>
            <label className="block text-sm font-medium mb-1">Düzgün cavab *</label>
            <input name="correct_answer" required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
              placeholder="Düzgün cavabı yazın" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Bal</label>
          <input name="points" type="number" defaultValue={1} min={1}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            ✅ Sual əlavə edildi!
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
          {loading ? 'Əlavə edilir...' : 'Sual əlavə et'}
        </button>
      </form>
    </div>
  )
}
