import Link from 'next/link'

export default function RefundPolicyPage() {
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

        <h1 className="text-3xl font-bold text-[#0F2E2C] mb-8">Refund Policy</h1>

        <div className="space-y-5 text-[15px] text-[#5A7270] leading-relaxed">
          <p>
            We offer a <strong className="text-[#0F2E2C]">full refund within 7 days of purchase</strong>, no questions asked. If it's not what you expected, we've got you.
          </p>

          <p>
            To request a refund, email <a href="mailto:shane@giftheranapp.com" className="text-[#5DD3C2] underline">shane@giftheranapp.com</a> with the email address you used at checkout. That's all we need to get it started.
          </p>

          <p>
            Once a refund is processed, access to both the girlfriend's app and the manager dashboard will be revoked.
          </p>

          <p>
            No partial refunds are available. Refunds are typically processed within 3-5 business days.
          </p>

          <p className="text-[#0F2E2C] font-medium pt-2">
            We want you to be happy with your gift. If it's not right, we'll make it right.
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-[#5A7270]">
          <p>Last updated: April 2026</p>
        </div>
      </div>
    </div>
  )
}
