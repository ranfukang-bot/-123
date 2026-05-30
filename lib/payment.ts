// LemonSqueezy payment integration

const LEMONSQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1'

interface CreateCheckoutParams {
  variantId: string
  userId: string
  userEmail: string
}

export async function createCheckout({ variantId, userId, userEmail }: CreateCheckoutParams) {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!apiKey || !storeId) {
    throw new Error('LemonSqueezy 尚未配置，请先补充支付环境变量')
  }

  if (process.env.NODE_ENV === 'production' && !appUrl) {
    throw new Error('生产环境缺少 NEXT_PUBLIC_APP_URL')
  }

  if (!variantId) {
    throw new Error('套餐 Variant ID 尚未配置')
  }

  const response = await fetch(`${LEMONSQUEEZY_API_URL}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: {
              user_id: userId,
            },
          },
          checkout_options: {
            locale: 'zh-CN',
          },
          product_options: {
            redirect_url: `${appUrl || 'http://localhost:3000'}/dashboard/account`,
            enabled_variants: [Number(variantId)],
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: storeId,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId,
            },
          },
        },
      },
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.detail || 'Failed to create checkout')
  }

  return data.data.attributes.url
}

// Plan to variant ID mapping
export const PLAN_VARIANTS: Record<string, string> = {
  basic: process.env.LEMONSQUEEZY_BASIC_VARIANT_ID || '',
  pro: process.env.LEMONSQUEEZY_PRO_VARIANT_ID || '',
  unlimited: process.env.LEMONSQUEEZY_UNLIMITED_VARIANT_ID || '',
}

// Plan credits mapping
export const PLAN_CREDITS: Record<string, number> = {
  free: 3,
  basic: 50,
  pro: 200,
  unlimited: 999999,
}
