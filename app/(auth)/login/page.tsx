'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { login } from '@/lib/auth/actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
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
            Biliyin kök salıb
            <br />
            <span className="text-yellow-300">böyüdüyü</span> yer
          </h1>
          <p className="text-green-100 text-base leading-relaxed mb-8">
            Onlayn imtahanlar, canlı monitorinq və inkişaf analitikası — şagirdlər,
            müəllimlər və məktəblər üçün vahid rəqəmsal məkanda.
          </p>

          {/* Statlar */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: '👥', value: '150 000+', label: 'Şagird' },
              { icon: '🎓', value: '5 000+', label: 'Müəllim' },
              { icon: '🏫', value: '300+', label: 'Məktəb' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-start">
                <div className="w-12 h-12 rounded-full bg-green-600/50 backdrop-blur border border-green-400/30 flex items-center justify-center text-2xl mb-3">
                  {s.icon}
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs opacity-80">{s.label}</div>
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
        {/* Üst - Ana səhifə linki */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              ←
            </span>
            <span className="font-medium">Ana səhifə</span>
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
            {/* Başlıq */}
            <div className="text-center mb-8">
              <div className="inline-flex w-16 h-16 bg-green-50 rounded-2xl items-center justify-center text-3xl mb-4">
                👋
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Xoş gəldiniz!
              </h1>
              <p className="text-gray-500">
                Hesabınıza daxil olun və öyrənməyə davam edin.
              </p>
            </div>

            {/* Forma */}
            <form action={handleSubmit} className="space-y-5">
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
                    name="email"
                    required
                    placeholder="example@mail.com"
                    className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-green-500 transition"
                  />
                </div>
              </div>

              {/* Şifrə */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ŞİFRƏ *
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    Şifrəni unutdum?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔒
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
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

              {/* Yadda saxla */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Məni yadda saxla
                </label>
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
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Daxil olunur...
                  </>
                ) : (
                  <>
                    Daxil ol →
                  </>
                )}
              </button>
            </form>

            {/* Ayırıcı */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400 font-medium">VƏ YA</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Sosial */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <a
                href="#"
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-xs font-medium text-gray-700"
              >
                <span className="text-green-500">💬</span> WhatsApp
              </a>
              <a
                href="#"
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-xs font-medium text-gray-700"
              >
                <span>📸</span> Instagram
              </a>
              <a
                href="#"
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-xs font-medium text-gray-700"
              >
                <span className="text-blue-500">✈️</span> Telegram
              </a>
            </div>

            {/* Register link */}
            <div className="text-center pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Hesabınız yoxdur?{' '}
                <Link
                  href="/register"
                  className="text-green-600 hover:text-green-700 font-bold"
                >
                  Qeydiyyatdan keç →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
