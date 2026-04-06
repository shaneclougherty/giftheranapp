'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Theme color definitions
const themes: Record<string, {
  bg: string; card: string; accent: string; accentText: string;
  text: string; subtext: string; redeemed: string; border: string;
  photoBorder: string; outlineBtn: string;
}> = {
  rose_gold: {
    bg: 'bg-pink-50',
    card: 'bg-white/90 border-pink-300',
    accent: 'bg-pink-400 hover:bg-pink-500',
    accentText: 'text-white',
    text: 'text-pink-900',
    subtext: 'text-pink-400',
    redeemed: 'bg-pink-100/60 border-pink-200 opacity-50',
    border: 'border-pink-300',
    photoBorder: 'border-pink-300 shadow-pink-200/50',
    outlineBtn: 'border-pink-400 text-pink-500 hover:bg-pink-50',
  },
  ocean: {
    bg: 'bg-blue-50',
    card: 'bg-white/90 border-blue-300',
    accent: 'bg-blue-400 hover:bg-blue-500',
    accentText: 'text-white',
    text: 'text-blue-900',
    subtext: 'text-blue-400',
    redeemed: 'bg-blue-100/60 border-blue-200 opacity-50',
    border: 'border-blue-300',
    photoBorder: 'border-blue-300 shadow-blue-200/50',
    outlineBtn: 'border-blue-400 text-blue-500 hover:bg-blue-50',
  },
  sunset: {
    bg: 'bg-amber-50',
    card: 'bg-white/90 border-orange-300',
    accent: 'bg-orange-400 hover:bg-orange-500',
    accentText: 'text-white',
    text: 'text-orange-900',
    subtext: 'text-orange-400',
    redeemed: 'bg-orange-100/60 border-orange-200 opacity-50',
    border: 'border-orange-300',
    photoBorder: 'border-orange-300 shadow-orange-200/50',
    outlineBtn: 'border-orange-400 text-orange-500 hover:bg-orange-50',
  },
  lavender: {
    bg: 'bg-purple-50',
    card: 'bg-white/90 border-purple-300',
    accent: 'bg-purple-400 hover:bg-purple-500',
    accentText: 'text-white',
    text: 'text-purple-900',
    subtext: 'text-purple-400',
    redeemed: 'bg-purple-100/60 border-purple-200 opacity-50',
    border: 'border-purple-300',
    photoBorder: 'border-purple-300 shadow-purple-200/50',
    outlineBtn: 'border-purple-400 text-purple-500 hover:bg-purple-50',
  },
  sage: {
    bg: 'bg-emerald-50',
    card: 'bg-white/90 border-emerald-300',
    accent: 'bg-emerald-400 hover:bg-emerald-500',
    accentText: 'text-white',
    text: 'text-emerald-900',
    subtext: 'text-emerald-400',
    redeemed: 'bg-emerald-100/60 border-emerald-200 opacity-50',
    border: 'border-emerald-300',
    photoBorder: 'border-emerald-300 shadow-emerald-200/50',
    outlineBtn: 'border-emerald-400 text-emerald-500 hover:bg-emerald-50',
  },
  cherry: {
    bg: 'bg-rose-50',
    card: 'bg-white/90 border-rose-300',
    accent: 'bg-rose-500 hover:bg-rose-600',
    accentText: 'text-white',
    text: 'text-rose-900',
    subtext: 'text-rose-400',
    redeemed: 'bg-rose-100/60 border-rose-200 opacity-50',
    border: 'border-rose-300',
    photoBorder: 'border-rose-300 shadow-rose-200/50',
    outlineBtn: 'border-rose-400 text-rose-500 hover:bg-rose-50',
  },
}

// Photo slideshow component
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
      <div className={`w-56 h-56 mx-auto rounded-2xl border-4 ${theme.photoBorder} shadow-lg bg-white/50 flex items-center justify-center mb-8`}>
        <span className="text-5xl">📷</span>
      </div>
    )
  }

  return (
    <div className={`w-56 h-56 mx-auto rounded-2xl overflow-hidden mb-8 border-4 ${theme.photoBorder} shadow-lg relative`}>
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
      {photos.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {photos.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? 'bg-white scale-110' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Coupon button component — centered text, no arrow
function CouponButton({
  coupon,
  theme,
  onClick,
  delay,
}: {
  coupon: { id: string; name: string; emoji: string; status: string }
  theme: typeof themes.rose_gold
  onClick: () => void
  delay: number
}) {
  const isRedeemed = coupon.status === 'redeemed'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <button
      onClick={isRedeemed ? undefined : onClick}
      disabled={isRedeemed}
      className={`w-full py-4 px-6 rounded-2xl border-2 transition-all duration-300 text-center ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      } ${
        isRedeemed
          ? `${theme.redeemed} cursor-not-allowed`
          : `${theme.card} cursor-pointer active:scale-[0.97] hover:shadow-md`
      }`}
    >
      <span className="text-2xl mr-2">{coupon.emoji}</span>
      <span className={`font-semibold text-base ${isRedeemed ? 'line-through opacity-60' : theme.text}`}>
        {coupon.name}
      </span>
      {isRedeemed && (
        <span className={`text-xs ml-2 ${theme.subtext}`}>✓ Redeemed</span>
      )}
    </button>
  )
}

// Main dashboard page
export default function GirlfriendDashboard() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [app, setApp] = useState<any>(null)
  const [coupons, setCoupons] = useState<any[]>([])
  const [photos, setPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const [photoVisible, setPhotoVisible] = useState(false)
  const [sectionVisible, setSectionVisible] = useState(false)

  useEffect(() => {
    async function loadApp() {
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
        .eq('photo_type', 'her')
        .order('display_order', { ascending: true })

      setPhotos((photoData || []).map((p: any) => p.photo_url))

      setLoading(false)

      // Staggered reveal animation
      setTimeout(() => setHeaderVisible(true), 100)
      setTimeout(() => setPhotoVisible(true), 300)
      setTimeout(() => setSectionVisible(true), 500)
    }

    loadApp()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-pulse text-pink-400 text-lg">Loading your app...</div>
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">💔</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">App not found</h1>
          <p className="text-gray-500">This link may have expired or doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  const theme = themes[app.theme] || themes.rose_gold
  const activeCoupons = coupons.filter(c => c.status === 'active')
  const redeemedCoupons = coupons.filter(c => c.status === 'redeemed')
  const allRedeemed = activeCoupons.length === 0 && redeemedCoupons.length > 0

  function handleCouponClick(coupon: any) {
    router.push(`/app/${slug}/redeem/${coupon.id}`)
  }

  function handleShare() {
    const bragUrl = `${window.location.origin}/share/${slug}`
    if (navigator.share) {
      navigator.share({
        title: `${app.her_name}'s Coupon Dashboard`,
        text: `Look what ${app.his_name} made for me! 💕`,
        url: bragUrl,
      })
    } else {
      navigator.clipboard.writeText(bragUrl)
      alert('Link copied! Share it with your friends 💕')
    }
  }

  return (
    <div className={`min-h-screen ${theme.bg} pb-12`}>

      {/* Title and subtitle */}
      <div className={`pt-12 pb-2 px-6 text-center transition-all duration-500 ${
        headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <h1 className={`text-2xl font-bold ${theme.text} mb-1`}>
          {app.her_name}&apos;s Coupon Dashboard
        </h1>
        <p className={`text-sm italic ${theme.subtext}`}>
          Made with ❤️ by {app.his_name}, just for {app.her_name}
        </p>
      </div>

      {/* Photo slideshow */}
      <div className={`py-6 transition-all duration-500 ${
        photoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
        <PhotoSlideshow photos={photos} theme={theme} />
      </div>

      {/* Section label */}
      <div className={`px-6 mb-5 text-center transition-all duration-500 ${
        sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <h2 className={`text-lg font-semibold ${theme.text}`}>
          Choose your {app.her_name} Coupon
        </h2>
      </div>

      {/* All redeemed congratulations */}
      {allRedeemed && (
        <div className="mx-6 mb-6 p-6 rounded-2xl bg-white/60 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className={`text-lg font-bold ${theme.text} mb-1`}>All coupons redeemed!</h2>
          <p className={`text-sm ${theme.subtext}`}>
            Ask {app.his_name} to add more coupons 💕
          </p>
        </div>
      )}

      {/* Coupon buttons */}
      <div className="px-6 space-y-4 max-w-md mx-auto">
        {coupons.map((coupon, index) => (
          <CouponButton
            key={coupon.id}
            coupon={coupon}
            theme={theme}
            onClick={() => handleCouponClick(coupon)}
            delay={600 + index * 100}
          />
        ))}
      </div>

      {/* Show off my App button */}
      <div className={`px-6 max-w-md mx-auto mt-10 transition-all duration-500 ${
        sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <button
          onClick={handleShare}
          className={`w-full py-3 px-6 rounded-full border-2 ${theme.outlineBtn} bg-transparent font-medium text-sm transition-all duration-200 active:scale-[0.97]`}
        >
          ✨ Show off my App
        </button>
      </div>

    </div>
  )
}
