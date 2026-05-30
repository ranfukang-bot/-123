'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, CreditCard, Zap, Crown, ArrowRight } from 'lucide-react'
import { authedFetch, clearStoredSession, getAccessToken } from '@/lib/client-auth'

interface Profile {
  email: string
  plan_type: string
  credits_remaining: number
  credits_total: number
  subscription_status: string
  current_period_end: string | null
}

const planNames: Record<string, string> = {
  free: '免费体验',
  basic: '基础版',
  pro: '专业版',
  unlimited: '无限版',
}

const planIcons: Record<string, typeof User> = {
  free: Zap,
  basic: CreditCard,
  pro: Crown,
  unlimited: Crown,
}

export default function AccountPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!getAccessToken()) {
        router.push('/login')
        return
      }

      const response = await authedFetch('/api/user')

      if (response.status === 401) {
        clearStoredSession()
        router.push('/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [router])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 mt-4">加载中...</p>
      </div>
    )
  }

  if (!profile) return null

  const PlanIcon = planIcons[profile.plan_type] || Zap
  const usagePercent = profile.credits_total > 0
    ? Math.round(((profile.credits_total - profile.credits_remaining) / profile.credits_total) * 100)
    : 0

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-950">账户管理</h1>
        <p className="text-gray-500 mt-1">管理你的账户信息和套餐</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="surface rounded-2xl bg-white p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-950 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{profile.email}</h2>
              <p className="text-sm text-gray-500">PromptReel 用户</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">当前套餐</span>
              <span className="flex items-center gap-2 font-medium">
                <PlanIcon className="w-4 h-4 text-indigo-600" />
                {planNames[profile.plan_type] || profile.plan_type}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">订阅状态</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                profile.subscription_status === 'active'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {profile.subscription_status === 'active' ? '生效中' : '未订阅'}
              </span>
            </div>
            {profile.current_period_end && (
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-sm text-gray-500">到期时间</span>
                <span className="text-sm font-medium">
                  {new Date(profile.current_period_end).toLocaleDateString('zh-CN')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Usage Card */}
        <div className="surface rounded-2xl bg-white p-6">
          <h3 className="font-semibold mb-6">使用情况</h3>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">已使用</span>
              <span className="text-sm font-medium">
                {profile.credits_total - profile.credits_remaining} / {profile.credits_total}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full animated-gradient transition-all duration-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          <div className="bg-[#f7f8fb] border border-gray-200 rounded-xl p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">剩余次数</div>
            <div className="text-3xl font-semibold text-[#2454d6]">{profile.credits_remaining}</div>
          </div>

          {profile.plan_type !== 'unlimited' && (
            <button
              onClick={() => router.push('/pricing')}
              className="w-full gradient-btn text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
            >
              升级套餐
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
