import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createExam } from '@/lib/exams/actions'

export default async function NewExamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: subjects } = await supabase.from('subjects').select('*').order('name')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-3xl font-bold mb-2">Yeni İmtahan 📝</h1>
          <p className="text-gray-500 mb-6">İmtahan məlumatlarını doldurun</p>

          <form action={createExam} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Başlıq *</label>
              <input name="title" required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Riyaziyyat - Kəsrlər" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Təsvir</label>
              <textarea name="description" rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Bu imtahan haqqında qısa məlumat" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fənn *</label>
                <select name="subject_id" required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none">
                  <option value="">Seçin</option>
                  {subjects?.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sinif *</label>
                <select name="grade_level" required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none">
                  <option value="">Seçin</option>
                  {[1,2,3,4,5,6,7,8,9].map(g => (
                    <option key={g} value={g}>{g}-ci sinif</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Müddət (dəqiqə)</label>
                <input name="duration_minutes" type="number" defaultValue={30} min={1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Keçid balı (%)</label>
                <input name="passing_score" type="number" defaultValue={60} min={0} max={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" />
              </div>
            </div>

            <button type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">
              Yarat və sualları əlavə et →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
