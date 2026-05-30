'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Sparkles } from 'lucide-react'

const navItems = [
  { href: '/#features', label: '能力' },
  { href: '/#workflow', label: '流程' },
  { href: '/pricing', label: '价格' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="block text-lg font-semibold tracking-tight text-gray-950">PromptReel</span>
            <span className="hidden text-[11px] text-gray-500 sm:block">带货视频提示词工作台</span>
          </div>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-gray-600 hover:text-gray-950">
              {item.label}
            </Link>
          ))}
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-950">
            登录
          </Link>
          <Link href="/register" className="gradient-btn rounded-lg px-4 py-2 text-sm font-semibold text-white">
            免费试用
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="打开导航"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
              登录
            </Link>
            <Link href="/register" className="gradient-btn rounded-lg px-3 py-2 text-center text-sm font-semibold text-white" onClick={() => setMobileOpen(false)}>
              免费试用
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
