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
  const linkBox = (url: string) => `
          <div style="background:#F0FCFA;border:1px solid #D8F0EC;border-radius:10px;padding:12px 14px;margin:0 0 12px;word-break:break-all;">
            <a href="${url}" style="color:#0F2E2C;text-decoration:none;font-size:13px;line-height:1.4;">${url}</a>
          </div>
          <a href="${url}" style="display:block;text-align:center;padding:11px 20px;background:#5DD3C2;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">Open</a>`

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
      <div style="padding:8px 24px 28px;text-align:center;">
        <p style="margin:0;font-size:15px;color:#5A7270;line-height:1.5;">Nice work — here are your links. Save this email.</p>
      </div>

      <!-- Section 1: Your links -->
      <div style="padding:0 24px 8px;">
        <p style="margin:0 0 20px;font-size:16px;font-weight:700;color:#0F2E2C;">Your links</p>

        <!-- Gift link -->
        <div style="margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0F2E2C;">Her gift link</p>
          <p style="margin:0 0 12px;font-size:13px;color:#5A7270;line-height:1.4;">Send her this link when you're ready. She'll see a gift reveal before setting up her app.</p>
${linkBox(giftLink)}
        </div>

        <!-- App link -->
        <div style="margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0F2E2C;">Her app link</p>
          <p style="margin:0 0 12px;font-size:13px;color:#5A7270;line-height:1.4;">If she ever needs to re-access her app directly. Save this in case she gets a new phone or needs to re-add it.</p>
${linkBox(appLink)}
        </div>

        <!-- Manager link -->
        <div style="margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0F2E2C;">Your manager dashboard</p>
          <p style="margin:0 0 12px;font-size:13px;color:#5A7270;line-height:1.4;">Use this to manage her app — swap photos, add coupons, and see when she redeems.</p>
${linkBox(manageLink)}
        </div>
      </div>

      <!-- Section 2: Add to home screen -->
      <div style="padding:0 24px 24px;">
        <div style="background:#f8f8f8;border-radius:12px;padding:20px;">
          <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#0F2E2C;">Add to home screen</p>
          <p style="margin:0 0 14px;font-size:13px;color:#5A7270;line-height:1.4;">Both her app and your dashboard can be added to the home screen for easy access. Here's how:</p>
          <p style="margin:0 0 6px;font-size:13px;color:#0F2E2C;"><strong>Step 1:</strong> Open the link in your phone's browser</p>
          <p style="margin:0 0 6px;font-size:13px;color:#0F2E2C;"><strong>Step 2:</strong> Tap the Share button</p>
          <p style="margin:0 0 6px;font-size:13px;color:#0F2E2C;"><strong>Step 3:</strong> Tap "Add to Home Screen"</p>
          <p style="margin:0 0 12px;font-size:13px;color:#0F2E2C;"><strong>Step 4:</strong> Find and open the app on your home screen</p>
          <p style="margin:0;font-size:12px;color:#5A7270;">These steps work for both her app and your manager dashboard.</p>
        </div>
      </div>

      <!-- Section 3: Quick tips -->
      <div style="padding:0 24px 28px;">
        <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#0F2E2C;">Quick tips</p>
        <ul style="margin:0;padding:0 0 0 18px;font-size:13px;color:#5A7270;line-height:1.8;">
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
