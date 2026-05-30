import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: '请填写邮箱和密码' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || '登录失败' }, { status: 400 })
    }

    return NextResponse.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    })
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 })
  }
}
