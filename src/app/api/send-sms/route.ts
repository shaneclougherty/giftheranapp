import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const fromNumber = process.env.TWILIO_PHONE_NUMBER!

const client = twilio(accountSid, authToken)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, herName, hisName, couponName, couponEmoji, details } = body

    // Validate required fields
    if (!to || !herName || !couponName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Build the message
    let message = `🎉 ${herName} just redeemed her ${couponEmoji} ${couponName} coupon!`

    if (details) {
      message += `\n\n📝 She wants: ${details}`
    }

    message += `\n\nTime to deliver, ${hisName}! 💕`

    // Send via Twilio
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    })

    return NextResponse.json({ success: true, messageId: result.sid })
  } catch (error: any) {
    console.error('SMS send error:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS', details: error.message },
      { status: 500 }
    )
  }
}