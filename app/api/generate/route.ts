import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { generateVideoPrompt } from '@/lib/gemini'
import { PLATFORM_VALUES, VIDEO_TYPE_VALUES } from '@/lib/constants/options'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_JSON_BYTES = 15 * 1024 * 1024
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

interface GenerateBody {
  productName?: unknown
  videoType?: unknown
  platform?: unknown
  extraRequirements?: unknown
  imageBase64?: unknown
  imageMimeType?: unknown
}

interface ReservedCredit {
  credits_remaining: number
  plan_type: string
}

type ValidatedGenerateBody =
  | {
      data: {
        productName: string
        videoType: string
        platform: string
        extraRequirements: string
        imageBase64: string
        imageMimeType: string
      }
    }
  | { error: string }

function jsonError(error: string, status: number, code?: string) {
  return NextResponse.json(code ? { error, code } : { error }, { status })
}

function getFriendlyServerError(error: unknown) {
  const message = error instanceof Error ? error.message : ''

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

  return message || '生成失败，请重试'
}

function getTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function getApproxBase64Bytes(value: string) {
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0
  return Math.floor((value.length * 3) / 4) - padding
}

function validateGenerateBody(body: GenerateBody): ValidatedGenerateBody {
  const productName = getTrimmedString(body.productName)
  const videoType = getTrimmedString(body.videoType)
  const platform = getTrimmedString(body.platform)
  const extraRequirements = getTrimmedString(body.extraRequirements)
  const imageBase64 = getTrimmedString(body.imageBase64)
  const imageMimeType = getTrimmedString(body.imageMimeType)

  if (!productName || !videoType || !imageBase64) {
    return { error: '请填写完整信息并上传图片' }
  }

  if (productName.length > 80) {
    return { error: '商品名称不能超过 80 个字符' }
  }

  if (extraRequirements.length > 800) {
    return { error: '额外需求不能超过 800 个字符' }
  }

  if (!VIDEO_TYPE_VALUES.includes(videoType as (typeof VIDEO_TYPE_VALUES)[number])) {
    return { error: '无效的视频类型' }
  }

  if (platform && !PLATFORM_VALUES.includes(platform as (typeof PLATFORM_VALUES)[number])) {
    return { error: '无效的发布平台' }
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(imageMimeType)) {
    return { error: '仅支持 JPG、PNG、WebP 图片' }
  }

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(imageBase64)) {
    return { error: '图片数据格式不正确' }
  }

  if (getApproxBase64Bytes(imageBase64) > MAX_IMAGE_BYTES) {
    return { error: '图片大小不能超过 10MB' }
  }

  return {
    data: {
      productName,
      videoType,
      platform,
      extraRequirements,
      imageBase64,
      imageMimeType,
    },
  }
}

async function consumeCredit(userId: string): Promise<{ data: ReservedCredit } | { error: string; code?: string }> {
  const { data, error } = await supabase.rpc('consume_generation_credit', {
    target_user_id: userId,
  })

  if (error) {
    if (error.message?.includes('NO_CREDITS')) {
      return { error: '免费次数已用完，请升级套餐继续使用', code: 'NO_CREDITS' }
    }

    console.error('Failed to consume credit:', error)
    return { error: '扣减生成次数失败，请稍后重试' }
  }

  const reserved = Array.isArray(data) ? data[0] : data
  if (!reserved || typeof reserved.credits_remaining !== 'number') {
    return { error: '扣减生成次数失败，请稍后重试' }
  }

  return { data: reserved as ReservedCredit }
}

async function refundCredit(userId: string) {
  const { error } = await supabase.rpc('refund_generation_credit', {
    target_user_id: userId,
  })

  if (error) {
    console.error('Failed to refund credit:', error)
  }
}

export async function POST(request: NextRequest) {
  let reservedCredit: ReservedCredit | null = null
  let userId: string | null = null

  try {
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (contentLength > MAX_JSON_BYTES) {
      return jsonError('请求体过大，请压缩图片后重试', 413)
    }

    // 1. Get auth token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonError('未授权访问', 401)
    }

    const token = authHeader.replace('Bearer ', '')

    // 2. Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return jsonError('登录已过期，请重新登录', 401)
    }
    userId = user.id

    // 3. Parse and validate request body
    const body = await request.json() as GenerateBody
    const parsed = validateGenerateBody(body)

    if ('error' in parsed) {
      return jsonError(parsed.error, 400)
    }

    const { productName, videoType, platform, extraRequirements, imageBase64, imageMimeType } = parsed.data

    // 4. Atomically reserve one generation credit before spending AI tokens.
    const creditResult = await consumeCredit(user.id)
    if ('error' in creditResult) {
      return jsonError(creditResult.error, creditResult.code === 'NO_CREDITS' ? 403 : 500, creditResult.code)
    }
    reservedCredit = creditResult.data

    // 5. Generate video prompt (server-side, prompt is injected here)
    const prompt = await generateVideoPrompt({
      productName,
      videoType,
      extraRequirements: extraRequirements || '',
      platform,
      imageBase64,
      imageMimeType,
    })

    // 6. Save generation record
    const { error: insertError } = await supabase.from('generations').insert({
      user_id: user.id,
      product_name: productName,
      video_type: videoType,
      extra_requirements: extraRequirements || '',
      platform: platform || '',
      output_prompt: prompt,
    })

    if (insertError) {
      console.error('Failed to save generation record:', insertError)
    }

    return NextResponse.json({
      prompt,
      credits_remaining: reservedCredit.credits_remaining,
    })
  } catch (error: unknown) {
    if (userId && reservedCredit) {
      await refundCredit(userId)
    }

    console.error('Generate error:', error)
    const errorMessage = getFriendlyServerError(error)
    return jsonError(errorMessage, 500)
  }
}
