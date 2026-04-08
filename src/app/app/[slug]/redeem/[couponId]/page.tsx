'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const themes: Record<string, {
  bg: string; card: string; accent: string; accentText: string;
  text: string; subtext: string; border: string; photoBorder: string;
  inputBorder: string; inputFocus: string; optionSelected: string; optionDefault: string;
}> = {
  rose_gold: {
    bg: 'bg-pink-50', card: 'bg-white/90 border-pink-300',
    accent: 'bg-pink-400 hover:bg-pink-500', accentText: 'text-white',
    text: 'text-pink-900', subtext: 'text-pink-400', border: 'border-pink-300',
    photoBorder: 'border-pink-300 shadow-pink-200/50',
    inputBorder: 'border-pink-200 focus:border-pink-400', inputFocus: 'focus:ring-pink-400',
    optionSelected: 'bg-pink-400 text-white border-pink-400', optionDefault: 'bg-white border-pink-200 text-pink-900',
  },
  ocean: {
    bg: 'bg-blue-50', card: 'bg-white/90 border-blue-300',
    accent: 'bg-blue-400 hover:bg-blue-500', accentText: 'text-white',
    text: 'text-blue-900', subtext: 'text-blue-400', border: 'border-blue-300',
    photoBorder: 'border-blue-300 shadow-blue-200/50',
    inputBorder: 'border-blue-200 focus:border-blue-400', inputFocus: 'focus:ring-blue-400',
    optionSelected: 'bg-blue-400 text-white border-blue-400', optionDefault: 'bg-white border-blue-200 text-blue-900',
  },
  sunset: {
    bg: 'bg-amber-50', card: 'bg-white/90 border-orange-300',
    accent: 'bg-orange-400 hover:bg-orange-500', accentText: 'text-white',
    text: 'text-orange-900', subtext: 'text-orange-400', border: 'border-orange-300',
    photoBorder: 'border-orange-300 shadow-orange-200/50',
    inputBorder: 'border-orange-200 focus:border-orange-400', inputFocus: 'focus:ring-orange-400',
    optionSelected: 'bg-orange-400 text-white border-orange-400', optionDefault: 'bg-white border-orange-200 text-orange-900',
  },
  lavender: {
    bg: 'bg-purple-50', card: 'bg-white/90 border-purple-300',
    accent: 'bg-purple-400 hover:bg-purple-500', accentText: 'text-white',
    text: 'text-purple-900', subtext: 'text-purple-400', border: 'border-purple-300',
    photoBorder: 'border-purple-300 shadow-purple-200/50',
    inputBorder: 'border-purple-200 focus:border-purple-400', inputFocus: 'focus:ring-purple-400',
    optionSelected: 'bg-purple-400 text-white border-purple-400', optionDefault: 'bg-white border-purple-200 text-purple-900',
  },
  sage: {
    bg: 'bg-emerald-50', card: 'bg-white/90 border-emerald-300',
    accent: 'bg-emerald-400 hover:bg-emerald-500', accentText: 'text-white',
    text: 'text-emerald-900', subtext: 'text-emerald-400', border: 'border-emerald-300',
    photoBorder: 'border-emerald-300 shadow-emerald-200/50',
    inputBorder: 'border-emerald-200 focus:border-emerald-400', inputFocus: 'focus:ring-emerald-400',
    optionSelected: 'bg-emerald-400 text-white border-emerald-400', optionDefault: 'bg-white border-emerald-200 text-emerald-900',
  },
  cherry: {
    bg: 'bg-rose-50', card: 'bg-white/90 border-rose-300',
    accent: 'bg-rose-500 hover:bg-rose-600', accentText: 'text-white',
    text: 'text-rose-900', subtext: 'text-rose-400', border: 'border-rose-300',
    photoBorder: 'border-rose-300 shadow-rose-200/50',
    inputBorder: 'border-rose-200 focus:border-rose-400', inputFocus: 'focus:ring-rose-400',
    optionSelected: 'bg-rose-500 text-white border-rose-500', optionDefault: 'bg-white border-rose-200 text-rose-900',
  },
}

function PhotoSlideshow({ photos, theme }: { photos: string[]; theme: typeof themes.rose_gold }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (photos.length <= 1) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % photos.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [photos.length])

  if (photos.length === 0) {
    return (
      <div className={`w-44 h-44 mx-auto rounded-2xl border-4 ${theme.photoBorder} shadow-lg bg-white/50 flex items-center justify-center`}>
        <span className="text-4xl">📷</span>
      </div>
    )
  }

  return (
    <div className={`w-44 h-44 mx-auto rounded-2xl overflow-hidden border-4 ${theme.photoBorder} shadow-lg relative`}>
      {photos.map((url, i) => (
        <img
          key={i}
          src={url}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  )
}

export default function RedeemCouponPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const couponId = params.couponId as string

  const [app, setApp] = useState<any>(null)
  const [coupon, setCoupon] = useState<any>(null)
  const [herPhotos, setHerPhotos] = useState<string[]>([])
  const [hisPhotos, setHisPhotos] = useState<string[]>([])
  const [couplePhotos, setCouplePhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [step, setStep] = useState<string>('loading')
  const [details, setDetails] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [fadeIn, setFadeIn] = useState(false)

  useEffect(() => {
    async function loadData() {
      const { data: appData, error: appError } = await supabase
        .from('apps')
        .select('*')
        .eq('her_slug', slug)
        .eq('is_active', true)
        .single()

      if (appError || !appData) {
        setError(true)
        setLoading(false)
        return
      }

      setApp(appData)

      // Cache theme so loading screens match on subsequent navigations
      try { sessionStorage.setItem(`theme:${slug}`, appData.theme) } catch {}

      const { data: couponData, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', couponId)
        .eq('app_id', appData.id)
        .single()

      if (couponError || !couponData) {
        setError(true)
        setLoading(false)
        return
      }

      if (couponData.status === 'redeemed') {
        router.push(`/app/${slug}`)
        return
      }

      setCoupon(couponData)

      const { data: allPhotos } = await supabase
        .from('photos')
        .select('*')
        .eq('app_id', appData.id)
        .order('display_order', { ascending: true })

      const photos = allPhotos || []
      setHerPhotos(photos.filter((p: any) => p.photo_type === 'her').map((p: any) => p.photo_url))
      setHisPhotos(photos.filter((p: any) => p.photo_type === 'him').map((p: any) => p.photo_url))
      setCouplePhotos(photos.filter((p: any) => p.photo_type === 'couple').map((p: any) => p.photo_url))

      // Determine starting step based on coupon type
      if (couponData.coupon_type === 'b' && couponData.options) {
        setStep('options')
      } else if (couponData.asks_for_details) {
        setStep('details')
      } else {
        setStep('best_boyfriend')
      }

      setLoading(false)
      setTimeout(() => setFadeIn(true), 100)
    }

    loadData()
  }, [slug, couponId, router])

  function toggleOption(option: string) {
    const maxPicks = coupon.max_picks
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(o => o !== option))
    } else {
      if (maxPicks && selectedOptions.length >= maxPicks) {
        // At max — replace the first selection
        return
      }
      setSelectedOptions([...selectedOptions, option])
    }
  }

  function buildDetailsString(): string {
    if (coupon.coupon_type === 'b') {
      const picks = selectedOptions.join(', ')
      return details ? `${picks} — ${details}` : picks
    }
    return details
  }

  async function handleRedeem() {
    setStep('confirming')

    const finalDetails = buildDetailsString()

    await supabase
      .from('coupons')
      .update({ status: 'redeemed' })
      .eq('id', couponId)

    await supabase
      .from('redemptions')
      .insert({
        coupon_id: couponId,
        app_id: app.id,
        details: finalDetails || null,
        sms_sent: false,
      })

    // Send SMS
    try {
      const smsResponse = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: app.his_phone,
          herName: app.her_name,
          hisName: app.his_name,
          couponName: coupon.name,
          couponEmoji: coupon.emoji_override || coupon.emoji,
          details: finalDetails || null,
        }),
      })

      if (smsResponse.ok) {
        await supabase
          .from('redemptions')
          .update({ sms_sent: true })
          .eq('coupon_id', couponId)
          .eq('app_id', app.id)
          .order('redeemed_at', { ascending: false })
          .limit(1)
      }
    } catch (err) {
      console.error('SMS failed:', err)
    }

    setTimeout(() => {
      setFadeIn(false)
      setTimeout(() => {
        setStep('done')
        setFadeIn(true)
      }, 300)
    }, 800)
  }

  function handleGoBack() {
    router.push(`/app/${slug}`)
  }

  function transitionTo(nextStep: string) {
    setFadeIn(false)
    setTimeout(() => {
      setStep(nextStep)
      setFadeIn(true)
    }, 300)
  }

  if (loading) {
    let cachedTheme: string | null = null
    try { cachedTheme = sessionStorage.getItem(`theme:${slug}`) } catch {}
    const t = themes[cachedTheme || ''] || themes.rose_gold
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.bg}`}>
        <div className={`animate-pulse ${t.subtext} text-lg`}>Loading...</div>
      </div>
    )
  }

  if (error || !app || !coupon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">💔</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h1>
          <p className="text-gray-500 mb-4">This coupon may not exist.</p>
          <button onClick={handleGoBack} className="text-pink-500 underline">Go back to dashboard</button>
        </div>
      </div>
    )
  }

  const theme = themes[app.theme] || themes.rose_gold
  const relationshipLabel = app.relationship_type === 'husband' ? 'husband' : 'boyfriend'
  const displayEmoji = coupon.emoji_override || coupon.emoji

  // ==========================================
  // TYPE B: OPTIONS SELECT
  // ==========================================
  if (step === 'options') {
    const options: string[] = typeof coupon.options === 'string' ? JSON.parse(coupon.options) : (coupon.options || [])
    const maxPicks = coupon.max_picks
    const canContinue = selectedOptions.length > 0

    return (
      <div className={`min-h-screen ${theme.bg} pb-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="pt-8 pb-1 px-6 text-center">
          <h1 className={`text-2xl font-bold ${theme.text} mb-1`}>
            {app.her_name}&apos;s Coupon Dashboard
          </h1>
          <p className={`text-sm italic ${theme.subtext}`}>
            Made with ❤️ by {app.his_name}, just for {app.her_name}
          </p>
        </div>

        <div className="py-4">
          <PhotoSlideshow photos={herPhotos} theme={theme} />
        </div>

        <div className={`px-6 max-w-md mx-auto transition-all duration-500 ${
          fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="text-center mb-4">
            <span className="text-4xl">{displayEmoji}</span>
            <h2 className={`text-xl font-bold ${theme.text} mt-2`}>{coupon.name}</h2>
            <p className={`text-sm ${theme.subtext} mt-1`}>
              {maxPicks
                ? `Pick ${maxPicks === 1 ? 'one' : `up to ${maxPicks}`}`
                : 'Pick as many as you want'}
            </p>
          </div>

          <div className="space-y-3 mb-5">
            {options.map((option) => {
              const isSelected = selectedOptions.includes(option)
              return (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`w-full py-3.5 px-5 rounded-2xl border-2 font-medium text-base transition-all duration-200 active:scale-[0.97] ${
                    isSelected ? theme.optionSelected : theme.optionDefault
                  }`}
                >
                  {isSelected && '✓ '}{option}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => transitionTo('best_boyfriend')}
            disabled={!canContinue}
            className={`w-full py-4 rounded-2xl ${theme.accent} ${theme.accentText} font-semibold text-base transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Continue
          </button>

          <button
            onClick={handleGoBack}
            className={`w-full mt-2 py-2 text-sm ${theme.subtext} hover:underline`}
          >
            ← Back to coupons
          </button>
        </div>
      </div>
    )
  }

  // ==========================================
  // TYPE A: TEXT DETAILS
  // ==========================================
  if (step === 'details') {
    return (
      <div className={`min-h-screen ${theme.bg} pb-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="pt-8 pb-1 px-6 text-center">
          <h1 className={`text-2xl font-bold ${theme.text} mb-1`}>
            {app.her_name}&apos;s Coupon Dashboard
          </h1>
          <p className={`text-sm italic ${theme.subtext}`}>
            Made with ❤️ by {app.his_name}, just for {app.her_name}
          </p>
        </div>

        <div className="py-4">
          <PhotoSlideshow photos={herPhotos} theme={theme} />
        </div>

        <div className={`px-6 max-w-md mx-auto transition-all duration-500 ${
          fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="text-center mb-4">
            <span className="text-4xl">{displayEmoji}</span>
            <h2 className={`text-xl font-bold ${theme.text} mt-2`}>{coupon.name}</h2>
          </div>

          <p className={`text-sm font-medium ${theme.text} text-center mb-3`}>
            {coupon.detail_prompt || `Add any details for ${app.his_name}`}
          </p>

          <input
            type="text"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Type here..."
            className={`w-full px-4 py-3 rounded-xl border-2 ${theme.inputBorder} outline-none transition-colors bg-white/80 text-gray-800 placeholder-gray-400 text-center`}
          />

          <button
            onClick={() => transitionTo('best_boyfriend')}
            className={`w-full mt-5 py-4 rounded-2xl ${theme.accent} ${theme.accentText} font-semibold text-base transition-all duration-200 active:scale-[0.97]`}
          >
            Continue
          </button>

          <button
            onClick={handleGoBack}
            className={`w-full mt-2 py-2 text-sm ${theme.subtext} hover:underline`}
          >
            ← Back to coupons
          </button>
        </div>
      </div>
    )
  }

  // ==========================================
  // "WHO HAS THE BEST BOYFRIEND?"
  // ==========================================
  if (step === 'best_boyfriend') {
    return (
      <div className={`min-h-screen ${theme.bg} pb-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="pt-8 pb-1 px-6 text-center">
          <h1 className={`text-2xl font-bold ${theme.text} mb-1`}>
            {app.her_name}&apos;s Coupon Dashboard
          </h1>
          <p className={`text-sm italic ${theme.subtext}`}>
            Made with ❤️ by {app.his_name}, just for {app.her_name}
          </p>
        </div>

        <div className="py-4">
          <PhotoSlideshow photos={hisPhotos} theme={theme} />
        </div>

        <div className={`px-6 max-w-md mx-auto text-center transition-all duration-500 ${
          fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h2 className={`text-2xl font-bold ${theme.text} mb-2`}>
            Who has the best {relationshipLabel}?
          </h2>
          <p className={`text-sm ${theme.subtext} mb-6`}>
            There&apos;s only one correct answer...
          </p>

          <button
            onClick={handleRedeem}
            className={`w-full py-5 rounded-2xl ${theme.accent} ${theme.accentText} font-bold text-lg transition-all duration-200 active:scale-[0.97] hover:shadow-lg`}
          >
            {app.her_name} does! 🙋‍♀️
          </button>
        </div>
      </div>
    )
  }

  // ==========================================
  // CONFIRMING
  // ==========================================
  if (step === 'confirming') {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">💕</div>
          <p className={`text-lg font-medium ${theme.text}`}>Redeeming your coupon...</p>
        </div>
      </div>
    )
  }

  // ==========================================
  // DONE
  // ==========================================
  if (step === 'done') {
    const finalDetails = buildDetailsString()

    return (
      <div className={`min-h-screen ${theme.bg} pb-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="pt-8 pb-1 px-6 text-center">
          <h1 className={`text-2xl font-bold ${theme.text} mb-1`}>
            {app.her_name}&apos;s Coupon Dashboard
          </h1>
          <p className={`text-sm italic ${theme.subtext}`}>
            Made with ❤️ by {app.his_name}, just for {app.her_name}
          </p>
        </div>

        <div className="py-4">
          <PhotoSlideshow photos={couplePhotos} theme={theme} />
        </div>

        <div className={`px-6 max-w-md mx-auto text-center transition-all duration-500 ${
          fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="text-5xl mb-3">✅</div>
          <h2 className={`text-2xl font-bold ${theme.text} mb-2`}>Coupon Redeemed!</h2>
          <p className={`text-base ${theme.subtext} mb-1`}>
            {displayEmoji} {coupon.name}
          </p>
          {finalDetails && (
            <p className={`text-sm ${theme.subtext} mb-3 italic`}>
              &ldquo;{finalDetails}&rdquo;
            </p>
          )}
          <p className={`text-sm ${theme.text} mb-6`}>
            {app.his_name} has been notified! Your {coupon.name.toLowerCase()} is on the way 💕
          </p>

          <button
            onClick={handleGoBack}
            className={`w-full py-4 rounded-2xl ${theme.accent} ${theme.accentText} font-semibold text-base transition-all duration-200 active:scale-[0.97]`}
          >
            Back to my coupons
          </button>
        </div>
      </div>
    )
  }

  return null
}
