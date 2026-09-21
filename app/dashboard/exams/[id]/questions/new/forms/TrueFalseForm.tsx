'use client'

import { useEffect } from 'react'

export default function TrueFalseForm({
  value,
  onChange,
}: {
  value: any
  onChange: (v: any) => void
}) {
  useEffect(() => {
    if (!value) {
      onChange({
        options: [],
        correctAnswer: null,
      })
    }
  }, [])

  function setAnswer(val: boolean) {
    onChange({
      options: [],
      correctAnswer: { value: val },
    })
  }

  const current = value?.correctAnswer?.value

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 mb-2">Düzgün cavabı seçin</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setAnswer(true)}
          className={`py-6 rounded-xl border-2 font-bold text-lg transition ${
            current === true
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 text-gray-500 hover:border-green-300'
          }`}
        >
          ✓ Doğru
        </button>
        <button
          type="button"
          onClick={() => setAnswer(false)}
          className={`py-6 rounded-xl border-2 font-bold text-lg transition ${
            current === false
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-200 text-gray-500 hover:border-red-300'
          }`}
        >
          ✗ Yanlış
        </button>
      </div>
    </div>
  )
}
