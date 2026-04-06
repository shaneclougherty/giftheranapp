import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await request.json()
    const { herName, hisName, relationship, hisEmail, hisPhone, theme, iconPhotoUrl, herPhotos, hisPhotos, couplePhotos, coupons } = body

    if (!herName || !hisName || !hisEmail || !hisPhone || !coupons?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const herSlug = generateSlug()
    const hisSlug = generateSlug()
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const { data: appData, error: appError } = await supabase
      .from('apps')
      .insert({
        her_name: herName,
        his_name: hisName,
        relationship_type: relationship,
        his_email: hisEmail,
        his_phone: hisPhone,
        theme: theme,
        her_slug: herSlug,
        his_slug: hisSlug,
        icon_photo_url: iconPhotoUrl || null,
        payment_status: 'pending',
        is_active: false,
      })
      .select()
      .single()

    if (appError) throw appError

    const appId = appData.id

    const photoRecords: any[] = []
    ;(herPhotos || []).forEach((url: string, i: number) => {
      if (url) photoRecords.push({ app_id: appId, photo_type: 'her', photo_url: url, display_order: i + 1 })
    })
    ;(hisPhotos || []).forEach((url: string, i: number) => {
      if (url) photoRecords.push({ app_id: appId, photo_type: 'him', photo_url: url, display_order: i + 1 })
    })
    ;(couplePhotos || []).forEach((url: string, i: number) => {
      if (url) photoRecords.push({ app_id: appId, photo_type: 'couple', photo_url: url, display_order: i + 1 })
    })

    if (photoRecords.length > 0) {
      await supabase.from('photos').insert(photoRecords)
    }

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
      await supabase.from('coupons').insert(couponRecords)
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: herName + ' Coupon App',
            description: 'A personalized coupon app made by ' + hisName + ' for ' + herName,
          },
          unit_amount: 1499,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: hisEmail,
      success_url: origin + '/success?app_id=' + appId,
      cancel_url: origin + '/build',
      metadata: {
        app_id: appId,
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout', details: error.message }, { status: 500 })
  }
}
