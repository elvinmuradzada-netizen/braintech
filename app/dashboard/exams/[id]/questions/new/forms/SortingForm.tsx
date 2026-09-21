'use client'

import { useState, useEffect } from 'react'

export default function SortingForm({
  value,
  onChange,
}: {
  value: any
  onChange: (v: any) => void
}) {
  const [items, setItems] = useState<string[]>(
    value?.correctAnswer?.items || ['', '', '']
  )

  useEffect(() => {
    const valid = items.filter(i => i.trim())
    onChange({
      options: valid.map((text, i) => ({ id: i + 1, text })),
      correctAnswer: valid.length >= 2 ? { items: valid } : null,
      metadata: { shuffle: true },
    })
  }, [items])

  function updateItem(idx: number, val: string) {
    const newItems = [...items]
    newItems[idx] = val
    setItems(newItems)
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    const newItems = [...items]
    ;[newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]]
    setItems(newItems)
  }

  function moveDown(idx: number) {
    if (idx === items.length - 1) return
    const newItems = [...items]
    ;[newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]]
    setItems(newItems)
  }

  function addItem() {
    if (items.length >= 8) return
    setItems([...items, ''])
  }

  function removeItem(idx: number) {
    if (items.length <= 2) return
    setItems(items.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">Elementləri düzgün ardıcıllıqla düzün</p>
        <button
          type="button"
          onClick={addItem}
          disabled={items.length >= 8}
          className="text-xs text-indigo-600 font-bold hover:underline disabled:opacity-50"
        >
          + Element əlavə et
        </button>
      </div>

      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => moveUp(idx)}
              disabled={idx === 0}
              className="w-6 h-4 text-gray-400 hover:text-indigo-600 disabled:opacity-30 text-xs"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => moveDown(idx)}
              disabled={idx === items.length - 1}
              className="w-6 h-4 text-gray-400 hover:text-indigo-600 disabled:opacity-30 text-xs"
            >
              ▼
            </button>
          </div>
          <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
            {idx + 1}
          </span>
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(idx, e.target.value)}
            placeholder={`Element ${idx + 1}`}
            className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500"
          />
          {items.length > 2 && (
            <button
              type="button"
              onClick={() => removeItem(idx)}
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
