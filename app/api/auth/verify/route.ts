import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (typeof email !== 'string' || typeof token !== 'string') {
      return NextResponse.json({ error: '请填写验证码' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: 'signup',
    })

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || '验证码错误或已过期' }, { status: 400 })
    }

    return NextResponse.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    })
  } catch (error) {
    console.error('Verify API error:', error)
    return NextResponse.json({ error: '验证失败，请稍后重试' }, { status: 500 })
  }
}
