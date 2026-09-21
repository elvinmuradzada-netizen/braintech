'use client'

import { useState, useEffect } from 'react'

export default function ReadingForm({
  value,
  onChange,
}: {
  value: any
  onChange: (v: any) => void
}) {
  const [passage, setPassage] = useState(value?.metadata?.passage || '')
  const [subQuestions, setSubQuestions] = useState<string[]>(
    value?.correctAnswer?.subQuestions || ['']
  )

  useEffect(() => {
    const valid = subQuestions.filter(q => q.trim())
    onChange({
      options: [],
      correctAnswer: valid.length > 0 ? { subQuestions: valid } : null,
      metadata: { passage },
    })
  }, [passage, subQuestions])

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-gray-700 mb-1 block uppercase tracking-wider">
          OXU MƏTNİ *
        </label>
        <textarea
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          rows={6}
          placeholder="Oxunacaq mətni buraya yazın..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-indigo-500 focus:bg-white transition resize-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            ALT SUALLAR
          </label>
          <button
            type="button"
            onClick={() => setSubQuestions([...subQuestions, ''])}
            className="text-xs text-indigo-600 font-bold hover:underline"
          >
            + Alt sual
          </button>
        </div>
        {subQuestions.map((q, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <span className="w-8 h-11 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {idx + 1}
            </span>
            <input
              type="text"
              value={q}
              onChange={(e) => {
                const nq = [...subQuestions]
                nq[idx] = e.target.value
                setSubQuestions(nq)
              }}
              placeholder="Alt sual..."
              className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500"
            />
            {subQuestions.length > 1 && (
              <button
                type="button"
                onClick={() => setSubQuestions(subQuestions.filter((_, i) => i !== idx))}
                className="w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
