'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validSession, setValidSession] = useState<boolean | null>(null)

  useEffect(() => {
    // Supabase avtomatik sessiyanı bərpa edir (hash-dən)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidSession(!!session)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Şifrələr uyğun deyil')
      return
    }
    if (password.length < 6) {
      setError('Şifrə minimum 6 simvol olmalıdır')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  if (validSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Yüklənir...</p>
        </div>
      </div>
    )
  }

  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Etibarsız link
          </h1>
          <p className="text-gray-500 mb-6">
            Bu link etibarsız və ya vaxtı bitmişdir. Yenidən şifrə bərpası üçün
            müraciət edin.
          </p>
          <Link
            href="/forgot-password"
            className="block bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition"
          >
            ← Yenidən cəhd et
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* SOL PANEL */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-700 via-green-700 to-emerald-800 relative overflow-hidden p-10 text-white">
        <div className="flex items-center gap-4 relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <div className="text-green-700 font-bold text-lg">BT</div>
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">BRAIN</div>
              <div className="text-xs opacity-80 leading-tight">TECH</div>
            </div>
          </Link>
          <div className="bg-green-600/40 backdrop-blur border border-green-400/30 rounded-full px-4 py-2 text-sm font-medium">
            Təməlində <span className="text-yellow-300 font-bold">sevg</span> var! 💚
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
            Yeni şifrə
            <br />
            <span className="text-yellow-300">təyin</span> edin
          </h1>
          <p className="text-green-100 text-base leading-relaxed">
            Hesabınızın təhlükəsizliyi üçün güclü şifrə seçin.
            Minimum 6 simvol, böyük-kiçik hərf və rəqəmlərdən istifadə edin.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 w-[520px] h-[520px] pointer-events-none">
          <Image
            src="/images/register-tree.png"
            alt="Bilik ağacı"
            width={650}
            height={650}
            className="object-contain"
            priority
          />
        </div>

        <div className="absolute bottom-6 left-6 grid grid-cols-6 gap-2 opacity-20 z-10">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-white"></div>
          ))}
        </div>
      </div>

      {/* SAĞ PANEL */}
      <div className="flex flex-col bg-white overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              ←
            </span>
            <span className="font-medium">Daxil ol</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <div className="max-w-md w-full">
            {success ? (
              <div className="text-center">
                <div className="inline-flex w-20 h-20 bg-green-100 rounded-full items-center justify-center text-4xl mb-6">
                  ✅
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  Uğurlu!
                </h1>
                <p className="text-gray-600 mb-6">
                  Şifrəniz uğurla yeniləndi. Dashboard-a yönləndirilirsiniz...
                </p>
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex w-16 h-16 bg-green-50 rounded-2xl items-center justify-center text-3xl mb-4">
                    🔑
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Yeni şifrə təyin edin
                  </h1>
                  <p className="text-gray-500">
                    Təhlükəsiz şifrə seçin və təsdiqləyin
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                      YENİ ŞİFRƏ *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        🔒
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-green-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                      ŞİFRƏNİ TƏSDİQLƏ *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        🔒
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-green-500 transition"
                      />
                    </div>
                  </div>

                  {/* Şifrə gücü */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => {
                          const strength = password.length >= 6 ? Math.min(4, Math.floor(password.length / 3)) : 0
                          return (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition ${
                                i <= strength
                                  ? strength <= 1 ? 'bg-red-500' :
                                    strength === 2 ? 'bg-orange-500' :
                                    strength === 3 ? 'bg-yellow-500' : 'bg-green-500'
                                  : 'bg-gray-200'
                              }`}
                            />
                          )
                        })}
                      </div>
                      <p className="text-xs text-gray-500">
                        {password.length < 6 ? 'Şifrə çox qısadır' :
                         password.length < 9 ? 'Zəif şifrə' :
                         password.length < 12 ? 'Orta şifrə' : 'Güclü şifrə'}
                      </p>
                    </div>
                  )}

                  {confirm && password !== confirm && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      ✗ Şifrələr uyğun deyil
                    </p>
                  )}
                  {confirm && password === confirm && password.length >= 6 && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      ✓ Şifrələr uyğundur
                    </p>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !password || !confirm}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Yenilənir...
                      </>
                    ) : (
                      <>🔑 Şifrəni yenilə</>
                    )}
                  </button>
                </form>

                <div className="text-center pt-6 mt-6 border-t border-gray-100">
                  <Link
                    href="/login"
                    className="text-sm text-green-600 hover:text-green-700 font-bold"
                  >
                    ← Daxil ol səhifəsinə qayıt
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
