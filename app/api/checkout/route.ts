import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { createCheckout, PLAN_VARIANTS } from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 })
    }

    // Get plan from body
    const { plan } = await request.json()

    if (!plan || !(plan in PLAN_VARIANTS)) {
      return NextResponse.json({ error: '无效的套餐' }, { status: 400 })
    }

    if (!PLAN_VARIANTS[plan]) {
      return NextResponse.json(
        { error: '该套餐暂未配置支付 ID，请先补充 LemonSqueezy Variant ID' },
        { status: 503 }
      )
    }

    // Create checkout
    const checkoutUrl = await createCheckout({
      variantId: PLAN_VARIANTS[plan],
      userId: user.id,
      userEmail: user.email || '',
    })

    return NextResponse.json({ url: checkoutUrl })
  } catch (error: unknown) {
    console.error('Checkout error:', error)
    const errorMessage = error instanceof Error ? error.message : '创建支付失败'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
