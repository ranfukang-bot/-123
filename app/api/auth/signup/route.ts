import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: '请填写邮箱和密码' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少需要 6 个字符' }, { status: 400 })
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 })
  }
}
