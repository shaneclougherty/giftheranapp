import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' })
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata!

    try {
      const { data: appData, error: appError } = await supabase
        .from('apps')
        .insert({
          her_name: meta.herName,
          his_name: meta.hisName,
          relationship_type: meta.relationship,
          his_email: meta.hisEmail,
          his_phone: meta.hisPhone,
          theme: meta.theme,
          her_slug: meta.herSlug,
          his_slug: meta.hisSlug,
          icon_photo_url: meta.iconPhotoUrl || null,
          payment_status: 'paid',
          stripe_payment_id: session.payment_intent as string,
          is_active: true,
        })
        .select()
        .single()

      if (appError) throw appError

      const appId = appData.id

      const herPhotos = JSON.parse(meta.herPhotos || '[]')
      const hisPhotos = JSON.parse(meta.hisPhotos || '[]')
      const couplePhotos = JSON.parse(meta.couplePhotos || '[]')

      const photoRecords: any[] = []
      herPhotos.forEach((url: string, i: number) => {
        if (url) photoRecords.push({ app_id: appId, photo_type: 'her', photo_url: url, display_order: i + 1 })
      })
      hisPhotos.forEach((url: string, i: number) => {
        if (url) photoRecords.push({ app_id: appId, photo_type: 'him', photo_url: url, display_order: i + 1 })
      })
      couplePhotos.forEach((url: string, i: number) => {
        if (url) photoRecords.push({ app_id: appId, photo_type: 'couple', photo_url: url, display_order: i + 1 })
      })

      if (photoRecords.length > 0) {
        const { error: photoError } = await supabase.from('photos').insert(photoRecords)
        if (photoError) console.error('Photo insert error:', photoError)
      }

      const coupons = JSON.parse(meta.coupons || '[]')
      const couponRecords = coupons.map((c: any, i: number) => ({
        app_id: appId,
        name: c.name,
        emoji: c.emoji,
        is_custom: c.is_custom || false,
        coupon_type: c.coupon_type || 'a',
        asks_for_details: c.asks_for_details || false,
        detail_prompt: c.detail_prompt || null,
        options: c.options ? JSON.stringify(c.options) : null,
        max_picks: c.max_picks || null,
        emoji_override: c.emoji_override || null,
        display_order: i + 1,
        status: 'active',
      }))

      if (couponRecords.length > 0) {
        const { error: couponError } = await supabase.from('coupons').insert(couponRecords)
        if (couponError) console.error('Coupon insert error:', couponError)
      }

      console.log(`App created: ${meta.herName}'s app (${meta.herSlug})`)
    } catch (err) {
      console.error('Failed to create app from webhook:', err)
      return NextResponse.json({ error: 'Failed to process' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
