import Link from 'next/link'
import { ArrowRight, CheckCircle2, ImagePlus, Layers3, Sparkles } from 'lucide-react'

const outputModules = ['视频定位', '卖点提炼', '镜头语言', '场景调度', '口播节奏']

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f7f8fb] pt-28">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700">
            <Sparkles className="h-4 w-4 text-[#2454d6]" />
            面向国内带货团队的 AI 创作工具
          </div>

          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
            把商品图变成
            <span className="block text-[#2454d6]">可直接拍摄的</span>
            <span className="block text-[#2454d6]">视频提示词</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-gray-600 sm:text-lg">
            PromptReel 帮你把商品卖点、镜头、场景、节奏和 AI 视频工具参数整理成结构化方案。适合短视频带货、商品种草、直播切片二创和团队批量出片。
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="gradient-btn inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white">
              开始生成
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 hover:border-gray-400">
              查看套餐
            </Link>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            {['注册送 3 次体验', '输出 10 个专业模块', '适配主流 AI 视频工具'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-[#0f9f7a]" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="surface overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#111827] px-5 py-4 text-white">
              <div>
                <p className="text-sm font-semibold">PromptReel 工作台</p>
                <p className="mt-1 text-xs text-gray-300">商品图分析 → 视频提示词</p>
              </div>
              <div className="hidden rounded-full bg-white/10 px-3 py-1 text-xs sm:block">Production Preview</div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[0.78fr_1fr]">
              <div className="border-b border-gray-200 p-5 lg:border-b-0 lg:border-r">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <ImagePlus className="h-4 w-4 text-[#2454d6]" />
                  商品输入
                </div>
                <div className="aspect-[4/3] rounded-xl border border-dashed border-gray-300 bg-[linear-gradient(135deg,#eef2ff,#f8fafc_48%,#ecfeff)] p-4">
                  <div className="flex h-full flex-col justify-between rounded-lg bg-white/70 p-4">
                    <div className="h-20 rounded-lg bg-[#111827]" />
                    <div>
                      <div className="h-3 w-3/4 rounded bg-gray-300" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">商品名称：夏季防晒夹克</div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">平台：抖音 / 小红书</div>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Layers3 className="h-4 w-4 text-[#0f9f7a]" />
                  结构化输出
                </div>
                <div className="space-y-3">
                  {outputModules.map((module, index) => (
                    <div key={module} className="rounded-xl border border-gray-200 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-900">[{module}]</span>
                        <span className="text-[11px] text-gray-400">0{index + 1}</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="h-2 rounded bg-gray-200" />
                        <div className="h-2 w-4/5 rounded bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 left-6 hidden rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg md:block">
            <p className="text-xs text-gray-500">今日生成</p>
            <p className="mt-1 text-xl font-semibold text-gray-950">128 条</p>
          </div>
        </div>
      </div>
    </section>
  )
}
