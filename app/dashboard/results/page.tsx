import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ResultsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: attempts } = await supabase
    .from('attempts')
    .select('*, exams(id, title, subjects(name, icon), passing_score)')
    .eq('student_id', user.id)
    .eq('status', 'completed')
    .order('finished_at', { ascending: false })

  const results = attempts || []
  const total = results.length
  const passed = results.filter(r => Number(r.percentage) >= 60).length
  const avg = total > 0
    ? Math.round(results.reduce((s, r) => s + Number(r.percentage || 0), 0) / total)
    : 0

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/dashboard" className="text-indigo-600 hover:underline mb-4 inline-block text-sm">
        ← Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">İmtahan nəticələrim 📋</h1>
        <p className="text-gray-500 mt-1">
          Bütün imtahan cəhdlərinizin nəticələri
        </p>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <p className="text-5xl mb-4">📋</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Hələ nəticə yoxdur</h2>
          <p className="text-gray-500 mb-6">İlk imtahanını ver və nəticələr burada görünsün</p>
          <Link
            href="/dashboard/exams"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            İmtahanlara bax →
          </Link>
        </div>
      ) : (
        <>
          {/* 3 stat kart */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Ümumi imtahan</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Keçdi</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{passed}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Orta bal</p>
              <p className="text-3xl font-bold text-indigo-600 mt-1">{avg}%</p>
            </div>
          </div>

          {/* Cədvəl */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Bütün nəticələr</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">#</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">İmtahan</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Fənn</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Bal</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Faiz</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Tarix</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Nəticə</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => {
                    const percent = Math.round(Number(r.percentage) || 0)
                    const isPassed = percent >= 60
                    return (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {(r.exams as any)?.title || 'İmtahan'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {(r.exams as any)?.subjects?.icon}{' '}
                          {(r.exams as any)?.subjects?.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {r.score}/{r.max_score}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${
                            percent >= 80 ? 'text-green-600' :
                            percent >= 60 ? 'text-indigo-600' : 'text-orange-500'
                          }`}>
                            {percent}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {r.finished_at
                            ? new Date(r.finished_at).toLocaleDateString('az-AZ')
                            : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            isPassed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {isPassed ? '✓ Keçdi' : '✗ Kəsildi'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
