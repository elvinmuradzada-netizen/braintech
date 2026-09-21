import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ClassesClient from './ClassesClient'

export default async function ClassesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const role = profile?.role

  // Yalnız müəllim və direktor üçün
  if (role !== 'teacher' && role !== 'director' && role !== 'admin') {
    redirect('/dashboard')
  }

  // Müəllim: öz sinifləri, Direktor: öz məktəbinin sinifləri
  let classesQuery = supabase
    .from('classes')
    .select('*, profiles:teacher_id(full_name), schools(name)')
    .order('grade_level')
    .order('name')

  if (role === 'teacher') {
    classesQuery = classesQuery.eq('teacher_id', user.id)
  } else if (role === 'director' && profile?.school_id) {
    classesQuery = classesQuery.eq('school_id', profile.school_id)
  }

  const { data: classes } = await classesQuery

  // Hər sinif üçün şagird sayı
  const classesWithCounts = await Promise.all(
    (classes || []).map(async (c) => {
      const { count } = await supabase
        .from('class_students')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', c.id)
      return { ...c, studentCount: count || 0 }
    })
  )

  // Direktor üçün müəllimlər — yalnız öz məktəbindən
  let teachers: any[] = []
  if (role === 'director' || role === 'admin') {
    let teacherQuery = supabase
      .from('profiles')
      .select('id, full_name, school_id')
      .eq('role', 'teacher')
      .order('full_name')

    if (role === 'director' && profile?.school_id) {
      teacherQuery = teacherQuery.eq('school_id', profile.school_id)
    }

    const { data } = await teacherQuery
    teachers = data || []
  }

  // Müəllimin məktəb məlumatı
  const schoolId = profile?.school_id || null
  let schoolInfo: any = null

  if (schoolId) {
    const { data } = await supabase
      .from('schools')
      .select('*, districts(name)')
      .eq('id', schoolId)
      .single()
    schoolInfo = data
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/dashboard" className="text-indigo-600 hover:underline mb-4 inline-block text-sm">
        ← Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {role === 'teacher' ? 'Siniflərim' : 'Məktəb sinifləri'} 🏫
          </h1>
          <p className="text-gray-500 mt-1">
            {role === 'teacher'
              ? 'Yaratdığınız sinifləri idarə edin'
              : schoolInfo
              ? `${schoolInfo.name} məktəbindəki bütün siniflər`
              : 'Məktəbdəki bütün siniflər'}
          </p>
        </div>
      </div>

      {/* Məktəb məlumatı kartı */}
      {schoolInfo && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-2xl text-white">
            🏫
          </div>
          <div>
            <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Məktəbiniz</p>
            <p className="font-bold text-gray-900">{schoolInfo.name}</p>
            {schoolInfo.districts?.name && (
              <p className="text-xs text-gray-500">📍 {schoolInfo.districts.name} rayonu</p>
            )}
          </div>
        </div>
      )}

      <ClassesClient
        classes={classesWithCounts}
        role={role}
        userId={user.id}
        teachers={teachers}
        schoolId={schoolId}
      />
    </div>
  )
}
