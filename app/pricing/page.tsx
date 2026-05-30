'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Landing/Navbar'
import Footer from '@/components/Landing/Footer'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { getAccessToken } from '@/lib/client-auth'

const plans = [
  {
    name: '免费体验',
    price: '¥0',
    description: '适合先验证生成质量',
    credits: '3 次',
    planKey: 'free',
    features: ['完整提示词生成', '支持 5 种视频类型', '历史记录保存', '一键复制'],
  },
  {
    name: '基础版',
    price: '¥29',
    description: '适合个人带货博主',
    credits: '50 次/月',
    planKey: 'basic',
    features: ['全部免费版功能', '优先响应速度', '商品类型智能识别', '多平台适配建议'],
  },
  {
    name: '专业版',
    price: '¥69',
    description: '适合专业 MCN 机构',
    credits: '200 次/月',
    planKey: 'pro',
    features: ['全部基础版功能', '最高优先级响应', '高级分镜脚本', '专属客服支持'],
    popular: true,
  },
  {
    name: '无限版',
    price: '¥129',
    description: '适合批量测试团队',
    credits: '不限次数',
    planKey: 'unlimited',
    features: ['全部专业版功能', '无限次生成', '开放接口调用（API）', '优先体验新功能'],
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
      const accessToken = getAccessToken()
      if (!accessToken) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
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
      <main className="bg-[#f7f8fb] pt-28">
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-[#2454d6]">价格方案</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
              按生成规模选择套餐
            </h1>
            <p className="mt-5 text-base leading-7 text-gray-600">
              先用免费次数验证效果，再根据账号数量、素材量和团队节奏升级。正式收费前会完成支付、发信和国内部署验收。
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 ${
                  plan.popular ? 'border-gray-950 bg-gray-950 text-white shadow-xl' : 'border-gray-200 bg-white text-gray-950'
                }`}
              >
                {plan.popular && (
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    推荐
                  </div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className={`mt-2 text-sm ${plan.popular ? 'text-gray-300' : 'text-gray-500'}`}>{plan.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                  {plan.planKey !== 'free' && <span className={`text-sm ${plan.popular ? 'text-gray-300' : 'text-gray-500'}`}> / 月</span>}
                </div>
                <p className={`mt-2 text-sm font-semibold ${plan.popular ? 'text-white' : 'text-[#2454d6]'}`}>{plan.credits}</p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-2 text-sm ${plan.popular ? 'text-gray-200' : 'text-gray-600'}`}>
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0f9f7a]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.planKey)}
                  disabled={loading === plan.planKey}
                  className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    plan.popular ? 'bg-white text-gray-950 hover:bg-gray-100' : 'border border-gray-300 bg-white text-gray-800 hover:border-gray-400'
                  } disabled:opacity-50`}
                >
                  {loading === plan.planKey ? <Loader2 className="h-4 w-4 animate-spin" /> : plan.planKey === 'free' ? '免费开始' : '立即订阅'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2">
            {[
              ['免费体验有什么限制？', '注册后获得 3 次完整生成机会，用完后需要升级套餐继续使用。'],
              ['生成结果能用于哪些工具？', '适配 Runway、Pika、Sora、Kling 等主流 AI 视频生成工具。'],
              ['可以随时取消订阅吗？', '可以。取消后当前周期内仍可正常使用，后续不再续费。'],
              ['国内用户能稳定使用吗？', '正式版会迁移到国内部署，并通过服务端代理减少海外直连。'],
            ].map(([q, a]) => (
              <div key={q} className="surface rounded-2xl bg-white p-6">
                <h3 className="font-semibold text-gray-950">{q}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
