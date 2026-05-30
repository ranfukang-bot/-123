import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Clapperboard,
  ImagePlus,
  MousePointerClick,
  Sparkles,
} from 'lucide-react'

const promptBlocks = ['商品识别', '卖点提炼', '分镜脚本', '镜头语言', '成片口播']

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#080b12] pt-24 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:46px_46px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="hero-scanline" />

      <div className="relative mx-auto grid min-h-[760px] max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-sm font-medium text-white/80 shadow-2xl shadow-blue-950/30 backdrop-blur">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            面向国内带货团队的 AI 视频创作台
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            把商品图变成
            <span className="block text-transparent bg-clip-text bg-[linear-gradient(90deg,#8ee8ff,#5b7cff_45%,#36f0aa)]">
              可直接开拍的
            </span>
            <span className="block">带货视频方案</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/68 sm:text-lg">
            上传商品图，自动拆解卖点、场景、镜头、动作和口播节奏。不是空泛文案，而是一份运营、剪辑、AI 视频工具都能直接用的成片蓝图。
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="gradient-btn button-pop inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
            >
              开始生成
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#showcase"
              className="button-pop inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur hover:bg-white/12"
            >
              看展示
              <Clapperboard className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            {['注册送 3 次体验', '自动压缩商品图', '输出中文分镜方案'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/70">
                <BadgeCheck className="h-4 w-4 text-emerald-300" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] border border-white/8" />
          <div className="creative-stage relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="grid gap-3 lg:grid-cols-[0.82fr_1.18fr]">
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-[#101623] p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold">
                      <ImagePlus className="h-4 w-4 text-cyan-300" />
                      商品输入
                    </span>
                    <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-xs text-cyan-200">AI Vision</span>
                  </div>
                  <div className="mt-4 aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,#182034,#0b1020)] p-3">
                    <div className="product-glow flex h-full flex-col justify-end rounded-xl p-4">
                      <div className="mb-auto h-28 rounded-2xl bg-[radial-gradient(circle_at_35%_25%,#fff7c7,transparent_28%),linear-gradient(145deg,#9b6b22,#f4c96e_45%,#6d4516)] shadow-2xl shadow-amber-400/20" />
                      <p className="mt-4 text-xs text-white/55">水滴金耳环 / 抖音种草</p>
                      <div className="mt-3 h-2 w-3/4 rounded bg-white/18" />
                      <div className="mt-2 h-2 w-1/2 rounded bg-white/10" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <MousePointerClick className="h-4 w-4 text-emerald-300" />
                    点击生成
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="progress-flow h-full w-2/3 rounded-full bg-[linear-gradient(90deg,#36f0aa,#5b7cff,#8ee8ff)]" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#f7f8fb] p-4 text-gray-950">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div>
                    <p className="text-sm font-semibold">成片蓝图</p>
                    <p className="mt-1 text-xs text-gray-500">商品卖点 → 分镜 → 视频提示词</p>
                  </div>
                  <span className="rounded-full bg-gray-950 px-3 py-1 text-xs text-white">Live Preview</span>
                </div>

                <div className="mt-4 space-y-3">
                  {promptBlocks.map((block, index) => (
                    <div
                      key={block}
                      className="prompt-flow-card rounded-2xl border border-gray-200 bg-white p-3"
                      style={{ animationDelay: `${index * 0.18}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{block}</span>
                        <span className="text-xs text-gray-400">0{index + 1}</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="h-2 rounded-full bg-gray-200" />
                        <div className="h-2 w-4/5 rounded-full bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 right-6 hidden rounded-2xl border border-white/10 bg-white px-5 py-4 text-gray-950 shadow-xl md:block">
            <p className="text-xs text-gray-500">今日生成</p>
            <p className="mt-1 text-2xl font-semibold">128 条</p>
          </div>
        </div>
      </div>
    </section>
  )
}
