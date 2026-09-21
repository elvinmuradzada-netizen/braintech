'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ClassDetail({
  cls,
  classStudents,
  isDirector,
}: {
  cls: any
  classStudents: any[]
  isDirector: boolean
}) {
  const router = useRouter()
  const supabase = createClient()

  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [students, setStudents] = useState(classStudents)

  const [searchName, setSearchName] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  // ═══ ŞAGİRD AXTAR — YALNIZ HƏMİN MƏKTƏBDƏN ═══
  async function searchStudents() {
    if (!searchName.trim()) return
    setSearching(true)
    setError(null)

    let query = supabase
      .from('profiles')
      .select('id, full_name, grade_level, role, school_id')
      .eq('role', 'student')
      .ilike('full_name', `%${searchName}%`)
      .limit(15)

    // Yalnız həmin məktəbin şagirdləri
    if (cls.school_id) {
      query = query.eq('school_id', cls.school_id)
    }

    const { data, error } = await query

    setSearching(false)
    if (error) {
      setError(error.message)
    } else {
      setSearchResults(data || [])
    }
  }

  // ═══ ŞAGİRDİ SİNFƏ ƏLAVƏ ET ═══
  async function addStudent(studentId: string) {
    if (students.some(s => s.student_id === studentId)) {
      setError('Bu şagird artıq sinifdədir')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('class_students')
      .insert({ class_id: cls.id, student_id: studentId })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    // Yeni şagirdi gətir
    const { data: newStudent } = await supabase
      .from('profiles')
      .select('id, full_name, grade_level')
      .eq('id', studentId)
      .single()

    if (newStudent) {
      setStudents(prev => [...prev, { student_id: studentId, profiles: newStudent }])
    }

    setSearchName('')
    setSearchResults([])
    router.refresh()
  }

  // ═══ ŞAGİRDİ SİNFDƏN ÇIXAR ═══
  async function removeStudent(studentId: string) {
    if (!confirm('Şagirdi sinifdən çıxarmaq istədiyinizə əminsiniz?')) return

    const { error } = await supabase
      .from('class_students')
      .delete()
      .eq('class_id', cls.id)
      .eq('student_id', studentId)

    if (error) {
      setError(error.message)
    } else {
      setStudents(prev => prev.filter(s => s.student_id !== studentId))
      router.refresh()
    }
  }

  return (
    <>
      {/* ═══ BAŞLIQ BANNER ═══ */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-6 md:p-8 mb-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl border-4 border-white/30">
            🏫
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{cls.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full font-bold">
                🎓 {cls.grade_level}-ci sinif
              </span>
              {cls.profiles?.full_name && (
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                  👨‍🏫 {cls.profiles.full_name}
                </span>
              )}
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full font-bold">
                👨‍🎓 {students.length} şagird
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ŞAGİRD ƏLAVƏ ET DÜYMƏSİ ═══ */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Şagirdlər ({students.length})
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition min-h-[44px] flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          ➕ Şagird əlavə et
        </button>
      </div>

      {/* ═══ ŞAGİRD SİYAHISI ═══ */}
      {students.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-5xl mb-4">👨‍🎓</p>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Sinifdə şagird yoxdur</h3>
          <p className="text-gray-500 mb-4">Şagird əlavə etmək üçün düyməyə basın</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition"
          >
            ➕ Şagird əlavə et
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {students.map((s, idx) => {
              const prof = s.profiles
              return (
                <div key={s.student_id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-6">#{idx + 1}</span>
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                      {(prof?.full_name || 'Ş').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{prof?.full_name}</p>
                      <p className="text-xs text-gray-500">
                        {prof?.grade_level ? `${prof.grade_level}-ci sinif` : '—'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeStudent(s.student_id)}
                    className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-bold transition"
                  >
                    🗑 Çıxar
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══ MODAL — ŞAGİRD AXTARIŞI ═══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Şagird əlavə et</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSearchName('')
                  setSearchResults([])
                  setError(null)
                }}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Məktəb məlumatı */}
            {cls.schools?.name && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <span className="text-sm">🏫</span>
                <p className="text-xs text-indigo-800">
                  <strong>Yalnız</strong> {cls.schools.name} şagirdləri göstərilir
                </p>
              </div>
            )}

            {/* Axtarış */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                ŞAGİRDİN ADI
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchStudents()}
                  placeholder="Ad yazın..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500 transition"
                />
                <button
                  onClick={searchStudents}
                  disabled={searching || !searchName.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-bold transition disabled:opacity-50"
                >
                  {searching ? '...' : '🔍'}
                </button>
              </div>
            </div>

            {/* Nəticələr */}
            <div className="flex-1 overflow-y-auto min-h-[200px]">
              {searchResults.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  {searchName ? 'Şagird tapılmadı' : 'Ad yazın və axtarın'}
                </p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((s) => {
                    const already = students.some(x => x.student_id === s.id)
                    return (
                      <button
                        key={s.id}
                        onClick={() => !already && addStudent(s.id)}
                        disabled={already || loading}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                          already
                            ? 'border-green-200 bg-green-50 cursor-not-allowed'
                            : 'border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/30'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                          {s.full_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">{s.full_name}</p>
                          <p className="text-xs text-gray-500">
                            {s.grade_level ? `${s.grade_level}-ci sinif` : '—'}
                          </p>
                        </div>
                        {already ? (
                          <span className="text-xs text-green-600 font-bold">✓ Əlavə edilib</span>
                        ) : (
                          <span className="text-xs text-indigo-600 font-bold">+ Əlavə et</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mt-3">
                {error}
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 mt-4">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSearchName('')
                  setSearchResults([])
                  setError(null)
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition"
              >
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
