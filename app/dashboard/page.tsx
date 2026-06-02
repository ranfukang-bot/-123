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
const MAX_ORIGINAL_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_GENERATION_IMAGE_BYTES = 1.5 * 1024 * 1024
const MAX_GENERATION_IMAGE_DIMENSION = 1280
const MAX_IMAGE_COUNT = 3
const VIDEO_DURATION_OPTIONS = [5, 10, 15, 20, 25, 30]

interface UploadedImage {
  file: File
  preview: string
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('图片读取失败，请重新上传'))
    reader.readAsDataURL(file)
  })
}

async function compressImageForGeneration(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('请上传图片文件')
  }

  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement('img')
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('图片解析失败，请换一张 JPG、PNG 或 WebP 图片'))
      img.src = objectUrl
    })

    const scale = Math.min(
      1,
      MAX_GENERATION_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
    )
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('图片处理失败，请换一张图片重试')
    }

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    const qualities = [0.82, 0.72, 0.62, 0.52]
    let compressedBlob: Blob | null = null

    for (const quality of qualities) {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', quality)
      })

      if (!blob) continue
      compressedBlob = blob
      if (blob.size <= MAX_GENERATION_IMAGE_BYTES) break
    }

    if (!compressedBlob) {
      throw new Error('图片压缩失败，请换一张图片重试')
    }

    return new File([compressedBlob], file.name.replace(/\.[^.]+$/, '.jpg'), {
      type: 'image/jpeg',
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function getFriendlyGenerateError(message: string) {
  if (
    message.includes('Maximum call stack size exceeded') ||
    message.includes('Unable to process input image') ||
    message.includes('input image')
  ) {
    return '图片处理失败。请换一张更清晰的 JPG/PNG 图片，或先截图/压缩后再上传。'
  }

  if (message.includes('429')) {
    return 'AI 服务当前繁忙，请稍后再试。'
  }

  return message
}

export default function DashboardPage() {
  const router = useRouter()
  const [images, setImages] = useState<UploadedImage[]>([])
  const [productName, setProductName] = useState('')
  const [videoType, setVideoType] = useState('')
  const [durationSeconds, setDurationSeconds] = useState('15')
  const [platform, setPlatform] = useState('')
  const [targetRegion, setTargetRegion] = useState('')
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    if (images.length + selectedFiles.length > MAX_IMAGE_COUNT) {
      setError(`最多上传 ${MAX_IMAGE_COUNT} 张图片`)
      return
    }

    try {
      const nextImages = await Promise.all(
        selectedFiles.map(async (file) => {
          if (file.size > MAX_ORIGINAL_IMAGE_BYTES) {
            throw new Error('单张图片大小不能超过 10MB')
          }

          const compressedFile = await compressImageForGeneration(file)
          return {
            file: compressedFile,
            preview: await readFileAsDataUrl(compressedFile),
          }
        })
      )

      setImages((current) => [...current, ...nextImages].slice(0, MAX_IMAGE_COUNT))
      setError('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '图片处理失败，请重新上传')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (indexToRemove: number) => {
    setImages((current) => current.filter((_, index) => index !== indexToRemove))
  }

  const handleGenerate = async () => {
    if (images.length === 0) {
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

      const imagePayload = await Promise.all(
        images.map(async (item) => {
          const imageDataUrl = await readFileAsDataUrl(item.file)
          return {
            base64: imageDataUrl.split(',')[1],
            mimeType: item.file.type,
          }
        })
      )

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productName,
          videoType,
          durationSeconds: Number(durationSeconds),
          platform,
          targetRegion,
          extraRequirements,
          images: imagePayload,
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
      setError(err instanceof Error ? getFriendlyGenerateError(err.message) : '生成失败，请重试')
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
            {images.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((item, index) => (
                    <div key={`${item.file.name}-${index}`} className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      <Image
                        src={item.preview}
                        alt={`商品图片 ${index + 1} 预览`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur">
                        {index + 1}
                      </div>
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
                        aria-label="删除图片"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGE_COUNT && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-white text-sm text-gray-500 transition-all hover:border-[#2454d6] hover:bg-blue-50/40"
                    >
                      继续添加
                    </button>
                  )}
                </div>
                <p className="text-xs leading-5 text-gray-500">
                  最多上传 3 张图片。图片会一起发送给 AI 识别商品、人物、场景和细节。
                </p>
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
                <p className="text-xs text-gray-400">支持 JPG、PNG、WebP，最多 3 张，单张最大 10MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
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

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-2">视频时长</label>
            <select
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2454d6] focus:border-transparent bg-white"
            >
              {VIDEO_DURATION_OPTIONS.map((seconds) => (
                <option key={seconds} value={seconds}>
                  {seconds} 秒
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              最佳时长 15 秒，时长过长可能导致效果不好，最长 30 秒。
            </p>
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

          {/* Target Region */}
          <div>
            <label className="block text-sm font-medium mb-2">带货地区（可选）</label>
            <input
              type="text"
              value={targetRegion}
              onChange={(e) => setTargetRegion(e.target.value)}
              placeholder="例如：印尼、美国"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2454d6] focus:border-transparent bg-white"
            />
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
