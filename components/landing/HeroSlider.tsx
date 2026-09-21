'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Slide = {
  id: number
  badge: string
  title: string
  description: string
  cta: string
  ctaLink: string
  image: string
  bgFrom: string
  bgTo: string
  emoji: string
}

const slides: Slide[] = [
  {
    id: 1,
    badge: '👨‍🏫 MÜƏLLİM PANELİ',
    title: 'Müəllim üçün güclü idarəetmə',
    description: 'Siniflərini idarə et, imtahan yarat, nəticələri analiz et və hesabatlar hazırla.',
    cta: 'Müəllim kimi qoşul',
    ctaLink: '/register',
    image: '/images/muellim-1.jpg',
    bgFrom: 'from-blue-600',
    bgTo: 'to-indigo-700',
    emoji: '👨‍🏫',
  },
  {
    id: 2,
    badge: '👨‍💼 DİREKTOR PANELİ',
    title: 'Məktəb üçün strateji analitika',
    description: 'Məktəb statistikası, müəllim performansı və rayon reytinqi — hamısı bir panelda.',
    cta: 'Direktor kimi qoşul',
    ctaLink: '/register',
    image: '/images/direktor-1.jpg',
    bgFrom: 'from-purple-600',
    bgTo: 'to-indigo-700',
    emoji: '👨‍💼',
  },
  {
    id: 3,
    badge: '🎓 ŞAGİRD PANELİ',
    title: 'Şagird üçün onlayn imtahan',
    description: 'İmtahanlara qatıl, nəticələrini izlə, sertifikat qazan və digər şagirdlərlə yarış.',
    cta: 'Pulsuz başla',
    ctaLink: '/register',
    image: '/images/sagird-1.jpg',
    bgFrom: 'from-green-600',
    bgTo: 'to-emerald-700',
    emoji: '🎓',
  },
  {
    id: 4,
    badge: '🎁 XÜSUSİ TƏKLİF',
    title: 'İlk imtahan tam pulsuz!',
    description: 'Yeni istifadəçilər üçün ilk imtahan tamamilə pulsuzdur. Qeydiyyatdan keç və dərhal başla!',
    cta: 'Qeydiyyatdan keç',
    ctaLink: '/register',
    image: '/images/icon-2.jpg',
    bgFrom: 'from-orange-500',
    bgTo: 'to-red-600',
    emoji: '🎁',
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const AUTOPLAY_MS = 10000 // 10 saniyə

  useEffect(() => {
    if (isPaused) return
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, AUTOPLAY_MS)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [current, isPaused])

  function goTo(index: number) {
    setCurrent((index + slides.length) % slides.length)
  }

  const slide = slides[current]

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${slide.bgFrom} ${slide.bgTo} transition-all duration-700 shadow-xl`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Dekor */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-60 h-60 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center p-6 md:p-10 min-h-[220px]">
          {/* SOL: Məzmun */}
          <div key={slide.id} className="text-white animate-fadeIn">
            <div className="inline-block bg-white/20 backdrop-blur border border-white/30 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              {slide.badge}
            </div>
            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold leading-tight mb-2">
              {slide.title}
            </h2>
            <p className="text-sm md:text-base opacity-90 leading-relaxed mb-4 max-w-xl">
              {slide.description}
            </p>
            <Link
              href={slide.ctaLink}
              className="inline-block bg-white text-gray-900 hover:bg-gray-100 px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg"
            >
              {slide.cta} →
            </Link>
          </div>

          {/* SAĞ: Şəkil */}
          <div key={`img-${slide.id}`} className="hidden md:block animate-fadeIn">
            <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-2xl overflow-hidden bg-white/10 backdrop-blur p-1.5 border border-white/20">
              <div className="w-full h-full rounded-xl overflow-hidden">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* OX DÜYMƏLƏRİ */}
        <button
          onClick={() => goTo(current - 1)}
          aria-label="Əvvəlki"
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/30 hover:bg-white/30 text-white flex items-center justify-center transition z-20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => goTo(current + 1)}
          aria-label="Növbəti"
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/30 hover:bg-white/30 text-white flex items-center justify-center transition z-20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* DOT INDIKATORLAR */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all ${
                i === current ? 'w-7 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Progress bar */}
        {!isPaused && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
            <div
              key={current}
              className="h-full bg-white/60"
              style={{ animation: `progress ${AUTOPLAY_MS}ms linear` }}
            />
          </div>
        )}

        <style jsx>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
          :global(.animate-fadeIn) {
            animation: fadeIn 0.5s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </section>
  )
}
