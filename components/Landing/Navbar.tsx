'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Sparkles } from 'lucide-react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg animated-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">PromptReel</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              功能特点
            </Link>
            <Link href="/#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              使用流程
            </Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              定价套餐
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="gradient-btn text-white text-sm font-medium px-5 py-2 rounded-full"
            >
              免费体验
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <Link href="/#features" className="text-sm text-gray-600 py-2" onClick={() => setMobileOpen(false)}>
                功能特点
              </Link>
              <Link href="/#how-it-works" className="text-sm text-gray-600 py-2" onClick={() => setMobileOpen(false)}>
                使用流程
              </Link>
              <Link href="/pricing" className="text-sm text-gray-600 py-2" onClick={() => setMobileOpen(false)}>
                定价套餐
              </Link>
              <Link href="/login" className="text-sm text-gray-600 py-2" onClick={() => setMobileOpen(false)}>
                登录
              </Link>
              <Link
                href="/register"
                className="gradient-btn text-white text-sm font-medium px-5 py-2 rounded-full text-center"
                onClick={() => setMobileOpen(false)}
              >
                免费体验
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
