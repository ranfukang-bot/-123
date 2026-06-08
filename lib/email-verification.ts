import crypto from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase'

const OTP_TTL_SECONDS = Number(process.env.EMAIL_OTP_TTL_SECONDS || 10 * 60)
const MAX_VERIFY_ATTEMPTS = 5

function getOtpSecret() {
  const secret = process.env.EMAIL_OTP_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) {
    throw new Error('验证码密钥尚未配置')
  }
  return secret
}

function hashCode(email: string, code: string) {
  return crypto
    .createHmac('sha256', getOtpSecret())
    .update(`${email}:${code}`)
    .digest('hex')
}

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export function createEmailVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString()
}

export async function assertEmailVerificationTableReady() {
  const { error } = await supabaseAdmin
    .from('email_verification_codes')
    .select('id')
    .limit(1)

  if (error) {
    console.error('Email verification table is not ready:', error)
    throw new Error('验证码数据表尚未创建，请先执行 supabase-email-verification.sql')
  }
}

export async function saveEmailVerificationCode(email: string, code: string) {
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString()
  const { error } = await supabaseAdmin
    .from('email_verification_codes')
    .insert({
      email,
      token_hash: hashCode(email, code),
      expires_at: expiresAt,
    })

  if (error) {
    console.error('Failed to save verification code:', error)
    throw new Error('验证码存储失败，请确认已执行 supabase-email-verification.sql')
  }

  return { expiresAt, ttlSeconds: OTP_TTL_SECONDS }
}

export async function verifyEmailCode(email: string, code: string) {
  const { data, error } = await supabaseAdmin
    .from('email_verification_codes')
    .select('id,email,token_hash,expires_at,attempts,consumed_at')
    .eq('email', email)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Failed to read verification code:', error)
    throw new Error('验证码验证失败，请确认已执行 supabase-email-verification.sql')
  }

  if (!data) {
    return { ok: false, error: '验证码错误或已过期' }
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    return { ok: false, error: '验证码已过期，请重新发送' }
  }

  if (Number(data.attempts || 0) >= MAX_VERIFY_ATTEMPTS) {
    return { ok: false, error: '验证码错误次数过多，请重新发送' }
  }

  const incomingHash = hashCode(email, code)
  if (!timingSafeEqual(incomingHash, data.token_hash)) {
    await supabaseAdmin
      .from('email_verification_codes')
      .update({ attempts: Number(data.attempts || 0) + 1 })
      .eq('id', data.id)

    return { ok: false, error: '验证码错误，请重新输入' }
  }

  const { error: updateError } = await supabaseAdmin
    .from('email_verification_codes')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', data.id)

  if (updateError) {
    console.error('Failed to consume verification code:', updateError)
    throw new Error('验证码验证失败，请稍后重试')
  }

  return { ok: true }
}
