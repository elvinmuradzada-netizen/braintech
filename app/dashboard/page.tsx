import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const isStudent = profile?.role === 'student'
  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin'

  let activeExam: any = null
  let nextExam: any = null
  let totalAttempts = 0
  let certificatesCount = 0
  let recentAttempts: any[] = []
  let chartData: { month: string; value: number }[] = []

  const { data: availableExams } = await supabase
    .from('exams')
    .select('*, subjects(name, icon)')
    .eq('is_published', true)
    .eq('grade_level', profile?.grade_level)
    .order('created_at', { ascending: false })

  const { data: inProgress } = await supabase
    .from('attempts')
    .select('*, exams(title, duration_minutes, subjects(name, icon))')
    .eq('student_id', user.id)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (inProgress) activeExam = inProgress
  if (availableExams && availableExams.length > 0) nextExam = availableExams[0]

  const { data: attempts } = await supabase
    .from('attempts')
    .select('*, exams(id, title, subjects(name, icon))')
    .eq('student_id', user.id)
    .eq('status', 'completed')
    .order('finished_at', { ascending: false })

  recentAttempts = attempts || []
  totalAttempts = recentAttempts.length
  certificatesCount = recentAttempts.filter(a => Number(a.percentage || 0) >= 70).length

  if (totalAttempts > 0) {
    const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek']
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthAttempts = recentAttempts.filter(a => {
        const ad = new Date(a.finished_at)
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear()
      })
      const avg = monthAttempts.length > 0
        ? Math.round(monthAttempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / monthAttempts.length)
        : 0
      chartData.push({ month: monthNames[d.getMonth()], value: avg })
    }
  }

  const initial = (profile?.full_name || 'U').charAt(0).toUpperCase()
  const avgScore = totalAttempts > 0
    ? Math.round(recentAttempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / totalAttempts)
    : 0

  return (
    <div className="max-w-6xl mx-auto">
      {/* ═══ PROFİL BANNER ═══ */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold border-4 border-white/30">
            {initial}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{profile?.full_name || 'Şagird'}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full font-medium">
                {profile?.grade_level ? `${profile.grade_level}-ci sinif` : profile?.role}
              </span>
              <span className="flex items-center gap-1 opacity-90">
                📍 Bakı, Azərbaycan
              </span>
            </div>
          </div>
        </div>
        <div className="absolute right-4 bottom-0 text-8xl opacity-10">🎓</div>
      </div>

      {/* ═══ 4 STAT KART ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-lg">▶️</div>
            <div className="text-xs text-gray-500 font-medium">Aktiv imtahanlarım</div>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {activeExam ? activeExam.exams?.title?.slice(0, 20) : 'Yoxdur'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">⏰</div>
            <div className="text-xs text-gray-500 font-medium">Növbəti imtahan</div>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {nextExam ? 'Tezliklə' : 'Yoxdur'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg">📝</div>
            <div className="text-xs text-gray-500 font-medium">Ümumi imtahan</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalAttempts}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-lg">🏆</div>
            <div className="text-xs text-gray-500 font-medium">Qazandığım sertifikatlar</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{certificatesCount}</div>
        </div>
      </div>

      {/* ═══ AKTİV + NÖVBƏTİ İMTAHAN ═══ */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Aktiv imtahan</h2>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              activeExam ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {activeExam ? 'Aktiv imtahan' : 'Yoxdur'}
            </span>
          </div>

          {activeExam ? (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {activeExam.exams?.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {activeExam.exams?.subjects?.icon} {activeExam.exams?.subjects?.name}
              </p>
              <Link
                href={`/dashboard/exams/${activeExam.exam_id}/take`}
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition"
              >
                Davam et →
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-6xl mb-3">📋</div>
              <h3 className="font-bold text-gray-900 mb-1">
                Aktiv imtahan olduqda burada göstəriləcək
              </h3>
              <p className="text-sm text-gray-500">
                Hazırda sizin parametrlərinizə uyğun aktiv imtahan yoxdur.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Növbəti imtahan</h2>

          {nextExam ? (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {nextExam.title}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Tarix</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {new Date(nextExam.created_at).toLocaleDateString('az-AZ')}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Vaxt</div>
                  <div className="text-sm font-semibold text-gray-900">
                    ⏱ {nextExam.duration_minutes} dəq
                  </div>
                </div>
              </div>
              <Link
                href={`/dashboard/exams/${nextExam.id}`}
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl font-medium transition"
              >
                İmtahana bax →
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-6xl mb-3">🚀</div>
              <h3 className="font-bold text-gray-900 mb-1">
                Növbəti imtahan olduqda burada göstəriləcək
              </h3>
              <p className="text-sm text-gray-500">Hazırda növbəti imtahan yoxdur.</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ BALANS + NƏTİCƏ + QRAFİK ═══ */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <h3 className="font-bold text-gray-900 mb-3">Balansım</h3>
          <div className="text-5xl mb-3">💰</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {Number(0).toFixed(2)} AZN
          </div>
          <p className="text-xs text-gray-500 mb-4">Cari balans</p>
          <div className="flex gap-2">
            <Link href="/dashboard/balance" className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded-lg font-medium transition text-center">
              Balansı artır
            </Link>
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg font-medium transition">
              Tarixçəyə bax
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <h3 className="font-bold text-gray-900 mb-3">Son nəticəm</h3>
          <div className="text-5xl mb-3">🏆</div>
          {totalAttempts > 0 ? (
            <>
              <div className="text-3xl font-bold text-indigo-600 mb-1">{avgScore}%</div>
              <p className="text-xs text-gray-500 mb-4">Orta bal</p>
            </>
          ) : (
            <p className="text-sm text-gray-500 mb-4">
              Hələ tamamlanmış imtahan yoxdur
            </p>
          )}
          <Link
            href="/dashboard/exams"
            className="block bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg font-medium transition"
          >
            İmtahanlara bax →
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">İnkişaf dinamikam</h3>
          {chartData.length > 0 && chartData.some(d => d.value > 0) ? (
            <>
              <div className="h-24 flex items-end gap-1.5 mb-3">
                {chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t"
                      style={{ height: `${Math.max(d.value * 0.9, 4)}px` }}
                    />
                    <div className="text-[10px] text-gray-400 mt-1">{d.month}</div>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/statistics"
                className="block text-center text-xs text-indigo-600 font-medium hover:underline"
              >
                Daha ətraflı statistika →
              </Link>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-gray-500">Hələ məlumat yoxdur</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ SON FƏALİYYƏTLƏR ═══ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Son fəaliyyətlər</h2>
        {recentAttempts.length > 0 ? (
          <div className="space-y-2">
            {recentAttempts.slice(0, 3).map((a) => {
              const percent = Math.round(Number(a.percentage) || 0)
              return (
                <Link
                  key={a.id}
                  href={`/dashboard/exams/${(a.exams as any)?.id}`}
                  className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-indigo-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{(a.exams as any)?.subjects?.icon || '📝'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {(a.exams as any)?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {a.finished_at
                          ? new Date(a.finished_at).toLocaleDateString('az-AZ')
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${
                    percent >= 80 ? 'text-green-600' :
                    percent >= 60 ? 'text-indigo-600' : 'text-orange-500'
                  }`}>
                    {percent}%
                  </span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-sm text-gray-400">Hələlik heç bir fəaliyyət yoxdur.</p>
          </div>
        )}
      </div>

      {/* ═══ TEZ KEÇİDLƏR ═══ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Tez keçidlər</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { icon: '📝', label: 'İmtahanlarım', href: '/dashboard/exams', color: 'green' },
            { icon: '📊', label: 'Statistikam', href: '/dashboard/statistics', color: 'blue' },
            { icon: '📋', label: 'Nəticələrim', href: '/dashboard/results', color: 'purple' },
            { icon: '📈', label: 'İnkişafım', href: '/dashboard/progress', color: 'orange' },
            { icon: '🎓', label: 'Sertifikatlarım', href: '/dashboard/certificates', color: 'indigo' },
            { icon: '⚙️', label: 'Məlumatlarım', href: '/dashboard/profile', color: 'pink' },
          ].map((item) => {
            const colors: Record<string, string> = {
              green: 'bg-green-50 text-green-600',
              blue: 'bg-blue-50 text-blue-600',
              purple: 'bg-purple-50 text-purple-600',
              orange: 'bg-orange-50 text-orange-600',
              indigo: 'bg-indigo-50 text-indigo-600',
              pink: 'bg-pink-50 text-pink-600',
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition border border-gray-100"
              >
                <div className={`w-12 h-12 rounded-xl ${colors[item.color]} flex items-center justify-center text-xl`}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ═══ BANNER ═══ */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold opacity-80 mb-1">BRAINTECH TÖVSİYƏSİ</p>
            <p className="text-lg font-bold mb-2 leading-tight">
              "Müvəffəqiyyət kiçik addımların böyük nəticəsidir."
            </p>
            <p className="text-xs opacity-80">
              Bugün 15 dəqiqə əlavə öyrənməyə başla!
            </p>
          </div>
          <div className="text-6xl opacity-70">💡</div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-indigo-50 rounded-2xl p-6 border border-green-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-green-700 mb-1">PLATFORMA XƏBƏRLƏRİ</p>
            <p className="text-sm font-bold text-gray-900 mb-1">Yeni funksiyalar əlavə olundu!</p>
            <p className="text-xs text-gray-600 mb-3">
              İmtahan hazırlığı prosesini daha da asanlaşdıracaq yeniliklər artıq aktivdir.
            </p>
            <Link
              href="/#xeberler"
              className="inline-block text-xs bg-white text-green-700 font-semibold px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-50 transition"
            >
              Yenilikləri kəşf et →
            </Link>
          </div>
          <div className="text-6xl">🎁</div>
        </div>
      </div>
    </div>
  )
}
