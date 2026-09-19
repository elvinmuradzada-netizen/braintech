'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'BrainTech nədir?',
    a: 'BrainTech 1-9-cu sinif şagirdləri üçün onlayn imtahan və bilik yarışları platformasıdır. Şagirdlər öz biliklərini yoxlaya, müəllimlər isə nəticələri izləyə bilər.',
  },
  {
    q: 'Necə qeydiyyatdan keçə bilərəm?',
    a: 'Yuxarı sağ küncdəki "Daxil ol" düyməsinə basın və "Qeydiyyatdan keç" seçin. Şagird, müəllim və ya valideyn kimi qeydiyyatdan keçə bilərsiniz.',
  },
  {
    q: 'İmtahanlar pulludur, yoxsa pulsuz?',
    a: 'Platformada həm pulsuz, həm də pullu imtahanlar mövcuddur. Pulsuz imtahanlarla biliklərinizi yoxlaya, pullu imtahanlarda isə sertifikat əldə edə bilərsiniz.',
  },
  {
    q: 'Hansı siniflər üçün imtahanlar var?',
    a: '1-ci sinifdən 9-cu sinifə qədər bütün şagirdlər üçün imtahanlar mövcuddur. Həmçinin məktəbəhazırlıq (5-6 yaş) üçün də imtahanlarımız var.',
  },
  {
    q: 'İmtahan nəticələrimi harada görə bilərəm?',
    a: 'Şəxsi kabinetinizdə "Nəticələrim" bölməsindən bütün imtahan nəticələrinizi, statistikanızı və irəliləyişinizi görə bilərsiniz.',
  },
  {
    q: 'Nəticələr necə hesablanır?',
    a: 'Hər sualın bal dəyəri var. Doğru cavablar toplanır və ümumi bal faizə çevrilir. Keçid balı imtahana görə dəyişir (adətən 60%).',
  },
  {
    q: 'Müəllim kimi necə qoşula bilərəm?',
    a: 'Qeydiyyat zamanı "Müəllim" rolunu seçin. Təsdiqdən sonra sinif yaradıb şagirdləri əlavə edə və imtahanlar təşkil edə biləcəksiniz.',
  },
  {
    q: 'Texniki problem yaranarsa nə etməliyəm?',
    a: 'Dəstək komandamızla əlaqə saxlayın: info@braintech.az və ya +994 XX XXX XX XX',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Tez-tez verilən suallar
          </h2>
          <p className="text-gray-500">
            Platformamızla bağlı ən çox verilən sualların cavablarını buradan tapa bilərsiniz.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border-2 transition-all ${
                openIndex === idx
                  ? 'border-blue-200 bg-blue-50/50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                    openIndex === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    ❓
                  </span>
                  <span className="font-semibold text-gray-900 text-sm md:text-base">
                    {faq.q}
                  </span>
                </div>
                <span className={`flex-shrink-0 text-2xl transition-transform ${
                  openIndex === idx ? 'rotate-45 text-blue-600' : 'text-gray-400'
                }`}>
                  +
                </span>
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-5 pt-0">
                  <p className="text-gray-600 text-sm leading-relaxed pl-11">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
