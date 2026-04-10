import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

async function generateHumanSlug(herName: string, hisName: string, supabase: any): Promise<string> {
  let base = (herName + hisName).toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!base) base = 'app'

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase
      .from('apps')
      .select('her_slug')
      .like('her_slug', base + '%')

    let maxNum = 0
    if (existing) {
      for (const row of existing) {
        const suffix = row.her_slug.slice(base.length)
        const num = parseInt(suffix, 10)
        if (!isNaN(num) && num > maxNum) maxNum = num
      }
    }

    const slug = base + (maxNum + 1)

    // Check it doesn't already exist (race condition guard)
    const { data: taken } = await supabase.from('apps').select('id').eq('her_slug', slug).single()
    if (!taken) return slug
  }

  // Fallback: append timestamp to guarantee uniqueness
  return base + Date.now().toString(36)
}

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await request.json()
    const { herName, hisName, relationship, hisPhone, theme, iconPhotoUrl, herPhotos, hisPhotos, couplePhotos, coupons } = body

    if (!herName || !hisName || !hisPhone || !coupons?.length) {
      console.error('Validation failed:', { herName: !!herName, hisName: !!hisName, hisPhone: !!hisPhone, couponsLength: coupons?.length })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Generating slug for:', herName, hisName)
    const slug = await generateHumanSlug(herName, hisName, supabase)
    console.log('Generated slug:', slug)
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const { data: appData, error: appError } = await supabase
      .from('apps')
      .insert({
        her_name: herName,
        his_name: hisName,
        relationship_type: relationship,
        his_email: '',
        his_phone: hisPhone,
        theme: theme,
        her_slug: slug,
        his_slug: slug,
        icon_photo_url: iconPhotoUrl || null,
        payment_status: 'pending',
        is_active: false,
      })
      .select()
      .single()

    if (appError) {
      console.error('Supabase insert error:', appError)
      throw appError
    }
    console.log('App created with id:', appData.id)

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
      const { error: photoError } = await supabase.from('photos').insert(photoRecords)
      if (photoError) console.error('Photo insert error:', photoError)
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
      const { error: couponError } = await supabase.from('coupons').insert(couponRecords)
      if (couponError) console.error('Coupon insert error:', couponError)
    }

    console.log('Creating Stripe session...')
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
      success_url: origin + '/success?app_id=' + appId + '&session_id={CHECKOUT_SESSION_ID}',
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
