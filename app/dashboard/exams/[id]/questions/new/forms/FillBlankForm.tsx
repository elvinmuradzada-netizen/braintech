'use client'

import { useState, useEffect } from 'react'

export default function FillBlankForm({
  value,
  onChange,
}: {
  value: any
  onChange: (v: any) => void
}) {
  const [answer, setAnswer] = useState(value?.correctAnswer?.value || '')
  const [alternatives, setAlternatives] = useState<string[]>(value?.correctAnswer?.alternatives || [])

  useEffect(() => {
    onChange({
      options: [],
      correctAnswer: answer ? {
        value: answer,
        alternatives: alternatives.filter(a => a.trim()),
      } : null,
    })
  }, [answer, alternatives])

  function addAlt() {
    setAlternatives([...alternatives, ''])
  }

  function updateAlt(idx: number, val: string) {
    const newAlts = [...alternatives]
    newAlts[idx] = val
    setAlternatives(newAlts)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-gray-700 mb-1 block uppercase tracking-wider">
          DÜZGÜN CAVAB *
        </label>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Düzgün cavabı yazın"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-indigo-500 transition"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            ALTERNATİV CAVABLAR (könüllü)
          </label>
          <button
            type="button"
            onClick={addAlt}
            className="text-xs text-indigo-600 font-bold hover:underline"
          >
            + Alternativ
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mb-2">
          Şagird bu cavablardan birini yazsa, düzgün sayılacaq
        </p>
        {alternatives.map((alt, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              type="text"
              value={alt}
              onChange={(e) => updateAlt(idx, e.target.value)}
              placeholder="Alternativ cavab"
              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setAlternatives(alternatives.filter((_, i) => i !== idx))}
              className="w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
