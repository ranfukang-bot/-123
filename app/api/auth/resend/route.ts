import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendVerificationEmail } from '@/lib/email'
import {
  createEmailVerificationCode,
  saveEmailVerificationCode,
} from '@/lib/email-verification'

async function findUserByEmail(email: string) {
  let page = 1

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000,
    })

    if (error) {
      console.error('Failed to list users before resend:', error)
      return null
    }

    const found = data.users.find((user) => user.email?.toLowerCase() === email)
    if (found) return found
    if (data.users.length < 1000) return null
    page += 1
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (typeof email !== 'string' || !normalizedEmail) {
      return NextResponse.json({ error: '请填写邮箱' }, { status: 400 })
    }

    const user = await findUserByEmail(normalizedEmail)
    if (!user) {
      return NextResponse.json({ error: '该邮箱尚未注册，请先填写密码注册' }, { status: 404 })
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({ error: '该邮箱已验证，请直接登录' }, { status: 409 })
    }

    const code = createEmailVerificationCode()
    const { ttlSeconds } = await saveEmailVerificationCode(normalizedEmail, code)
    await sendVerificationEmail({ email: normalizedEmail, code })

    return NextResponse.json({ ok: true, cooldownSeconds: 60, expiresInSeconds: ttlSeconds })
  } catch (error) {
    console.error('Resend API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '发送失败，请稍后重试' },
      { status: 500 }
    )
  }
}
