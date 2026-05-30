import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envFile = resolve('.env.local')
if (existsSync(envFile)) {
  const lines = readFileSync(envFile, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const [name, ...valueParts] = trimmed.split('=')
    if (!process.env[name]) {
      process.env[name] = valueParts.join('=')
    }
  }
}

const required = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'GEMINI_BASE_URL',
  'GEMINI_MODEL',
  'LEMONSQUEEZY_API_KEY',
  'LEMONSQUEEZY_STORE_ID',
  'LEMONSQUEEZY_WEBHOOK_SECRET',
  'LEMONSQUEEZY_BASIC_VARIANT_ID',
  'LEMONSQUEEZY_PRO_VARIANT_ID',
  'LEMONSQUEEZY_UNLIMITED_VARIANT_ID',
]

const missing = required.filter((name) => !process.env[name]?.trim())

if (missing.length > 0) {
  console.error('Missing production environment variables:')
  for (const name of missing) {
    console.error(`- ${name}`)
  }
  process.exit(1)
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL
if (!/^https:\/\//.test(appUrl)) {
  console.error('NEXT_PUBLIC_APP_URL must be an HTTPS URL in production.')
  process.exit(1)
}

console.log('Production environment looks complete.')
