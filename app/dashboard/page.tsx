'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Upload, X, Wand2, Copy, Check, Loader2, Image as ImageIcon } from 'lucide-react'
import { VIDEO_TYPES, PLATFORMS } from '@/lib/constants/options'
import { useRouter } from 'next/navigation'
import { authedFetch, clearStoredSession, getAccessToken } from '@/lib/client-auth'

interface GeneratedModule {
  title: string
  content: string
}

const MODULE_TITLE_LABELS: Record<string, string> = {
  'Video Type': '视频类型',
  Style: '画面风格',
  'Environment / Scene': '场景环境',
  Environment: '场景环境',
  Scene: '场景环境',
  'Cinematography / Camera': '镜头语言',
  Cinematography: '镜头语言',
  Camera: '镜头语言',
  'Lighting & Color': '光线色彩',
  Lighting: '光线色彩',
  Color: '光线色彩',
  'Mood & Tone': '情绪基调',
  Mood: '情绪基调',
  Tone: '情绪基调',
  Actions: '分镜动作',
  Action: '分镜动作',
  Dialogue: '口播/对白',
  'Audio / Music': '声音/音乐',
  Audio: '声音/音乐',
  Music: '声音/音乐',
  Editing: '剪辑节奏',
  'Technical Parameters': '技术参数',
  'Negative Prompt': '避雷说明',
  'Call to Action': '引导动作',
}

const getModuleTitle = (title: string) => MODULE_TITLE_LABELS[title.trim()] || title

export default function DashboardPage() {
  const router = useRouter()
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [productName, setProductName] = useState('')
  const [videoType, setVideoType] = useState('')
  const [platform, setPlatform] = useState('')
  const [extraRequirements, setExtraRequirements] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [credits, setCredits] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check auth and get credits
  useEffect(() => {
    const checkAuth = async () => {
      if (!getAccessToken()) {
        router.push('/login')
        return
      }

      const response = await authedFetch('/api/user')
      if (response.status === 401) {
        clearStoredSession()
        router.push('/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setCredits(data.profile?.credits_remaining ?? null)
      }
    }
    checkAuth()
  }, [router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB')
      return
    }

    setImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    setError('')
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleGenerate = async () => {
    if (!image) {
      setError('请上传商品图片')
      return
    }
    if (!productName.trim()) {
      setError('请输入商品名称')
      return
    }
    if (!videoType) {
      setError('请选择视频类型')
      return
    }

    setLoading(true)
    setError('')
      setResult(null)

    try {
      const accessToken = getAccessToken()
      if (!accessToken) {
        router.push('/login')
        return
      }

      // Convert image to base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1]
          resolve(base64)
        }
      })
      reader.readAsDataURL(image)
      const imageBase64 = await base64Promise

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productName,
          videoType,
          platform,
          extraRequirements,
          imageBase64,
          imageMimeType: image.type,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '生成失败')
      }

      setResult(data.prompt)
      if (data.credits_remaining !== undefined) {
        setCredits(data.credits_remaining)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Parse the result into modules for display
  const parseModules = (text: string): GeneratedModule[] => {
    const modules: GeneratedModule[] = []
    const lines = text.split('\n')
    let currentModule: GeneratedModule | null = null

    for (const line of lines) {
      const moduleMatch = line.match(/^\s*(?:\*\*)?\[(.+?)\](?:\*\*)?\s*/)
      if (moduleMatch) {
        if (currentModule) {
          modules.push(currentModule)
        }
        currentModule = {
          title: moduleMatch[1],
          content: line.replace(moduleMatch[0], '').trim(),
        }
      } else if (currentModule && line.trim()) {
        currentModule.content += (currentModule.content ? '\n' : '') + line
      }
    }

    if (currentModule) {
      modules.push(currentModule)
    }

    return modules
  }

  const modules = result ? parseModules(result) : []

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950">生成视频提示词</h1>
          <p className="text-gray-500 mt-1">上传商品图，输出可直接用于 AI 视频工具的结构化方案</p>
        </div>
        {credits !== null && (
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-sm shadow-sm">
            <span className="text-gray-500">剩余次数：</span>
            <span className="font-semibold text-[#2454d6]">{credits}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="surface space-y-6 rounded-2xl bg-white p-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">商品图片</label>
            {imagePreview ? (
              <div className="relative h-72 rounded-xl overflow-hidden border border-gray-200">
                <Image
                  src={imagePreview}
                  alt="商品图片预览"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-[#2454d6] hover:bg-blue-50/40 transition-all"
              >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-950 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-600 mb-1">点击或拖拽上传商品图片</p>
                <p className="text-xs text-gray-400">支持 JPG、PNG、WebP，最大 10MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium mb-2">商品名称</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="例如：假两件拼接连帽夹克"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2454d6] focus:border-transparent bg-white"
            />
          </div>

          {/* Video Type */}
          <div>
            <label className="block text-sm font-medium mb-2">视频类型</label>
            <select
              value={videoType}
              onChange={(e) => setVideoType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2454d6] focus:border-transparent bg-white"
            >
              <option value="">选择视频类型</option>
              {VIDEO_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium mb-2">发布平台（可选）</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2454d6] focus:border-transparent bg-white"
            >
              <option value="">选择平台</option>
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Extra Requirements */}
          <div>
            <label className="block text-sm font-medium mb-2">额外需求（可选）</label>
            <textarea
              value={extraRequirements}
              onChange={(e) => setExtraRequirements(e.target.value)}
              placeholder="描述你希望突出的卖点、风格偏好、目标受众等..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2454d6] focus:border-transparent resize-none bg-white"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full gradient-btn text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                正在生成...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                生成视频提示词
              </>
            )}
          </button>
        </div>

        <div className="surface rounded-2xl bg-white p-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-950">生成结果</label>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    一键复制
                  </>
                )}
              </button>
            )}
          </div>

          {result ? (
            <div className="rounded-xl border border-gray-200 bg-[#fbfcfe] p-4 max-h-[calc(100vh-210px)] overflow-y-auto">
              {modules.length > 0 ? (
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <div key={index} className="prompt-module">
                      <h4>[{getModuleTitle(module.title)}]</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {module.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {result}
                </pre>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-[#fbfcfe] p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">
                上传商品图片并填写信息后，点击生成按钮
              </p>
              <p className="text-gray-400 text-xs mt-1">
                生成的提示词将在这里显示
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
