'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { register } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/client'

type Step = 'role' | 'phone' | 'student-form' | 'teacher-form' | 'director-form' | 'confirm'
type Role = 'student' | 'teacher' | 'director'

export default function RegisterWizard() {
  const supabase = createClient()
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<Role>('student')
  const [parentPhone, setParentPhone] = useState({ prefix: '050', number: '' })
  const [formProgress, setFormProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Dropdown məlumatları
  const [cities, setCities] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [schools, setSchools] = useState<any[]>([])
  const [directorDistricts, setDirectorDistricts] = useState<any[]>([])
  const [directorSchools, setDirectorSchools] = useState<any[]>([])
  const [teacherDistricts, setTeacherDistricts] = useState<any[]>([])
  const [teacherSchools, setTeacherSchools] = useState<any[]>([])

  // Şagird formu
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', father_name: '', email: '',
    gender: 'Oğlan', city_id: '', district_id: '', school_id: '',
    grade_level: '1', class_index: 'a', class_teacher: '',
    password: '', confirm_password: '', foreign_language: 'İngilis dili',
  })

  // Müəllim formu
  const [teacherData, setTeacherData] = useState({
    first_name: '', last_name: '', father_name: '', email: '',
    gender: 'Kişi',
    institution_type: 'Dövlət məktəbi',
    institution_name: '', grade_level: '1', class_index: 'a',
    foreign_language: 'İngilis dili', section: 'Azərbaycan bölməsi',
    city_id: '', district_id: '', school_id: '',
    id_card_file: null as File | null,
    password: '', confirm_password: '',
  })

  // Direktor formu
  const [directorData, setDirectorData] = useState({
    first_name: '', last_name: '', father_name: '', email: '',
    gender: 'Kişi', city_id: '', district_id: '', school_id: '',
    position: 'Məktəb direktoru', experience_years: '5',
    id_card_file: null as File | null,
    password: '', confirm_password: '',
  })

  // Şəhərləri yüklə
  useEffect(() => {
    supabase.from('cities').select('*').order('name')
      .then(({ data }) => setCities(data || []))
  }, [])

  // Şagird rayonları
  useEffect(() => {
    if (!formData.city_id) { setDistricts([]); return }
    supabase.from('districts').select('*').eq('city_id', formData.city_id).order('name')
      .then(({ data }) => setDistricts(data || []))
  }, [formData.city_id])

  // Şagird məktəbləri
  useEffect(() => {
    if (!formData.district_id) { setSchools([]); return }
    supabase.from('schools').select('*').eq('district_id', formData.district_id).order('name')
      .then(({ data }) => setSchools(data || []))
  }, [formData.district_id])

  // Müəllim rayonları
  useEffect(() => {
    if (!teacherData.city_id) { setTeacherDistricts([]); return }
    supabase.from('districts').select('*').eq('city_id', teacherData.city_id).order('name')
      .then(({ data }) => setTeacherDistricts(data || []))
  }, [teacherData.city_id])

  // Müəllim məktəbləri
  useEffect(() => {
    if (!teacherData.district_id) { setTeacherSchools([]); return }
    supabase.from('schools').select('*').eq('district_id', teacherData.district_id).order('name')
      .then(({ data }) => setTeacherSchools(data || []))
  }, [teacherData.district_id])

  // Direktor rayonları
  useEffect(() => {
    if (!directorData.city_id) { setDirectorDistricts([]); return }
    supabase.from('districts').select('*').eq('city_id', directorData.city_id).order('name')
      .then(({ data }) => setDirectorDistricts(data || []))
  }, [directorData.city_id])

  // Direktor məktəbləri
  useEffect(() => {
    if (!directorData.district_id) { setDirectorSchools([]); return }
    supabase.from('schools').select('*').eq('district_id', directorData.district_id).order('name')
      .then(({ data }) => setDirectorSchools(data || []))
  }, [directorData.district_id])

  function updateForm(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  function updateTeacher(field: string, value: any) {
    setTeacherData(prev => ({ ...prev, [field]: value }))
  }
  function updateDirector(field: string, value: any) {
    setDirectorData(prev => ({ ...prev, [field]: value }))
  }

  // 2 saniyə gecikmə ilə növbəti sahəni göstər
  function nextStep() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setFormProgress(prev => Math.min(prev + 1, 10))
    }, 2000)
  }

  // ═══════════════════════════════════════════════════════
  // STEP 1: ROL SEÇİMİ
  // ═══════════════════════════════════════════════════════
  if (step === 'role') {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Xoş gəldiniz! 👋</h1>
          <p className="text-gray-500">Hesabınıza daxil olun və ya qeydiyyatdan keçin.</p>
        </div>

        <div className="mb-4">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
            Hansı panelə daxil olursunuz?
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'student', title: 'Şagird', desc: 'İmtahanlara qatıl, nəticələrini izlə', icon: '/images/sagird-1.jpg', color: 'green' },
              { id: 'teacher', title: 'Müəllim', desc: 'Siniflərini idarə et, statistika', icon: '/images/muellim-1.jpg', color: 'blue' },
              { id: 'director', title: 'Direktor', desc: 'Məktəb statistikası və analitika', icon: '/images/direktor-1.jpg', color: 'purple' },
            ].map((r) => {
              const btnColors: Record<string, string> = {
                green: 'bg-green-600 hover:bg-green-700',
                blue: 'bg-blue-600 hover:bg-blue-700',
                purple: 'bg-purple-600 hover:bg-purple-700',
              }
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setRole(r.id as Role)
                    setFormProgress(0)
                    if (r.id === 'student') setStep('phone')
                    else if (r.id === 'teacher') setStep('teacher-form')
                    else setStep('director-form')
                  }}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-3 hover:border-indigo-500 hover:shadow-lg transition text-center"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 mx-auto mb-2">
                    <Image src={r.icon} alt={r.title} width={80} height={80} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 mb-0.5">BrainTech {r.title.toLowerCase()}</p>
                  <p className="text-[10px] text-gray-500 leading-tight mb-2">{r.desc}</p>
                  <div className={`w-7 h-7 rounded-full ${btnColors[r.color]} text-white flex items-center justify-center mx-auto text-xs`}>
                    →
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2 mb-4">
          <span className="text-green-600 text-sm">ⓘ</span>
          <p className="text-xs text-green-800">Davam etmək üçün yuxarıdan müvafiq bölməni seçin.</p>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════
  // STEP 2: VALİDEYN TELEFONU (yalnız şagird)
  // ═══════════════════════════════════════════════════════
  if (step === 'phone') {
    return (
      <div>
        <button onClick={() => setStep('role')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition mb-6">
          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">←</span>
          <span className="font-medium">Ana səhifə</span>
        </button>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-green-600">📞</span>
            <span className="text-sm font-medium text-green-800">Siz şagird kimi sisteme daxil olursunuz.</span>
          </div>
          <button onClick={() => setStep('role')} className="text-xs text-green-700 font-medium hover:underline">← Geri qayıt</button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-green-500 shadow-lg">
              <Image src="/images/sagird-1.jpg" alt="Şagird" width={128} height={128} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg border-4 border-white">✓</div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">BrainTech şagird</h3>
          <p className="text-xs text-gray-500">İmtahanlara qatıl, nəticələrini izlə</p>
        </div>

        <div className="mb-4">
          <label className="text-xs font-bold text-gray-700 mb-2 block">VALİDEYNİN MOBİL NÖMRƏSİ *</label>
          <div className="flex gap-2">
            <select
              value={parentPhone.prefix}
              onChange={(e) => setParentPhone({ ...parentPhone, prefix: e.target.value })}
              className="w-24 px-3 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 outline-none focus:border-green-500"
            >
              <option>050</option><option>051</option><option>055</option><option>070</option><option>077</option>
            </select>
            <input
              type="tel"
              value={parentPhone.number}
              onChange={(e) => setParentPhone({ ...parentPhone, number: e.target.value.replace(/\D/g, '').slice(0, 7) })}
              placeholder="000 00 00"
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-green-500"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Format: 050 123 45 67</p>
        </div>

        <button
          onClick={() => {
            if (parentPhone.number.length !== 7) { setError('Zəhmət olmasa tam mobil nömrəni daxil edin'); return }
            setError(null)
            setStep('student-form')
            setFormProgress(0)
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition"
        >
          Təsdiq et
        </button>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mt-4">{error}</div>}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════
  // STEP 3: ŞAGİRD FORMU (addım-addım)
  // ═══════════════════════════════════════════════════════
  if (step === 'student-form') {
    const allFilled =
      formData.first_name && formData.last_name && formData.father_name &&
      formData.email && formData.city_id && formData.district_id &&
      formData.school_id && formData.class_teacher &&
      formData.password && formData.confirm_password

    return (
      <div>
        <button onClick={() => setStep('phone')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition mb-4">
          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">←</span>
          <span className="font-medium">Giriş səhifəsinə qayıt</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Şagird üçün qeydiyyat</h1>
          <p className="text-xs text-gray-500">Məlumatları valideyn olaraq düzgün qeyd edin.</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-green-600">📞</span>
            <span className="text-sm font-medium text-gray-800">
              Şagird qeydiyyatı: {parentPhone.prefix} {parentPhone.number.slice(0, 3)} {parentPhone.number.slice(3, 5)} {parentPhone.number.slice(5)}
            </span>
          </div>
          <button onClick={() => setStep('phone')} className="text-xs text-green-700 font-medium hover:underline">Nömrəni dəyiş</button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (formData.password !== formData.confirm_password) { setError('Şifrələr uyğun deyil'); return }
            if (formData.password.length < 6) { setError('Şifrə minimum 6 simvol olmalıdır'); return }
            setError(null)
            setStep('confirm')
          }}
          className="space-y-4"
        >
          {/* Ad, Soyad */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="ŞAGİRDİN ADI *" icon="👤" value={formData.first_name} onChange={(v) => updateForm('first_name', v)} onBlur={() => formData.first_name && nextStep()} required />
            <FormField label="ŞAGİRDİN SOYADI *" icon="👤" value={formData.last_name} onChange={(v) => updateForm('last_name', v)} onBlur={() => formData.last_name && nextStep()} required />
          </div>

          {/* Ata adı */}
          {formProgress >= 1 && (
            <FormField label="ŞAGİRDİN ATA ADI *" icon="👤" value={formData.father_name} onChange={(v) => updateForm('father_name', v)} onBlur={() => formData.father_name && nextStep()} required />
          )}

          {/* Email */}
          {formProgress >= 2 && (
            <FormField label="EMAIL *" icon="✉️" type="email" value={formData.email} onChange={(v) => updateForm('email', v)} onBlur={() => formData.email && nextStep()} hint="Şifrəni unutduğunuz təqdirdə bu emaildən istifadə edərək hesabınıza bərpa edə biləcəksiniz." required />
          )}

          {/* Cins, Bölmə */}
          {formProgress >= 3 && (
            <>
              <SelectField label="CİNS *" value={formData.gender} onChange={(v) => { updateForm('gender', v); nextStep() }} options={['Oğlan', 'Qız']} />
              <SelectField label="BÖLMƏ *" value="Azərbaycan bölməsi" onChange={() => nextStep()} options={['Azərbaycan bölməsi', 'Rus bölməsi']} />
            </>
          )}

          {/* Sinif, İndeks */}
          {formProgress >= 4 && (
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="SİNİF *" value={formData.grade_level} onChange={(v) => { updateForm('grade_level', v); nextStep() }} options={['1', '2', '3', '4', '5', '6', '7', '8', '9']} display={(v) => `${v}-ci sinif`} />
              <SelectField label="SİNFİN İNDEKSİ *" value={formData.class_index} onChange={(v) => { updateForm('class_index', v); nextStep() }} options={['a', 'b', 'c', 'd', 'e']} />
            </div>
          )}

          {/* Şəhər, Rayon */}
          {formProgress >= 5 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-700 mb-1 block uppercase tracking-wider">ŞƏHƏR / RAYON *</label>
                <select
                  value={formData.city_id}
                  onChange={(e) => { updateForm('city_id', e.target.value); updateForm('district_id', ''); updateForm('school_id', ''); }}
                  onBlur={() => formData.city_id && nextStep()}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-green-500"
                >
                  <option value="">Şəhər seçin</option>
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-700 mb-1 block uppercase tracking-wider">RAYON *</label>
                <select
                  value={formData.district_id}
                  onChange={(e) => { updateForm('district_id', e.target.value); updateForm('school_id', ''); }}
                  onBlur={() => formData.district_id && nextStep()}
                  disabled={!formData.city_id}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-green-500 disabled:opacity-50"
                >
                  <option value="">Rayon seçin</option>
                  {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Məktəb, Xarici dil */}
          {formProgress >= 6 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-700 mb-1 block uppercase tracking-wider">MƏKTƏB *</label>
                <select
                  value={formData.school_id}
                  onChange={(e) => { updateForm('school_id', e.target.value); nextStep() }}
                  disabled={!formData.district_id}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-green-500 disabled:opacity-50"
                >
                  <option value="">Məktəb seçin</option>
                  {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <SelectField label="XARİCİ DİL *" value={formData.foreign_language} onChange={(v) => { updateForm('foreign_language', v); nextStep() }} options={['İngilis dili', 'Rus dili', 'Fransız dili', 'Alman dili']} />
            </div>
          )}

          {/* Sinif rəhbəri */}
          {formProgress >= 7 && (
            <FormField label="SİNİF RƏHBƏRİNİN ADI VƏ SOYADI *" icon="👤" value={formData.class_teacher} onChange={(v) => updateForm('class_teacher', v)} onBlur={() => formData.class_teacher && nextStep()} required />
          )}

          {/* Şifrə */}
          {formProgress >= 8 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="ŞİFRƏ TƏYİN EDİN *" icon="🔒" type="password" value={formData.password} onChange={(v) => updateForm('password', v)} required />
                <FormField label="ŞİFRƏNİ TƏKRAR EDİN *" icon="🔒" type="password" value={formData.confirm_password} onChange={(v) => updateForm('confirm_password', v)} required />
              </div>

              {formData.password && formData.confirm_password && (
                <p className={`text-xs flex items-center gap-1 ${formData.password === formData.confirm_password ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.password === formData.confirm_password ? '✓' : '✗'} Şifrələr uyğundur.
                </p>
              )}
            </>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          {allFilled && formProgress >= 8 && (
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition">
              Qeydiyyatdan keç
            </button>
          )}
        </form>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════
  // STEP 4: MÜƏLLİM FORMU (addım-addım)
  // ═══════════════════════════════════════════════════════
  if (step === 'teacher-form') {
    const allFilled =
      teacherData.first_name && teacherData.last_name && teacherData.father_name &&
      teacherData.email && teacherData.city_id && teacherData.district_id &&
      teacherData.school_id && teacherData.id_card_file &&
      teacherData.password && teacherData.confirm_password

    return (
      <div>
        <button onClick={() => setStep('role')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition mb-4">
          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">←</span>
          <span className="font-medium">Giriş səhifəsinə qayıt</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Müəllim üçün qeydiyyat</h1>
          <p className="text-xs text-gray-500">Məlumatları Azərbaycan əlifbası ilə düzgün qeyd edin. Hesabınız yoxlanışdan sonra aktiv ediləcək.</p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (teacherData.password !== teacherData.confirm_password) { setError('Şifrələr uyğun deyil'); return }
            if (teacherData.password.length < 6) { setError('Şifrə minimum 6 simvol olmalıdır'); return }
            setLoading(true)
            setError(null)

            const fd = new FormData()
            fd.set('email', teacherData.email)
            fd.set('password', teacherData.password)
            fd.set('full_name', `${teacherData.last_name} ${teacherData.first_name} ${teacherData.father_name}`)
            fd.set('role', role)
            fd.set('grade_level', teacherData.grade_level)
            fd.set('institution_name', teacherData.institution_name)
            fd.set('city_id', teacherData.city_id)
            fd.set('district_id', teacherData.district_id)
            fd.set('school_id', teacherData.school_id)

            const result = await register(fd)
            if (result?.error) { setError(result.error); setLoading(false) }
          }}
          className="space-y-4"
        >
          {/* Ad, Soyad */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="ADINIZ *" icon="👤" value={teacherData.first_name} onChange={(v) => updateTeacher('first_name', v)} onBlur={() => teacherData.first_name && nextStep()} required />
            <FormField label="SOYADINIZ *" icon="👤" value={teacherData.last_name} onChange={(v) => updateTeacher('last_name', v)} onBlur={() => teacherData.last_name && nextStep()} required />
          </div>

          {/* Ata adı */}
          {formProgress >= 1 && (
            <FormField label="ATA ADINIZ *" icon="👤" value={teacherData.father_name} onChange={(v) => updateTeacher('father_name', v)} onBlur={() => teacherData.father_name && nextStep()} required />
          )}

          {/* Email */}
          {formProgress >= 2 && (
            <FormField label="EMAIL *" icon="✉️" type="email" value={teacherData.email} onChange={(v) => updateTeacher('email', v)} onBlur={() => teacherData.email && nextStep()} hint="Şifrəni unutduğunuz təqdirdə bu emaildən istifadə edərək hesabınıza bərpa edə biləcəksiniz." required />
          )}

          {/* Cins + Müəssisə */}
          {formProgress >= 3 && (
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="CİNS *" value={teacherData.gender} onChange={(v) => { updateTeacher('gender', v); nextStep() }} options={['Kişi', 'Qadın']} />
              <SelectField label="MÜƏSSİSƏ *" value={teacherData.institution_type} onChange={(v) => { updateTeacher('institution_type', v); nextStep() }} options={['Dövlət məktəbi', 'Özəl (kurs, bağça, lisey, repetitor)', 'Universitet']} />
            </div>
          )}

          {/* Şəhər + Rayon */}
          {formProgress >= 4 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-700 mb-1 block uppercase tracking-wider">ŞƏHƏR *</label>
                <select
                  value={teacherData.city_id}
                  onChange={(e) => {
                    updateTeacher('city_id', e.target.value)
                    updateTeacher('district_id', '')
                    updateTeacher('school_id', '')
                  }}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-500"
                >
                  <option value="">Şəhər seçin</option>
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-700 mb-1 block uppercase tracking-wider">RAYON *</label>
                <select
                  value={teacherData.district_id}
                  onChange={(e) => {
                    updateTeacher('district_id', e.target.value)
                    updateTeacher('school_id', '')
                  }}
                  disabled={!teacherData.city_id}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="">Rayon seçin</option>
                  {teacherDistricts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Məktəb / Müəssisə */}
          {formProgress >= 5 && (
            <div>
              <label className="text-[10px] font-bold text-gray-700 mb-1 block uppercase tracking-wider">MƏKTƏB / MÜƏSSİSƏ *</label>
              <select
                value={teacherData.school_id}
                onChange={(e) => {
                  updateTeacher('school_id', e.target.value)
                  const school = teacherSchools.find(s => String(s.id) === e.target.value)
                  if (school) updateTeacher('institution_name', school.name)
                  nextStep()
                }}
                disabled={!teacherData.district_id}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">Məktəb seçin</option>
                {teacherSchools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          {/* Sinif + İndeks */}
          {formProgress >= 6 && (
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="SİNİF *" value={teacherData.grade_level} onChange={(v) => { updateTeacher('grade_level', v); nextStep() }} options={['1', '2', '3', '4', '5', '6', '7', '8', '9']} display={(v) => `${v}-ci sinif`} />
              <SelectField label="SİNFİN İNDEKSİ *" value={teacherData.class_index} onChange={(v) => { updateTeacher('class_index', v); nextStep() }} options={['a', 'b', 'c', 'd', 'e']} />
            </div>
          )}

          {/* Xarici dil + Bölmə */}
          {formProgress >= 7 && (
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="XARİCİ DİL *" value={teacherData.foreign_language} onChange={(v) => { updateTeacher('foreign_language', v); nextStep() }} options={['İngilis dili', 'Rus dili', 'Fransız dili', 'Alman dili']} />
              <SelectField label="BÖLMƏ *" value={teacherData.section} onChange={(v) => { updateTeacher('section', v); nextStep() }} options={['Azərbaycan bölməsi', 'Rus bölməsi']} />
            </div>
          )}

          {/* Şəxsiyyət vəsiqəsi */}
          {formProgress >= 8 && (
            <FileField
              label="ŞƏXSİYYƏT VƏSİQƏSİNİN ÖN ÜZÜNÜN ŞƏKLİ *"
              file={teacherData.id_card_file}
              onChange={(f) => { updateTeacher('id_card_file', f); if (f) nextStep() }}
            />
          )}

          {/* Şifrə */}
          {formProgress >= 9 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="ŞİFRƏ TƏYİN EDİN *" icon="🔒" type="password" value={teacherData.password} onChange={(v) => updateTeacher('password', v)} required />
                <FormField label="ŞİFRƏNİ TƏKRAR EDİN *" icon="🔒" type="password" value={teacherData.confirm_password} onChange={(v) => updateTeacher('confirm_password', v)} required />
              </div>

              {teacherData.password && teacherData.confirm_password && (
                <p className={`text-xs flex items-center gap-1 ${teacherData.password === teacherData.confirm_password ? 'text-green-600' : 'text-red-600'}`}>
                  {teacherData.password === teacherData.confirm_password ? '✓' : '✗'} Şifrələr uyğundur.
                </p>
              )}
            </>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          {allFilled && formProgress >= 9 && (
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50">
              {loading ? 'Yaradılır...' : 'Qeydiyyatdan keç'}
            </button>
          )}
        </form>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════
  // STEP 5: DİREKTOR FORMU (addım-addım)
  // ═══════════════════════════════════════════════════════
  if (step === 'director-form') {
    const allFilled =
      directorData.first_name && directorData.last_name && directorData.father_name &&
      directorData.email && directorData.city_id && directorData.district_id &&
      directorData.school_id && directorData.id_card_file &&
      directorData.password && directorData.confirm_password

    return (
      <div>
        <button onClick={() => setStep('role')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition mb-4">
          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">←</span>
          <span className="font-medium">Giriş səhifəsinə qayıt</span>
        </button>

        <div className="mb-6">
          <div className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            🏫 MƏKTƏB DİREKTORU
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Direktor üçün qeydiyyat</h1>
          <p className="text-xs text-gray-500">Məktəb rəhbəri kimi qeydiyyatdan keçin. Məlumatlar yoxlanışdan sonra aktiv ediləcək.</p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (directorData.password !== directorData.confirm_password) { setError('Şifrələr uyğun deyil'); return }
            if (directorData.password.length < 6) { setError('Şifrə minimum 6 simvol olmalıdır'); return }
            setLoading(true)
            setError(null)

            const fd = new FormData()
            fd.set('email', directorData.email)
            fd.set('password', directorData.password)
            fd.set('full_name', `${directorData.last_name} ${directorData.first_name} ${directorData.father_name}`)
            fd.set('role', role)
            fd.set('city_id', directorData.city_id)
            fd.set('district_id', directorData.district_id)
            fd.set('school_id', directorData.school_id)

            const result = await register(fd)
            if (result?.error) { setError(result.error); setLoading(false) }
          }}
          className="space-y-4"
        >
          {/* Ad, Soyad */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="ADINIZ *" icon="👤" value={directorData.first_name} onChange={(v) => updateDirector('first_name', v)} onBlur={() => directorData.first_name && nextStep()} required />
            <FormField label="SOYADINIZ *" icon="👤" value={directorData.last_name} onChange={(v) => updateDirector('last_name', v)} onBlur={() => directorData.last_name && nextStep()} required />
          </div>

          {/* Ata adı */}
          {formProgress >= 1 && (
            <FormField label="ATA ADINIZ *" icon="👤" value={directorData.father_name} onChange={(v) => updateDirector('father_name', v)} onBlur={() => directorData.father_name && nextStep()} required />
          )}

          {/* Email */}
          {formProgress >= 2 && (
            <FormField label="EMAIL *" icon="✉️" type="email" value={directorData.email} onChange={(v) => updateDirector('email', v)} onBlur={() => directorData.email && nextStep()} hint="Rəsmi e-poçt ünvanı tövsiyə olunur" required />
          )}

          {/* Cins + Vəzifə */}
          {formProgress >= 3 && (
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="CİNS *" value={directorData.gender} onChange={(v) => { updateDirector('gender', v); nextStep() }} options={['Kişi', 'Qadın']} />
              <SelectField label="VƏZİFƏ *" value={directorData.position} onChange={(v) => { updateDirector('position', v); nextStep() }} options={['Məktəb direktoru', 'Direktor müavini', 'Təlim-tərbiyə işləri üzrə müavin', 'Digər']} />
            </div>
          )}

          {/* İş təcrübəsi */}
          {formProgress >= 4 && (
            <SelectField label="İŞ TƏCRÜBƏSİ (İL) *" value={directorData.experience_years} onChange={(v) => { updateDirector('experience_years', v); nextStep() }} options={['1', '2', '3', '5', '10', '15', '20+']} display={(v) => `${v} il`} />
          )}

          {/* Şəhər + Rayon */}
          {formProgress >= 5 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-700 mb-1 block uppercase tracking-wider">ŞƏHƏR *</label>
                <select
                  value={directorData.city_id}
                  onChange={(e) => { updateDirector('city_id', e.target.value); updateDirector('district_id', ''); updateDirector('school_id', ''); }}
                  onBlur={() => directorData.city_id && nextStep()}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-purple-500"
                >
                  <option value="">Şəhər seçin</option>
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-700 mb-1 block uppercase tracking-wider">RAYON *</label>
                <select
                  value={directorData.district_id}
                  onChange={(e) => { updateDirector('district_id', e.target.value); updateDirector('school_id', ''); }}
                  onBlur={() => directorData.district_id && nextStep()}
                  disabled={!directorData.city_id}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-purple-500 disabled:opacity-50"
                >
                  <option value="">Rayon seçin</option>
                  {directorDistricts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Məktəb */}
          {formProgress >= 6 && (
            <div>
              <label className="text-[10px] font-bold text-gray-700 mb-1 block uppercase tracking-wider">MƏKTƏB / MÜƏSSİSƏ *</label>
              <select
                value={directorData.school_id}
                onChange={(e) => { updateDirector('school_id', e.target.value); nextStep() }}
                disabled={!directorData.district_id}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-purple-500 disabled:opacity-50"
              >
                <option value="">Məktəb seçin</option>
                {directorSchools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          {/* Şəxsiyyət vəsiqəsi */}
          {formProgress >= 7 && (
            <FileField
              label="ŞƏXSİYYƏT VƏSİQƏSİNİN ÖN ÜZÜNÜN ŞƏKLİ *"
              file={directorData.id_card_file}
              onChange={(f) => { updateDirector('id_card_file', f); if (f) nextStep() }}
            />
          )}

          {/* Şifrə */}
          {formProgress >= 8 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="ŞİFRƏ TƏYİN EDİN *" icon="🔒" type="password" value={directorData.password} onChange={(v) => updateDirector('password', v)} required />
                <FormField label="ŞİFRƏNİ TƏKRAR EDİN *" icon="🔒" type="password" value={directorData.confirm_password} onChange={(v) => updateDirector('confirm_password', v)} required />
              </div>

              {directorData.password && directorData.confirm_password && (
                <p className={`text-xs flex items-center gap-1 ${directorData.password === directorData.confirm_password ? 'text-green-600' : 'text-red-600'}`}>
                  {directorData.password === directorData.confirm_password ? '✓' : '✗'} Şifrələr uyğundur.
                </p>
              )}
            </>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          {allFilled && formProgress >= 8 && (
            <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50">
              {loading ? 'Yaradılır...' : 'Qeydiyyatdan keç'}
            </button>
          )}
        </form>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════
  // STEP 6: TƏSDİQ (yalnız şagird)
  // ═══════════════════════════════════════════════════════
  if (step === 'confirm') {
    async function handleFinalSubmit() {
      setLoading(true)
      setError(null)
      const fd = new FormData()
      fd.set('email', formData.email)
      fd.set('password', formData.password)
      fd.set('full_name', `${formData.last_name} ${formData.first_name} ${formData.father_name}`)
      fd.set('role', role)
      fd.set('grade_level', formData.grade_level)
      fd.set('city_id', formData.city_id)
      fd.set('district_id', formData.district_id)
      fd.set('school_id', formData.school_id)
      const result = await register(fd)
      if (result?.error) { setError(result.error); setLoading(false) }
    }

    const cityName = cities.find(c => String(c.id) === formData.city_id)?.name || '—'
    const districtName = districts.find(d => String(d.id) === formData.district_id)?.name || '—'
    const schoolName = schools.find(s => String(s.id) === formData.school_id)?.name || '—'

    const items = [
      { label: 'Mobil nömrə', value: `${parentPhone.prefix} ${parentPhone.number.slice(0, 3)} ${parentPhone.number.slice(3, 5)} ${parentPhone.number.slice(5)}`, icon: '📞' },
      { label: 'Ad', value: formData.first_name, icon: '👤' },
      { label: 'Soyad', value: formData.last_name, icon: '👤' },
      { label: 'Ata adı', value: formData.father_name, icon: '👤' },
      { label: 'Email', value: formData.email, icon: '✉️' },
      { label: 'Cins', value: formData.gender, icon: '👥' },
      { label: 'Şəhər', value: cityName, icon: '📍' },
      { label: 'Bölmə', value: 'Azərbaycan bölməsi', icon: '📚' },
      { label: 'Sinif', value: `${formData.grade_level}-ci sinif - ${formData.class_index}`, icon: '🎓' },
      { label: 'Xarici dil', value: formData.foreign_language, icon: '🌍' },
      { label: 'Rayon', value: districtName, icon: '🗺️' },
      { label: 'Məktəb', value: schoolName, icon: '🏫' },
      { label: 'Sinif rəhbəri', value: formData.class_teacher, icon: '👩‍🏫' },
    ]

    return (
      <div>
        <div className="mb-6">
          <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Təsdiq</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Məlumatları bir daha yoxlayın</h1>
          <p className="text-xs text-gray-500">Yanlışlıq varsa geri qayıdıb düzəliş edin.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {items.map((item, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">{item.icon}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{item.label}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">{item.value || '—'}</p>
            </div>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        <div className="flex gap-2">
          <button onClick={() => setStep('student-form')} disabled={loading} className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-4 rounded-xl transition disabled:opacity-50">
            ← Geri qayıt
          </button>
          <button onClick={handleFinalSubmit} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50">
            {loading ? 'Yaradılır...' : 'Qeydiyyatı tamamla'}
          </button>
        </div>
      </div>
    )
  }

  return null
}

// ═══════════════════════════════════════════════════════
// KÖMƏKÇİ KOMPONENTLƏR
// ═══════════════════════════════════════════════════════

function FormField({
  label, icon, value, onChange, onBlur, type = 'text', hint, required, placeholder,
}: {
  label: string
  icon: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  type?: string
  hint?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-700 mb-1 block uppercase tracking-wider">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500 transition"
        />
      </div>
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function SelectField({
  label, value, onChange, options, display,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  display?: (v: string) => string
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-700 mb-1 block uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500 transition"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{display ? display(opt) : opt}</option>
        ))}
      </select>
    </div>
  )
}

function FileField({
  label, file, onChange,
}: {
  label: string
  file: File | null
  onChange: (f: File | null) => void
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-700 mb-1 block uppercase tracking-wider">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 flex items-center gap-3 hover:border-indigo-500 transition cursor-pointer">
        <span className="text-xl">🪪</span>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="flex-1 text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
          required
        />
      </div>
      {file && <p className="text-[10px] text-green-600 mt-1">✓ {file.name}</p>}
      <p className="text-[10px] text-gray-400 mt-1">JPG, PNG, PDF (maks. 5 MB)</p>
    </div>
  )
}
