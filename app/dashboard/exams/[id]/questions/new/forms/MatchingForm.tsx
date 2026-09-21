'use client'

import { useState, useEffect } from 'react'

export default function MatchingForm({
  value,
  onChange,
}: {
  value: any
  onChange: (v: any) => void
}) {
  const [pairs, setPairs] = useState<{ left: string; right: string }[]>(
    value?.correctAnswer?.pairs || [
      { left: '', right: '' },
      { left: '', right: '' },
    ]
  )

  useEffect(() => {
    const valid = pairs.filter(p => p.left.trim() && p.right.trim())
    onChange({
      options: valid.map(p => ({ left: p.left, right: p.right })),
      correctAnswer: valid.length > 0 ? { pairs: valid } : null,
      metadata: { shuffleRight: true },
    })
  }, [pairs])

  function updatePair(idx: number, side: 'left' | 'right', val: string) {
    const newPairs = [...pairs]
    newPairs[idx][side] = val
    setPairs(newPairs)
  }

  function addPair() {
    if (pairs.length >= 8) return
    setPairs([...pairs, { left: '', right: '' }])
  }

  function removePair(idx: number) {
    if (pairs.length <= 2) return
    setPairs(pairs.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">Cütləri uyğunlaşdırın</p>
        <button
          type="button"
          onClick={addPair}
          disabled={pairs.length >= 8}
          className="text-xs text-indigo-600 font-bold hover:underline disabled:opacity-50"
        >
          + Cüt əlavə et
        </button>
      </div>

      {pairs.map((pair, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            type="text"
            value={pair.left}
            onChange={(e) => updatePair(idx, 'left', e.target.value)}
            placeholder="Sol tərəf"
            className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500"
          />
          <span className="text-gray-400 font-bold flex-shrink-0">⇄</span>
          <input
            type="text"
            value={pair.right}
            onChange={(e) => updatePair(idx, 'right', e.target.value)}
            placeholder="Sağ tərəf"
            className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500"
          />
          {pairs.length > 2 && (
            <button
              type="button"
              onClick={() => removePair(idx)}
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
