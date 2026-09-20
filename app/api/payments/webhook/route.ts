import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET — istifadəçi Payriff-dən geri qayıdanda
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const paymentId = searchParams.get('paymentId')

  if (!paymentId) {
    return NextResponse.redirect(`${origin}/dashboard/balance?error=no_payment_id`)
  }

  // Ödəniş statusunu yoxla
  const supabase = await createClient()
  const { data: payment } = await supabase
    .from('payments')
    .select('status, exam_id')
    .eq('id', paymentId)
    .single()

  if (payment?.status === 'paid') {
    if (payment.exam_id) {
      return NextResponse.redirect(`${origin}/dashboard/exams/${payment.exam_id}?paid=1`)
    }
    return NextResponse.redirect(`${origin}/dashboard/balance?paid=1`)
  }

  // Ödəniş hələ təsdiqlənməyibsə — 2 saniyə gözlə və yoxla
  if (payment?.exam_id) {
    return NextResponse.redirect(`${origin}/dashboard/exams/${payment.exam_id}?pending=1`)
  }
  return NextResponse.redirect(`${origin}/dashboard/balance?pending=1`)
}

// POST — Payriff serverindən callback
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId yoxdur' }, { status: 400 })
    }

    const body = await request.json()
    const orderId = body.orderId || body.payload?.orderId

    if (!orderId) {
      return NextResponse.json({ error: 'orderId yoxdur' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (!payment) {
      return NextResponse.json({ error: 'Ödəniş tapılmadı' }, { status: 404 })
    }

    const secretKey = process.env.PAYRIFF_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Konfiqurasiya xətası' }, { status: 500 })
    }

    // Payriff-dən order statusunu yoxla
    const statusRes = await fetch(`https://api.payriff.com/api/v3/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': secretKey,
      },
    })

    const statusData = await statusRes.json()
    const status = statusData.payload?.paymentStatus

    if (status === 'PAID') {
      await supabase
        .from('payments')
        .update({
          status: 'paid',
          provider_payment_id: statusData.payload?.transactionId || null,
          paid_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
    } else if (['CANCELED', 'DECLINED', 'FAILED'].includes(status)) {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', paymentId)
    }

    return NextResponse.json({ success: true, status })
  } catch (err: any) {
    console.error('Webhook xətası:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
