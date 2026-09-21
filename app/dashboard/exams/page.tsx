import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import ExamsFilters from './ExamsFilters'

export default async function ExamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin'
  const isDirector = profile?.role === 'director'
  const isStudent = profile?.role === 'student'

  let exams: any[] = []

  if (isTeacher) {
    const { data } = await supabase
      .from('exams')
      .select('*, subjects(name, icon)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
    exams = data || []
  } else if (isDirector) {
    const { data } = await supabase
      .from('exams')
      .select('*, subjects(name, icon), profiles:teacher_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(100)
    exams = data || []
  } else if (isStudent) {
    const { data } = await supabase
      .from('exams')
      .select('*, subjects(name, icon), profiles:teacher_id(full_name)')
      .eq('is_published', true)
      .eq('grade_level', profile?.grade_level)
      .order('created_at', { ascending: false })
    exams = data || []
  }

  // Şagirdin cəhdləri
  let attempts: any[] = []
  let payments: any[] = []

  if (isStudent) {
    const { data: att } = await supabase
      .from('attempts')
      .select('exam_id, status, percentage')
      .eq('student_id', user.id)
    attempts = att || []

    const { data: pay } = await supabase
      .from('payments')
      .select('exam_id, status')
      .eq('student_id', user.id)
      .eq('status', 'paid')
    payments = pay || []
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ═══ HEADER BANNER ═══ */}
      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <p className="text-xs text-gray-500 mb-2">
              <Link href="/dashboard" className="hover:text-green-600">Ana səhifə</Link>
              <span className="mx-2">/</span>
              <span className="text-green-600 font-medium">
                {isTeacher ? 'İmtahanlarım' : 'İmtahanlarımız'}
              </span>
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {isTeacher ? 'İmtahanlarım' : 'İmtahanlarımız'}
            </h1>
            <div className="w-16 h-1 bg-green-500 mb-4"></div>
            <p className="text-sm text-gray-600 leading-relaxed max-w-md">
              {isTeacher
                ? 'Yaratdığınız imtahanları burada idarə edin. Sual əlavə edin, nəticələrə baxın.'
                : 'Sizə uyğun imtahanı seçin, mövzularla tanış olun və imtahana başlayın.'}
            </p>
          </div>

          <div className="hidden md:flex justify-center">
            <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-lg bg-white p-2">
              <Image
                src="/images/hero-1.jpg"
                alt="İmtahan"
                width={200}
                height={200}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Müəllim üçün: Yeni imtahan düyməsi */}
      {isTeacher && (
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div className="text-sm text-gray-600">
            <strong className="text-gray-900">{exams.length}</strong> imtahan
          </div>
          <Link
            href="/dashboard/exams/new"
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
          >
            ➕ Yeni imtahan yarat
          </Link>
        </div>
      )}

      <ExamsFilters
        exams={exams}
        role={profile?.role}
        attempts={attempts}
        payments={payments}
      />
    </div>
  )
}
