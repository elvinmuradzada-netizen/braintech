'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ClassesClient({
  classes,
  role,
  userId,
  teachers,
  schoolId,
}: {
  classes: any[]
  role: string
  userId: string
  teachers: any[]
  schoolId?: number | null
}) {
  const router = useRouter()
  const supabase = createClient()

  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [className, setClassName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('1')
  const [teacherId, setTeacherId] = useState(userId)

  // ═══ SİNİF YARAT ═══
  async function createClass(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Müəllimin məktəbini tap
    const selectedTeacher = teachers.find((t) => t.id === teacherId)
    const finalSchoolId = selectedTeacher?.school_id || schoolId || null

    const { error } = await supabase
      .from('classes')
      .insert({
        name: className,
        grade_level: parseInt(gradeLevel),
        teacher_id: role === 'teacher' ? userId : teacherId,
        school_id: finalSchoolId,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setShowModal(false)
    setClassName('')
    setGradeLevel('1')
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      {/* Yeni sinif düyməsi */}
      <div className="mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition min-h-[44px] flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          ➕ Yeni sinif yarat
        </button>
      </div>

      {/* Siniflər siyahısı */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-5xl mb-4">🏫</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Hələ sinif yoxdur</h2>
          <p className="text-gray-500 mb-6">
            İlk sinfinizi yaradın və şagirdləri əlavə edin
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition"
          >
            ➕ Sinif yarat
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/classes/${c.id}`}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl text-white">
                  🏫
                </div>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                  {c.grade_level}-ci sinif
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-lg mb-1">{c.name}</h3>
              {role === 'director' && c.profiles?.full_name && (
                <p className="text-xs text-gray-500 mb-2">
                  👨‍🏫 {c.profiles.full_name}
                </p>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Şagirdlər</p>
                  <p className="text-xl font-bold text-gray-900">{c.studentCount}</p>
                </div>
                <span className="text-indigo-600 text-sm font-bold">
                  Bax →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ═══ MODAL — YENİ SİNİF ═══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Yeni sinif yarat</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setError(null)
                }}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={createClass} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                  SİNİFİN ADI *
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                  placeholder="5A Riyaziyyat"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                  SİNİF SƏVİYYƏSİ *
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white outline-none focus:border-indigo-500 transition"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                    <option key={g} value={g}>
                      {g}-ci sinif
                    </option>
                  ))}
                </select>
              </div>

              {/* Direktor üçün müəllim seçimi */}
              {role === 'director' && teachers.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                    MÜƏLLİM *
                  </label>
                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white outline-none focus:border-indigo-500 transition"
                  >
                    <option value="">Müəllim seçin</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setError(null)
                  }}
                  className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3 rounded-xl transition"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                >
                  {loading ? 'Yaradılır...' : 'Yarat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
