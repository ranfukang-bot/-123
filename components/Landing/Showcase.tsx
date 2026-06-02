'use client'

import Link from 'next/link'
import { ArrowRight, Play, Sparkles } from 'lucide-react'

const reels = [
  {
    title: '饰品细节',
    tag: '近景质感 / 光泽氛围',
    video: '/showcase/jewelry.mp4',
    accent: 'from-amber-200 via-yellow-500 to-orange-700',
  },
  {
    title: '服装穿搭',
    tag: '上身展示 / 街拍节奏',
    video: '/showcase/fashion.mp4',
    accent: 'from-sky-200 via-blue-500 to-indigo-800',
  },
  {
    title: '家居小电器',
    tag: '生活场景 / 功能演示',
    video: '/showcase/appliance.mp4',
    accent: 'from-emerald-100 via-teal-500 to-slate-800',
  },
]

function ReelCard({ reel }: { reel: (typeof reels)[number] }) {
  return (
    <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111827] shadow-2xl shadow-black/25">
      <div className={`absolute inset-0 bg-gradient-to-br ${reel.accent} opacity-35`} />
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
        src={reel.video}
        muted
        loop
        playsInline
        autoPlay
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080b12]/95 via-[#080b12]/12 to-transparent" />

      <div className="relative flex aspect-[9/14] flex-col justify-between p-5 text-white">
        <div className="flex justify-end">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18 backdrop-blur">
            <Play className="h-4 w-4 fill-white" />
          </div>
        </div>

        <div>
          <p className="text-sm text-white/75">{reel.tag}</p>
          <h3 className="mt-2 text-2xl font-semibold">{reel.title}</h3>
        </div>
      </div>
    </div>
  )
}

export default function Showcase() {
  return (
    <section id="showcase" className="overflow-hidden border-t border-white/10 bg-[#080b12] py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
              <Sparkles className="h-4 w-4" />
              作品橱窗
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              商品素材进入画面，方案才有说服力
            </h2>
            <p className="mt-4 text-base leading-7 text-white/62">
              从商品卖点到拍摄节奏，PromptReel 会把画面、动作、口播和平台语感组织成一份可执行的视频方案。
            </p>
          </div>
          <Link
            href="/register"
            className="button-pop inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-950 hover:bg-cyan-50"
          >
            用我的商品生成
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {reels.map((reel) => (
            <ReelCard key={reel.title} reel={reel} />
          ))}
        </div>
      </div>
    </section>
  )
}
