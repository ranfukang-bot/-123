import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080b12] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#080b12]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">PromptReel</p>
              <p className="text-xs text-white/50">带货视频提示词工作台</p>
            </div>
          </Link>
          <div className="flex flex-wrap gap-5 text-sm text-white/55">
            <Link href="/features" className="hover:text-white">能力</Link>
            <Link href="/workflow" className="hover:text-white">流程</Link>
            <Link href="/pricing" className="hover:text-white">价格</Link>
            <Link href="/login" className="hover:text-white">登录</Link>
          </div>
        </div>
        <div className="border-t border-white/10 pt-5 text-sm text-white/35">
          © {new Date().getFullYear()} PromptReel. 保留所有权利。
        </div>
      </div>
    </footer>
  )
}
