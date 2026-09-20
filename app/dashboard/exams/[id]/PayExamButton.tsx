'use client'

import { useState } from 'react'

export default function PayExamButton({ examId, price }: { examId: string; price: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePay() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, amount: price }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ödəniş yaradıla bilmədi')
        setLoading(false)
        return
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        setError('Ödəniş linki alına bilmədi')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Yönləndirilir...
          </>
        ) : (
          <>💳 {price.toFixed(2)} AZN ödə</>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-2">⚠️ {error}</p>
      )}
    </div>
  )
}
