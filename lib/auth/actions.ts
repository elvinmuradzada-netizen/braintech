'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════
export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ═══════════════════════════════════════════════════════════════
// REGISTER — Şagird, Müəllim, Direktor üçün məktəb məlumatları ilə
// ═══════════════════════════════════════════════════════════════
export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const role = (formData.get('role') as string) || 'student'
  const gradeLevel = formData.get('grade_level') as string
  const classIndex = formData.get('class_index') as string

  // Məktəb məlumatları
  const cityId = formData.get('city_id') as string
  const districtId = formData.get('district_id') as string
  const schoolId = formData.get('school_id') as string
  const institutionName = formData.get('institution_name') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        grade_level: gradeLevel || null,
        class_index: classIndex || null,
        city_id: cityId || null,
        district_id: districtId || null,
        school_id: schoolId || null,
        institution_name: institutionName || null,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ═══════════════════════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════════════════════
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ═══════════════════════════════════════════════════════════════
// RESET PASSWORD
// ═══════════════════════════════════════════════════════════════
export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'E-poçt tələb olunur' }
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

// ═══════════════════════════════════════════════════════════════
// UPDATE PASSWORD
// ═══════════════════════════════════════════════════════════════
export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!password || password.length < 6) {
    return { error: 'Şifrə minimum 6 simvol olmalıdır' }
  }

  if (password !== confirmPassword) {
    return { error: 'Şifrələr uyğun deyil' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
