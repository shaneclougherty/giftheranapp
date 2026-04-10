import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const email = session.customer_details?.email || null

    return NextResponse.json({ email })
  } catch (error: any) {
    console.error('Failed to retrieve Stripe session:', error.message)
    return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 500 })
  }
}
