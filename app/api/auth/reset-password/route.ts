import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, redirectTo } = await request.json()

    if (typeof email !== 'string') {
      return NextResponse.json({ error: '请填写邮箱' }, { status: 400 })
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: typeof redirectTo === 'string' ? redirectTo : undefined,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Reset password API error:', error)
    return NextResponse.json({ error: '发送失败，请稍后重试' }, { status: 500 })
  }
}
