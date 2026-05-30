'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Landing/Navbar'
import Footer from '@/components/Landing/Footer'
import { Check, Sparkles, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const plans = [
  {
    name: '免费体验',
    price: '¥0',
    period: '',
    description: '先试试看效果',
    credits: '3 次/月',
    planKey: 'free',
    features: [
      '基础视频提示词生成',
      '支持 5 种视频风格',
      '10 大模块完整输出',
      '一键复制功能',
    ],
    popular: false,
  },
  {
    name: '基础版',
    price: '¥29',
    period: '/月',
    description: '适合个人带货博主',
    credits: '50 次/月',
    planKey: 'basic',
    features: [
      '全部免费版功能',
      '优先响应速度',
      '历史记录保存',
      '商品类型智能识别',
      '多平台适配建议',
    ],
    popular: false,
  },
  {
    name: '专业版',
    price: '¥69',
    period: '/月',
    description: '适合专业 MCN 机构',
    credits: '200 次/月',
    planKey: 'pro',
    features: [
      '全部基础版功能',
      '最高优先级响应',
      '批量生成支持',
      '专属客服支持',
      '高级分镜脚本',
      '定制化风格模板',
    ],
    popular: true,
  },
  {
    name: '无限版',
    price: '¥129',
    period: '/月',
    description: '无限量使用',
    credits: '不限次数',
    planKey: 'unlimited',
    features: [
      '全部专业版功能',
      '无限次生成',
      '开放接口调用（API）',
      '专属培训服务',
      '优先体验新功能',
      '定制化需求响应',
    ],
    popular: false,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planKey: string) => {
    if (planKey === 'free') {
      router.push('/register')
      return
    }

    setLoading(planKey)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: planKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '创建支付失败')
      }

      window.location.assign(data.url)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '支付失败，请重试')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
              <span className="text-sm text-purple-700 font-medium">灵活定价</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              选择适合你的 <span className="gradient-text">套餐</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              从免费体验到无限使用，满足不同规模的带货视频创作需求
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl border ${
                  plan.popular
                    ? 'border-indigo-200 shadow-lg shadow-indigo-100'
                    : 'border-gray-100'
                } p-6 card-hover`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full animated-gradient text-white text-xs font-medium">
                      <Sparkles className="w-3 h-3" />
                      最受欢迎
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>
                  <div className="mt-2 text-sm text-indigo-600 font-medium">{plan.credits}</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.planKey)}
                  disabled={loading === plan.planKey}
                  className={`w-full py-2.5 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'gradient-btn text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  } disabled:opacity-50`}
                >
                  {loading === plan.planKey ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : plan.planKey === 'free' ? (
                    '免费开始'
                  ) : (
                    '立即订阅'
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">常见问题</h2>
            <div className="space-y-6">
              {[
                {
                  q: '免费体验有什么限制？',
                  a: '注册后即可获得 3 次免费生成机会，可以体验全部功能。用完后需要升级套餐继续使用。',
                },
                {
                  q: '支持哪些支付方式？',
                  a: '支持支付宝、信用卡等主流支付方式，通过安全的第三方支付平台处理。',
                },
                {
                  q: '可以随时取消订阅吗？',
                  a: '可以，随时可以在账户管理中取消订阅。取消后当前周期内仍可正常使用。',
                },
                {
                  q: '生成的提示词可以用在哪些工具上？',
                  a: '支持 Runway、Pika、Sora、Kling 等主流 AI 视频生成工具，描述格式通用。',
                },
              ].map((faq) => (
                <div key={faq.q} className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
