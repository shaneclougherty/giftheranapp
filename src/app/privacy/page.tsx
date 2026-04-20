import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <Link href="/">
            <img
              src="https://kckxnvyorzzayhfapadc.supabase.co/storage/v1/object/public/photos/GiftHerAnApp_Logo_w_words.png"
              alt="GiftHerAnApp"
              className="h-10 w-auto"
            />
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-[#0F2E2C] mb-8">Privacy Policy</h1>

        <div className="space-y-5 text-[15px] text-[#5A7270] leading-relaxed">
          <p>
            GiftHerAnApp is a product of <strong className="text-[#0F2E2C]">Shane Ventures LLC</strong>. We take your privacy seriously and want to be transparent about what we collect and why.
          </p>

          <h2 className="text-lg font-semibold text-[#0F2E2C] pt-2">What we collect</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>First names (his and hers) — to personalize the app</li>
            <li>Email address — collected via Stripe at checkout, used for purchase confirmation</li>
            <li>Phone number (his) — for SMS notifications when coupons are redeemed</li>
            <li>Photos — uploaded by you to display within the app</li>
            <li>Usage data — theme selection, coupon choices, and basic app interactions</li>
          </ul>

          <h2 className="text-lg font-semibold text-[#0F2E2C] pt-2">Why we collect it</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To build and deliver your personalized coupon app</li>
            <li>To send SMS notifications when coupons are redeemed</li>
            <li>To send a purchase confirmation email with your app links</li>
            <li>To provide customer support</li>
          </ul>

          <h2 className="text-lg font-semibold text-[#0F2E2C] pt-2">Third-party services</h2>
          <p>We use the following services to deliver GiftHerAnApp. Each handles a specific part of the product:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-[#0F2E2C]">Stripe</strong> — payment processing. Their privacy policy applies to all payment data.</li>
            <li><strong className="text-[#0F2E2C]">Supabase</strong> — data and photo storage</li>
            <li><strong className="text-[#0F2E2C]">Twilio</strong> — SMS delivery</li>
            <li><strong className="text-[#0F2E2C]">Resend</strong> — email delivery</li>
            <li><strong className="text-[#0F2E2C]">Vercel</strong> — website hosting</li>
          </ul>

          <h2 className="text-lg font-semibold text-[#0F2E2C] pt-2">What we don't do</h2>
          <p>
            We do not sell, rent, or share your personal data with third parties for marketing purposes. Your photos are stored securely and are only used to display within the app you create.
          </p>

          <h2 className="text-lg font-semibold text-[#0F2E2C] pt-2">Data deletion</h2>
          <p>
            You can request deletion of all your data by emailing <a href="mailto:shane@giftheranapp.com" className="text-[#5DD3C2] underline">shane@giftheranapp.com</a>. We will remove your app, photos, and all associated data within 7 business days.
          </p>

          <h2 className="text-lg font-semibold text-[#0F2E2C] pt-2">Cookies</h2>
          <p>
            We use minimal cookies and localStorage for basic site functionality — for example, remembering if the gift animation has been viewed and caching theme preferences. We do not use tracking cookies or third-party analytics cookies.
          </p>

          <p>
            For questions about your data, contact <a href="mailto:shane@giftheranapp.com" className="text-[#5DD3C2] underline">shane@giftheranapp.com</a>.
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-[#5A7270]">
          <p>Last updated: April 2026</p>
        </div>
      </div>
    </div>
  )
}
