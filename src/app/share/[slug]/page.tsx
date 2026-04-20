'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const themes: Record<string, {
  bg: string; accent: string; accentText: string;
  text: string; subtext: string; photoBorder: string; card: string; border: string;
}> = {
  rose_gold: { bg: 'bg-pink-50', accent: 'bg-pink-400', accentText: 'text-white', text: 'text-pink-900', subtext: 'text-pink-400', photoBorder: 'border-pink-300', card: 'bg-white/90 border-pink-200', border: 'border-pink-200' },
  ocean: { bg: 'bg-blue-50', accent: 'bg-blue-400', accentText: 'text-white', text: 'text-blue-900', subtext: 'text-blue-400', photoBorder: 'border-blue-300', card: 'bg-white/90 border-blue-200', border: 'border-blue-200' },
  sunset: { bg: 'bg-amber-50', accent: 'bg-orange-400', accentText: 'text-white', text: 'text-orange-900', subtext: 'text-orange-400', photoBorder: 'border-orange-300', card: 'bg-white/90 border-orange-200', border: 'border-orange-200' },
  lavender: { bg: 'bg-purple-50', accent: 'bg-purple-400', accentText: 'text-white', text: 'text-purple-900', subtext: 'text-purple-400', photoBorder: 'border-purple-300', card: 'bg-white/90 border-purple-200', border: 'border-purple-200' },
  sage: { bg: 'bg-emerald-50', accent: 'bg-emerald-400', accentText: 'text-white', text: 'text-emerald-900', subtext: 'text-emerald-400', photoBorder: 'border-emerald-300', card: 'bg-white/90 border-emerald-200', border: 'border-emerald-200' },
  cherry: { bg: 'bg-rose-50', accent: 'bg-rose-500', accentText: 'text-white', text: 'text-rose-900', subtext: 'text-rose-400', photoBorder: 'border-rose-300', card: 'bg-white/90 border-rose-200', border: 'border-rose-200' },
}

function Slideshow({ photos, borderClass, size = 'w-32 h-32' }: { photos: string[]; borderClass: string; size?: string }) {
  const [current, setCurrent] = useState(0)
  const filtered = photos.filter(Boolean)

  useEffect(() => {
    if (filtered.length <= 1) return
    const interval = setInterval(() => setCurrent(prev => (prev + 1) % filtered.length), 4000)
    return () => clearInterval(interval)
  }, [filtered.length])

  if (filtered.length === 0) return (
    <div className={`${size} mx-auto rounded-xl border-2 ${borderClass} bg-white/40 flex items-center justify-center mb-3`}>
      <span className="text-2xl opacity-40">📷</span>
    </div>
  )

  return (
    <div className={`${size} mx-auto rounded-xl border-2 ${borderClass} overflow-hidden mb-3 shadow relative`}>
      {filtered.map((url, i) => (
        <img key={i} src={url} alt="" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`} />
      ))}
    </div>
  )
}

export default function BragPage() {
  const params = useParams()
  const slug = params.slug as string

  const [app, setApp] = useState<any>(null)
  const [coupons, setCoupons] = useState<any[]>([])
  const [herPhotos, setHerPhotos] = useState<string[]>([])
  const [hisPhotos, setHisPhotos] = useState<string[]>([])
  const [couplePhotos, setCouplePhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [fadeIn, setFadeIn] = useState(false)
  const [tappedCoupon, setTappedCoupon] = useState<any>(null)
  const [demoStep, setDemoStep] = useState<'dashboard' | 'detail' | 'boyfriend' | 'done'>('dashboard')
  const [demoFade, setDemoFade] = useState(true)

  useEffect(() => {
    async function loadApp() {
      const { data: appData } = await supabase
        .from('apps')
        .select('*')
        .eq('her_slug', slug)
        .eq('is_active', true)
        .single()

      if (!appData) { setLoading(false); return }
      setApp(appData)

      const { data: couponData } = await supabase
        .from('coupons')
        .select('*')
        .eq('app_id', appData.id)
        .order('display_order', { ascending: true })
      setCoupons(couponData || [])

      const { data: photoData } = await supabase
        .from('photos')
        .select('*')
        .eq('app_id', appData.id)
        .order('display_order', { ascending: true })

      const photos = photoData || []
      setHerPhotos(photos.filter((p: any) => p.photo_type === 'her').map((p: any) => p.photo_url))
      setHisPhotos(photos.filter((p: any) => p.photo_type === 'him').map((p: any) => p.photo_url))
      setCouplePhotos(photos.filter((p: any) => p.photo_type === 'couple').map((p: any) => p.photo_url))

      setLoading(false)
      setTimeout(() => setFadeIn(true), 200)
    }
    loadApp()
  }, [slug])

  function demoTransition(next: 'dashboard' | 'detail' | 'boyfriend' | 'done') {
    setDemoFade(false)
    setTimeout(() => { setDemoStep(next); setDemoFade(true) }, 300)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-pulse text-pink-400 text-lg">Loading...</div>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">💔</div>
          <h1 className="text-xl font-semibold text-gray-800">App not found</h1>
        </div>
      </div>
    )
  }

  const t = themes[app.theme] || themes.rose_gold
  const relLabel = app.relationship_type === 'husband' ? 'husband' : 'boyfriend'

  return (
    <div className={`min-h-screen ${t.bg} pb-12`}>
      <div className={`max-w-md mx-auto px-6 transition-all duration-500 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

        {/* Title */}
        <div className="text-center pt-10 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {app.her_name} just received an app from {app.his_name} 💕
          </h1>
        </div>

        {/* Full interactive demo */}
        <div className={`${t.card} rounded-2xl border p-5 mb-5`}>
          <p className={`text-sm font-semibold ${t.text} mb-3`}>Try it out 👇</p>
          <div className={`transition-all duration-300 ${demoFade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

            {demoStep === 'dashboard' && (
              <div>
                <div className="text-center mb-4">
                  <Slideshow photos={herPhotos} borderClass={t.photoBorder} size="w-36 h-36" />
                  <h2 className={`text-lg font-bold ${t.text}`}>{app.her_name}&apos;s Coupon Dashboard</h2>
                  <p className={`text-xs italic ${t.subtext} mt-0.5`}>Made with ❤️ by {app.his_name}, just for {app.her_name}</p>
                  <p className="text-xs text-gray-400 mt-3">Tap a coupon to see what happens!</p>
                </div>
                <div className="space-y-2">
                  {coupons.map((coupon) => (
                    <button key={coupon.id} onClick={() => { setTappedCoupon(coupon); demoTransition('detail') }}
                      className={`w-full py-3 rounded-xl ${t.accent} ${t.accentText} font-medium text-sm text-center transition-all active:scale-95 ${
                        coupon.status === 'redeemed' ? 'opacity-40' : ''
                      }`}>
                      {coupon.emoji_override || coupon.emoji} {coupon.name}
                      {coupon.status === 'redeemed' && ' ✓'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {demoStep === 'detail' && tappedCoupon && (
              <div>
                <div className="text-center mb-4">
                  <Slideshow photos={herPhotos} borderClass={t.photoBorder} size="w-28 h-28" />
                  <span className="text-4xl">{tappedCoupon.emoji_override || tappedCoupon.emoji}</span>
                  <h3 className={`text-lg font-bold ${t.text} mt-2`}>{tappedCoupon.name}</h3>
                  <p className={`text-sm ${t.subtext} mt-2`}>
                    {tappedCoupon.detail_prompt || (tappedCoupon.coupon_type === 'b' ? 'Pick your options:' : 'Add any details')}
                  </p>
                  <div className={`mt-3 px-4 py-2.5 rounded-xl border ${t.border} bg-white/50 text-sm text-gray-400 italic`}>
                    {app.her_name} adds her details here...
                  </div>
                </div>
                <button onClick={() => demoTransition('boyfriend')}
                  className={`w-full py-3 rounded-xl ${t.accent} ${t.accentText} font-semibold text-sm`}>Continue</button>
                <button onClick={() => demoTransition('dashboard')}
                  className={`w-full py-2 text-xs ${t.subtext} mt-2`}>← Back</button>
              </div>
            )}

            {demoStep === 'boyfriend' && (
              <div className="text-center">
                <Slideshow photos={hisPhotos} borderClass={t.photoBorder} size="w-28 h-28" />
                <h3 className={`text-xl font-bold ${t.text}`}>Who has the best {relLabel}?</h3>
                <p className={`text-sm ${t.subtext} mt-1 mb-4`}>There&apos;s only one correct answer...</p>
                <button onClick={() => demoTransition('done')}
                  className={`w-full py-4 rounded-xl ${t.accent} ${t.accentText} font-bold text-base`}>
                  {app.her_name} does! 🙋‍♀️
                </button>
                <button onClick={() => demoTransition('detail')}
                  className={`w-full py-2 text-xs ${t.subtext} mt-2`}>← Back</button>
              </div>
            )}

            {demoStep === 'done' && (
              <div className="text-center">
                <Slideshow photos={couplePhotos} borderClass={t.photoBorder} size="w-28 h-28" />
                <div className="text-4xl mb-2">✅</div>
                <h3 className={`text-xl font-bold ${t.text}`}>Coupon Redeemed!</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {app.his_name} just got a text with exactly what {app.her_name} wants.
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Now he has to deliver! 😄
                </p>
                <button onClick={() => { setTappedCoupon(null); demoTransition('dashboard') }}
                  className={`w-full py-3 rounded-xl ${t.accent} ${t.accentText} font-semibold text-sm mt-4`}>Try another coupon</button>
              </div>
            )}

          </div>
        </div>

        {/* How it works */}
        <div className={`${t.card} rounded-2xl border p-5 mb-5`}>
          <h2 className={`text-base font-bold ${t.text} mb-3`}>How it works</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-lg">1️⃣</span>
              <p className="text-sm text-gray-600">She opens her app and picks a coupon</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">2️⃣</span>
              <p className="text-sm text-gray-600">She adds details like &ldquo;Matcha Latte from Starbucks&rdquo;</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">3️⃣</span>
              <p className="text-sm text-gray-600">{app.his_name} gets a text instantly with exactly what she wants</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">4️⃣</span>
              <p className="text-sm text-gray-600">He delivers — no excuses 😄</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center shadow-sm">
          <p className="text-xl font-bold text-gray-900 mb-2">
            Want your own app? 👀
          </p>
          <p className="text-sm text-gray-500 mb-1">
            It takes 5 minutes and costs less than a coffee date.
          </p>
          <p className="text-xs text-gray-400 mb-4">
            The most unique and thoughtful gift he could get you.
          </p>
          <a href="/"
            className={`block w-full py-4 rounded-2xl ${t.accent} ${t.accentText} font-bold text-base transition-all active:scale-[0.97] hover:shadow-lg text-center`}>
            Get My Own App →
          </a>
          <p className="text-xs text-gray-400 mt-3">giftheranapp.com</p>
        </div>

      </div>
    </div>
  )
}
