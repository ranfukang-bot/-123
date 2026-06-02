import OpenAI from 'openai'
import { SYSTEM_PROMPT, buildUserMessage } from './prompts/system'

let openai: OpenAI | null = null
const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview'

function getOpenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('AI 服务尚未配置，请先补充 GEMINI_API_KEY')
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey,
      baseURL: process.env.GEMINI_BASE_URL || 'https://yunwu.ai/v1',
    })
  }

  return openai
}

interface GenerateParams {
  productName: string
  videoType: string
  durationSeconds?: number
  extraRequirements: string
  platform?: string
  targetRegion?: string
  images?: Array<{
    base64: string
    mimeType: string
  }>
}

export async function generateVideoPrompt(params: GenerateParams) {
  const {
    productName,
    videoType,
    durationSeconds,
    extraRequirements,
    platform,
    targetRegion,
    images = [],
  } = params

  const userMessage = buildUserMessage({
    productName,
    videoType,
    durationSeconds,
    extraRequirements,
    platform,
    targetRegion,
  })

  const content: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = []

  for (const image of images) {
    content.push({
      type: 'image_url',
      image_url: {
        url: `data:${image.mimeType};base64,${image.base64}`,
      },
    })
  }

  content.push({ type: 'text', text: userMessage })

  const completion = await getOpenAIClient().chat.completions.create({
    model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content },
    ],
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 4096,
  })

  return cleanGeneratedPrompt(completion.choices[0].message.content || '')
}

function cleanGeneratedPrompt(prompt: string) {
  return prompt
    .replace(/\*\*/g, '')
    .replace(/^\s*---+\s*$/gm, '')
    .replace(/["“”']?#[A-Za-z0-9_\u4e00-\u9fa5-]+["“”']?/g, '')
    .replace(/(?:\s{2,}| )$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
