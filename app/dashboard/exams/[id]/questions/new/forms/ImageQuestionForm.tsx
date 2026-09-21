'use client'

import { useState, useEffect } from 'react'

export default function ImageQuestionForm({
  value,
  onChange,
  mediaFile,
  setMediaFile,
}: {
  value: any
  onChange: (v: any) => void
  mediaFile: File | null
  setMediaFile: (f: File | null) => void
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
      metadata: { hasImage: true },
    })
  }, [options, correctId])

  return (
    <div className="space-y-4">
      {/* Şəkil yükləmə */}
      <div>
        <label className="text-xs font-bold text-gray-700 mb-1 block uppercase tracking-wider">
          ŞƏKİL YÜKLƏ *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer block">
            <div className="text-4xl mb-2">🖼</div>
            <p className="text-sm font-bold text-gray-700">
              {mediaFile ? mediaFile.name : 'Şəkil seçin'}
            </p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG (maks. 5 MB)</p>
          </label>
        </div>
      </div>

      {/* Variantlar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500">Düzgün cavabı seçin</p>
          <button
            type="button"
            onClick={() => {
              if (options.length >= 8) return
              const nextId = String.fromCharCode(65 + options.length)
              setOptions([...options, { id: nextId, text: '' }])
            }}
            className="text-xs text-indigo-600 font-bold hover:underline"
          >
            + Variant
          </button>
        </div>

        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
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
              onChange={(e) => {
                const newOpts = [...options]
                newOpts[idx].text = e.target.value
                setOptions(newOpts)
              }}
              placeholder={`Variant ${opt.id}`}
              className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
