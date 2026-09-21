'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function extractClassIndex(className: string): string | null {
  const match = className.match(/(\d+)\s*([a-zA-Z])/i)
  if (match && match[2]) return match[2].toLowerCase()
  return null
}

export default function ClassDetail({
  cls,
  classStudents,
  studentAttempts,
  isDirector,
}: {
  cls: any
  classStudents: any[]
  studentAttempts: any[]
  isDirector: boolean
}) {
  const router = useRouter()
  const supabase = createClient()

  const [showModal, setShowModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [students, setStudents] = useState(classStudents)
  const [searchInClass, setSearchInClass] = useState('')

  const [searchName, setSearchName] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const classIndex = extractClassIndex(cls.name)

  // ═══ SİNİF STATİSTİKASI ═══
  const stats = useMemo(() => {
    const totalAttempts = studentAttempts.length
    const uniqueStudents = new Set(studentAttempts.map(a => a.student_id)).size
    const avgScore = totalAttempts > 0
      ? Math.round(studentAttempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / totalAttempts)
      : 0
    const passedCount = studentAttempts.filter(a => Number(a.percentage || 0) >= 60).length
    const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0

    return { totalAttempts, uniqueStudents, avgScore, passedCount, passRate }
  }, [studentAttempts])

  // ═══ SİNİF ŞAGİRDLƏRİNİ FİLTRLƏ ═══
  const filteredStudents = useMemo(() => {
    if (!searchInClass.trim()) return students
    return students.filter((s) => {
      const name = s.profiles?.full_name?.toLowerCase() || ''
      return name.includes(searchInClass.toLowerCase())
    })
  }, [students, searchInClass])

  // ═══ ŞAGİRD AXTAR (yeni əlavə) ═══
  async function searchStudents() {
    if (!searchName.trim()) return
    setSearching(true)
    setError(null)

    let query = supabase
      .from('profiles')
      .select('id, full_name, grade_level, class_index, role, school_id')
      .eq('role', 'student')
      .ilike('full_name', `%${searchName}%`)
      .eq('grade_level', cls.grade_level)
      .limit(15)

    if (cls.school_id) {
      query = query.eq('school_id', cls.school_id)
    }

    if (classIndex) {
      query = query.or(`class_index.eq.${classIndex},class_index.is.null`)
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

    const { data: newStudent } = await supabase
      .from('profiles')
      .select('id, full_name, grade_level, class_index')
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

  // ═══ ŞAGİRD PROFİLİNƏ BAX ═══
  function viewStudent(student: any) {
    setSelectedStudent(student)
    setShowStudentModal(true)
  }

  // Seçilmiş şagirdin cəhdləri
  const selectedStudentAttempts = useMemo(() => {
    if (!selectedStudent) return []
    return studentAttempts.filter(a => a.student_id === selectedStudent.student_id)
  }, [selectedStudent, studentAttempts])

  // ═══ CSV EXPORT ═══
  function exportCSV() {
    if (filteredStudents.length === 0) {
      alert('Export üçün şagird yoxdur')
      return
    }

    const headers = ['#', 'Ad Soyad', 'Sinif', 'Sinif indeksi']
    const rows = filteredStudents.map((s, i) => [
      i + 1,
      s.profiles?.full_name || '—',
      s.profiles?.grade_level || '',
      s.profiles?.class_index || '',
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    // BOM əlavə et (Azərbaycan hərfləri üçün)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${cls.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
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

      {/* ═══ SİNİF STATİSTİKASI ═══ */}
      {studentAttempts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👥</span>
              <span className="text-xs text-indigo-600 font-bold">Aktiv şagirdlər</span>
            </div>
            <div className="text-3xl font-bold text-indigo-900">{stats.uniqueStudents}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <span className="text-xs text-purple-600 font-bold">Orta bal</span>
            </div>
            <div className={`text-3xl font-bold ${
              stats.avgScore >= 80 ? 'text-green-600' :
              stats.avgScore >= 60 ? 'text-purple-600' : 'text-orange-500'
            }`}>{stats.avgScore}%</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✅</span>
              <span className="text-xs text-green-600 font-bold">Keçən</span>
            </div>
            <div className="text-3xl font-bold text-green-700">{stats.passedCount}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📝</span>
              <span className="text-xs text-yellow-600 font-bold">İmtahanlar</span>
            </div>
            <div className="text-3xl font-bold text-yellow-700">{stats.totalAttempts}</div>
          </div>
        </div>
      )}

      {/* ═══ DÜYMƏLƏR + AXTARIŞ ═══ */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Axtarış */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchInClass}
              onChange={(e) => setSearchInClass(e.target.value)}
              placeholder="Sinifdə şagird axtar..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Düymələr */}
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              disabled={filteredStudents.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              📥 CSV
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 whitespace-nowrap"
            >
              ➕ Şagird əlavə et
            </button>
          </div>
        </div>
      </div>

      {/* ═══ ŞAGİRD SİYAHISI ═══ */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900">
          Şagirdlər ({filteredStudents.length}{searchInClass && ` / ${students.length}`})
        </h2>
        {searchInClass && (
          <button
            onClick={() => setSearchInClass('')}
            className="text-xs text-indigo-600 hover:underline font-bold"
          >
            ✕ Axtarışı təmizlə
          </button>
        )}
      </div>

      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-5xl mb-4">{searchInClass ? '🔍' : '👨‍🎓'}</p>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {searchInClass ? 'Şagird tapılmadı' : 'Sinifdə şagird yoxdur'}
          </h3>
          <p className="text-gray-500">
            {searchInClass
              ? 'Axtarış sözünü dəyişdirin'
              : "Yuxarıdaki 'Şagird əlavə et' düyməsinə basın"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredStudents.map((s, idx) => {
              const prof = s.profiles
              const sAttempts = studentAttempts.filter(a => a.student_id === s.student_id)
              const sAvg = sAttempts.length > 0
                ? Math.round(sAttempts.reduce((sum, a) => sum + Number(a.percentage || 0), 0) / sAttempts.length)
                : null

              return (
                <div key={s.student_id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                  <button
                    onClick={() => viewStudent(s)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <span className="text-xs font-bold text-gray-400 w-6">#{idx + 1}</span>
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                      {(prof?.full_name || 'Ş').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{prof?.full_name}</p>
                      <p className="text-xs text-gray-500">
                        {prof?.grade_level ? `${prof.grade_level}-ci sinif` : '—'}
                        {prof?.class_index && ` - ${prof.class_index}`}
                        {sAttempts.length > 0 && ` • ${sAttempts.length} imtahan`}
                      </p>
                    </div>
                    {sAvg !== null && (
                      <span className={`text-sm font-bold ${
                        sAvg >= 80 ? 'text-green-600' :
                        sAvg >= 60 ? 'text-indigo-600' : 'text-orange-500'
                      }`}>{sAvg}%</span>
                    )}
                  </button>
                  <button
                    onClick={() => removeStudent(s.student_id)}
                    className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-bold transition ml-2"
                  >
                    🗑
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

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <span className="text-sm">🔍</span>
              <div className="text-xs text-indigo-800">
                <p><strong>Yalnız</strong> bu sinfə uyğun şagirdlər göstərilir:</p>
                <p className="mt-1">
                  🏫 {cls.schools?.name || '—'} <br />
                  🎓 {cls.grade_level}-ci sinif {classIndex && `- ${classIndex}`}
                </p>
              </div>
            </div>

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

            <div className="flex-1 overflow-y-auto min-h-[200px]">
              {searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-sm text-gray-400 font-medium">
                    {searchName ? 'Uyğun şagird tapılmadı' : 'Ad yazın və axtarın'}
                  </p>
                </div>
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
                            {s.class_index && ` - ${s.class_index}`}
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

      {/* ═══ MODAL — ŞAGİRD PROFİLİ ═══ */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Şagird profili</h2>
              <button
                onClick={() => {
                  setShowStudentModal(false)
                  setSelectedStudent(null)
                }}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Şagird başlığı */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl">
                {selectedStudent.profiles?.full_name?.charAt(0) || 'Ş'}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">
                  {selectedStudent.profiles?.full_name}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedStudent.profiles?.grade_level}-ci sinif
                  {selectedStudent.profiles?.class_index && ` - ${selectedStudent.profiles.class_index}`}
                </p>
              </div>
            </div>

            {/* Cəhdlər */}
            <h3 className="font-bold text-gray-900 mb-3">
              📝 İmtahan nəticələri ({selectedStudentAttempts.length})
            </h3>

            {selectedStudentAttempts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-2xl">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm text-gray-400">Hələ imtahan verməyib</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedStudentAttempts.map((a) => {
                  const percent = Math.round(Number(a.percentage) || 0)
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-lg">
                          {a.exams?.subjects?.icon || '📝'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{a.exams?.title}</p>
                          <p className="text-xs text-gray-500">
                            {a.finished_at
                              ? new Date(a.finished_at).toLocaleDateString('az-AZ')
                              : '—'}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold ${
                        percent >= 80 ? 'text-green-600' :
                        percent >= 60 ? 'text-indigo-600' : 'text-orange-500'
                      }`}>{percent}%</span>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowStudentModal(false)
                  setSelectedStudent(null)
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
