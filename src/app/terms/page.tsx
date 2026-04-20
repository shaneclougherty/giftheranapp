import Link from 'next/link'

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold text-[#0F2E2C] mb-8">Terms of Service</h1>

        <div className="space-y-5 text-[15px] text-[#5A7270] leading-relaxed">
          <p>
            GiftHerAnApp is a product of <strong className="text-[#0F2E2C]">Shane Ventures LLC</strong>. By purchasing or using GiftHerAnApp, you agree to these terms.
          </p>

          <p>
            You are purchasing a one-time digital product — a personalized web-based coupon app built for someone you care about. This is not a subscription, and there are no recurring charges.
          </p>

          <p>
            You must be 18 years or older to make a purchase.
          </p>

          <p>
            The product is provided as-is. We do our best to keep things running smoothly, but we do not guarantee 100% uptime or uninterrupted service.
          </p>

          <p>
            You retain ownership of any photos you upload. By uploading them, you grant GiftHerAnApp permission to store and display them solely for the purpose of delivering the product. We will never use your photos for anything else.
          </p>

          <p>
            GiftHerAnApp reserves the right to terminate access for abuse, fraud, or violations of these terms.
          </p>

          <p>
            Pricing may change at any time, but existing purchases are always honored at the price paid.
          </p>

          <p>
            For refund terms, see our <Link href="/refund" className="text-[#5DD3C2] underline">Refund Policy</Link>.
          </p>

          <p>
            For questions, contact <a href="mailto:shane@giftheranapp.com" className="text-[#5DD3C2] underline">shane@giftheranapp.com</a>.
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-[#5A7270]">
          <p>Last updated: April 2026</p>
        </div>
      </div>
    </div>
  )
}
