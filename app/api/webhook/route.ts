import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { PLAN_CREDITS } from '@/lib/payment'
import crypto from 'crypto'

interface LemonSqueezyWebhookPayload {
  meta?: {
    event_id?: string
    webhook_id?: string
    event_name?: string
    custom_data?: {
      user_id?: string
    }
  }
  data?: {
    id?: string | number
    attributes?: {
      variant_id?: string | number
      status?: string
      renews_at?: string | null
      updated_at?: string
      subscription_id?: string | number
    }
  }
}

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(body).digest('hex')
  const signatureBuffer = Buffer.from(signature, 'hex')
  const digestBuffer = Buffer.from(digest, 'hex')

  if (signatureBuffer.length !== digestBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(signatureBuffer, digestBuffer)
}

function getPlanTypeFromVariant(variantId: string | undefined) {
  if (variantId === process.env.LEMONSQUEEZY_BASIC_VARIANT_ID) return 'basic'
  if (variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) return 'pro'
  if (variantId === process.env.LEMONSQUEEZY_UNLIMITED_VARIANT_ID) return 'unlimited'
  return null
}

function getEventId(payload: LemonSqueezyWebhookPayload) {
  return String(
    payload.meta?.event_id ||
    payload.meta?.webhook_id ||
    `${payload.meta?.event_name || 'unknown'}:${payload.data?.id || 'unknown'}:${payload.data?.attributes?.updated_at || payload.data?.attributes?.renews_at || ''}`
  )
}

async function markWebhookProcessed(eventId: string, eventName: string) {
  const { error } = await supabase.from('webhook_events').insert({
    id: eventId,
    event_name: eventName,
  })

  if (error) {
    if (error.code === '23505') {
      return { duplicate: true }
    }

    console.error('Failed to record webhook event:', error)
    return { error }
  }

  return { duplicate: false }
}

async function releaseWebhookEvent(eventId: string) {
  const { error } = await supabase.from('webhook_events').delete().eq('id', eventId)
  if (error) {
    console.error('Failed to release webhook event:', error)
  }
}

async function resolveUserId(payload: LemonSqueezyWebhookPayload, subscriptionId?: string) {
  const userId = payload.meta?.custom_data?.user_id
  if (typeof userId === 'string' && userId) return userId

  if (!subscriptionId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('subscription_id', subscriptionId)
    .single()

  if (error || !data?.id) {
    return null
  }

  return data.id as string
}

export async function POST(request: NextRequest) {
  let processingEventId: string | null = null

  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature')
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

    if (webhookSecret) {
      if (!signature || !verifyWebhookSignature(body, signature, webhookSecret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 })
    }

    const payload = JSON.parse(body) as LemonSqueezyWebhookPayload
    const eventName = payload.meta?.event_name
    const eventId = getEventId(payload)

    if (!eventName) {
      return NextResponse.json({ error: 'Missing event name' }, { status: 400 })
    }

    const eventRecord = await markWebhookProcessed(eventId, eventName)
    if ('error' in eventRecord) {
      return NextResponse.json({ error: 'Webhook idempotency check failed' }, { status: 500 })
    }
    if (eventRecord.duplicate) {
      return NextResponse.json({ received: true, duplicate: true })
    }
    processingEventId = eventId

    const fail = async (message: string, status: number) => {
      await releaseWebhookEvent(eventId)
      processingEventId = null
      return NextResponse.json({ error: message }, { status })
    }

    // Handle subscription events
    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const subscription = payload.data?.attributes
      const subscriptionId = payload.data?.id?.toString()
      const userId = await resolveUserId(payload, subscriptionId)

      if (!subscription) {
        return fail('Missing subscription data', 400)
      }

      if (!userId) {
        console.error('No user_id in webhook custom_data')
        return fail('Missing user_id', 400)
      }

      // Determine plan from variant
      const variantId = subscription.variant_id?.toString()
      const planType = getPlanTypeFromVariant(variantId)

      if (!planType) {
        console.error('Unknown LemonSqueezy variant:', variantId)
        return fail('Unknown variant', 400)
      }

      const credits = PLAN_CREDITS[planType] || 3
      const isActive = subscription.status === 'active' || subscription.status === 'on_trial'

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          plan_type: planType,
          credits_remaining: credits,
          credits_total: credits,
          subscription_id: subscriptionId,
          subscription_status: isActive ? 'active' : 'inactive',
          current_period_end: subscription.renews_at || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to update profile:', updateError)
        return fail('Update failed', 500)
      }
    }

    // Handle subscription cancellation
    if (eventName === 'subscription_cancelled') {
      const subscriptionId = payload.data?.id?.toString()
      const userId = await resolveUserId(payload, subscriptionId)

      if (userId) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
      }
    }

    // Handle subscription payment success (renewal)
    if (eventName === 'subscription_payment_success') {
      const subscriptionId = payload.data?.attributes?.subscription_id?.toString()
      const userId = await resolveUserId(payload, subscriptionId)

      if (userId) {
        // Reset credits on renewal
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan_type')
          .eq('id', userId)
          .single()

        if (profile) {
          const credits = PLAN_CREDITS[profile.plan_type] || 3
          await supabase
            .from('profiles')
            .update({
              credits_remaining: credits,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
        }
      }
    }

    processingEventId = null
    return NextResponse.json({ received: true })
  } catch (error) {
    if (processingEventId) {
      await releaseWebhookEvent(processingEventId)
    }

    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
