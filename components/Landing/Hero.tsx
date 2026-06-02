import Link from 'next/link'
import { ArrowRight, BadgeCheck, Clapperboard, Sparkles } from 'lucide-react'

const heroReels = [
  {
    title: '服装穿搭',
    caption: '上身展示 / 街拍节奏',
    src: '/showcase/fashion.mp4',
    className: 'md:col-span-7 md:row-span-2',
  },
  {
    title: '饰品细节',
    caption: '近景质感 / 光泽氛围',
    src: '/showcase/jewelry.mp4',
    className: 'md:col-span-5',
  },
  {
    title: '家居小电器',
    caption: '生活场景 / 功能演示',
    src: '/showcase/appliance.mp4',
    className: 'md:col-span-5',
  },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#080b12] pt-24 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:46px_46px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="hero-scanline" />

      <div className="relative mx-auto grid min-h-[820px] max-w-7xl grid-cols-1 items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-sm font-medium text-white/80 shadow-2xl shadow-blue-950/30 backdrop-blur">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            面向国内带货团队的 AI 视频创作台
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            把商品素材变成
            <span className="block bg-[linear-gradient(90deg,#8ee8ff,#5b7cff_45%,#36f0aa)] bg-clip-text text-transparent">
              可直接开拍的
            </span>
            <span className="block">带货视频方案</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/68 sm:text-lg">
            上传商品图，自动拆解卖点、场景、镜头、动作和口播节奏。输出不是空泛文案，而是一份运营、剪辑、AI
            视频工具都能直接接着用的成片蓝图。
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
              href="/features"
              className="button-pop inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur hover:bg-white/12"
            >
              查看能力
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
            <div className="mb-3 flex items-center justify-between px-2 py-1">
              <div>
                <p className="text-sm font-semibold text-white">精选成片样例</p>
                <p className="mt-1 text-xs text-white/48">服装、饰品、家居场景实时预览</p>
              </div>
              <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                自动播放
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-12 md:grid-rows-2">
              {heroReels.map((reel, index) => (
                <div
                  key={reel.title}
                  className={`${reel.className} group relative min-h-[230px] overflow-hidden rounded-3xl border border-white/10 bg-[#111827] md:min-h-[260px]`}
                >
                  <video
                    className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                    src={reel.src}
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080b12]/92 via-[#080b12]/20 to-transparent" />
                  <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                    <span className="rounded-full bg-black/35 px-3 py-1 text-xs text-white/80 backdrop-blur">
                      样片 0{index + 1}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-950">
                      Preview
                    </span>
                  </div>
                  <div className="absolute inset-x-5 bottom-5">
                    <p className="text-sm text-white/72">{reel.caption}</p>
                    <h2 className="mt-1 text-2xl font-semibold">{reel.title}</h2>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
