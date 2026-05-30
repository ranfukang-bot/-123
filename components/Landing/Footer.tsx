import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg animated-gradient flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">PromptReel</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI 驱动的视频提示词生成器，让带货视频创作更简单。
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">产品</h4>
            <ul className="space-y-2">
              <li><Link href="/#features" className="text-sm text-gray-500 hover:text-gray-700">功能特点</Link></li>
              <li><Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-700">定价套餐</Link></li>
              <li><Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">开始使用</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">支持</h4>
            <ul className="space-y-2">
              <li><Link href="/#how-it-works" className="text-sm text-gray-500 hover:text-gray-700">使用指南</Link></li>
              <li><span className="text-sm text-gray-500">常见问题</span></li>
              <li><span className="text-sm text-gray-500">联系客服</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">法律</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-gray-500">服务条款</span></li>
              <li><span className="text-sm text-gray-500">隐私政策</span></li>
              <li><span className="text-sm text-gray-500">退款政策</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} PromptReel。保留所有权利。
          </p>
        </div>
      </div>
    </footer>
  )
}
