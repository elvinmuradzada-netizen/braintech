import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import FAQ from '@/components/landing/FAQ'
import HeroSlider from '@/components/landing/HeroSlider'
import HeaderNav from '@/components/landing/HeaderNav'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; error_description?: string }>
}) {
  const params = await searchParams

  // ═══ Supabase bərpa linki gəlibsə → /auth/callback-a yönləndir ═══
  if (params.code) {
    redirect(`/auth/callback?code=${params.code}&next=/reset-password`)
  }

  // Xəta varsa → login-ə yönləndir
  if (params.error) {
    redirect(`/login?error=${params.error}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ═══ HEADER ═══ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              BT
            </div>
            <div className="hidden md:block">
              <div className="font-bold text-gray-900 leading-tight">BRAIN</div>
              <div className="text-xs text-gray-500 leading-tight">TECH</div>
            </div>
          </Link>

          <HeaderNav />

          <Link
            href="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition shadow-sm"
          >
            Daxil ol
          </Link>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                🎓 RƏQƏMSAL TƏHSİL PLATFORMASI
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Brain<span className="text-indigo-600">Tech</span>
                <br />
                imtahan platforması
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                1-9-cu sinif şagirdləri üçün onlayn imtahanlar, canlı yarışlar,
                statistik təhlillər və fərdi inkişaf planı — hamısı bir platformada.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-indigo-600/20"
                >
                  🚀 Pulsuz başla
                </Link>
                <Link
                  href="#platformalar"
                  className="bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-xl font-semibold transition border border-gray-200"
                >
                  Daha ətraflı →
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-8">
                <div>
                  <div className="text-2xl font-bold text-gray-900">150K+</div>
                  <div className="text-xs text-gray-500">Şagird</div>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">5K+</div>
                  <div className="text-xs text-gray-500">Müəllim</div>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">300+</div>
                  <div className="text-xs text-gray-500">Məktəb</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/hero-1.jpg"
                  alt="Şagird laptop ilə"
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>

              <div className="absolute -top-4 -left-4 bg-yellow-400 rounded-2xl p-3 shadow-lg animate-bounce">
                <div className="text-2xl">🏆</div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-green-500 rounded-2xl p-3 shadow-lg">
                <div className="text-2xl">📊</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HERO SLIDER ═══ */}
      <HeroSlider />

      {/* ═══ 4 FEATURES ═══ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Nə edə bilərsiniz?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Platformamızın əsas funksiyaları
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { img: '/images/icon-1.jpg', title: 'Diaqnostik qiymətləndirmə', desc: 'Bilik səviyyəni yoxla' },
              { img: '/images/icon-2.jpg', title: 'BrainTech bilik yarışları', desc: 'Özünü yarışlarda sına' },
              { img: '/images/icon-3.jpg', title: 'Canlı imtahanlar', desc: 'Online və nəzarətli imtahanlar' },
              { img: '/images/icon-4.jpg', title: 'Statistikalarım', desc: 'Nəticələri izlə və təhlil et' },
            ].map((f, i) => (
              <div
                key={i}
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-transparent transition-all duration-300 cursor-pointer"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 group-hover:scale-110 transition-transform">
                  <Image
                    src={f.img}
                    alt={f.title}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">{f.title}</h3>
                <p className="text-xs md:text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '150 000+', label: 'Şagird', icon: '👨‍🎓' },
              { value: '5 000+', label: 'Müəllim', icon: '👨‍🏫' },
              { value: '300+', label: 'Məktəb', icon: '🏫' },
              { value: '1 000 000+', label: 'Həll edilmiş sual', icon: '✏️' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-3">{s.icon}</div>
                <div className="text-3xl md:text-4xl font-bold mb-1">{s.value}</div>
                <div className="text-sm opacity-90">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLATFORMALAR ═══ */}
      <section id="platformalar" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Platformalarımız
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Hər kəs üçün özünə uyğun panel — şagirdlər, müəllimlər və məktəb rəhbərləri üçün
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'BrainTech Şagird',
                img: '/images/sagird-1.jpg',
                color: 'green',
                features: ['Onlayn imtahanlar', 'Canlı imtahanlar', 'Fərdi inkişaf planı', 'Reytinq və statistika', 'Video izahlar'],
              },
              {
                title: 'BrainTech Müəllim',
                img: '/images/muellim-1.jpg',
                color: 'blue',
                features: ['Sinifin nəticələri', 'Nəticə analitikası', 'Tapşırıq PDF-ləri', 'Şagird inkişaf təhlili', 'Rapor və hesabatlar'],
              },
              {
                title: 'BrainTech Direktor',
                img: '/images/direktor-1.jpg',
                color: 'purple',
                features: ['Məktəb statistikası', 'Müəllim performansı', 'Şagird statistikası', 'Rayon və şəhər reytinqi', 'Strateji hesabatlar'],
              },
            ].map((p, i) => {
              const colors = {
                green: { bg: 'bg-green-50', text: 'text-green-700', btn: 'bg-green-600 hover:bg-green-700', border: 'border-green-200' },
                blue: { bg: 'bg-blue-50', text: 'text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700', border: 'border-blue-200' },
                purple: { bg: 'bg-purple-50', text: 'text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700', border: 'border-purple-200' },
              }[p.color as 'green' | 'blue' | 'purple']

              return (
                <div
                  key={i}
                  className={`${colors.bg} rounded-3xl p-6 border-2 ${colors.border} hover:shadow-xl transition-all duration-300 overflow-hidden`}
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden bg-white shadow-lg">
                      <Image
                        src={p.img}
                        alt={p.title}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 text-center ${colors.text}`}>
                    {p.title}
                  </h3>
                  <ul className="space-y-2 mb-6">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className={colors.text}>▸</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={`block text-center ${colors.btn} text-white px-4 py-2.5 rounded-xl font-medium text-sm transition`}
                  >
                    Daxil ol →
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ ONLAYN İMTAHANLAR ═══ */}
      <section id="imtahanlar" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Onlayn imtahanlarımız
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              1-ci sinifdən 9-cu sinfə qədər hər sinif üçün xüsusi imtahanlar
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-5 text-center hover:shadow-lg transition">
              <div className="flex justify-center mb-3">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white shadow">
                  <Image
                    src="/images/sagird-2.jpg"
                    alt="Məktəbəhazırlıq"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Məktəbəhazırlıq</h3>
              <p className="text-xs text-gray-500 mb-4">5-6 yaş</p>
              <Link
                href="/register"
                className="block bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg font-medium mb-2 transition"
              >
                İmtahana başla
              </Link>
            </div>

            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((grade) => (
              <div
                key={grade}
                className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-center hover:shadow-lg hover:border-indigo-200 transition"
              >
                <div className="flex justify-center mb-3">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 shadow">
                    <Image
                      src={grade <= 4 ? '/images/sagird-3.jpg' : grade <= 7 ? '/images/sagird-1.jpg' : '/images/hero-1.jpg'}
                      alt={`${grade}-ci sinif`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{grade}-ci sinif</h3>
                <p className="text-xs text-gray-500 mb-4">
                  {grade === 9 ? 'Buraxılış' : 'Ümumi'} imtahanları
                </p>
                <Link
                  href="/register"
                  className="block bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg font-medium mb-2 transition"
                >
                  İmtahana başla
                </Link>
                <Link
                  href="/login"
                  className="block text-xs text-indigo-600 hover:underline"
                >
                  İmtahanlara bax
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ XƏBƏRLƏR ═══ */}
      <section id="xeberler" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Xəbərlər
              </h2>
              <p className="text-gray-500">Təhsil, innovasiya və uğura aparan yeni xəbərlər</p>
            </div>
            <a href="#" className="hidden md:inline-flex items-center gap-2 text-indigo-600 font-medium hover:gap-3 transition-all">
              Bütün xəbərlərə bax →
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                date: '18 sentyabr 2026',
                tag: 'XƏBƏR',
                title: 'BrainTech 2026-2027-ci tədris ili Onlayn Sınaq imtahanı tarixləri',
                desc: 'BrainTech Onlayn Sınaq İmtahanlarının tarixləri açıqlandı...',
                color: 'from-yellow-400 to-orange-500',
              },
              {
                date: '09 avqust 2026',
                tag: 'XƏBƏR',
                title: 'BRAINTECH-da hansı yeniliklər olacaq?',
                desc: 'BRAINTECH yeni tədris ilində şagirdlərin biliklərini daha müasir...',
                color: 'from-blue-400 to-purple-500',
              },
              {
                date: '08 avqust 2026',
                tag: 'XƏBƏR',
                title: 'BRAINTECH DİREKTOR paneli yeniləndi!',
                desc: 'BrainTech Monitorinq və Qiymətləndirmə Mərkəzi BRAINTECH DİREKTOR panelini...',
                color: 'from-green-400 to-teal-500',
              },
            ].map((news, i) => (
              <article
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className={`h-44 bg-gradient-to-br ${news.color} flex items-center justify-center text-7xl`}>
                  📰
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3 text-xs">
                    <span className="text-gray-500">📅 {news.date}</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      {news.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition">
                    {news.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-3">{news.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <FAQ />

      {/* ═══ CTA ═══ */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bu gün başla! 🚀
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Pulsuz qeydiyyatdan keç və ilk imtahanını ver
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-xl"
          >
            Qeydiyyatdan keç →
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer id="elaqe" className="bg-gray-900 text-gray-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                  BT
                </div>
                <div>
                  <div className="font-bold text-white leading-tight">BRAIN</div>
                  <div className="text-xs leading-tight">TECH</div>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                BrainTech rəqəmsal təhsil platforması — şagirdlər, müəllimlər və məktəblər üçün.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Platforma</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition">BrainTech Şagird</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">BrainTech Müəllim</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">BrainTech Direktor</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">İmtahanlar</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Keşf et</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition">Platformalar</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Vəsaitlər</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Xəbərlər</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Haqqımızda</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Əlaqə</h4>
              <ul className="space-y-2 text-sm">
                <li>📧 info@braintech.az</li>
                <li>📞 +994 XX XXX XX XX</li>
                <li>📍 Bakı, Azərbaycan</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              © 2026 BrainTech — Bütün hüquqlar qorunur.
            </p>
            <div className="flex gap-3">
              {['📘', '📷', '▶️', '✈️'].map((icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-indigo-600 flex items-center justify-center transition">
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
