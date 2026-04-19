'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function GiftRevealPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<'gift' | 'instructions'>('gift')
  const [visible, setVisible] = useState(false)
  const [canTap, setCanTap] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('gift_seen_' + slug)
    if (seen) {
      router.replace('/app/' + slug)
      return
    }

    async function loadApp() {
      const { data } = await supabase
        .from('apps')
        .select('*')
        .eq('her_slug', slug)
        .eq('is_active', true)
        .single()

      if (!data) {
        router.replace('/app/' + slug)
        return
      }

      setApp(data)
      setLoading(false)
      setTimeout(() => setVisible(true), 100)
      setTimeout(() => setCanTap(true), 2000)
    }

    loadApp()
  }, [slug, router])

  function openGift() {
    if (!canTap) return
    setVisible(false)
    setTimeout(() => {
      setPhase('instructions')
      localStorage.setItem('gift_seen_' + slug, 'true')
      setTimeout(() => setVisible(true), 50)
    }, 500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-pink-400 text-lg">Loading your gift...</div>
      </div>
    )
  }

  if (!app) return null

  // Phase 1: Gift reveal
  if (phase === 'gift') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-100 via-rose-50 to-white flex items-center justify-center px-6"
        onClick={openGift}>
        <div className={`text-center transition-all duration-[800ms] ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-pink-400 text-sm mb-10 tracking-wide">a gift from {app.his_name}</p>

          <div className="relative inline-block mb-10">
            <span className="text-[120px] leading-none inline-block" style={{animation: 'gentle-float 3s ease-in-out infinite'}}>🎁</span>
            <span className="absolute -top-4 -right-4 text-2xl" style={{animation: 'sparkle 2s ease-in-out infinite'}}>✨</span>
            <span className="absolute -bottom-2 -left-4 text-xl" style={{animation: 'sparkle 2s ease-in-out infinite 0.5s'}}>✨</span>
          </div>

          <h1 className="text-2xl font-bold text-pink-900 mb-3">
            {app.his_name} made you something special
          </h1>
          <p className="text-pink-500 text-base">
            Just for you, {app.her_name} 💕
          </p>

          {canTap && (
            <p className="text-pink-300 text-sm mt-14" style={{animation: 'gentle-pulse 2s ease-in-out infinite'}}>
              Tap to open your gift
            </p>
          )}
        </div>

        <style jsx>{`
          @keyframes gentle-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.1); }
          }
          @keyframes gentle-pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  // Phase 2: Instructions
  if (phase === 'instructions') {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-pink-50 to-white px-6 pt-10 pb-16 transition-all duration-[800ms] ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-sm mx-auto">

          {/* App icon and name */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-lg border-2 border-pink-300 flex items-center justify-center bg-pink-400 mb-3">
              {app.icon_photo_url ? (
                <img src={app.icon_photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">💝</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900">{app.her_name}&apos;s App</h1>
            <p className="text-sm text-pink-500 mt-1">Made with ❤️ by {app.his_name}</p>
          </div>

          {/* Celebration message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              You got your own app! 🎉
            </h2>
            <p className="text-sm text-gray-500">
              Follow these steps to get your app on your home screen
            </p>
          </div>

          {/* 4 simple steps */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-800">
                <span className="font-bold">Step 1:</span> Tap &ldquo;Open&rdquo; to see your app
              </p>
              <a href={'/app/' + slug}
                className="block w-full text-center py-3 bg-pink-500 text-white rounded-xl font-bold text-base hover:bg-pink-600 active:scale-[0.97] transition-all">
                Open My App
              </a>
              <p className="text-sm text-gray-800">
                <span className="font-bold">Step 2:</span> Tap Share
              </p>
              <p className="text-sm text-gray-800">
                <span className="font-bold">Step 3:</span> Tap &ldquo;Add to Home Screen&rdquo;
              </p>
              <p className="text-sm text-gray-800">
                <span className="font-bold">Step 4:</span> Find and open your app!
              </p>
            </div>
          </div>

          {/* Video */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Need help? Watch this</p>
            </div>
            <div className="p-4">
              <video src="/appinstructionvideo.mp4" controls playsInline webkit-playsinline preload="metadata" className="w-full rounded-2xl" />
            </div>
          </div>

        </div>
      </div>
    )
  }

  return null
}
