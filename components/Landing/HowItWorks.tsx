import { Copy, FileCheck2, Upload } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: '输入商品资料',
    description: '上传商品图，填写商品名称、目标平台和需要强调的卖点。',
  },
  {
    icon: FileCheck2,
    title: '生成拍摄方案',
    description: 'AI 输出视频定位、镜头调度、场景、动作、声音和技术参数。',
  },
  {
    icon: Copy,
    title: '复制到视频工具',
    description: '直接用于 Runway、Pika、Sora、Kling 等视频生成工具，也能交给剪辑团队执行。',
  },
]

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[#080b12] py-24 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(54,240,170,0.12),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(91,124,255,0.14),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-emerald-200">工作流程</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              三步生成视频方案
            </h1>
            <p className="mt-5 text-base leading-7 text-white/62">
              上传素材，生成方案，复制使用。流程保持简单，运营人员第一次打开也能顺着做下去。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/20 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#080b12]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-white/22">0{index + 1}</span>
                  </div>
                  <h2 className="mt-6 text-lg font-semibold">{step.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/62">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-14 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="grid gap-4 md:grid-cols-3">
            {['商品识别', '分镜脚本', '成片提示词'].map((item, index) => (
              <div key={item} className="rounded-2xl bg-[#111827] p-5">
                <p className="text-xs font-semibold text-cyan-200">Step 0{index + 1}</p>
                <h3 className="mt-3 text-xl font-semibold">{item}</h3>
                <div className="mt-5 space-y-2">
                  <div className="h-2 rounded-full bg-white/16" />
                  <div className="h-2 w-4/5 rounded-full bg-white/10" />
                  <div className="h-2 w-2/3 rounded-full bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
