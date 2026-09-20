'use client'

import { useState } from 'react'

const PRESET_AMOUNTS = [10, 5, 4, 3, 2, 1]

export default function BalanceForm({ balance = 0 }: { balance?: number }) {
  const [selectedAmount, setSelectedAmount] = useState<number>(10)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const finalAmount = customAmount
    ? Math.max(0, Number(customAmount) || 0)
    : selectedAmount

  function handlePresetClick(amount: number) {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCustomAmount(e.target.value)
  }

  async function handlePayment() {
    if (finalAmount <= 0) {
      alert('Zəhmət olmasa məbləğ seçin')
      return
    }
    if (finalAmount < 1) {
      alert('Minimum məbləğ 1 AZN-dir')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert('Xəta: ' + (data.error || 'Ödəniş yaradıla bilmədi'))
        setLoading(false)
        return
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        alert('Ödəniş linki alına bilmədi')
        setLoading(false)
      }
    } catch (err: any) {
      alert('Şəbəkə xətası: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Başlıq */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <span className="text-xl">💰</span>
            Balans əməliyyatları
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Balansı artırın və yalnız uğurlu ödənişlərinizi tarixçədə izləyin.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-1">
            <span>➕</span>
            Balans artır
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition">
            Tarixçə
          </button>
        </div>
      </div>

      {/* Məbləğ seç */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-sm">
            💲
          </div>
          <h3 className="font-bold text-gray-900">Məbləği seçin</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {PRESET_AMOUNTS.map((amount) => {
            const isSelected = selectedAmount === amount && !customAmount
            return (
              <button
                key={amount}
                onClick={() => handlePresetClick(amount)}
                className={`relative p-4 rounded-xl border-2 transition text-left ${
                  isSelected
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                    isSelected ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isSelected ? '✓' : '$'}
                  </div>
                  <span className="font-bold text-gray-900">{amount} AZN</span>
                </div>
                <div className="text-xs text-gray-500">Balansı artır</div>
              </button>
            )
          })}
        </div>

        {/* Fərdi məbləğ */}
        <div className="mt-3">
          <label className="text-xs text-gray-500 font-medium mb-1 block">
            Fərqli məbləğ (AZN)
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={customAmount}
            onChange={handleCustomChange}
            placeholder="Məsələn: 25"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-900"
          />
        </div>
      </div>

      {/* Xülasə */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs">💰</span>
            <span className="text-xs text-gray-500 font-medium">Seçilən məbləğ</span>
          </div>
          <div className="font-bold text-gray-900">{finalAmount.toFixed(2)} AZN</div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs">💳</span>
            <span className="text-xs text-gray-500 font-medium">Ödəniş sistemi</span>
          </div>
          <div className="font-bold text-gray-900">Payriff</div>
        </div>

        <div className="bg-green-50 rounded-xl p-3 border border-green-200">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs">✓</span>
            <span className="text-xs text-green-700 font-medium">Ödəniləcək məbləğ</span>
          </div>
          <div className="font-bold text-green-700">{finalAmount.toFixed(2)} AZN</div>
        </div>
      </div>

      {/* Info mesaj */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex items-start gap-2">
        <span className="text-orange-500 text-sm mt-0.5">⚠️</span>
        <p className="text-xs text-orange-800">
          Ödəniş tamamlandıqdan sonra məbləğ avtomatik olaraq balansınıza əlavə olunacaq.
        </p>
      </div>

      {/* Ödəniş et */}
      <div className="flex justify-end">
        <button
          onClick={handlePayment}
          disabled={loading || finalAmount <= 0}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Yönləndirilir...
            </>
          ) : (
            <>
              Ödəniş et →
            </>
          )}
        </button>
      </div>
    </div>
  )
}
