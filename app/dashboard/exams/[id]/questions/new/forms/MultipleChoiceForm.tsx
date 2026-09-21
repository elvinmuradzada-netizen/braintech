'use client'

import { useState, useEffect } from 'react'

export default function MultipleChoiceForm({
  value,
  onChange,
}: {
  value: any
  onChange: (v: any) => void
}) {
  const [options, setOptions] = useState<{ id: string; text: string }[]>(
    value?.options?.length > 0 ? value.options : [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
    ]
  )
  const [correctIds, setCorrectIds] = useState<string[]>(value?.correctAnswer?.ids || [])

  useEffect(() => {
    const correctOptions = options.filter(o => correctIds.includes(o.id))
    onChange({
      options: options.filter(o => o.text.trim()),
      correctAnswer: correctIds.length > 0 ? {
        ids: correctIds,
        texts: correctOptions.map(o => o.text),
      } : null,
    })
  }, [options, correctIds])

  function updateOption(idx: number, text: string) {
    const newOpts = [...options]
    newOpts[idx].text = text
    setOptions(newOpts)
  }

  function toggleCorrect(id: string) {
    setCorrectIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function addOption() {
    if (options.length >= 8) return
    const nextId = String.fromCharCode(65 + options.length)
    setOptions([...options, { id: nextId, text: '' }])
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return
    const removed = options[idx]
    const newOpts = options.filter((_, i) => i !== idx)
    const reassigned = newOpts.map((o, i) => ({ ...o, id: String.fromCharCode(65 + i) }))
    setOptions(reassigned)
    setCorrectIds(prev => prev.filter(x => x !== removed.id))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">
          Bir və ya bir neçə düzgün cavab seçin ({correctIds.length} seçilib)
        </p>
        <button
          type="button"
          onClick={addOption}
          disabled={options.length >= 8}
          className="text-xs text-indigo-600 font-bold hover:underline disabled:opacity-50"
        >
          + Variant əlavə et
        </button>
      </div>

      {options.map((opt, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleCorrect(opt.id)}
            className={`w-8 h-8 rounded-lg font-bold text-sm flex-shrink-0 transition ${
              correctIds.includes(opt.id)
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {correctIds.includes(opt.id) ? '✓' : opt.id}
          </button>
          <input
            type="text"
            value={opt.text}
            onChange={(e) => updateOption(idx, e.target.value)}
            placeholder={`Variant ${opt.id}`}
            className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500 transition"
          />
          {options.length > 2 && (
            <button
              type="button"
              onClick={() => removeOption(idx)}
              className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center flex-shrink-0"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
