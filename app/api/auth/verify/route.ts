import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { verifyEmailCode } from '@/lib/email-verification'

async function findUserByEmail(email: string) {
  let page = 1

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000,
    })

    if (error) {
      console.error('Failed to list users before verify:', error)
      return null
    }

    const found = data.users.find((user) => user.email?.toLowerCase() === email)
    if (found) return found
    if (data.users.length < 1000) return null
    page += 1
  }
}

async function createSession(email: string) {
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  const emailOtp = linkData?.properties?.email_otp
  if (linkError || !emailOtp) {
    console.error('Failed to generate login link after verification:', linkError)
    return null
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: emailOtp,
    type: 'magiclink',
  })

  if (error || !data.session) {
    console.error('Failed to create session after verification:', error)
    return null
  }

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const normalizedToken = typeof token === 'string' ? token.trim() : ''

    if (!normalizedEmail || !/^\d{6}$/.test(normalizedToken)) {
      return NextResponse.json({ error: '请填写 6 位验证码' }, { status: 400 })
    }

    const result = await verifyEmailCode(normalizedEmail, normalizedToken)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const user = await findUserByEmail(normalizedEmail)
    if (!user) {
      return NextResponse.json({ error: '账号不存在，请重新注册' }, { status: 404 })
    }

    if (!user.email_confirmed_at) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
        user_metadata: {
          ...(user.user_metadata || {}),
          pending_email_verification: false,
        },
      })

      if (error) {
        console.error('Failed to confirm user email:', error)
        return NextResponse.json({ error: '邮箱验证失败，请稍后重试' }, { status: 500 })
      }
    }

    const session = await createSession(normalizedEmail)
    if (!session) {
      return NextResponse.json({ ok: true, needsLogin: true })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Verify API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '验证失败，请稍后重试' },
      { status: 500 }
    )
  }
}
