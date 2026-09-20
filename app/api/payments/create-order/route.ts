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
    const examId = body.examId as string | undefined
    const amount = Number(body.amount)

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Minimum məbləğ 1 AZN-dir' }, { status: 400 })
    }

    const secretKey = process.env.PAYRIFF_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Payriff konfiqurasiyası yoxdur' }, { status: 500 })
    }

    // 1. Ödəniş qeydini yarat (pending)
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        student_id: user.id,
        exam_id: examId || null,
        amount,
        currency: 'AZN',
        status: 'pending',
        provider: 'payriff',
      })
      .select()
      .single()

    if (error || !payment) {
      return NextResponse.json({ error: error?.message || 'Ödəniş yaradıla bilmədi' }, { status: 500 })
    }

    // 2. Payriff V3 API-yə müraciət
    const callbackUrl = `${process.env.PAYRIFF_CALLBACK_URL}?paymentId=${payment.id}`

    const payriffBody = {
      amount,
      currency: 'AZN',
      language: 'AZ',
      description: `BrainTech ödəniş #${payment.id.slice(0, 8)}`,
      callbackUrl,
      operation: 'PURCHASE',
    }

    const payriffRes = await fetch('https://api.payriff.com/api/v3/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': secretKey,
      },
      body: JSON.stringify(payriffBody),
    })

    const payriffData = await payriffRes.json()

    if (!payriffRes.ok || !payriffData.payload) {
      console.error('Payriff xətası:', payriffData)
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id)
      return NextResponse.json({
        error: payriffData.message || 'Payriff cavabı yanlışdır'
      }, { status: 500 })
    }

    const paymentUrl = payriffData.payload.paymentUrl
    const orderId = payriffData.payload.orderId

    if (!paymentUrl || !orderId) {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id)
      return NextResponse.json({ error: 'Payriff linki alına bilmədi' }, { status: 500 })
    }

    // 3. Ödənişi yenilə
    await supabase
      .from('payments')
      .update({
        provider_order_id: String(orderId),
        payment_url: paymentUrl,
      })
      .eq('id', payment.id)

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      orderId: String(orderId),
      paymentUrl,
    })
  } catch (err: any) {
    console.error('Create-order xətası:', err)
    return NextResponse.json({ error: err.message || 'Xəta' }, { status: 500 })
  }
}
