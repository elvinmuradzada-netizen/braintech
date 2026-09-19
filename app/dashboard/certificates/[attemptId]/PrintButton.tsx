'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-medium text-sm"
    >
      🖨 Çap et / PDF yüklə
    </button>
  )
}
