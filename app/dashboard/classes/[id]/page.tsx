import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ClassDetail from './ClassDetail'

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: cls } = await supabase
    .from('classes')
    .select('*, profiles:teacher_id(full_name), schools(name, districts(name))')
    .eq('id', id)
    .single()

  if (!cls) notFound()

  // İcazə yoxlaması
  const isTeacher = cls.teacher_id === user.id
  const isDirector = profile?.role === 'director' || profile?.role === 'admin'
  if (!isTeacher && !isDirector) redirect('/dashboard/classes')

  // Sinif şagirdləri
  const { data: classStudents } = await supabase
    .from('class_students')
    .select('*, profiles:student_id(id, full_name, grade_level, class_index)')
    .eq('class_id', id)

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/dashboard/classes" className="text-indigo-600 hover:underline mb-4 inline-block text-sm">
        ← Siniflər
      </Link>

      <ClassDetail
        cls={cls}
        classStudents={classStudents || []}
        isDirector={isDirector}
      />
    </div>
  )
}
