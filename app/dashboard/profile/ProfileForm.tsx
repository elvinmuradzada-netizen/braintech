'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProfileForm({
  userId,
  email,
  profile,
}: {
  userId: string
  email: string
  profile: any
}) {
  const router = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info')

  // Şəxsi məlumatlar
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [gradeLevel, setGradeLevel] = useState(profile?.grade_level?.toString() || '')
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoMessage, setInfoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Şifrə
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPass, setSavingPass] = useState(false)
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault()
    setSavingInfo(true)
    setInfoMessage(null)

    const updates: any = { full_name: fullName }
    if (profile?.role === 'student' && gradeLevel) {
      updates.grade_level = parseInt(gradeLevel)
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    setSavingInfo(false)

    if (error) {
      setInfoMessage({ type: 'error', text: error.message })
    } else {
      setInfoMessage({ type: 'success', text: '✓ Məlumatlar yeniləndi' })
      router.refresh()
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setSavingPass(true)
    setPassMessage(null)

    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'Şifrələr uyğun deyil' })
      setSavingPass(false)
      return
    }

    if (newPassword.length < 6) {
      setPassMessage({ type: 'error', text: 'Şifrə minimum 6 simvol olmalıdır' })
      setSavingPass(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    setSavingPass(false)

    if (error) {
      setPassMessage({ type: 'error', text: error.message })
    } else {
      setPassMessage({ type: 'success', text: '✓ Şifrə dəyişdirildi' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tablar */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition ${
            activeTab === 'info'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          👤 Şəxsi məlumatlar
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition ${
            activeTab === 'password'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          🔒 Şifrə dəyiş
        </button>
      </div>

      <div className="p-6 md:p-8">
        {/* ═══ TAB 1: Şəxsi məlumatlar ═══ */}
        {activeTab === 'info' && (
          <form onSubmit={saveInfo} className="space-y-5 max-w-xl">
            {/* Ad Soyad */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                AD VƏ SOYAD *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Email (dəyişmək olmur) */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                E-POÇT
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50 outline-none cursor-not-allowed"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                E-poçt dəyişdirilə bilməz
              </p>
            </div>

            {/* Sinif (yalnız şagird) */}
            {profile?.role === 'student' && (
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                  SİNİF
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white outline-none focus:border-indigo-500 transition"
                >
                  <option value="">Sinif seç</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => (
                    <option key={g} value={g}>{g}-ci sinif</option>
                  ))}
                </select>
              </div>
            )}

            {/* Rol (dəyişmək olmur) */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                ROL
              </label>
              <input
                type="text"
                value={
                  profile?.role === 'student' ? '👨‍🎓 Şagird' :
                  profile?.role === 'teacher' ? '👨‍🏫 Müəllim' :
                  profile?.role === 'director' ? '👨‍💼 Direktor' :
                  profile?.role === 'parent' ? '👨‍👩‍👧 Valideyn' : 'Admin'
                }
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50 outline-none cursor-not-allowed"
              />
            </div>

            {infoMessage && (
              <div className={`px-4 py-3 rounded-lg text-sm ${
                infoMessage.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {infoMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={savingInfo}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {savingInfo ? 'Yadda saxlanılır...' : '💾 Yadda saxla'}
            </button>
          </form>
        )}

        {/* ═══ TAB 2: Şifrə dəyiş ═══ */}
        {activeTab === 'password' && (
          <form onSubmit={changePassword} className="space-y-5 max-w-xl">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2 mb-4">
              <span className="text-yellow-600">⚠️</span>
              <p className="text-xs text-yellow-800">
                Şifrənizi dəyişdikdən sonra bütün cihazlardan yenidən daxil olmalısınız.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                CARİ ŞİFRƏ
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                YENİ ŞİFRƏ *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500 transition"
              />
              <p className="text-[10px] text-gray-400 mt-1">Minimum 6 simvol</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                YENİ ŞİFRƏNİ TƏSDİQLƏ *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500 transition"
              />
            </div>

            {newPassword && confirmPassword && (
              <p className={`text-xs flex items-center gap-1 ${
                newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'
              }`}>
                {newPassword === confirmPassword ? '✓' : '✗'} Şifrələr uyğundur
              </p>
            )}

            {passMessage && (
              <div className={`px-4 py-3 rounded-lg text-sm ${
                passMessage.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {passMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={savingPass || !newPassword || !confirmPassword}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {savingPass ? 'Dəyişdirilir...' : '🔒 Şifrəni dəyişdir'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
