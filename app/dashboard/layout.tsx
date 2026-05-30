'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Wand2, History, User, LogOut, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { clearStoredSession, getAccessToken } from '@/lib/client-auth'

const navItems = [
  { href: '/dashboard', label: '生成提示词', icon: Wand2 },
  { href: '/dashboard/history', label: '历史记录', icon: History },
  { href: '/dashboard/account', label: '账户管理', icon: User },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [hasSession] = useState(() =>
    typeof window === 'undefined' ? false : Boolean(getAccessToken())
  )

  useEffect(() => {
    if (!hasSession) {
      router.replace('/login')
    }
  }, [hasSession, router])

  const handleLogout = () => {
    clearStoredSession()
    router.push('/')
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-100 flex md:flex-col shrink-0">
        {/* Logo */}
        <div className="p-4 md:p-6 md:border-b border-gray-100 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg animated-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">PromptReel</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 md:p-4 flex md:block gap-1 md:space-y-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            )
          })}

          <Link
            href="/dashboard/account"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <CreditCard className="w-5 h-5" />
            <span className="whitespace-nowrap">套餐升级</span>
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-2 md:p-4 md:border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:inline whitespace-nowrap">退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
