import { Camera, FileText, Gauge, Layers, ShieldCheck, Users } from 'lucide-react'

const features = [
  {
    icon: Camera,
    title: '商品图智能拆解',
    description: '识别商品品类、材质、颜色、使用场景和传播卖点，减少从零写脚本的时间。',
  },
  {
    icon: FileText,
    title: '结构化视频提示词',
    description: '按视频定位、镜头、场景、光线、动作、声音和避雷说明输出，团队可以直接复用。',
  },
  {
    icon: Layers,
    title: '多平台创作视角',
    description: '围绕抖音、小红书、快手、视频号等平台语境，为同一商品生成不同表达方向。',
  },
  {
    icon: Gauge,
    title: '减少试错成本',
    description: '把含糊的想法变成可执行描述，减少 AI 视频工具反复试错和低质量出片。',
  },
  {
    icon: Users,
    title: '适合团队协作',
    description: '历史记录保留每次生成结果，运营、剪辑和投手可以围绕同一份方案推进。',
  },
  {
    icon: ShieldCheck,
    title: '服务端保护核心流程',
    description: '核心提示词在服务端注入，用户拿到的是结果，不暴露产品方法论。',
  },
]

export default function Features() {
  return (
    <section className="relative overflow-hidden bg-[#080b12] py-24 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:46px_46px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-cyan-200">核心能力</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            不只写文案，而是输出能落地的视频方案
          </h1>
          <p className="mt-5 text-base leading-7 text-white/62">
            PromptReel 把商品信息、平台语境和 AI 视频生成经验整理成可复用流程，让团队少想一步，直接进入创作。
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="card-hover rounded-2xl border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/20 backdrop-blur"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#080b12] shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-lg font-semibold">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/62">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
