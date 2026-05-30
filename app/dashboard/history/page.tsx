'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Copy, Check, Clock, Film } from 'lucide-react'
import { VIDEO_TYPE_LABELS } from '@/lib/constants/options'

interface Generation {
  id: string
  product_name: string
  video_type: string
  platform: string
  output_prompt: string
  created_at: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setGenerations(data)
      }
      setLoading(false)
    }

    fetchHistory()
  }, [router])

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">历史记录</h1>
        <p className="text-gray-500 mt-1">查看你之前生成的所有视频提示词</p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">加载中...</p>
        </div>
      ) : generations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
            <Film className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 mb-2">暂无历史记录</p>
          <p className="text-sm text-gray-400">生成你的第一个视频提示词吧</p>
        </div>
      ) : (
        <div className="space-y-4">
          {generations.map((gen) => (
            <div
              key={gen.id}
              className="bg-white rounded-xl border border-gray-100 p-5 card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{gen.product_name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Film className="w-3.5 h-3.5" />
                      {VIDEO_TYPE_LABELS[gen.video_type as keyof typeof VIDEO_TYPE_LABELS] || gen.video_type}
                    </span>
                    {gen.platform && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs">
                        {gen.platform}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(gen.created_at)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(gen.id, gen.output_prompt)}
                  className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium shrink-0"
                >
                  {copiedId === gen.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制
                    </>
                  )}
                </button>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-hidden relative">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {gen.output_prompt.substring(0, 300)}...
                </pre>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
