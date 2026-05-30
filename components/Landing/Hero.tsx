import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-sm text-indigo-700 font-medium">AI 驱动的视频提示词生成</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            上传商品图
            <br />
            <span className="gradient-text">一键生成专业视频提示词</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            专为带货达人打造的 AI 视频提示词生成器。上传商品图片，选择视频风格，
            即可获得适用于 Runway、Pika、Sora 等工具的专业级提示词。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="gradient-btn text-white font-medium px-8 py-3.5 rounded-full text-lg flex items-center gap-2"
            >
              免费开始体验
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/#how-it-works"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-6 py-3.5 rounded-full border border-gray-200 hover:border-gray-300 transition-all"
            >
              <Play className="w-5 h-5" />
              了解工作原理
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-bold gradient-text">10+</div>
              <div className="text-sm text-gray-500 mt-1">专业模块</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">5s</div>
              <div className="text-sm text-gray-500 mt-1">生成速度</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">5+</div>
              <div className="text-sm text-gray-500 mt-1">视频风格</div>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="mt-20 relative max-w-5xl mx-auto">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-gray-400">创作工作台预览</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Side */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-500">输入</div>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">拖拽商品图片到此处</p>
                </div>
                <div className="space-y-2">
                  <div className="h-10 bg-gray-50 rounded-lg" />
                  <div className="h-10 bg-gray-50 rounded-lg" />
                </div>
              </div>
              {/* Output Side */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-500">输出</div>
                {['视频类型', '画面风格', '场景环境', '镜头语言', '光线色彩'].map((module) => (
                  <div key={module} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-indigo-600">[{module}]</div>
                      <div className="h-2 bg-gray-200 rounded mt-1.5 w-full" />
                      <div className="h-2 bg-gray-200 rounded mt-1 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
