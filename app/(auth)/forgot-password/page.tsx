'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { resetPassword } from '@/lib/auth/actions'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData()
    fd.set('email', email)

    const result = await resetPassword(fd)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ═══ SOL YAŞIL PANEL ═══ */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-700 via-green-700 to-emerald-800 relative overflow-hidden p-10 text-white">
        {/* Üst - Logo + Tagline */}
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

        {/* Orta - Başlıq */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
            Hesabınıza
            <br />
            <span className="text-yellow-300">bərpa</span> edin
          </h1>
          <p className="text-green-100 text-base leading-relaxed mb-8">
            E-poçt ünvanınızı daxil edin və şifrə bərpası üçün link alacaqsınız.
            Təhlükəsizlik bizim prioritetimizdir.
          </p>

          {/* Xüsusiyyətlər */}
          <div className="space-y-3">
            {[
              { icon: '🔒', text: 'Təhlükəsiz e-poçt bərpası' },
              { icon: '⚡', text: 'Sürətli cavab — 2 dəqiqə ərzində' },
              { icon: '💬', text: '24/7 dəstək xidməti' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-600/40 backdrop-blur border border-green-400/30 flex items-center justify-center text-lg">
                  {item.icon}
                </div>
                <span className="text-sm text-green-100">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ağac şəkli */}
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

        {/* Alt - Dekorativ nöqtələr */}
        <div className="absolute bottom-6 left-6 grid grid-cols-6 gap-2 opacity-20 z-10">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-white"></div>
          ))}
        </div>
      </div>

      {/* ═══ SAĞ AĞ PANEL ═══ */}
      <div className="flex flex-col bg-white overflow-y-auto">
        {/* Üst - Geri linki */}
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
          <Link
            href="/register"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Qeydiyyatdan keç →
          </Link>
        </div>

        {/* Forma */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <div className="max-w-md w-full">
            {success ? (
              /* ═══ UĞURLU VƏZİYYƏT ═══ */
              <div className="text-center">
                <div className="inline-flex w-20 h-20 bg-green-100 rounded-full items-center justify-center text-4xl mb-6">
                  📧
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  E-poçtunuzu yoxlayın!
                </h1>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  <strong className="text-gray-900">{email}</strong> ünvanına şifrə bərpası
                  linki göndərdik. Link <strong>15 dəqiqə</strong> ərzində etibarlıdır.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm text-blue-800 mb-2 font-semibold">
                    📬 E-poçtu görmürsünüzsə:
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                    <li>Spam / Promosyonlar qovluğunu yoxlayın</li>
                    <li>E-poçt ünvanını düzgün yazdığınızdan əmin olun</li>
                    <li>2-3 dəqiqə gözləyin</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setSuccess(false)
                      setEmail('')
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition"
                  >
                    🔄 Yenidən cəhd et
                  </button>
                  <Link
                    href="/login"
                    className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition"
                  >
                    ← Daxil ol səhifəsinə qayıt
                  </Link>
                </div>
              </div>
            ) : (
              /* ═══ FORMA ═══ */
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex w-16 h-16 bg-green-50 rounded-2xl items-center justify-center text-3xl mb-4">
                    🔐
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Şifrəni unutdunuz?
                  </h1>
                  <p className="text-gray-500">
                    E-poçtunuzu daxil edin, bərpa linkini göndərək.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                      E-POÇT *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        ✉️
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="example@mail.com"
                        className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-green-500 transition"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Qeydiyyat zamanı istifadə etdiyiniz e-poçt ünvanını daxil edin
                    </p>
                  </div>

                  {/* Xəta */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Düymə */}
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Göndərilir...
                      </>
                    ) : (
                      <>
                        📧 Bərpa linkini göndər
                      </>
                    )}
                  </button>
                </form>

                {/* Info box */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-lg">💡</span>
                    <div>
                      <p className="text-sm font-semibold text-green-800 mb-1">
                        Şifrə bərpası necə işləyir?
                      </p>
                      <p className="text-xs text-green-700 leading-relaxed">
                        E-poçtunuza xüsusi link göndəriləcək. Həmin linkə basaraq
                        yeni şifrə təyin edə biləcəksiniz. Link 15 dəqiqə ərzində
                        etibarlıdır.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-6 mt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Şifrənizi xatırladınız?{' '}
                    <Link
                      href="/login"
                      className="text-green-600 hover:text-green-700 font-bold"
                    >
                      Daxil ol →
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
