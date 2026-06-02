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
    description: '适合个人带货账号',
    credits: '50 次 / 月',
    planKey: 'basic',
    features: ['全部免费版功能', '优先响应速度', '商品类型智能识别', '多平台适配建议'],
  },
  {
    name: '专业版',
    price: '¥69',
    description: '适合专业 MCN 团队',
    credits: '200 次 / 月',
    planKey: 'pro',
    features: ['全部基础版功能', '最高优先级响应', '高级分镜脚本', '专属客服支持'],
    popular: true,
  },
  {
    name: '无限版',
    price: '¥129',
    description: '适合批量测试素材',
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
          Authorization: `Bearer ${accessToken}`,
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
      <main className="min-h-screen bg-[#080b12] pt-28 text-white">
        <section className="relative overflow-hidden pb-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:46px_46px]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-cyan-200">价格方案</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
                按生成规模选择套餐
              </h1>
              <p className="mt-5 text-base leading-7 text-white/62">
                先用免费次数验证效果，再根据账号数量、素材量和团队节奏升级。订阅入口会在支付配置完成后正式开放。
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border p-6 shadow-2xl shadow-black/20 ${
                    plan.popular
                      ? 'border-cyan-200/40 bg-white text-gray-950'
                      : 'border-white/10 bg-white/[0.055] text-white backdrop-blur'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gray-950 px-2.5 py-1 text-xs text-white">
                      <Sparkles className="h-3.5 w-3.5" />
                      推荐
                    </div>
                  )}
                  <h2 className="text-lg font-semibold">{plan.name}</h2>
                  <p className={`mt-2 text-sm ${plan.popular ? 'text-gray-500' : 'text-white/55'}`}>{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                    {plan.planKey !== 'free' && <span className={`text-sm ${plan.popular ? 'text-gray-500' : 'text-white/55'}`}> / 月</span>}
                  </div>
                  <p className={`mt-2 text-sm font-semibold ${plan.popular ? 'text-[#2454d6]' : 'text-cyan-200'}`}>{plan.credits}</p>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className={`flex items-start gap-2 text-sm ${plan.popular ? 'text-gray-600' : 'text-white/62'}`}>
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0f9f7a]" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.planKey)}
                    disabled={loading === plan.planKey}
                    className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                      plan.popular
                        ? 'bg-gray-950 text-white hover:bg-gray-800'
                        : 'border border-white/15 bg-white/10 text-white hover:bg-white/15'
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
                ['生成结果能用于哪些工具？', '适配 Runway、Pika、Sora、Kling 等主流 AI 视频生成工具，也适合给剪辑团队做执行脚本。'],
                ['可以随时取消订阅吗？', '可以。取消后当前周期内仍可正常使用，后续不再续费。'],
                ['国内用户能稳定使用吗？', '正式收费前会完成国内可访问性、支付、发信和服务端代理的上线检查。'],
              ].map(([q, a]) => (
                <div key={q} className="rounded-2xl border border-white/10 bg-white/[0.055] p-6 backdrop-blur">
                  <h2 className="font-semibold">{q}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/62">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
