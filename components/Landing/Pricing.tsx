import Link from 'next/link'
import { Check, Crown } from 'lucide-react'

const plans = [
  {
    name: '免费体验',
    price: '¥0',
    description: '验证效果',
    credits: '3 次',
    features: ['完整提示词输出', '5 种视频类型', '历史记录保存'],
    cta: '免费开始',
    ctaLink: '/register',
  },
  {
    name: '基础版',
    price: '¥29',
    description: '个人带货账号',
    credits: '50 次/月',
    features: ['全部基础能力', '多平台适配建议', '商品类型智能识别'],
    cta: '选择基础版',
    ctaLink: '/register',
  },
  {
    name: '专业版',
    price: '¥69',
    description: '团队日常出片',
    credits: '200 次/月',
    features: ['更高生成额度', '高级分镜脚本', '专属客服支持'],
    cta: '选择专业版',
    ctaLink: '/register',
    popular: true,
  },
  {
    name: '无限版',
    price: '¥129',
    description: '批量测试素材',
    credits: '不限次数',
    features: ['不限次数生成', '开放接口调用（API）', '优先体验新功能'],
    cta: '选择无限版',
    ctaLink: '/register',
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#2454d6]">套餐价格</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              从免费体验开始，按出片规模升级
            </h2>
          </div>
          <Link href="/pricing" className="text-sm font-semibold text-[#2454d6] hover:text-[#173b98]">
            查看完整套餐
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 ${
                plan.popular ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-200 bg-[#fbfcfe] text-gray-950'
              }`}
            >
              {plan.popular && (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white">
                  <Crown className="h-3.5 w-3.5" />
                  推荐
                </div>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className={`mt-2 text-sm ${plan.popular ? 'text-gray-300' : 'text-gray-500'}`}>{plan.description}</p>
              <div className="mt-6 flex items-end gap-1">
                <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                {plan.price !== '¥0' && <span className={`pb-1 text-sm ${plan.popular ? 'text-gray-300' : 'text-gray-500'}`}>/月</span>}
              </div>
              <p className={`mt-2 text-sm font-medium ${plan.popular ? 'text-white' : 'text-[#2454d6]'}`}>{plan.credits}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className={`flex items-start gap-2 text-sm ${plan.popular ? 'text-gray-200' : 'text-gray-600'}`}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0f9f7a]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaLink}
                className={`mt-8 block rounded-xl px-4 py-2.5 text-center text-sm font-semibold ${
                  plan.popular ? 'bg-white text-gray-950 hover:bg-gray-100' : 'border border-gray-300 bg-white text-gray-800 hover:border-gray-400'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
