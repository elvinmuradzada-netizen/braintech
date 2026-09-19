import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: attempts } = await supabase
    .from('attempts')
    .select('student_id, percentage, profiles:student_id(full_name, grade_level)')
    .eq('status', 'completed')

  const studentMap: Record<string, {
    id: string
    name: string
    grade: number
    sum: number
    count: number
    best: number
  }> = {}

  ;(attempts || []).forEach((a: any) => {
    const studentId = a.student_id
    const prof = a.profiles
    if (!prof) return

    if (!studentMap[studentId]) {
      studentMap[studentId] = {
        id: studentId,
        name: prof.full_name || 'Anonim',
        grade: prof.grade_level,
        sum: 0,
        count: 0,
        best: 0,
      }
    }
    const percent = Number(a.percentage || 0)
    studentMap[studentId].count++
    studentMap[studentId].sum += percent
    if (percent > studentMap[studentId].best) {
      studentMap[studentId].best = percent
    }
  })

  const rankings = Object.values(studentMap).map(s => ({
    ...s,
    avg: Math.round(s.sum / s.count),
  })).sort((a, b) => b.avg - a.avg || b.count - a.count)

  const myRank = rankings.findIndex(r => r.id === user.id) + 1
  const myStats = rankings.find(r => r.id === user.id)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-indigo-600 hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Reytinq 🏆</h1>
          <p className="text-gray-500 mt-1">
            Platformada ən yaxşı nəticə göstərən şagirdlər
          </p>
        </div>

        {myStats && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Sizin yeriniz</p>
                <p className="text-4xl font-bold mt-1">
                  #{myRank}
                  <span className="text-lg opacity-70 ml-2">/ {rankings.length}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Orta bal</p>
                <p className="text-3xl font-bold mt-1">{myStats.avg}%</p>
                <p className="text-xs opacity-75 mt-1">{myStats.count} imtahan</p>
              </div>
            </div>
          </div>
        )}

        {rankings.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-6 items-end">
            {[1, 0, 2].map((idx) => {
              const student = rankings[idx]
              if (!student) return null
              const place = idx + 1
              const style = {
                1: { bg: 'bg-gradient-to-b from-yellow-300 to-yellow-500', text: 'text-yellow-900', h: 'h-40', emoji: '🥇' },
                2: { bg: 'bg-gradient-to-b from-gray-200 to-gray-400', text: 'text-gray-700', h: 'h-32', emoji: '🥈' },
                3: { bg: 'bg-gradient-to-b from-orange-300 to-orange-500', text: 'text-orange-900', h: 'h-28', emoji: '🥉' },
              }[place as 1 | 2 | 3]

              return (
                <div key={student.id} className="flex flex-col items-center">
                  <div className="text-4xl mb-2">{style.emoji}</div>
                  <div className={`w-full ${style.bg} rounded-t-2xl p-4 flex flex-col items-center justify-end ${style.h} shadow-lg`}>
                    <p className={`font-bold text-sm truncate w-full text-center ${style.text}`}>
                      {student.name}
                    </p>
                    <p className={`text-xs ${style.text} opacity-75`}>
                      {student.grade}-ci sinif
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${style.text}`}>
                      {student.avg}%
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {rankings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <p className="text-5xl mb-4">🏆</p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Hələ reytinq yoxdur</h2>
            <p className="text-gray-500">İlk imtahan verən şagird reytinqdə görünəcək</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Bütün iştirakçılar ({rankings.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase w-16">#</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Şagird</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Sinif</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">İmtahan</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Ən yüksək</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Orta bal</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((student, idx) => {
                    const isMe = student.id === user.id
                    const place = idx + 1
                    const emoji = place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : null
                    return (
                      <tr
                        key={student.id}
                        className={`border-b border-gray-50 ${
                          isMe ? 'bg-indigo-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-700">{place}</span>
                            {emoji && <span className="text-lg">{emoji}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isMe ? 'text-indigo-700' : 'text-gray-900'}`}>
                              {student.name}
                            </span>
                            {isMe && (
                              <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                                Siz
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.grade}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.count}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {Math.round(student.best)}%
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${
                            student.avg >= 80 ? 'text-green-600' :
                            student.avg >= 60 ? 'text-indigo-600' : 'text-orange-500'
                          }`}>
                            {student.avg}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
