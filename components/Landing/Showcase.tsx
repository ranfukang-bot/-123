'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Play, Sparkles } from 'lucide-react'

const reels = [
  {
    title: '饰品细节',
    tag: '手部特写 / 光泽氛围',
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
    tag: '生活场景 / 功能展示',
    video: '/showcase/appliance.mp4',
    accent: 'from-emerald-100 via-teal-500 to-slate-800',
  },
]

function ReelCard({ reel, index }: { reel: (typeof reels)[number]; index: number }) {
  const [videoReady, setVideoReady] = useState(true)

  return (
    <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111827] shadow-2xl shadow-black/25">
      <div className={`absolute inset-0 bg-gradient-to-br ${reel.accent} opacity-75`} />

      {videoReady && (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-85 mix-blend-luminosity transition duration-500 group-hover:scale-105 group-hover:opacity-100"
          src={reel.video}
          muted
          loop
          playsInline
          autoPlay
          onError={() => setVideoReady(false)}
        />
      )}

      {!videoReady && (
        <div className="fallback-reel absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />
          <div className="absolute inset-x-8 bottom-28 space-y-2">
            <div className="h-3 rounded-full bg-white/45" />
            <div className="h-3 w-2/3 rounded-full bg-white/25" />
          </div>
        </div>
      )}

      <div className="relative flex aspect-[9/14] flex-col justify-between p-5 text-white">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-black/25 px-3 py-1 text-xs backdrop-blur">Demo 0{index + 1}</span>
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
    <section id="showcase" className="overflow-hidden bg-[#080b12] py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
              <Sparkles className="h-4 w-4" />
              作品橱窗
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              让用户先看到“能做出什么”
            </h2>
            <p className="mt-4 text-base leading-7 text-white/62">
              这里可以放你用 AI 做出的带货视频，也可以先用动态样片占位。页面会自动播放，形成更像创意工具官网的第一印象。
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
          {reels.map((reel, index) => (
            <ReelCard key={reel.title} reel={reel} index={index} />
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/62">
          素材放置位置：把视频文件放到 <span className="text-white">public/showcase</span>，命名为
          <span className="text-white"> jewelry.mp4</span>、<span className="text-white">fashion.mp4</span>、
          <span className="text-white">appliance.mp4</span>，页面会自动使用真实视频。
        </div>
      </div>
    </section>
  )
}
