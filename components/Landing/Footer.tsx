import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-950">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-950">PromptReel</p>
              <p className="text-xs text-gray-500">带货视频提示词工作台</p>
            </div>
          </Link>
          <div className="flex flex-wrap gap-5 text-sm text-gray-500">
            <Link href="/#features" className="hover:text-gray-950">能力</Link>
            <Link href="/pricing" className="hover:text-gray-950">价格</Link>
            <Link href="/login" className="hover:text-gray-950">登录</Link>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-5 text-sm text-gray-400">
          © {new Date().getFullYear()} PromptReel。保留所有权利。
        </div>
      </div>
    </footer>
  )
}
