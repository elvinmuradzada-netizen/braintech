import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/auth/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Salam, {profile?.full_name || user.email}! 👋
              </h1>
              <p className="text-gray-500 mt-2">
                Rol: <span className="font-semibold text-blue-600">{profile?.role}</span>
                {profile?.grade_level && (
                  <> • Sinif: <span className="font-semibold">{profile.grade_level}</span></>
                )}
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Çıxış
              </button>
            </form>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-6 rounded-xl">
              <p className="text-sm text-blue-600 font-medium">İmtahanlar</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">0</p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl">
              <p className="text-sm text-green-600 font-medium">Nəticələr</p>
              <p className="text-3xl font-bold text-green-900 mt-2">0</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl">
              <p className="text-sm text-purple-600 font-medium">Orta bal</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">—</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
