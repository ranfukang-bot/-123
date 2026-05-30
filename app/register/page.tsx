'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { withClientTimeout } from '@/lib/client-timeout'

const PENDING_SIGNUP_EMAIL_KEY = 'promptreel_pending_signup_email'
const PENDING_SIGNUP_UNLOCK_AT_KEY = 'promptreel_pending_signup_unlock_at'
const DEFAULT_RATE_LIMIT_SECONDS = 60 * 60

const getStoredPendingSignup = () => {
  if (typeof window === 'undefined') {
    return { email: '', step: 'form' as const, countdown: 0 }
  }

  const pendingEmail = window.localStorage.getItem(PENDING_SIGNUP_EMAIL_KEY) || ''
  const unlockAt = Number(window.localStorage.getItem(PENDING_SIGNUP_UNLOCK_AT_KEY) || '0')
  const countdown = Math.max(0, Math.ceil((unlockAt - Date.now()) / 1000))

  return {
    email: pendingEmail,
    step: pendingEmail ? 'verify' as const : 'form' as const,
    countdown,
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const [initialSignup] = useState(getStoredPendingSignup)
  const [step, setStep] = useState<'form' | 'verify'>(initialSignup.step)
  const [email, setEmail] = useState(initialSignup.email)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(initialSignup.countdown)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 倒计时
  const startCountdown = (seconds: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setCountdown(seconds)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    if (initialSignup.countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [initialSignup.countdown])

  const savePendingSignup = (emailValue: string, cooldownSeconds: number) => {
    window.localStorage.setItem(PENDING_SIGNUP_EMAIL_KEY, emailValue)
    window.localStorage.setItem(
      PENDING_SIGNUP_UNLOCK_AT_KEY,
      String(Date.now() + cooldownSeconds * 1000)
    )
  }

  const clearPendingSignup = () => {
    window.localStorage.removeItem(PENDING_SIGNUP_EMAIL_KEY)
    window.localStorage.removeItem(PENDING_SIGNUP_UNLOCK_AT_KEY)
  }

  const getRateLimitSeconds = (message: string) => {
    const exactMatch = message.match(/after\s+(\d+)\s+seconds?/i)
    if (exactMatch) {
      return Number(exactMatch[1])
    }

    if (message.includes('For security purposes') || message.includes('email rate limit exceeded')) {
      return DEFAULT_RATE_LIMIT_SECONDS
    }

    return 60
  }

  const getFriendlyAuthError = (message: string) => {
    if (message === 'Failed to fetch') {
      return '网络请求失败，请稍后重试'
    }

    if (message === 'User already registered') {
      return '该邮箱已注册，请直接登录'
    }

    if (message.includes('For security purposes') || message.includes('email rate limit exceeded')) {
      return '验证码发送太频繁，请稍后再试'
    }

    return message
  }

  const formatCountdown = (seconds: number) => {
    if (seconds >= 90) {
      return `约 ${Math.ceil(seconds / 60)} 分钟后可重新发送`
    }

    return `${seconds} 秒后可重新发送`
  }

  const isRateLimitError = (message: string) =>
    message.includes('For security purposes') || message.includes('email rate limit exceeded')

  // 第一步：注册并发送验证码
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const normalizedEmail = email.trim().toLowerCase()

    try {
      if (password.length < 6) {
        setError('密码至少需要 6 个字符')
        return
      }

      // 注册账号。Supabase 会发送 signup 验证码，避免再调用 signInWithOtp 触发限流。
      const { error: signUpError } = await withClientTimeout(
        supabase.auth.signUp({
          email: normalizedEmail,
          password,
        }),
        '注册请求超时。当前网络可能无法连接认证服务，请稍后重试。'
      )

      if (signUpError) {
        if (isRateLimitError(signUpError.message)) {
          const seconds = getRateLimitSeconds(signUpError.message)
          setEmail(normalizedEmail)
          savePendingSignup(normalizedEmail, seconds)
          setStep('verify')
          startCountdown(seconds)
          setError('验证码发送太频繁，请先不要反复点击。若刚才已经收到邮件，请直接输入邮件里的验证码。')
          return
        }

        setError(getFriendlyAuthError(signUpError.message))
        return
      }

      // 进入验证码输入步骤
      setEmail(normalizedEmail)
      savePendingSignup(normalizedEmail, 60)
      setStep('verify')
      startCountdown(60)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 重新发送验证码
  const handleResend = async () => {
    if (countdown > 0) return
    setLoading(true)
    setError('')
    const normalizedEmail = email.trim().toLowerCase()

    try {
      const { error } = await withClientTimeout(
        supabase.auth.resend({
          type: 'signup',
          email: normalizedEmail,
        }),
        '验证码发送请求超时，请稍后重试。'
      )

      if (error) {
        if (isRateLimitError(error.message)) {
          const seconds = getRateLimitSeconds(error.message)
          savePendingSignup(normalizedEmail, seconds)
          startCountdown(seconds)
        }
        setError('发送失败：' + getFriendlyAuthError(error.message))
      } else {
        savePendingSignup(normalizedEmail, 60)
        startCountdown(60)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '发送失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 第二步：验证验证码
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (otpCode.length !== 6) {
        setError('请输入 6 位验证码')
        return
      }

      const { error } = await withClientTimeout(
        supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: 'signup',
        }),
        '验证码验证请求超时，请稍后重试。'
      )

      if (error) {
        setError('验证码错误或已过期')
        return
      }

      // 验证成功，跳转到工作台
      clearPendingSignup()
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '验证失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 验证码输入步骤
  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl animated-gradient flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">PromptReel</span>
            </Link>
            <h1 className="text-2xl font-bold">验证邮箱</h1>
            <p className="text-gray-500 mt-1">
              验证码已发送至 <span className="font-medium text-gray-700">{email}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">输入 6 位验证码</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-center text-2xl tracking-[0.5em] font-mono"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full gradient-btn text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  '验证并注册'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={handleResend}
                disabled={countdown > 0 || loading}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? formatCountdown(countdown) : '重新发送验证码'}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearPendingSignup()
                  setStep('form')
                  setOtpCode('')
                  setError('')
                  setCountdown(0)
                }}
                className="block mx-auto mt-3 text-xs text-gray-400 hover:text-gray-600"
              >
                换一个邮箱
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 注册表单步骤
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl animated-gradient flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">PromptReel</span>
          </Link>
          <h1 className="text-2xl font-bold">创建账号</h1>
          <p className="text-gray-500 mt-1">注册即可获得 3 次免费体验</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 个字符"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  注册
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            已有账号？{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
