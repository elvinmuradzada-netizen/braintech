import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role !== 'director' && profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Bütün şagirdlər (rayon məlumatı üçün)
  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name, grade_level, district_id, city_id')
    .eq('role', 'student')

  // Rayonlar və şəhərlər
  const { data: districts } = await supabase.from('districts').select('*')
  const { data: cities } = await supabase.from('cities').select('*')

  // Bütün cəhdlər
  const { data: attempts } = await supabase
    .from('attempts')
    .select('student_id, percentage')
    .eq('status', 'completed')

  // Rayon üzrə statistika
  const districtStats: Record<string, {
    id: number
    name: string
    city: string
    sum: number
    count: number
    students: Set<string>
  }> = {}

  // Hər şagirdin rayonunu tap
  const studentDistrict: Record<string, number> = {}
  students?.forEach(s => {
    if (s.district_id) {
      studentDistrict[s.id] = s.district_id
    }
  })

  // Cəhdləri rayonlara böl
  attempts?.forEach(a => {
    const districtId = studentDistrict[a.student_id]
    if (!districtId) return

    const district = districts?.find(d => d.id === districtId)
    if (!district) return

    const city = cities?.find(c => c.id === district.city_id)
    const key = String(districtId)

    if (!districtStats[key]) {
      districtStats[key] = {
        id: districtId,
        name: district.name,
        city: city?.name || '—',
        sum: 0,
        count: 0,
        students: new Set(),
      }
    }

    districtStats[key].sum += Number(a.percentage || 0)
    districtStats[key].count++
    districtStats[key].students.add(a.student_id)
  })

  // Orta bal + sırala
  const ranked = Object.values(districtStats)
    .map(d => ({
      id: d.id,
      name: d.name,
      city: d.city,
      avg: Math.round(d.sum / d.count),
      count: d.count,
      students: d.students.size,
    }))
    .sort((a, b) => b.avg - a.avg)

  // Şagird sayı
  const totalStudentsPerDistrict: Record<number, number> = {}
  students?.forEach(s => {
    if (s.district_id) {
      totalStudentsPerDistrict[s.district_id] = (totalStudentsPerDistrict[s.district_id] || 0) + 1
    }
  })

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/dashboard" className="text-purple-600 hover:underline mb-4 inline-block text-sm">
        ← Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🏆 Rayon reytinqi</h1>
        <p className="text-gray-500 mt-1">Rayonlar üzrə orta bal göstəriciləri</p>
      </div>

      {ranked.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-5xl mb-4">📊</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Hələ məlumat yoxdur</h2>
          <p className="text-gray-500">Şagirdlər imtahan verməyə başladıqda reytinq görünəcək</p>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {ranked.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 mb-6 items-end">
              {[1, 0, 2].map((idx) => {
                const district = ranked[idx]
                if (!district) return null
                const place = idx + 1
                const style = {
                  1: { bg: 'bg-gradient-to-b from-yellow-300 to-yellow-500', text: 'text-yellow-900', h: 'h-40', emoji: '🥇' },
                  2: { bg: 'bg-gradient-to-b from-gray-200 to-gray-400', text: 'text-gray-700', h: 'h-32', emoji: '🥈' },
                  3: { bg: 'bg-gradient-to-b from-orange-300 to-orange-500', text: 'text-orange-900', h: 'h-28', emoji: '🥉' },
                }[place as 1 | 2 | 3]

                return (
                  <div key={district.id} className="flex flex-col items-center">
                    <div className="text-4xl mb-2">{style.emoji}</div>
                    <div className={`w-full ${style.bg} rounded-t-2xl p-4 flex flex-col items-center justify-end ${style.h} shadow-lg`}>
                      <p className={`font-bold text-sm text-center ${style.text}`}>
                        {district.name}
                      </p>
                      <p className={`text-xs ${style.text} opacity-75`}>
                        {district.city}
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${style.text}`}>
                        {district.avg}%
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Cədvəl */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Bütün rayonlar ({ranked.length})</h2>
            </div>

            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">#</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Rayon</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Şəhər</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Şagirdlər</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Cəhdlər</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Orta bal</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((d, i) => (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-700">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{d.city}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{totalStudentsPerDistrict[d.id] || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{d.count}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${
                          d.avg >= 80 ? 'text-green-600' :
                          d.avg >= 60 ? 'text-purple-600' : 'text-orange-500'
                        }`}>{d.avg}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobil */}
            <div className="md:hidden divide-y divide-gray-100">
              {ranked.map((d, i) => (
                <div key={d.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-500">{d.city}</p>
                    </div>
                    <span className={`font-bold ${
                      d.avg >= 80 ? 'text-green-600' :
                      d.avg >= 60 ? 'text-purple-600' : 'text-orange-500'
                    }`}>{d.avg}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Şagirdlər</div>
                      <div className="font-bold">{totalStudentsPerDistrict[d.id] || 0}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Cəhdlər</div>
                      <div className="font-bold">{d.count}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
