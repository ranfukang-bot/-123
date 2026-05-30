import { Copy, FileCheck2, Upload } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: '输入商品资料',
    description: '上传商品图，填写商品名、目标平台和想强调的卖点。',
  },
  {
    icon: FileCheck2,
    title: '生成拍摄方案',
    description: 'AI 输出视频定位、镜头调度、场景、动作、声音和技术参数。',
  },
  {
    icon: Copy,
    title: '复制到视频工具',
    description: '直接用于 Runway、Pika、Sora、Kling 等视频生成工具。',
  },
]

export default function HowItWorks() {
  return (
    <section id="workflow" className="bg-[#f7f8fb] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-[#0f9f7a]">工作流程</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              从商品到视频，只保留必要步骤
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-600">
              设计重点不是炫技，而是让运营人员第一次打开也知道下一步该做什么。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="surface rounded-2xl bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-950">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-300">0{index + 1}</span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-gray-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
