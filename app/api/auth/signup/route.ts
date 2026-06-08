import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { assertEmailServiceConfigured, sendVerificationEmail } from '@/lib/email'
import {
  assertEmailVerificationTableReady,
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
      console.error('Failed to list users before signup:', error)
      return null
    }

    const found = data.users.find((user) => user.email?.toLowerCase() === email)
    if (found) return found
    if (data.users.length < 1000) return null
    page += 1
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: '请填写邮箱和密码' }, { status: 400 })
    }

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少需要 6 个字符' }, { status: 400 })
    }

    assertEmailServiceConfigured()
    await assertEmailVerificationTableReady()

    const existingUser = await findUserByEmail(normalizedEmail)
    if (existingUser?.email_confirmed_at) {
      return NextResponse.json(
        { error: '该邮箱已注册，请直接登录', code: 'USER_ALREADY_REGISTERED' },
        { status: 409 }
      )
    }

    if (existingUser) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password,
        user_metadata: {
          ...(existingUser.user_metadata || {}),
          pending_email_verification: true,
        },
      })

      if (error) {
        console.error('Failed to update pending user:', error)
        return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 })
      }
    } else {
      const { error } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: false,
        user_metadata: {
          pending_email_verification: true,
        },
      })

      if (error) {
        console.error('Failed to create user:', error)
        return NextResponse.json({ error: error.message || '注册失败，请稍后重试' }, { status: 400 })
      }
    }

    const code = createEmailVerificationCode()
    const { ttlSeconds } = await saveEmailVerificationCode(normalizedEmail, code)
    await sendVerificationEmail({ email: normalizedEmail, code })

    return NextResponse.json({ ok: true, cooldownSeconds: 60, expiresInSeconds: ttlSeconds })
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}
