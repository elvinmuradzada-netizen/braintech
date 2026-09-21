'use client'

import { useState, useEffect } from 'react'

export default function SingleChoiceForm({
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
  const [correctId, setCorrectId] = useState<string>(value?.correctAnswer?.id || '')

  useEffect(() => {
    onChange({
      options: options.filter(o => o.text.trim()),
      correctAnswer: correctId ? { id: correctId, text: options.find(o => o.id === correctId)?.text } : null,
    })
  }, [options, correctId])

  function updateOption(idx: number, text: string) {
    const newOpts = [...options]
    newOpts[idx].text = text
    setOptions(newOpts)
  }

  function addOption() {
    if (options.length >= 8) return
    const nextId = String.fromCharCode(65 + options.length)
    setOptions([...options, { id: nextId, text: '' }])
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return
    const newOpts = options.filter((_, i) => i !== idx)
    // Re-assign IDs
    const reassigned = newOpts.map((o, i) => ({ ...o, id: String.fromCharCode(65 + i) }))
    setOptions(reassigned)
    if (correctId === options[idx].id) setCorrectId('')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">Yalnız bir düzgün cavab seçin</p>
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
            onClick={() => setCorrectId(opt.id)}
            className={`w-8 h-8 rounded-lg font-bold text-sm flex-shrink-0 transition ${
              correctId === opt.id
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {correctId === opt.id ? '✓' : opt.id}
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

