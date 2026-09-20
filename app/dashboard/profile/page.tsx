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

      {/* ═══ Form ═══ */}
      <ProfileForm
        userId={user.id}
        email={user.email || ''}
        profile={profile}
      />
    </div>
  )
}
