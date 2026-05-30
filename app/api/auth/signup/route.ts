import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

async function findUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (error) {
    console.error('Failed to list users before signup:', error)
    return null
  }

  return data.users.find((user) => user.email?.toLowerCase() === email) || null
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: '请填写邮箱和密码' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少需要 6 个字符' }, { status: 400 })
    }

    const existingUser = await findUserByEmail(normalizedEmail)
    if (existingUser?.email_confirmed_at) {
      return NextResponse.json(
        { error: '该邮箱已注册，请直接登录', code: 'USER_ALREADY_REGISTERED' },
        { status: 409 }
      )
    }

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    })

    if (error) {
      const isRateLimited =
        error.message.includes('email rate limit exceeded') ||
        error.message.includes('For security purposes')

      return NextResponse.json(
        {
          error: isRateLimited
            ? '验证码发送太频繁，请稍后再试。如果刚刚已经收到验证码，请直接输入验证码。'
            : error.message,
          code: isRateLimited ? 'EMAIL_RATE_LIMITED' : 'SIGNUP_FAILED',
        },
        { status: isRateLimited ? 429 : 400 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 })
  }
}
