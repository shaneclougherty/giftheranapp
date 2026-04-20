import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const appId = session.metadata?.app_id

    if (!appId) {
      console.error('No app_id in session metadata')
      return NextResponse.json({ received: true })
    }

    try {
      // Activate the app
      await supabase
        .from('apps')
        .update({ payment_status: 'paid', is_active: true })
        .eq('id', appId)

      // Fetch app data
      const { data: app, error: appError } = await supabase
        .from('apps')
        .select('her_name, his_name, her_slug, his_email')
        .eq('id', appId)
        .single()

      if (appError || !app) {
        console.error('Failed to fetch app for email:', appError)
        return NextResponse.json({ received: true })
      }

      // Get email — prefer app record, fall back to Stripe session
      const email = app.his_email || session.customer_details?.email
      if (!email) {
        console.log('No email available for app:', appId)
        return NextResponse.json({ received: true })
      }

      // Save email to app record if not already there
      if (!app.his_email && email) {
        await supabase.from('apps').update({ his_email: email }).eq('id', appId)
      }

      const slug = app.her_slug
      const giftLink = 'https://www.giftheranapp.com/gift/' + slug
      const appLink = 'https://www.giftheranapp.com/app/' + slug
      const manageLink = 'https://www.giftheranapp.com/manage/' + slug

      await resend.emails.send({
        from: 'GiftHerAnApp <shane@giftheranapp.com>',
        replyTo: 'shaneventuresllc@gmail.com',
        to: email,
        subject: `Your gift for ${app.her_name} is ready! 🎁`,
        html: buildEmailHtml(app.her_name, giftLink, appLink, manageLink),
      })

      console.log('Confirmation email sent to:', email)
    } catch (err) {
      console.error('Webhook processing error:', err)
    }
  }

  return NextResponse.json({ received: true })
}

function buildEmailHtml(herName: string, giftLink: string, appLink: string, manageLink: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8f8f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <!-- Logo -->
      <div style="text-align:center;padding:32px 24px 16px;">
        <img src="https://kckxnvyorzzayhfapadc.supabase.co/storage/v1/object/public/photos/GiftHerAnApp_Logo_w_words.png" alt="GiftHerAnApp" style="height:60px;width:auto;" />
      </div>

      <!-- Heading -->
      <div style="padding:0 24px 8px;text-align:center;">
        <h1 style="margin:0;font-size:22px;color:#0F2E2C;font-weight:700;">Your gift for ${herName} is ready!</h1>
      </div>

      <!-- Intro -->
      <div style="padding:8px 24px 24px;text-align:center;">
        <p style="margin:0;font-size:15px;color:#555;line-height:1.5;">Nice work — ${herName}'s app is built and ready to go. Here's everything you need.</p>
      </div>

      <!-- Section 1: Send her the gift -->
      <div style="padding:0 24px 24px;">
        <div style="background:#f0fdfb;border-radius:12px;padding:20px;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#0F2E2C;">Send her the gift</p>
          <p style="margin:0 0 14px;font-size:13px;color:#555;line-height:1.4;">When you're ready, text her this link:</p>
          <p style="margin:0;padding:10px 14px;background:#ffffff;border:1px solid #d1d5db;border-radius:8px;font-size:13px;color:#0F2E2C;word-break:break-all;"><a href="${giftLink}" style="color:#0F2E2C;text-decoration:none;">${giftLink}</a></p>
          <p style="margin:10px 0 0;font-size:11px;color:#999;">This shows her a special gift reveal before she sets up her app.</p>
        </div>
      </div>

      <!-- Section 2: Her app link -->
      <div style="padding:0 24px 24px;">
        <div style="background:#f0fdfb;border-radius:12px;padding:20px;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#0F2E2C;">Her app link</p>
          <p style="margin:0 0 14px;font-size:13px;color:#555;line-height:1.4;">If she ever needs to re-access her app directly:</p>
          <p style="margin:0;padding:10px 14px;background:#ffffff;border:1px solid #d1d5db;border-radius:8px;font-size:13px;color:#0F2E2C;word-break:break-all;"><a href="${appLink}" style="color:#0F2E2C;text-decoration:none;">${appLink}</a></p>
          <p style="margin:10px 0 0;font-size:11px;color:#999;">Save this in case she gets a new phone or needs to re-add the app.</p>
        </div>
      </div>

      <!-- Section 3: Manager dashboard -->
      <div style="padding:0 24px 24px;">
        <div style="background:#f8f8f8;border-radius:12px;padding:20px;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#0F2E2C;">Your manager dashboard</p>
          <p style="margin:0 0 14px;font-size:13px;color:#555;line-height:1.4;">Use this link to manage her app — swap photos, add coupons, and see when she redeems:</p>
          <a href="${manageLink}" style="display:block;text-align:center;padding:12px 20px;background:#0F2E2C;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">Open Dashboard</a>
          <p style="margin:10px 0 0;font-size:11px;color:#999;text-align:center;word-break:break-all;">${manageLink}</p>
        </div>
      </div>

      <!-- Section 4: Add to home screen -->
      <div style="padding:0 24px 24px;">
        <div style="background:#f8f8f8;border-radius:12px;padding:20px;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#0F2E2C;">Add to home screen</p>
          <p style="margin:0;font-size:13px;color:#555;line-height:1.4;">Both your dashboard and her app can be added to the home screen for easy access. Just open the link, tap Share, then tap "Add to Home Screen."</p>
        </div>
      </div>

      <!-- Section 5: What she'll see -->
      <div style="padding:0 24px 24px;">
        <div style="background:#f0fdfb;border-radius:12px;padding:20px;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#0F2E2C;">What she'll see</p>
          <p style="margin:0;font-size:13px;color:#555;line-height:1.4;">When she opens the gift link, she'll see a gift animation, then instructions to add her app to her home screen. It takes about 30 seconds.</p>
        </div>
      </div>

      <!-- Section 6: Quick tips -->
      <div style="padding:0 24px 28px;">
        <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#0F2E2C;">Quick tips</p>
        <ul style="margin:0;padding:0 0 0 18px;font-size:13px;color:#555;line-height:1.8;">
          <li>You can send her the gift link by text — it works best on her phone</li>
          <li>Add your manager dashboard to your home screen for easy access</li>
          <li>You'll get a text when she redeems a coupon</li>
        </ul>
      </div>

    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px 20px;">
      <p style="margin:0 0 8px;font-size:12px;color:#999;">Questions, concerns, or refund requests? Email us at <a href="mailto:shane@giftheranapp.com" style="color:#5DD3C2;text-decoration:none;">shane@giftheranapp.com</a></p>
      <p style="margin:0;font-size:11px;color:#bbb;">&copy; 2026 GiftHerAnApp</p>
    </div>
  </div>
</body>
</html>`
}
