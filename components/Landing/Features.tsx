import { Camera, FileText, Gauge, Layers, ShieldCheck, Users } from 'lucide-react'

const features = [
  {
    icon: Camera,
    title: '商品图智能拆解',
    description: '识别商品品类、材质、颜色、使用场景和可传播卖点，减少人工写脚本的前置时间。',
  },
  {
    icon: FileText,
    title: '结构化提示词',
    description: '按视频定位、镜头、场景、光线、动作、声音和避雷说明输出，团队可以直接复用。',
  },
  {
    icon: Layers,
    title: '多平台创作视角',
    description: '支持抖音、小红书、快手、视频号等平台语境，让同一商品能快速生成不同风格。',
  },
  {
    icon: Gauge,
    title: '节省试错成本',
    description: '把含糊的想法变成可执行描述，减少 AI 视频工具反复试错和低质量出片。',
  },
  {
    icon: Users,
    title: '适合团队协作',
    description: '历史记录保留每次生成结果，运营、剪辑、投手可以围绕同一份提示词推进。',
  },
  {
    icon: ShieldCheck,
    title: '服务端保护核心提示词',
    description: '系统提示词只在服务端注入，用户拿到的是结果，不暴露你的核心方法论。',
  },
]

export default function Features() {
  return (
    <section id="features" className="border-y border-gray-200 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#2454d6]">核心能力</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
            不是写几句漂亮话，而是输出能落地的创作方案
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600">
            正式上线的工具要让用户少想一步。PromptReel 把商品信息、平台语境和 AI 视频生成经验整理成可复用流程。
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="card-hover rounded-2xl border border-gray-200 bg-[#fbfcfe] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Icon className="h-5 w-5 text-[#2454d6]" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
