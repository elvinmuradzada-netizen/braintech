'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { publishExam } from '@/lib/exams/actions'

export default function PublishButton({ examId }: { examId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!confirm('İmtahanı yayımlamaq istədiyinizə əminsiniz?')) return
    setLoading(true)
    const result = await publishExam(examId)
    setLoading(false)
    if (result?.error) {
      alert('Xəta: ' + result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <button onClick={handleClick} disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50">
      {loading ? 'Yayımlanır...' : '✓ Yayımla'}
    </button>
  )
}
