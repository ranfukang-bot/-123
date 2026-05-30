'use client'

import { useEffect, useSyncExternalStore } from 'react'
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

const subscribeToSession = (callback: () => void) => {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

const getSessionSnapshot = () => Boolean(getAccessToken())
const getServerSessionSnapshot = () => null

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const hasSession = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getServerSessionSnapshot
  )

  useEffect(() => {
    if (hasSession === false) {
      router.replace('/login')
    }
  }, [hasSession, router])

  const handleLogout = () => {
    clearStoredSession()
    router.push('/')
  }

  if (hasSession !== true) {
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f7f8fb]">
      <aside className="w-full md:w-68 bg-[#0b1220] text-white flex md:flex-col shrink-0">
        <div className="p-4 md:p-6 md:border-b border-white/10 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#111827]" />
            </div>
            <div>
              <span className="block text-lg font-semibold text-white">PromptReel</span>
              <span className="hidden text-xs text-white/50 md:block">创作工作台</span>
            </div>
          </Link>
        </div>

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
                    ? 'bg-white text-gray-950'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            )
          })}

          <Link
            href="/dashboard/account"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <CreditCard className="w-5 h-5" />
            <span className="whitespace-nowrap">套餐升级</span>
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-2 md:p-4 md:border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all w-full"
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
