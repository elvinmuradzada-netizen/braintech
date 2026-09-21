import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  // ═══ MƏKTƏB MƏLUMATLARI ═══
  let schoolInfo: any = null
  let districtInfo: any = null
  let cityInfo: any = null

  if (profile?.school_id) {
    const { data: school } = await supabase
      .from('schools')
      .select('*, districts(name, city_id)')
      .eq('id', profile.school_id)
      .single()

    schoolInfo = school
    districtInfo = school?.districts

    if (districtInfo?.city_id) {
      const { data: city } = await supabase
        .from('cities')
        .select('*')
        .eq('id', districtInfo.city_id)
        .single()
      cityInfo = city
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard" className="text-indigo-600 hover:underline mb-4 inline-block text-sm">
        ← Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Şəxsi məlumatlar 👤</h1>
        <p className="text-gray-500 mt-1">
          Profilinizi idarə edin və məlumatlarınızı yeniləyin
        </p>
      </div>

      {/* ═══ Profil banneri ═══ */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 mb-6 text-white">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold border-4 border-white/30">
            {(profile?.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profile?.full_name || 'İstifadəçi'}</h2>
            <p className="text-sm opacity-90 mt-1">{user.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full font-medium">
                {profile?.role === 'student' && '👨‍🎓 Şagird'}
                {profile?.role === 'teacher' && '👨‍🏫 Müəllim'}
                {profile?.role === 'director' && '👨‍💼 Direktor'}
                {profile?.role === 'parent' && '👨‍👩‍👧 Valideyn'}
                {profile?.role === 'admin' && '⚙️ Admin'}
              </span>
              {profile?.grade_level && (
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full font-medium">
                  {profile.grade_level}-ci sinif
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MƏKTƏB MƏLUMATI ═══ */}
      {(cityInfo || districtInfo || schoolInfo || profile?.institution_name) && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-2xl text-white shadow-lg">
              🏫
            </div>
            <div>
              <h3 className="text-sm font-bold text-purple-700 uppercase tracking-wider">
                {profile?.role === 'director' ? 'İdarə etdiyiniz məktəb' :
                 profile?.role === 'teacher' ? 'İşlədiyiniz müəssisə' :
                 'Təhsil aldığınız məktəb'}
              </h3>
              <p className="text-xs text-purple-600">
                {profile?.role === 'director' ? 'Rəsmi məktəb məlumatları' : 'Qeydiyyat məlumatları'}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Şəhər */}
            {cityInfo && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📍</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Şəhər
                  </span>
                </div>
                <p className="font-bold text-gray-900">{cityInfo.name}</p>
              </div>
            )}

            {/* Rayon */}
            {districtInfo && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🗺️</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Rayon
                  </span>
                </div>
                <p className="font-bold text-gray-900">{districtInfo.name}</p>
              </div>
            )}

            {/* Məktəb / Müəssisə */}
            {(schoolInfo || profile?.institution_name) && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🏫</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    {schoolInfo ? 'Məktəb' : 'Müəssisə'}
                  </span>
                </div>
                <p className="font-bold text-gray-900">
                  {schoolInfo?.name || profile?.institution_name}
                </p>
              </div>
            )}
          </div>

          {/* Xəbərdarlıq */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
            <span className="text-yellow-600 text-sm">⚠️</span>
            <p className="text-xs text-yellow-800">
              Məktəb məlumatlarını dəyişmək üçün <strong>dəstək xidmətinə</strong> müraciət edin.
              Təhlükəsizlik üçün bu məlumatlar avtomatik dəyişdirilə bilməz.
            </p>
          </div>
        </div>
      )}

      {/* ═══ Form ═══ */}
      <ProfileForm
        userId={user.id}
        email={user.email || ''}
        profile={profile}
      />
    </div>
  )
}
