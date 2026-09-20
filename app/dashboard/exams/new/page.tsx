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
        <Link href="/dashboard" className="text-indigo-600 hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-3xl font-bold mb-2">Yeni İmtahan 📝</h1>
          <p className="text-gray-500 mb-6">İmtahan məlumatlarını doldurun</p>

          <form action={createExam} className="space-y-5">
            {/* Başlıq */}
            <div>
              <label className="block text-sm font-medium mb-1">Başlıq *</label>
              <input name="title" required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                placeholder="Riyaziyyat - Kəsrlər" />
            </div>

            {/* Təsvir */}
            <div>
              <label className="block text-sm font-medium mb-1">Təsvir</label>
              <textarea name="description" rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                placeholder="Bu imtahan haqqında qısa məlumat" />
            </div>

            {/* Fənn + Sinif */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fənn *</label>
                <select name="subject_id" required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none text-gray-900">
                  <option value="">Seçin</option>
                  {subjects?.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sinif *</label>
                <select name="grade_level" required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none text-gray-900">
                  <option value="">Seçin</option>
                  {[1,2,3,4,5,6,7,8,9].map(g => (
                    <option key={g} value={g}>{g}-ci sinif</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Müddət + Keçid balı */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Müddət (dəqiqə)</label>
                <input name="duration_minutes" type="number" defaultValue={30} min={1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Keçid balı (%)</label>
                <input name="passing_score" type="number" defaultValue={60} min={0} max={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-gray-900" />
              </div>
            </div>

            {/* İmtahan növü + Qiymət */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">İmtahan növü</label>
                <select name="is_paid" defaultValue="false"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none text-gray-900">
                  <option value="false">🆓 Pulsuz</option>
                  <option value="true">💰 Ödənişli</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Qiymət (AZN)</label>
                <input name="price" type="number" defaultValue={0} min={0} step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-gray-900"
                  placeholder="5.00" />
              </div>
            </div>

            {/* Info box */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-start gap-2">
              <span className="text-indigo-600 text-sm">💡</span>
              <p className="text-xs text-indigo-800">
                <strong>Qeyd:</strong> Ödənişli imtahan seçsəniz, şagirdlər imtahana başlamazdan əvvəl
                müəyyən etdiyiniz məbləği ödəməli olacaqlar. Pulsuz imtahanlar hamı üçün açıqdır.
              </p>
            </div>

            {/* Submit */}
            <button type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition">
              Yarat və sualları əlavə et →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
