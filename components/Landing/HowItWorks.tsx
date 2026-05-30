import { Upload, Cpu, Copy } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    step: '01',
    title: '上传商品图片',
    description: '拍摄或上传你的商品图片，填写商品名称、目标平台等基本信息。',
    detail: '支持 JPG、PNG、WebP 格式，最大 10MB',
  },
  {
    icon: Cpu,
    step: '02',
    title: 'AI 智能分析',
    description: 'AI 自动分析商品特征，结合你选择的视频风格，生成专业级提示词。',
    detail: '5 秒内完成，10 大模块全覆盖',
  },
  {
    icon: Copy,
    step: '03',
    title: '复制使用',
    description: '一键复制生成的提示词，粘贴到 Runway、Pika、Sora 等 AI 视频工具中使用。',
    detail: '适配主流 AI 视频生成工具',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 mb-4">
            <span className="text-sm text-cyan-700 font-medium">简单三步</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            如何使用 <span className="gradient-text">PromptReel</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            无需专业知识，三步即可获得专业级 AI 视频提示词
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.step} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-200 to-cyan-200" />
                )}

                <div className="relative bg-white rounded-2xl p-8 border border-gray-100 text-center card-hover">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full animated-gradient flex items-center justify-center text-white text-sm font-bold">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-indigo-600" />
                  </div>

                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{step.description}</p>
                  <p className="text-xs text-gray-400">{step.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
