'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset-sent'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getFriendlyAuthError = (message: string) => {
    if (message === 'Invalid login credentials') {
      return '邮箱或密码错误'
    }

    if (message === 'Email not confirmed') {
      return '邮箱还没有验证，请先完成邮箱验证'
    }

    if (message === 'Failed to fetch') {
      return '网络请求失败，请稍后重试'
    }

    return message
  }

  // 登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(getFriendlyAuthError(error.message))
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  // 发送重置密码邮件
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    if (error) {
      setError(getFriendlyAuthError(error.message))
      setLoading(false)
      return
    }

    setMode('reset-sent')
    setLoading(false)
  }

  // 忘记密码 - 已发送页面
  if (mode === 'reset-sent') {
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
            <h1 className="text-2xl font-bold">邮件已发送</h1>
            <p className="text-gray-500 mt-1">
              重置密码链接已发送至 <span className="font-medium text-gray-700">{email}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg text-center">
            <p className="text-sm text-gray-600 mb-6">
              请检查你的邮箱，点击邮件中的链接重置密码。重置完成后回来登录。
            </p>
            <button
              onClick={() => setMode('login')}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              返回登录
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 忘记密码表单
  if (mode === 'forgot') {
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
            <h1 className="text-2xl font-bold">忘记密码</h1>
            <p className="text-gray-500 mt-1">输入邮箱，我们将发送重置密码链接</p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
            <form onSubmit={handleForgotPassword} className="space-y-5">
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
                disabled={loading}
                className="w-full gradient-btn text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  '发送重置链接'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setMode('login'); setError('') }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                返回登录
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 登录表单
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
          <h1 className="text-2xl font-bold">欢迎回来</h1>
          <p className="text-gray-500 mt-1">登录你的账号继续使用</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-5">
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">密码</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError('') }}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  忘记密码？
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码"
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
                  登录
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            还没有账号？{' '}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
              免费注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
