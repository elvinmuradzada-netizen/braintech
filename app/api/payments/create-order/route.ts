import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Giriş tələb olunur' }, { status: 401 })
    }

    const body = await request.json()
    const amount = Number(body.amount)

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Minimum məbləğ 1 AZN-dir' },
        { status: 400 }
      )
    }

    // Ödəniş qeydini yarat
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        student_id: user.id,
        amount,
        currency: 'AZN',
        status: 'pending',
        provider: 'payriff',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ⚠️ MÜVƏQQƏTİ: Payriff hələ qoşulmayıb
    // Test üçün ödənişi dərhal "paid" edək
    await supabase
      .from('payments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      // paymentUrl: 'https://payriff.com/...'  // Payriff əlavə edəndə
      paymentUrl: '/dashboard/balance?success=1', // test üçün
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
