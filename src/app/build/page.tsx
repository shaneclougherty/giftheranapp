'use client'

import { useState, useEffect, useRef } from 'react'
import PhotoUploader from '@/components/PhotoUploader'
import { supabase } from '@/lib/supabase'

// Auto-crop an image file to a center square (800×800) and return a JPEG blob
async function autoCropToSquare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const size = Math.min(img.width, img.height)
      const x = (img.width - size) / 2
      const y = (img.height - size) / 2

      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 800
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, x, y, size, size, 0, 0, 800, 800)

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
        'image/jpeg',
        0.85,
      )
      URL.revokeObjectURL(img.src)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// Multi-select photo uploader with auto-crop for slideshow categories
function CategoryPhotos({
  label,
  photos,
  setPhotos,
  photoType,
}: {
  label: string
  photos: string[]
  setPhotos: (p: string[]) => void
  photoType: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const filled = photos.filter(Boolean)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    e.target.value = ''

    const slotsAvailable = 3 - filled.length
    const toProcess = files.slice(0, slotsAvailable)
    if (toProcess.length === 0) return

    setUploading(true)
    const newUrls: string[] = []

    for (const file of toProcess) {
      try {
        const blob = await autoCropToSquare(file)
        const fileName = `temp_${photoType}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.jpg`

        const { data, error } = await supabase.storage
          .from('photos')
          .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })

        if (error) throw error

        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(data.path)
        newUrls.push(urlData.publicUrl)
      } catch (err) {
        console.error('Upload failed:', err)
      }
    }

    if (newUrls.length > 0) {
      setPhotos([...filled, ...newUrls].slice(0, 3))
    }
    setUploading(false)
  }

  function removePhoto(index: number) {
    setPhotos(filled.filter((_, i) => i !== index))
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {filled.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-gray-300 transition-all">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70">
              ✕
            </button>
          </div>
        ))}
        {filled.length < 3 && (
          <button onClick={() => inputRef.current?.click()} disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 flex items-center justify-center transition-colors disabled:opacity-50">
            {uploading ? (
              <span className="text-xs text-gray-400 animate-pulse">Uploading...</span>
            ) : (
              <div className="text-center p-2">
                <span className="text-2xl block mb-1">📷</span>
                <span className="text-[10px] text-gray-400">{filled.length === 0 ? 'Add photos' : 'Add more'}</span>
              </div>
            )}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
    </div>
  )
}

const PRESET_COUPONS = [
  { name: 'Coffee Run', emoji: '☕', coupon_type: 'a', asks_for_details: true, detail_prompt: "What's your order?", configurable: false, description: 'She tells you exactly what she wants — you deliver the caffeine.' },
  { name: 'Dinner Date', emoji: '🍝', coupon_type: 'a', asks_for_details: true, detail_prompt: 'What are you craving?', configurable: false, description: 'She picks the food, you make it happen — delivery or a night out.' },
  { name: 'Round of Drinks', emoji: '🍹', coupon_type: 'a', asks_for_details: true, detail_prompt: 'Which bar and how many people? 🥂', configurable: false, description: 'Fund her night out — she tells you the bar and the headcount.' },
  { name: 'Express Boyfriend Delivery', emoji: '🚗', coupon_type: 'a', asks_for_details: true, detail_prompt: 'Where are you?', configurable: true, config_type: 'emoji_pick', description: 'You drop everything and go to her. Pick your travel method.' },
  { name: 'Ice Cream Run', emoji: '🍦', coupon_type: 'a', asks_for_details: true, detail_prompt: 'What flavor and where from?', configurable: false, description: 'She names the flavor and the spot — you go get it.' },
  { name: 'Car Service', emoji: '🔧', coupon_type: 'b', asks_for_details: true, detail_prompt: null, configurable: true, config_type: 'car', description: 'Pick which car services she can choose from.' },
  { name: 'Personal Chef Night', emoji: '👨‍🍳', coupon_type: 'a', asks_for_details: true, detail_prompt: 'What should he cook?', configurable: false, description: 'She picks the meal, you cook it from scratch. No complaining.' },
  { name: 'Spa Day', emoji: '🧖‍♀️', coupon_type: 'b', asks_for_details: true, detail_prompt: null, configurable: true, config_type: 'spa', description: 'Pick which treatments she can choose from and how many.' },
  { name: 'Movie Night', emoji: '🍿', coupon_type: 'a', asks_for_details: true, detail_prompt: 'What movie are we watching tonight?', configurable: false, description: 'She picks the movie. You are legally not allowed to complain or fall asleep.' },
]

const SPA_OPTIONS = ['Hair', 'Mani/Pedi', 'Facial', 'Massage']
const CAR_OPTIONS = ['Full tank of gas', 'Oil change', 'Car wash', 'Tune up']

const THEMES = [
  { id: 'rose_gold', label: 'Rose gold', dot: 'bg-pink-400', bg: 'bg-pink-50', pageBg: 'from-pink-50/80 to-white', accent: 'bg-pink-400', accentHover: 'hover:bg-pink-500', text: 'text-pink-900', sub: 'text-pink-400', border: 'border-pink-200', iconBorder: 'border-pink-300', btnText: 'text-white', inputFocus: 'focus:border-pink-400', selectedBorder: 'border-pink-400', selectedBg: 'bg-pink-50', toggleOn: 'border-pink-400 bg-pink-50 text-pink-700' },
  { id: 'ocean', label: 'Ocean', dot: 'bg-blue-400', bg: 'bg-blue-50', pageBg: 'from-blue-50/80 to-white', accent: 'bg-blue-400', accentHover: 'hover:bg-blue-500', text: 'text-blue-900', sub: 'text-blue-400', border: 'border-blue-200', iconBorder: 'border-blue-300', btnText: 'text-white', inputFocus: 'focus:border-blue-400', selectedBorder: 'border-blue-400', selectedBg: 'bg-blue-50', toggleOn: 'border-blue-400 bg-blue-50 text-blue-700' },
  { id: 'sunset', label: 'Sunset', dot: 'bg-orange-400', bg: 'bg-amber-50', pageBg: 'from-amber-50/80 to-white', accent: 'bg-orange-400', accentHover: 'hover:bg-orange-500', text: 'text-orange-900', sub: 'text-orange-400', border: 'border-orange-200', iconBorder: 'border-orange-300', btnText: 'text-white', inputFocus: 'focus:border-orange-400', selectedBorder: 'border-orange-400', selectedBg: 'bg-orange-50', toggleOn: 'border-orange-400 bg-orange-50 text-orange-700' },
  { id: 'lavender', label: 'Lavender', dot: 'bg-purple-400', bg: 'bg-purple-50', pageBg: 'from-purple-50/80 to-white', accent: 'bg-purple-400', accentHover: 'hover:bg-purple-500', text: 'text-purple-900', sub: 'text-purple-400', border: 'border-purple-200', iconBorder: 'border-purple-300', btnText: 'text-white', inputFocus: 'focus:border-purple-400', selectedBorder: 'border-purple-400', selectedBg: 'bg-purple-50', toggleOn: 'border-purple-400 bg-purple-50 text-purple-700' },
  { id: 'sage', label: 'Sage', dot: 'bg-emerald-400', bg: 'bg-emerald-50', pageBg: 'from-emerald-50/80 to-white', accent: 'bg-emerald-400', accentHover: 'hover:bg-emerald-500', text: 'text-emerald-900', sub: 'text-emerald-400', border: 'border-emerald-200', iconBorder: 'border-emerald-300', btnText: 'text-white', inputFocus: 'focus:border-emerald-400', selectedBorder: 'border-emerald-400', selectedBg: 'bg-emerald-50', toggleOn: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
  { id: 'cherry', label: 'Cherry', dot: 'bg-rose-500', bg: 'bg-rose-50', pageBg: 'from-rose-50/80 to-white', accent: 'bg-rose-500', accentHover: 'hover:bg-rose-600', text: 'text-rose-900', sub: 'text-rose-400', border: 'border-rose-200', iconBorder: 'border-rose-300', btnText: 'text-white', inputFocus: 'focus:border-rose-400', selectedBorder: 'border-rose-400', selectedBg: 'bg-rose-50', toggleOn: 'border-rose-400 bg-rose-50 text-rose-700' },
]

const STEPS = ['Basics', 'Theme', 'Photos', 'Coupons', 'Her App', 'Pay']

function Slideshow({ photos, themeObj, size = 'w-24 h-24' }: { photos: string[]; themeObj: any; size?: string }) {
  const [current, setCurrent] = useState(0)
  const filtered = photos.filter(Boolean)

  useEffect(() => {
    if (filtered.length <= 1) return
    const interval = setInterval(() => setCurrent(prev => (prev + 1) % filtered.length), 4000)
    return () => clearInterval(interval)
  }, [filtered.length])

  if (filtered.length === 0) return (
    <div className={`${size} mx-auto rounded-xl border-2 ${themeObj.iconBorder} bg-white/40 flex items-center justify-center mb-3`}>
      <span className="text-2xl opacity-40">💑</span>
    </div>
  )
  return (
    <div className={`${size} mx-auto rounded-xl border-2 ${themeObj.iconBorder} overflow-hidden mb-3 shadow relative`}>
      
    </div>
  )
}

function MiniDashboardPreview({ herName, hisName, theme, herPhotos, coupons }: {
  herName: string; hisName: string; theme: string; herPhotos: string[];
  coupons: { name: string; emoji: string }[];
}) {
  const t = THEMES.find(th => th.id === theme) || THEMES[4]
  const name = herName || 'Her'
  const his = hisName || 'Him'

  return (
    <div className="w-full max-w-[260px] mx-auto">
      <div className={`${t.bg} rounded-2xl p-5 shadow-xl border ${t.border} transition-all duration-500`}>
        <div className="text-center">
          <Slideshow photos={herPhotos} themeObj={t} size="w-24 h-24" />
          <p className={`text-sm font-bold ${t.text} truncate transition-colors duration-500`}>{name}&apos;s Coupon Dashboard</p>
          <p className={`text-[9px] italic ${t.sub} mt-0.5 transition-colors duration-500`}>Made with ❤️ by {his}, just for {name}</p>
          <div className="mt-3 space-y-1.5">
            {coupons.length > 0 ? (
              coupons.slice(0, 5).map((c, i) => (
                <div key={i} className={`${t.accent} rounded-lg py-1.5 px-2 text-[9px] ${t.btnText} font-medium truncate transition-all duration-300`}>
                  {c.emoji} {c.name}
                </div>
              ))
            ) : (
              <>
                <div className={`${t.accent} rounded-lg py-1.5 opacity-25 h-6`} />
                <div className={`${t.accent} rounded-lg py-1.5 opacity-15 h-6`} />
                <div className={`${t.accent} rounded-lg py-1.5 opacity-10 h-6`} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PhoneMockup({ herName, iconPhoto, theme, onOpenApp }: {
  herName: string; iconPhoto: string | null; theme: string; onOpenApp: () => void;
}) {
  const t = THEMES.find(th => th.id === theme) || THEMES[4]
  const name = herName || 'Her'
  const [zooming, setZooming] = useState(false)

  function handleTap() {
    setZooming(true)
    setTimeout(() => onOpenApp(), 600)
  }

  const otherApps = [
    { emoji: '📞', color: 'bg-green-500' }, { emoji: '💬', color: 'bg-green-400' },
    { emoji: '📸', color: 'bg-gray-500' }, { emoji: '🎵', color: 'bg-red-500' },
    { emoji: '📧', color: 'bg-blue-500' }, { emoji: '🗺️', color: 'bg-green-600' },
    { emoji: '🌤️', color: 'bg-blue-400' }, { emoji: '📅', color: 'bg-red-400' },
    { emoji: '⚙️', color: 'bg-gray-400' }, { emoji: '📝', color: 'bg-yellow-500' },
    { emoji: '🏪', color: 'bg-blue-600' },
  ]

  return (
    <div className={`w-full max-w-[300px] mx-auto transition-all duration-600 ${zooming ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}>
      <div className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-2 border-gray-700">
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.2rem] overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 px-5 pt-6 pb-4">
            <div className="flex justify-between text-white/50 text-[11px] mb-8 px-1">
              <span className="font-semibold text-white/80">9:41</span>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-3" viewBox="0 0 16 12" fill="currentColor"><rect x="0" y="6" width="3" height="6" rx="0.5"/><rect x="4.5" y="4" width="3" height="8" rx="0.5"/><rect x="9" y="2" width="3" height="10" rx="0.5"/><rect x="13.5" y="0" width="2.5" height="12" rx="0.5" opacity="0.3"/></svg>
                <svg className="w-6 h-3" viewBox="0 0 25 12" fill="currentColor"><rect x="0" y="0.5" width="22" height="11" rx="2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35"/><rect x="1.5" y="2" width="16" height="8" rx="1" opacity="0.8"/><rect x="23" y="3.5" width="2" height="5" rx="1" opacity="0.3"/></svg>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-x-5 gap-y-4">
              <div className="flex flex-col items-center gap-1.5 relative">
                <button onClick={handleTap} disabled={zooming} className="active:scale-90 transition-transform relative">
                  <div className={`w-[56px] h-[56px] rounded-[14px] border-2 ${t.iconBorder} flex items-center justify-center overflow-hidden shadow-lg ${iconPhoto ? '' : t.accent}`}>
                    {iconPhoto ? (
                      <img src={iconPhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">💝</span>
                    )}
                  </div>
                  <div className="absolute -inset-2 rounded-[18px] border-2 border-white/40 animate-pulse" />
                </button>
                <span className="text-[10px] text-white/90 truncate w-16 text-center font-medium">{name}&apos;s App</span>
              </div>
              {otherApps.map((app, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className={`w-[56px] h-[56px] rounded-[14px] ${app.color} flex items-center justify-center shadow opacity-60`}>
                    <span className="text-2xl">{app.emoji}</span>
                  </div>
                  <span className="text-[10px] text-white/40 w-16 text-center">&nbsp;</span>
                </div>
              ))}
            </div>
            <div className="mt-5 text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2">
                <span className="text-white text-sm animate-bounce">👆</span>
                <span className="text-white/80 text-xs font-medium">Tap her app to try it out!</span>
              </div>
            </div>
            <div className="mt-5 bg-white/5 backdrop-blur rounded-2xl p-3">
              <div className="flex justify-around">
                {[{ e: '📞', c: 'bg-green-500' }, { e: '🧭', c: 'bg-blue-500' }, { e: '💬', c: 'bg-green-400' }, { e: '🎵', c: 'bg-red-500' }].map((d, i) => (
                  <div key={i} className={`w-[52px] h-[52px] rounded-[13px] ${d.c} flex items-center justify-center shadow opacity-60`}>
                    <span className="text-xl">{d.e}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex justify-center">
              <div className="w-32 h-1 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FullDashboardDemo({ herName, hisName, theme, coupons, relationship, herPhotos, hisPhotos, couplePhotos, onBack }: {
  herName: string; hisName: string; theme: string;
  coupons: { name: string; emoji: string; detail_prompt?: string }[];
  relationship: string; herPhotos: string[]; hisPhotos: string[]; couplePhotos: string[]; onBack: () => void;
}) {
  const t = THEMES.find(th => th.id === theme) || THEMES[4]
  const [demoCoupon, setDemoCoupon] = useState<any>(null)
  const [demoStep, setDemoStep] = useState<'dashboard' | 'detail' | 'boyfriend' | 'confirmed'>('dashboard')
  const [fadeIn, setFadeIn] = useState(true)
  const relLabel = relationship === 'husband' ? 'husband' : 'boyfriend'

  function transitionTo(next: 'dashboard' | 'detail' | 'boyfriend' | 'confirmed') {
    setFadeIn(false)
    setTimeout(() => { setDemoStep(next); setFadeIn(true) }, 300)
  }

  if (demoStep === 'detail' && demoCoupon) {
    return (
      <div className={`w-full max-w-[300px] mx-auto transition-all duration-500 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className={`${t.bg} rounded-2xl p-5 border ${t.border}`}>
          <Slideshow photos={herPhotos} themeObj={t} size="w-24 h-24" />
          <div className="text-center mb-4">
            <span className="text-4xl">{demoCoupon.emoji}</span>
            <h3 className={`text-lg font-bold ${t.text} mt-2`}>{demoCoupon.name}</h3>
            <p className={`text-sm ${t.sub} mt-2`}>{demoCoupon.detail_prompt || (demoCoupon.coupon_type === 'b' ? 'Pick your options:' : 'Add any details')}</p>
            <div className={`mt-3 px-4 py-2.5 rounded-xl border ${t.border} bg-white/50 text-sm text-gray-400 italic`}>{herName} adds her details here...</div>
          </div>
          <button onClick={() => transitionTo('boyfriend')} className={`w-full py-3 rounded-xl ${t.accent} ${t.btnText} font-semibold text-sm mt-2`}>Continue</button>
          <button onClick={() => transitionTo('dashboard')} className={`w-full py-2 text-xs ${t.sub} mt-2`}>← Back</button>
        </div>
      </div>
    )
  }

  if (demoStep === 'boyfriend') {
    return (
      <div className={`w-full max-w-[300px] mx-auto transition-all duration-500 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className={`${t.bg} rounded-2xl p-5 border ${t.border}`}>
          <div className="text-center">
            <Slideshow photos={hisPhotos} themeObj={t} size="w-24 h-24" />
            <h3 className={`text-xl font-bold ${t.text}`}>Who has the best {relLabel}?</h3>
            <p className={`text-sm ${t.sub} mt-1 mb-4`}>There&apos;s only one correct answer...</p>
            <button onClick={() => transitionTo('confirmed')} className={`w-full py-4 rounded-xl ${t.accent} ${t.btnText} font-bold text-base`}>{herName} does! 🙋‍♀️</button>
            <button onClick={() => transitionTo('detail')} className={`w-full py-2 text-xs ${t.sub} mt-2`}>← Back</button>
          </div>
        </div>
      </div>
    )
  }

  if (demoStep === 'confirmed') {
    return (
      <div className={`w-full max-w-[300px] mx-auto transition-all duration-500 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className={`${t.bg} rounded-2xl p-5 border ${t.border}`}>
          <div className="text-center">
            <Slideshow photos={couplePhotos} themeObj={t} size="w-24 h-24" />
            <div className="text-4xl mb-2">✅</div>
            <h3 className={`text-xl font-bold ${t.text}`}>Coupon Redeemed!</h3>
            {demoCoupon && <p className={`text-sm ${t.sub} mt-1`}>{demoCoupon.emoji} {demoCoupon.name}</p>}
            <p className={`text-sm ${t.text} mt-2`}>{hisName} has been notified! 💕</p>
            <button onClick={() => { setDemoCoupon(null); transitionTo('dashboard') }}
              className={`w-full py-3 rounded-xl ${t.accent} ${t.btnText} font-semibold text-sm mt-4`}>Back to coupons</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-[300px] mx-auto transition-all duration-500 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className={`${t.bg} rounded-2xl p-5 border ${t.border}`}>
        <div className="text-center mb-4">
          <Slideshow photos={herPhotos} themeObj={t} size="w-24 h-24" />
          <h3 className={`text-base font-bold ${t.text}`}>{herName}&apos;s Coupon Dashboard</h3>
          <p className={`text-[10px] italic ${t.sub}`}>Made with ❤️ by {hisName}, just for {herName}</p>
        </div>
        <div className="space-y-2">
          {coupons.map((c, i) => (
            <button key={i} onClick={() => { setDemoCoupon(c); transitionTo('detail') }}
              className={`w-full py-2.5 rounded-xl ${t.accent} ${t.btnText} font-medium text-sm text-center transition-all active:scale-95`}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
        <button onClick={onBack} className={`w-full py-2 text-xs ${t.sub} mt-4`}>← Close preview</button>
      </div>
    </div>
  )
}

function CouponConfigPanel({ preset, herName, theme, onSave, onCancel }: {
  preset: any; herName: string; theme: string;
  onSave: (config: any) => void; onCancel: () => void;
}) {
  const t = THEMES.find(th => th.id === theme) || THEMES[4]
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [maxPicks, setMaxPicks] = useState<number | null>(null)
  const [emojiChoice, setEmojiChoice] = useState('🚗')
  const toggle = (opt: string) => {
    if (selectedOptions.includes(opt)) setSelectedOptions(selectedOptions.filter(o => o !== opt))
    else setSelectedOptions([...selectedOptions, opt])
  }

  if (preset.config_type === 'spa') {
    return (
      <div className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
        <p className="text-sm font-medium text-gray-700">Which treatments can {herName} pick from?</p>
        <div className="space-y-2">
          {SPA_OPTIONS.map(opt => (
            <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={selectedOptions.includes(opt)} onChange={() => toggle(opt)} className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-400" />{opt}
            </label>
          ))}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">How many can she pick?</p>
          <div className="flex gap-2">
            {[1, 2, 3].map(n => (
              <button key={n} onClick={() => setMaxPicks(n)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${maxPicks === n ? t.toggleOn : 'border-gray-300 text-gray-500'}`}>{n}</button>
            ))}
            <button onClick={() => setMaxPicks(null)} className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${maxPicks === null ? t.toggleOn : 'border-gray-300 text-gray-500'}`}>All</button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { if (selectedOptions.length === 0) return; onSave({ options: selectedOptions, max_picks: maxPicks, emoji_override: null, coupon_type: 'b' }) }}
            disabled={selectedOptions.length === 0} className={`flex-1 py-2.5 rounded-lg ${t.accent} ${t.btnText} font-medium text-sm disabled:opacity-50`}>Add Spa Day</button>
          <button onClick={onCancel} className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-500">Cancel</button>
        </div>
      </div>
    )
  }

  if (preset.config_type === 'car') {
    return (
      <div className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
        <p className="text-sm font-medium text-gray-700">Which services can {herName} pick from?</p>
        <div className="space-y-2">
          {CAR_OPTIONS.map(opt => (
            <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={selectedOptions.includes(opt)} onChange={() => toggle(opt)} className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-400" />{opt}
            </label>
          ))}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">How many can she pick?</p>
          <div className="flex gap-2">
            {[1, 2, 3].map(n => (
              <button key={n} onClick={() => setMaxPicks(n)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${maxPicks === n ? t.toggleOn : 'border-gray-300 text-gray-500'}`}>{n}</button>
            ))}
            <button onClick={() => setMaxPicks(null)} className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${maxPicks === null ? t.toggleOn : 'border-gray-300 text-gray-500'}`}>All</button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { if (selectedOptions.length === 0) return; onSave({ options: selectedOptions, max_picks: maxPicks, emoji_override: null, coupon_type: 'b' }) }}
            disabled={selectedOptions.length === 0} className={`flex-1 py-2.5 rounded-lg ${t.accent} ${t.btnText} font-medium text-sm disabled:opacity-50`}>Add Car Service</button>
          <button onClick={onCancel} className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-500">Cancel</button>
        </div>
      </div>
    )
  }

  if (preset.config_type === 'emoji_pick') {
    return (
      <div className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
        <p className="text-sm font-medium text-gray-700">Are you driving or flying to {herName}?</p>
        <div className="flex gap-3">
          <button onClick={() => setEmojiChoice('🚗')} className={`flex-1 py-4 rounded-xl border-2 text-3xl transition-colors ${emojiChoice === '🚗' ? t.selectedBorder + ' ' + t.selectedBg : 'border-gray-200'}`}>🚗</button>
          <button onClick={() => setEmojiChoice('✈️')} className={`flex-1 py-4 rounded-xl border-2 text-3xl transition-colors ${emojiChoice === '✈️' ? t.selectedBorder + ' ' + t.selectedBg : 'border-gray-200'}`}>✈️</button>
        </div>
        <button onClick={() => onSave({ options: null, max_picks: null, emoji_override: emojiChoice, coupon_type: 'a' })}
          className={`w-full py-2.5 rounded-lg ${t.accent} ${t.btnText} font-medium text-sm`}>Add Express Delivery</button>
        <button onClick={onCancel} className="w-full py-2 text-sm text-gray-500">Cancel</button>
      </div>
    )
  }
  return null
}

export default function AppBuilder() {
  const [step, setStep] = useState(() => {
    if (typeof window === 'undefined') return 0
    try {
      const saved = sessionStorage.getItem('builderState')
      if (saved) return JSON.parse(saved).step || 0
    } catch (e) {}
    return 0
  })

  const [restoredOnce, setRestoredOnce] = useState(false)

  useEffect(() => {
    if (restoredOnce) return
    try {
      const saved = sessionStorage.getItem('builderState')
      if (saved) {
        const s = JSON.parse(saved)
        if (s.herName) setHerName(s.herName)
        if (s.hisName) setHisName(s.hisName)
        if (s.relationship) setRelationship(s.relationship)
        if (s.hisPhone) setHisPhone(s.hisPhone)
        if (s.theme) setTheme(s.theme)
        if (s.iconPhoto) setIconPhoto(s.iconPhoto)
        if (s.herPhotos) setHerPhotos(s.herPhotos)
        if (s.hisPhotos) setHisPhotos(s.hisPhotos)
        if (s.couplePhotos) setCouplePhotos(s.couplePhotos)
        if (s.selectedCoupons) setSelectedCoupons(s.selectedCoupons)
      }
    } catch (e) {}
    setRestoredOnce(true)
  }, [restoredOnce])
  const [stepFade, setStepFade] = useState(true)
  const [herName, setHerName] = useState('')
  const [hisName, setHisName] = useState('')
  const [relationship, setRelationship] = useState<'boyfriend' | 'husband'>('boyfriend')
  const [hisPhone, setHisPhone] = useState('')
  const [theme, setTheme] = useState('sage')
  const [iconPhoto, setIconPhoto] = useState<string | null>(null)
  const [herPhotos, setHerPhotos] = useState<string[]>([])
  const [hisPhotos, setHisPhotos] = useState<string[]>([])
  const [couplePhotos, setCouplePhotos] = useState<string[]>([])
  const [selectedCoupons, setSelectedCoupons] = useState<any[]>([])
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customEmoji, setCustomEmoji] = useState('🎁')
  const [customAsksDetails, setCustomAsksDetails] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [configuringPreset, setConfiguringPreset] = useState<any>(null)
  const [appOpened, setAppOpened] = useState(false)
  const [paying, setPaying] = useState(false)

  const t = THEMES.find(th => th.id === theme) || THEMES[4]
  const atMax = selectedCoupons.length >= 5
  const addedNames = selectedCoupons.map((c: any) => c.name)

  function canAdvance(): boolean {
    if (step === 0) return herName.trim() !== '' && hisName.trim() !== ''
    if (step === 1) return true
    if (step === 2) return iconPhoto !== null
    if (step === 3) return selectedCoupons.length > 0
    return true
  }

  function transitionStep(newStep: number) {
    setStepFade(false)
    setTimeout(() => { setStep(newStep); setStepFade(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }, 300)
  }

  function nextStep() { if (canAdvance() && step < STEPS.length - 1) transitionStep(step + 1) }
  function prevStep() { if (step > 0) { setAppOpened(false); transitionStep(step - 1) } }

  function handlePresetClick(preset: any) {
    if (addedNames.includes(preset.name)) {
      setSelectedCoupons(selectedCoupons.filter((c: any) => c.name !== preset.name))
      setConfiguringPreset(null)
    } else if (!atMax) {
      if (preset.configurable) { setConfiguringPreset(preset) }
      else { setSelectedCoupons([...selectedCoupons, preset]); setConfiguringPreset(null) }
    }
  }

  function handleConfigSave(config: any) {
    if (!configuringPreset) return
    const newCoupon = { ...configuringPreset, ...config }
    if (config.emoji_override) { newCoupon.emoji = config.emoji_override }
    setSelectedCoupons([...selectedCoupons, newCoupon])
    setConfiguringPreset(null)
  }

  function addCustomCoupon() {
    if (!customName.trim() || atMax) return
    setSelectedCoupons([...selectedCoupons, {
      name: customName.trim(), emoji: customEmoji, coupon_type: 'a',
      asks_for_details: customAsksDetails, detail_prompt: customAsksDetails ? (customPrompt.trim() || 'Add any details') : null,
      configurable: false, description: 'Custom coupon',
    }])
    setCustomName(''); setCustomEmoji('🎁'); setCustomAsksDetails(false); setCustomPrompt(''); setShowCustomForm(false)
  }

  async function handlePay() {
    setPaying(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          herName, hisName, relationship, hisPhone, theme,
          iconPhotoUrl: iconPhoto,
          herPhotos, hisPhotos, couplePhotos,
          coupons: selectedCoupons.map((c: any) => ({
            name: c.name, emoji: c.emoji, is_custom: c.is_custom || false,
            coupon_type: c.coupon_type, asks_for_details: c.asks_for_details,
            detail_prompt: c.detail_prompt, options: c.options || null,
            max_picks: c.max_picks || null, emoji_override: c.emoji_override || null,
          })),
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Something went wrong. Please try again.')
        setPaying(false)
      }
    } catch (err) {
      alert('Something went wrong. Please try again.')
      setPaying(false)
    }
  }
// Save builder state to sessionStorage so it survives Stripe redirect
  useEffect(() => {
    const state = { herName, hisName, relationship, hisPhone, theme, iconPhoto, herPhotos, hisPhotos, couplePhotos, selectedCoupons, step }
    try { sessionStorage.setItem('builderState', JSON.stringify(state)) } catch (e) {}
  }, [herName, hisName, relationship, hisPhone, theme, iconPhoto, herPhotos, hisPhotos, couplePhotos, selectedCoupons, step])

  const pageBg = `bg-gradient-to-b ${t.pageBg}`

  return (
    <div className={`min-h-screen ${pageBg} pb-12 transition-all duration-700`}>
      <div className="bg-white/80 backdrop-blur border-b border-gray-200 px-6 pt-6 pb-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-bold text-gray-900 text-center mb-4">Build Her App</h1>
          <div className="flex items-center gap-1">
            {STEPS.map((label, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${i < step ? t.accent : i === step ? t.accent : 'bg-gray-200'}`} />
                <span className={`text-[10px] transition-colors ${i <= step ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`max-w-lg mx-auto px-6 mt-6 space-y-6 transition-all duration-500 ${stepFade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {step <= 3 && (
          <div className="flex justify-center">
            <MiniDashboardPreview herName={herName} hisName={hisName} theme={theme} herPhotos={herPhotos} coupons={selectedCoupons} />
          </div>
        )}

        {step === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Let&apos;s start with the basics</h2>
              <p className="text-sm text-gray-500">Tell us about you and who this gift is for.</p>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Her first name</label>
              <input type="text" value={herName} onChange={(e) => setHerName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 outline-none ${t.inputFocus} transition-colors`} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Your first name</label>
              <input type="text" value={hisName} onChange={(e) => setHisName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 outline-none ${t.inputFocus} transition-colors`} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">You are her...</label>
              <div className="flex gap-3">
                <button onClick={() => setRelationship('boyfriend')} className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${relationship === 'boyfriend' ? t.toggleOn : 'border-gray-300 text-gray-500'}`}>Boyfriend</button>
                <button onClick={() => setRelationship('husband')} className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${relationship === 'husband' ? t.toggleOn : 'border-gray-300 text-gray-500'}`}>Husband</button>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Pick a theme for {herName || 'her'}</h2>
              <p className="text-sm text-gray-500">Watch everything change as you pick!</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((th) => (
                <button key={th.id} onClick={() => setTheme(th.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === th.id ? 'border-gray-900 bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className={`w-8 h-8 rounded-full ${th.dot} shadow`} />
                  <span className={`text-xs ${theme === th.id ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{th.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Add your photos</h2>
              <p className="text-sm text-gray-500">Start with her app icon — slideshow photos are optional.</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">App icon (shown on her home screen)</p>
              <div className="w-24">
                <PhotoUploader photoType="her" displayOrder={0}
                  currentUrl={iconPhoto} themeAccent={t.accent}
                  onUploaded={(url: string) => setIconPhoto(url)} />
              </div>
            </div>
            <CategoryPhotos label={`Photos for ${herName || 'her'} dashboard`} photos={herPhotos} setPhotos={setHerPhotos} photoType="her" />
            <CategoryPhotos label={`Photos of ${hisName || 'you'}`} photos={hisPhotos} setPhotos={setHisPhotos} photoType="him" />
            <CategoryPhotos label="Photos to show after she redeems" photos={couplePhotos} setPhotos={setCouplePhotos} photoType="couple" />
            <p className="text-xs text-gray-400 text-center">You can always add, edit, and crop photos later from your dashboard.</p>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Pick coupons for {herName || 'her'}</h2>
              <p className="text-sm text-gray-500">{atMax ? 'Maximum 5 coupons reached!' : `Choose up to 5. ${selectedCoupons.length} selected.`}</p>
            </div>
            <div className="space-y-3">
              {PRESET_COUPONS.map((preset) => {
                const isSelected = addedNames.includes(preset.name)
                const isConfiguring = configuringPreset?.name === preset.name
                return (
                  <div key={preset.name}>
                    <button onClick={() => handlePresetClick(preset)} disabled={!isSelected && atMax}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${isSelected ? `${t.selectedBorder} ${t.selectedBg}` : (atMax ? 'border-gray-100 opacity-40 cursor-not-allowed' : 'border-gray-200 hover:border-gray-300 bg-white')}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{isSelected ? (selectedCoupons.find((c: any) => c.name === preset.name)?.emoji || preset.emoji) : preset.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold ${isSelected ? t.text : 'text-gray-900'}`}>{preset.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{preset.description}</div>
                        </div>
                        {isSelected && <span className="text-green-500 text-lg">✓</span>}
                      </div>
                    </button>
                    {isConfiguring && <CouponConfigPanel preset={preset} herName={herName || 'her'} theme={theme} onSave={handleConfigSave} onCancel={() => setConfiguringPreset(null)} />}
                  </div>
                )
              })}
            </div>
            {!showCustomForm ? (
              <button onClick={() => setShowCustomForm(true)} disabled={atMax}
                className={`w-full py-4 rounded-xl border-2 border-dashed text-sm transition-colors ${atMax ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}>
                + Create custom coupon
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex gap-2">
                  <input type="text" value={customEmoji} onChange={(e) => setCustomEmoji(e.target.value)}
                    className="w-14 text-center text-2xl border border-gray-300 rounded-lg p-2 bg-white" maxLength={2} />
                  <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Coupon name..." className={`flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-400 outline-none ${t.inputFocus}`} />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={customAsksDetails} onChange={(e) => setCustomAsksDetails(e.target.checked)}
                    className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-400" />
                  Ask {herName || 'her'} for details when redeeming
                </label>
                {customAsksDetails && (
                  <input type="text" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g., What flavor do you want?"
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-400 outline-none ${t.inputFocus} text-sm`} />
                )}
                <div className="flex gap-2">
                  <button onClick={addCustomCoupon} disabled={!customName.trim()}
                    className={`flex-1 py-2.5 rounded-lg ${t.accent} ${t.btnText} font-medium text-sm disabled:opacity-50`}>Add Coupon</button>
                  <button onClick={() => { setShowCustomForm(false); setCustomName(''); setCustomEmoji('🎁'); setCustomAsksDetails(false); setCustomPrompt('') }}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-500">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            {!appOpened ? (
              <>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">You built {herName} an app! 🎉</h2>
                  <p className="text-sm text-gray-500 mb-1">This is what it&apos;ll look like on her phone.</p>
                </div>
                <PhoneMockup herName={herName} iconPhoto={iconPhoto} theme={theme} onOpenApp={() => setAppOpened(true)} />
              </>
            ) : (
              <>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">This is {herName}&apos;s app</h2>
                  <p className="text-sm text-gray-500">Tap the coupons to see what happens when she redeems!</p>
                </div>
                <FullDashboardDemo herName={herName} hisName={hisName} theme={theme}
                  coupons={selectedCoupons} relationship={relationship}
                  herPhotos={herPhotos} hisPhotos={hisPhotos} couplePhotos={couplePhotos}
                  onBack={() => setAppOpened(false)} />
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">You also get your own dashboard</h3>
                  <p className="text-xs text-gray-500 mb-3">After purchase, you&apos;ll get a private management panel where you can:</p>
                  <div className="space-y-2">
                    {['Add or swap coupons anytime', 'See when she redeems (with her details)', 'Reactivate used coupons', 'Change photos and theme'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-emerald-500">✓</span>{item}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-1">She&apos;s going to love this 💕</h2>
              <p className="text-sm text-gray-500">The most unique and thoughtful gift you could get her.</p>
            </div>

            <MiniDashboardPreview herName={herName} hisName={hisName} theme={theme} herPhotos={herPhotos} coupons={selectedCoupons} />

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Your phone number</label>
                <input type="tel" value={hisPhone} onChange={(e) => setHisPhone(e.target.value)} placeholder="+1 (555) 123-4567"
                  className={`w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 outline-none ${t.inputFocus} transition-colors`} />
                <p className="text-xs text-gray-400 mt-1">This is so we can text you when she redeems her coupons.</p>
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" defaultChecked className="mt-1 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400" />
                <p className="text-xs text-gray-500">I consent to receiving automated SMS notifications when coupons are redeemed.</p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { icon: '📱', text: 'Her own personalized coupon app' },
                  { icon: '🎨', text: selectedCoupons.length + ' custom coupons she can redeem anytime' },
                  { icon: '📸', text: 'Photo slideshows of you, her, and you together' },
                  { icon: '⚙️', text: 'Your management dashboard to update it anytime' },
                  { icon: '💬', text: 'Instant text notifications when she redeems' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="text-gray-700 font-medium text-lg">Total</span>
                <span className="text-gray-900 font-bold text-2xl">$14.99</span>
              </div>

              <button onClick={handlePay} disabled={paying || !hisPhone.trim()} className={`w-full py-4 rounded-2xl ${t.accent} ${t.accentHover} ${t.btnText} font-bold text-base transition-all active:scale-[0.97] disabled:opacity-50`}>{paying ? 'Redirecting to checkout...' : 'Pay $14.99'}</button>
              <p className="text-xs text-gray-400 text-center">Secure payment powered by Stripe</p>
            </div>
          </div>
        )}

        {step !== 4 && (
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={prevStep} className="flex-1 py-3.5 rounded-2xl border border-gray-300 text-gray-600 font-medium text-sm hover:bg-white transition-colors">← Back</button>
            )}
            {step < STEPS.length - 1 && (
              <button onClick={nextStep} disabled={!canAdvance()}
                className={`flex-1 py-3.5 rounded-2xl font-medium text-sm transition-all ${canAdvance() ? `${t.accent} ${t.btnText} ${t.accentHover}` : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>Continue →</button>
            )}
          </div>
        )}
        {step === 4 && (
          <div className="flex gap-3">
            <button onClick={prevStep} className="flex-1 py-3.5 rounded-2xl border border-gray-300 text-gray-600 font-medium text-sm hover:bg-white transition-colors">← Back</button>
            <button onClick={nextStep} className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all ${t.accent} ${t.btnText} ${t.accentHover}`}>She&apos;s going to love this 💕</button>
          </div>
        )}
      </div>
    </div>
  )
}
