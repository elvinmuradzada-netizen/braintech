import Link from 'next/link'
import Image from 'next/image'
import RegisterWizard from './RegisterWizard'

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ═══ SOL YAŞIL PANEL ═══ */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-700 via-green-700 to-emerald-800 relative overflow-hidden p-10 text-white">
        {/* Üst - Logo + Tagline */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <div className="text-green-700 font-bold text-lg">BT</div>
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">BRAIN</div>
              <div className="text-xs opacity-80 leading-tight">TECH</div>
            </div>
          </div>
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

        {/* Ağac şəkli - şəffaf PNG */}
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
            href="/login"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Daxil ol →
          </Link>
        </div>

        {/* Wizard */}
        <div className="flex-1 p-6 md:p-10">
          <div className="max-w-xl mx-auto">
            <RegisterWizard />
          </div>
        </div>
      </div>
    </div>
  )
}
