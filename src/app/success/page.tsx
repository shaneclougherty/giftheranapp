'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function SuccessContent() {
  const searchParams = useSearchParams()
  const appId = searchParams.get('app_id')
  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [fadeIn, setFadeIn] = useState(false)

  useEffect(() => {
    async function loadApp() {
      if (!appId) { setLoading(false); return }
      await new Promise(resolve => setTimeout(resolve, 1500))
      const { data } = await supabase.from('apps').select('*').eq('id', appId).single()
      if (data) {
        await supabase.from('apps').update({ payment_status: 'paid', is_active: true }).eq('id', appId)
        setApp(data)
        setLoading(false)
        setTimeout(() => setFadeIn(true), 200)
      } else {
        setLoading(false)
      }
    }
    loadApp()
  }, [appId])

  function copyLink(link: string, label: string) {
    navigator.clipboard.writeText(link)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h1>
          <p className="text-gray-500 animate-pulse">Setting up her app...</p>
        </div>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h1>
          <p className="text-gray-500">We couldn&apos;t find your app. Please contact support.</p>
        </div>
      </div>
    )
  }

  const herGiftLink = (typeof window !== 'undefined' ? window.location.origin : '') + '/gift/' + app.her_slug
  const herAppLink = (typeof window !== 'undefined' ? window.location.origin : '') + '/app/' + app.her_slug
  const hisLink = (typeof window !== 'undefined' ? window.location.origin : '') + '/manage/' + app.his_slug

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-12">
      <div className={`max-w-lg mx-auto px-6 pt-12 transition-all duration-700 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {app.her_name}&apos;s app is ready!
          </h1>
          <p className="text-gray-500">
            You just built something amazing for {app.her_name}. Here&apos;s how to set everything up.
          </p>
        </div>

        {/* ====== SECTION 1: Get her app on her phone ====== */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <h2 className="text-lg font-bold text-gray-900">Get her app on her phone</h2>
            </div>
          </div>

          {/* Option A */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Option A: Set it up yourself</h3>
            <p className="text-xs text-gray-500 mb-3">Grab her phone when she&apos;s not looking — maximum surprise factor.</p>

            <div className="flex gap-2 mb-4">
              <input type="text" readOnly value={herAppLink}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none" />
              <button onClick={() => copyLink(herAppLink, 'herApp')}
                className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors">
                {copied === 'herApp' ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3">Open the link on her phone, then:</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-800"><span className="font-semibold">Step 1:</span> Tap Share</p>
              <p className="text-sm text-gray-800"><span className="font-semibold">Step 2:</span> Tap &ldquo;Add to Home Screen&rdquo;</p>
              <p className="text-sm text-gray-800"><span className="font-semibold">Step 3:</span> Find your app on the home screen and open it!</p>
            </div>
          </div>

          {/* Option B */}
          <div className="px-5 py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Option B: Send her the gift</h3>
            <p className="text-xs text-gray-500 mb-3">She&apos;ll get a gift reveal animation with setup instructions built in.</p>
            <div className="flex gap-2">
              <input type="text" readOnly value={herGiftLink}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none" />
              <button onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'A gift from ' + app.his_name, text: app.his_name + ' made you something special! 🎁', url: herGiftLink })
                } else {
                  copyLink(herGiftLink, 'herGift')
                }
              }}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors">
                {copied === 'herGift' ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>
        </div>

        {/* ====== SECTION 2: Get your dashboard on your phone ====== */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <h2 className="text-lg font-bold text-gray-900">Get your dashboard on your phone</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Your management panel — add coupons, swap photos, see redemptions.</p>
          </div>

          <div className="px-5 py-4">
            <div className="flex gap-2 mb-4">
              <input type="text" readOnly value={hisLink}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none" />
              <a href={hisLink} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-medium hover:bg-gray-900 transition-colors">
                Open
              </a>
            </div>

            <p className="text-xs text-gray-500 mb-3">Open the link above, then:</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-800"><span className="font-semibold">Step 1:</span> Tap Share</p>
              <p className="text-sm text-gray-800"><span className="font-semibold">Step 2:</span> Tap &ldquo;Add to Home Screen&rdquo;</p>
              <p className="text-sm text-gray-800"><span className="font-semibold">Step 3:</span> Find your dashboard on the home screen and open it!</p>
            </div>
          </div>
        </div>

        {/* ====== SECTION 3: Save these links ====== */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🔗</span>
            <h2 className="text-lg font-bold text-gray-900">Save these links</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">Keep these somewhere safe. If either of you loses the app, just re-open the link and add it to the home screen again.</p>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">{app.her_name}&apos;s app</p>
              <div className="flex gap-2">
                <input type="text" readOnly value={herAppLink}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none" />
                <button onClick={() => copyLink(herAppLink, 'saveHer')}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors">
                  {copied === 'saveHer' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Your dashboard</p>
              <div className="flex gap-2">
                <input type="text" readOnly value={hisLink}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none" />
                <button onClick={() => copyLink(hisLink, 'saveHis')}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors">
                  {copied === 'saveHis' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">Both links have been emailed to {app.his_email}</p>
        </div>

        {/* ====== SECTION 4: Video ====== */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎥</span>
              <h2 className="text-lg font-bold text-gray-900">Need help? Watch this</h2>
            </div>
          </div>
          <div className="px-5 py-6 flex justify-center">
            <div className="w-[200px] aspect-[9/16] bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <span className="text-4xl">▶️</span>
                <p className="text-xs text-gray-400 mt-2 px-4">15-second setup video coming soon</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
      <SuccessContent />
    </Suspense>
  )
}