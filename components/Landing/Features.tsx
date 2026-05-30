import { Camera, Palette, FileText, Zap, Shield, Layers } from 'lucide-react'

const features = [
  {
    icon: Camera,
    title: '智能图片分析',
    description: '上传商品图片，AI 自动识别商品类型、材质、颜色等关键特征，精准理解商品卖点。',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: FileText,
    title: '10 大模块输出',
    description: '严格按照视频类型、画面风格、场景环境、镜头语言等十大模块生成结构化提示词，专业完整。',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Palette,
    title: '多风格支持',
    description: '支持 Vlog 种草、产品展示、生活方式纪录片、快节奏卡点、ASMR 等多种视频风格。',
    color: 'from-pink-500 to-red-500',
  },
  {
    icon: Layers,
    title: '商品类型覆盖',
    description: '服装、美妆、数码、家居、食品等主流商品类型全覆盖，内置最佳实践模板。',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Zap,
    title: '极速生成',
    description: '5 秒内完成分析和生成，无需等待。支持一键复制，直接粘贴到 AI 视频工具使用。',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: '专业可执行',
    description: '使用专业摄影术语，描述清晰具体，确保 Runway、Pika、Sora 等工具能够准确理解并生成。',
    color: 'from-green-500 to-emerald-500',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
            <span className="text-sm text-indigo-700 font-medium">核心功能</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            为什么选择 <span className="gradient-text">PromptReel</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            从商品图片到专业视频提示词，一站式解决你的带货视频创作需求
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="card-hover bg-white rounded-2xl p-6 border border-gray-100"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
