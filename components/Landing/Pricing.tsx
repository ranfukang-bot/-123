import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'

const plans = [
  {
    name: '免费体验',
    price: '¥0',
    period: '',
    description: '先试试看效果',
    credits: '3 次/月',
    features: [
      '基础视频提示词生成',
      '支持 5 种视频风格',
      '10 大模块完整输出',
      '一键复制功能',
    ],
    cta: '免费开始',
    ctaLink: '/register',
    popular: false,
    gradient: '',
  },
  {
    name: '基础版',
    price: '¥29',
    period: '/月',
    description: '适合个人带货博主',
    credits: '50 次/月',
    features: [
      '全部免费版功能',
      '优先响应速度',
      '历史记录保存',
      '商品类型智能识别',
      '多平台适配建议',
    ],
    cta: '选择基础版',
    ctaLink: '/register',
    popular: false,
    gradient: '',
  },
  {
    name: '专业版',
    price: '¥69',
    period: '/月',
    description: '适合专业 MCN 机构',
    credits: '200 次/月',
    features: [
      '全部基础版功能',
      '最高优先级响应',
      '批量生成支持',
      '专属客服支持',
      '高级分镜脚本',
      '定制化风格模板',
    ],
    cta: '选择专业版',
    ctaLink: '/register',
    popular: true,
    gradient: 'from-indigo-500 via-purple-500 to-cyan-500',
  },
  {
    name: '无限版',
    price: '¥129',
    period: '/月',
    description: '无限量使用',
    credits: '不限次数',
    features: [
      '全部专业版功能',
      '无限次生成',
      '开放接口调用（API）',
      '专属培训服务',
      '优先体验新功能',
      '定制化需求响应',
    ],
    cta: '选择无限版',
    ctaLink: '/register',
    popular: false,
    gradient: '',
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
            <span className="text-sm text-purple-700 font-medium">灵活定价</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            选择适合你的 <span className="gradient-text">套餐</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            从免费体验到无限使用，满足不同规模的带货视频创作需求
          </p>
        </div>

        {/* Pricing Grid */}
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
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full animated-gradient text-white text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    最受欢迎
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <div className="mt-2 text-sm text-indigo-600 font-medium">{plan.credits}</div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.ctaLink}
                className={`block text-center py-2.5 rounded-full text-sm font-medium transition-all ${
                  plan.popular
                    ? 'gradient-btn text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
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
