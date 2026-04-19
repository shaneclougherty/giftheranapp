'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// ── Animation wrapper ──
// Uses direct DOM class toggling (not React state) so it survives bfcache,
// client-side back-navigation, and every other re-mount scenario.
function AnimateIn({
  children,
  delay = 0,
  className = '',
  type = 'fade-up',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  type?: 'fade-up' | 'phone'
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reset on every mount so re-navigations animate fresh
    el.classList.remove('is-visible')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => el.classList.add('is-visible'), delay)
          } else {
            el.classList.add('is-visible')
          }
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} data-animate={type} className={className}>
      {children}
    </div>
  )
}

// ── FAQ data ──
const FAQS = [
  {
    q: 'How long does it take to build?',
    a: "About 5 minutes. Pick a theme, upload photos, choose her coupons, and you're done.",
  },
  {
    q: 'How does she get the app on her phone?',
    a: 'Send her a gift link and she follows simple instructions, or grab her phone and add it to her home screen yourself. No App Store needed.',
  },
  {
    q: 'Does it work on iPhone and Android?',
    a: 'Yes, both. The app lives in her browser and gets added to her home screen, so it works on any modern phone.',
  },
  {
    q: 'Can I edit it after I send it?',
    a: 'Always. You get your own management dashboard to swap photos, add coupons, and reactivate used ones — anytime.',
  },
  {
    q: 'How does the text message work?',
    a: 'When she redeems a coupon, you get a text instantly with exactly what she wants. Just a regular text — nothing to install.',
  },
  {
    q: "What if she doesn't love it?",
    a: 'Money-back guarantee. We refund you and take the app down. No questions asked.',
  },
]

// ── Check SVG (reused in pricing) ──
function Check() {
  return (
    <svg
      className="w-4 h-4 text-[#5DD3C2]"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

// ── Page ──
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Safety net: if the browser restores this page from bfcache,
  // force every animated element visible immediately (no re-animation).
  useEffect(() => {
    const handler = (e: PageTransitionEvent) => {
      if (e.persisted) {
        document.querySelectorAll('[data-animate]').forEach((el) => {
          el.classList.add('is-visible')
        })
      }
    }
    window.addEventListener('pageshow', handler)
    return () => window.removeEventListener('pageshow', handler)
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#0F2E2C]">
      {/* ── Header ── */}
      <header className="px-6 py-6 md:py-8 flex items-center justify-between max-w-7xl mx-auto">
        <img
          src="/GiftHerAnApp_Logo_w_words.png"
          alt="GiftHerAnApp"
          className="h-20 md:h-24 w-auto"
        />
        <Link
          href="/build"
          className="hidden sm:inline-block px-6 py-3 rounded-full bg-[#5DD3C2] text-white font-semibold text-sm hover:bg-[#46C2B0] transition-colors shadow-md shadow-[#5DD3C2]/30"
        >
          Try It
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="px-6 pt-8 pb-20 md:pt-16 md:pb-32 max-w-7xl mx-auto">
        <div className="md:grid md:grid-cols-[1fr_1fr] md:gap-4 md:items-center md:max-w-5xl md:mx-auto">
          <div className="text-center md:text-center md:pr-4">
            <AnimateIn>
              <h1 className="text-5xl md:text-7xl font-extrabold leading-[0.95] tracking-tight mb-6 text-[#0F2E2C]">
                The most thoughtful gift you&apos;ll ever give her
              </h1>
            </AnimateIn>

            <AnimateIn delay={200}>
              <p className="text-lg md:text-xl text-[#5A7270] mb-10 max-w-md mx-auto md:mx-0 leading-relaxed">
                Build her her own app full of coupons she can redeem anytime.
                When she taps one, you get a text. Then you deliver.
              </p>
            </AnimateIn>

            <AnimateIn delay={400}>
              <Link
                href="/build"
                className="inline-block px-10 py-5 rounded-full bg-[#5DD3C2] text-white font-bold text-lg hover:bg-[#46C2B0] transition-all active:scale-[0.97] shadow-xl shadow-[#5DD3C2]/40"
              >
                See what hers would look like
              </Link>
            </AnimateIn>

            <AnimateIn delay={550}>
              <p className="mt-4 text-sm text-[#7A8A88]">
                Free to try &bull; $14.99 to send
              </p>
            </AnimateIn>
          </div>

          <div className="mt-16 md:mt-0 flex justify-center">
            <AnimateIn type="phone">
              <img
                src="https://kckxnvyorzzayhfapadc.supabase.co/storage/v1/object/public/photos/Iphone_w_Dasboard.png"
                alt="Her personalized coupon app"
                className="w-full max-w-md md:max-w-lg lg:max-w-xl drop-shadow-2xl"
              />
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ── Why Guys Love It ── */}
      <section className="bg-gradient-to-b from-[#F0FCFA] to-white px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <AnimateIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 text-[#0F2E2C] tracking-tight">
                Why guys love it.
              </h2>
              <p className="text-lg md:text-xl text-[#5A7270]">
                It hits different than flowers.
              </p>
            </div>
          </AnimateIn>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Acts of service, on demand.',
                desc: "If her love language is acts of service, this is built for her. Every coupon is a way you show up — and she's the one in control.",
              },
              {
                title: "A gift she'll actually keep.",
                desc: "Flowers die. Chocolate gets eaten. This sits on her home screen forever — and she'll show it to all her friends.",
              },
              {
                title: '5 minutes. Lasts forever.',
                desc: "Lower effort than running to Target. Higher impact than anything you've ever bought her. The math checks out.",
              },
              {
                title: 'She gets to brag.',
                desc: "She literally has her own app. Made by you. For her. Her friends are going to be jealous — and that's a win for you.",
              },
            ].map((item, i) => (
              <AnimateIn key={i} delay={i * 150}>
                <div className="p-8 md:p-10 rounded-3xl bg-white border border-[#D8F0EC] hover:border-[#5DD3C2] transition-all hover:shadow-lg hover:shadow-[#5DD3C2]/10 h-full">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 text-[#0F2E2C]">
                    {item.title}
                  </h3>
                  <p className="text-base md:text-lg text-[#5A7270] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TikTok Reactions ── */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 text-[#0F2E2C] tracking-tight">
                Watch her open it.
              </h2>
              <p className="text-lg md:text-xl text-[#5A7270]">
                Real reactions from real girlfriends.
              </p>
            </div>
          </AnimateIn>

          <AnimateIn delay={150}>
            <div className="flex justify-center">
              <div className="w-full max-w-xs aspect-[9/16] bg-gradient-to-br from-[#F0FCFA] to-[#D8F0EC] rounded-3xl border border-[#D8F0EC] flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white shadow-lg flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6 text-[#5DD3C2] ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#5A7270] font-medium">
                    Reaction video coming soon
                  </p>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="bg-gradient-to-b from-white to-[#F0FCFA] px-6 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateIn>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 text-[#0F2E2C] tracking-tight">
              One price. Everything included.
            </h2>
          </AnimateIn>

          <AnimateIn delay={150}>
            <p className="text-lg md:text-xl text-[#5A7270] mb-12">
              No subscriptions. No hidden fees. No catch.
            </p>
          </AnimateIn>

          <AnimateIn delay={300}>
            <div className="bg-white rounded-3xl border border-[#D8F0EC] shadow-2xl shadow-[#5DD3C2]/10 p-10 md:p-14">
              <div className="text-7xl md:text-8xl font-extrabold mb-2 text-[#0F2E2C]">
                $14.99
              </div>
              <p className="text-base text-[#7A8A88] mb-10">One-time payment</p>

              <Link
                href="/build"
                className="inline-block w-full sm:w-auto px-12 py-5 rounded-full bg-[#5DD3C2] text-white font-bold text-lg hover:bg-[#46C2B0] transition-all active:scale-[0.97] shadow-xl shadow-[#5DD3C2]/40"
              >
                See what hers would look like
              </Link>
              <p className="mt-4 text-sm text-[#7A8A88]">
                Free to try &bull; $14.99 to send
              </p>

              <div className="mt-12 pt-10 border-t border-[#D8F0EC] flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[#5A7270]">
                <div className="flex items-center gap-2">
                  <Check />
                  Secure payment via Stripe
                </div>
                <div className="flex items-center gap-2">
                  <Check />
                  Money-back guarantee
                </div>
                <div className="flex items-center gap-2">
                  <Check />
                  Works on any phone
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <AnimateIn>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 text-[#0F2E2C] tracking-tight">
                Questions?
              </h2>
              <p className="text-lg md:text-xl text-[#5A7270]">
                We&apos;ve got answers.
              </p>
            </div>
          </AnimateIn>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <AnimateIn key={i} delay={i * 100}>
                <div className="bg-white rounded-2xl border border-[#D8F0EC] overflow-hidden hover:border-[#5DD3C2] transition-colors">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                  >
                    <span className="font-semibold text-base md:text-lg text-[#0F2E2C]">
                      {faq.q}
                    </span>
                    <span
                      className={`text-2xl text-[#5DD3C2] transition-transform flex-shrink-0 font-light ${
                        openFaq === i ? 'rotate-45' : ''
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-base text-[#5A7270] leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-b from-[#F0FCFA] to-[#D8F0EC] px-6 py-24 md:py-40">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateIn>
            <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[0.95] tracking-tight text-[#0F2E2C]">
              Give her something she&apos;ll actually remember.
            </h2>
          </AnimateIn>

          <AnimateIn delay={200}>
            <p className="text-lg md:text-xl text-[#5A7270] mb-10">
              Takes 5 minutes. She&apos;ll keep it forever.
            </p>
          </AnimateIn>

          <AnimateIn delay={400}>
            <Link
              href="/build"
              className="inline-block px-12 py-6 rounded-full bg-[#5DD3C2] text-white font-bold text-xl hover:bg-[#46C2B0] transition-all active:scale-[0.97] shadow-2xl shadow-[#5DD3C2]/40"
            >
              See what hers would look like
            </Link>
          </AnimateIn>

          <AnimateIn delay={550}>
            <p className="mt-5 text-sm text-[#7A8A88]">
              Free to try &bull; $14.99 to send
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#D8F0EC] px-6 py-12 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <img
            src="/GiftHerAnApp_Logo_w_words.png"
            alt="GiftHerAnApp"
            className="h-16 w-auto"
          />
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-[#7A8A88]">
            <a href="#" className="hover:text-[#0F2E2C] transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-[#0F2E2C] transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-[#0F2E2C] transition-colors">
              Refund Policy
            </a>
            <a href="#" className="hover:text-[#0F2E2C] transition-colors">
              Contact
            </a>
          </div>
          <p className="text-sm text-[#7A8A88]">&copy; 2026 GiftHerAnApp</p>
        </div>
      </footer>
    </div>
  )
}
