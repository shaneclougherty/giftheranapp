'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PhotoUploader from '@/components/PhotoUploader'

const PRESET_COUPONS = [
  { name: 'Coffee Run', emoji: '☕', coupon_type: 'a', asks_for_details: true, detail_prompt: "What's your order?", configurable: false },
  { name: 'Dinner Date', emoji: '🍝', coupon_type: 'a', asks_for_details: true, detail_prompt: 'What are you craving?', configurable: false },
  { name: 'Round of Drinks', emoji: '🍹', coupon_type: 'b', asks_for_details: true, detail_prompt: null, configurable: true, config_type: 'drinks' },
  { name: 'Express Boyfriend Delivery', emoji: '✈️', coupon_type: 'a', asks_for_details: true, detail_prompt: 'Where are you?', configurable: true, config_type: 'emoji_pick' },
  { name: 'Ice Cream Run', emoji: '🍦', coupon_type: 'a', asks_for_details: true, detail_prompt: 'What flavor and where from?', configurable: false },
  { name: 'Car Service', emoji: '🔧', coupon_type: 'b', asks_for_details: true, detail_prompt: null, configurable: true, config_type: 'car' },
  { name: 'Personal Chef Night', emoji: '👨‍🍳', coupon_type: 'a', asks_for_details: true, detail_prompt: null, configurable: false },
  { name: 'Spa Day', emoji: '🧖‍♀️', coupon_type: 'b', asks_for_details: true, detail_prompt: null, configurable: true, config_type: 'spa' },
  { name: 'Movie Night', emoji: '🍿', coupon_type: 'a', asks_for_details: true, detail_prompt: 'What movie are we watching tonight?', configurable: false },
]

const SPA_OPTIONS = ['Hair', 'Mani/Pedi', 'Facial', 'Massage']
const CAR_OPTIONS = ['Full tank of gas', 'Oil change', 'Car wash', 'Tune up']
const DRINKS_MODES = ['Just for her', 'Round for the group']

const THEMES = [
  { id: 'rose_gold', label: 'Rose gold', dot: 'bg-pink-400' },
  { id: 'ocean', label: 'Ocean', dot: 'bg-blue-400' },
  { id: 'sunset', label: 'Sunset', dot: 'bg-orange-400' },
  { id: 'lavender', label: 'Lavender', dot: 'bg-purple-400' },
  { id: 'sage', label: 'Sage', dot: 'bg-emerald-400' },
  { id: 'cherry', label: 'Cherry', dot: 'bg-rose-500' },
]

const THEME_PREVIEW_COLORS: Record<string, { bg: string; accent: string; text: string; sub: string }> = {
  rose_gold: { bg: 'bg-pink-50', accent: 'bg-pink-400', text: 'text-pink-900', sub: 'text-pink-400' },
  ocean: { bg: 'bg-blue-50', accent: 'bg-blue-400', text: 'text-blue-900', sub: 'text-blue-400' },
  sunset: { bg: 'bg-amber-50', accent: 'bg-orange-400', text: 'text-orange-900', sub: 'text-orange-400' },
  lavender: { bg: 'bg-purple-50', accent: 'bg-purple-400', text: 'text-purple-900', sub: 'text-purple-400' },
  sage: { bg: 'bg-emerald-50', accent: 'bg-emerald-400', text: 'text-emerald-900', sub: 'text-emerald-400' },
  cherry: { bg: 'bg-rose-50', accent: 'bg-rose-500', text: 'text-rose-900', sub: 'text-rose-400' }
}

function ConfigModal({ preset, herName, hisName, onSave, onCancel }: {
  preset: any; herName: string; hisName: string;
  onSave: (config: any) => void; onCancel: () => void;
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [maxPicks, setMaxPicks] = useState<number | null>(null)
  const [emojiChoice, setEmojiChoice] = useState('🚗')
  const [drinksMode, setDrinksMode] = useState('Just for her')

  const toggle = (opt: string) => {
    if (selectedOptions.includes(opt)) setSelectedOptions(selectedOptions.filter(o => o !== opt))
    else setSelectedOptions([...selectedOptions, opt])
  }

  if (preset.config_type === 'spa') {
    return (
      <div className="p-4 space-y-4 bg-slate-700/50 rounded-xl border border-slate-600">
        <h3 className="font-semibold text-white">{preset.emoji} Configure Spa Day</h3>
        <div>
          <p className="text-sm text-slate-300 mb-2">Which options can {herName} pick from?</p>
          <div className="space-y-2">
            {SPA_OPTIONS.map(opt => (
              <label key={opt} className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input type="checkbox" checked={selectedOptions.includes(opt)} onChange={() => toggle(opt)}
                  className="rounded border-slate-500 text-blue-400 focus:ring-blue-400 bg-slate-700" />{opt}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-300 mb-2">How many can she pick?</p>
          <div className="flex gap-2">
            {[1, 2, 3].map(n => (
              <button key={n} onClick={() => setMaxPicks(n)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${maxPicks === n ? 'border-blue-400 bg-blue-400/20 text-blue-300' : 'border-slate-600 text-slate-400'}`}>{n}</button>
            ))}
            <button onClick={() => setMaxPicks(null)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${maxPicks === null ? 'border-blue-400 bg-blue-400/20 text-blue-300' : 'border-slate-600 text-slate-400'}`}>Unlimited</button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { if (selectedOptions.length === 0) return; onSave({ options: selectedOptions, max_picks: maxPicks, emoji_override: null, detail_prompt: null, coupon_type: 'b' }) }}
            disabled={selectedOptions.length === 0} className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors">Add Spa Day</button>
          <button onClick={onCancel} className="px-4 py-2.5 rounded-lg border border-slate-600 text-sm text-slate-400">Cancel</button>
        </div>
      </div>
    )
  }

  if (preset.config_type === 'car') {
    return (
      <div className="p-4 space-y-4 bg-slate-700/50 rounded-xl border border-slate-600">
        <h3 className="font-semibold text-white">{preset.emoji} Configure Car Service</h3>
        <div>
          <p className="text-sm text-slate-300 mb-2">Which services can {herName} pick from?</p>
          <div className="space-y-2">
            {CAR_OPTIONS.map(opt => (
              <label key={opt} className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input type="checkbox" checked={selectedOptions.includes(opt)} onChange={() => toggle(opt)}
                  className="rounded border-slate-500 text-blue-400 focus:ring-blue-400 bg-slate-700" />{opt}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-300 mb-2">How many can she pick?</p>
          <div className="flex gap-2">
            {[1, 2, 3].map(n => (
              <button key={n} onClick={() => setMaxPicks(n)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${maxPicks === n ? 'border-blue-400 bg-blue-400/20 text-blue-300' : 'border-slate-600 text-slate-400'}`}>{n}</button>
            ))}
            <button onClick={() => setMaxPicks(null)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${maxPicks === null ? 'border-blue-400 bg-blue-400/20 text-blue-300' : 'border-slate-600 text-slate-400'}`}>All</button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { if (selectedOptions.length === 0) return; onSave({ options: selectedOptions, max_picks: maxPicks, emoji_override: null, detail_prompt: null, coupon_type: 'b' }) }}
            disabled={selectedOptions.length === 0} className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors">Add Car Service</button>
          <button onClick={onCancel} className="px-4 py-2.5 rounded-lg border border-slate-600 text-sm text-slate-400">Cancel</button>
        </div>
      </div>
    )
  }

  if (preset.config_type === 'drinks') {
    return (
      <div className="p-4 space-y-4 bg-slate-700/50 rounded-xl border border-slate-600">
        <h3 className="font-semibold text-white">{preset.emoji} Configure Round of Drinks</h3>
        <div>
          <p className="text-sm text-slate-300 mb-2">What can {herName} redeem this for?</p>
          <div className="space-y-2">
            {DRINKS_MODES.map(mode => (
              <button key={mode} onClick={() => setDrinksMode(mode)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  drinksMode === mode ? 'border-blue-400 bg-blue-400/20 text-blue-200' : 'border-slate-600 text-slate-400 bg-slate-800'}`}>
                {mode === 'Just for her' ? `☝️ Just for ${herName} — she texts the bar name` : `🥂 Round for the group — bar name & how many`}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave({ options: null, max_picks: null, emoji_override: null, detail_prompt: drinksMode === 'Just for her' ? 'Which bar? 🍹' : 'Which bar and how many people? 🥂', coupon_type: 'a' })}
            className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 transition-colors">Add Round of Drinks</button>
          <button onClick={onCancel} className="px-4 py-2.5 rounded-lg border border-slate-600 text-sm text-slate-400">Cancel</button>
        </div>
      </div>
    )
  }

  if (preset.config_type === 'emoji_pick') {
    return (
      <div className="p-4 space-y-4 bg-slate-700/50 rounded-xl border border-slate-600">
        <h3 className="font-semibold text-white">Configure Express Boyfriend Delivery</h3>
        <p className="text-sm text-slate-300">Are you driving or flying to {herName}?</p>
        <div className="flex gap-3">
          <button onClick={() => setEmojiChoice('🚗')}
            className={`flex-1 py-4 rounded-xl border text-3xl transition-colors ${emojiChoice === '🚗' ? 'border-blue-400 bg-blue-400/20' : 'border-slate-600 bg-slate-800'}`}>🚗</button>
          <button onClick={() => setEmojiChoice('✈️')}
            className={`flex-1 py-4 rounded-xl border text-3xl transition-colors ${emojiChoice === '✈️' ? 'border-blue-400 bg-blue-400/20' : 'border-slate-600 bg-slate-800'}`}>✈️</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave({ options: null, max_picks: null, emoji_override: emojiChoice, detail_prompt: 'Where are you?', coupon_type: 'a' })}
            className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 transition-colors">Add Express Delivery</button>
          <button onClick={onCancel} className="px-4 py-2.5 rounded-lg border border-slate-600 text-sm text-slate-400">Cancel</button>
        </div>
      </div>
    )
  }

  return null
}

export default function ManageDashboard() {
  const params = useParams()
  const slug = params.slug as string

  const [app, setApp] = useState<any>(null)
  const [coupons, setCoupons] = useState<any[]>([])
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [configuringPreset, setConfiguringPreset] = useState<any>(null)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🎁')
  const [newAsksDetails, setNewAsksDetails] = useState(false)
  const [newPrompt, setNewPrompt] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [herPhotos, setHerPhotos] = useState<any[]>([])
  const [hisPhotos, setHisPhotos] = useState<any[]>([])
  const [couplePhotos, setCouplePhotos] = useState<any[]>([])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  async function loadData() {
    const { data: appData, error: appError } = await supabase.from('apps').select('*').eq('his_slug', slug).single()
    if (appError || !appData) { setError(true); setLoading(false); return }
    setApp(appData)
    const { data: couponData } = await supabase.from('coupons').select('*').eq('app_id', appData.id).order('display_order', { ascending: true })
    setCoupons(couponData || [])
    const { data: redemptionData } = await supabase.from('redemptions').select('*, coupons(name, emoji)').eq('app_id', appData.id).order('redeemed_at', { ascending: false })
    setRedemptions(redemptionData || [])

    const { data: photoData } = await supabase
      .from('photos')
      .select('*')
      .eq('app_id', appData.id)
      .order('display_order', { ascending: true })

    const allPhotos = photoData || []
    setHerPhotos(allPhotos.filter((p: any) => p.photo_type === 'her'))
    setHisPhotos(allPhotos.filter((p: any) => p.photo_type === 'him'))
    setCouplePhotos(allPhotos.filter((p: any) => p.photo_type === 'couple'))

    setLoading(false)
  }

  useEffect(() => { loadData() }, [slug])

  const couponCount = coupons.length
  const atMax = couponCount >= 5
  const addedNames = coupons.map(c => c.name)
  const availablePresets = PRESET_COUPONS.filter(p => !addedNames.includes(p.name))

  async function addCouponToDb(data: any) {
    const maxOrder = coupons.reduce((max, c) => Math.max(max, c.display_order), 0)
    await supabase.from('coupons').insert({
      app_id: app.id, name: data.name, emoji: data.emoji, is_custom: data.is_custom,
      coupon_type: data.coupon_type, asks_for_details: data.asks_for_details,
      detail_prompt: data.detail_prompt,
      options: data.options ? JSON.stringify(data.options) : null,
      max_picks: data.max_picks, emoji_override: data.emoji_override,
      display_order: maxOrder + 1, status: 'active',
    })
    loadData()
  }

  function handlePresetClick(preset: any) {
    if (atMax) return
    if (preset.configurable) { setConfiguringPreset(preset) }
    else {
      addCouponToDb({
        name: preset.name, emoji: preset.emoji, is_custom: false, coupon_type: preset.coupon_type,
        asks_for_details: preset.asks_for_details, detail_prompt: preset.detail_prompt || `Add any details for ${app.his_name}`,
        options: null, max_picks: null, emoji_override: null,
      })
      showToast(`${preset.emoji} ${preset.name} added!`)
    }
  }

  async function handleConfigSave(config: any) {
    if (!configuringPreset) return
    await addCouponToDb({
      name: configuringPreset.name, emoji: configuringPreset.emoji, is_custom: false,
      coupon_type: config.coupon_type, asks_for_details: true,
      detail_prompt: config.detail_prompt || configuringPreset.detail_prompt,
      options: config.options, max_picks: config.max_picks, emoji_override: config.emoji_override,
    })
    showToast(`${configuringPreset.emoji} ${configuringPreset.name} added!`)
    setConfiguringPreset(null)
  }

  async function handleAddCustom() {
    if (!newName.trim() || atMax) return
    setSaving(true)
    await addCouponToDb({
      name: newName.trim(), emoji: newEmoji, is_custom: true, coupon_type: 'a',
      asks_for_details: newAsksDetails, detail_prompt: newAsksDetails ? (newPrompt.trim() || `Add any details for ${app.his_name}`) : null,
      options: null, max_picks: null, emoji_override: null,
    })
    setNewName(''); setNewEmoji('🎁'); setNewAsksDetails(false); setNewPrompt('')
    setShowCustomForm(false); setSaving(false)
    showToast('Custom coupon added!')
  }

  async function handleReactivate(id: string) {
    await supabase.from('coupons').update({ status: 'active' }).eq('id', id)
    showToast('Coupon reactivated!'); loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this coupon?')) return
    await supabase.from('coupons').delete().eq('id', id)
    showToast('Coupon removed'); loadData()
  }

  async function handleChangeTheme(themeId: string) {
    await supabase.from('apps').update({ theme: themeId }).eq('id', app.id)
    setApp({ ...app, theme: themeId }); showToast('Theme updated!')
  }

  async function handlePhotoUploaded(type: string, index: number, url: string) {
    const existing = type === 'her' ? herPhotos[index] : type === 'him' ? hisPhotos[index] : couplePhotos[index]

    if (existing) {
      await supabase.from('photos').update({ photo_url: url }).eq('id', existing.id)
    } else {
      await supabase.from('photos').insert({
        app_id: app.id,
        photo_type: type,
        photo_url: url,
        display_order: index + 1,
      })
    }

    showToast('Photo updated!')
    loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-pulse text-slate-500 text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-semibold text-white mb-2">Dashboard not found</h1>
          <p className="text-slate-400">This management link may be invalid.</p>
        </div>
      </div>
    )
  }

  const tp = THEME_PREVIEW_COLORS[app.theme] || THEME_PREVIEW_COLORS.rose_gold

  return (
    <div className="min-h-screen bg-slate-900 pb-12">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium">{toast}</div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 px-6 pt-8 pb-6 border-b border-slate-700/50">
        <div className="max-w-lg mx-auto text-center">
          {/* App icon preview */}
          <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-700 border-2 border-slate-600 flex items-center justify-center mb-3 shadow-lg overflow-hidden">
            {app.icon_photo_url ? (
              <img src={app.icon_photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">📷</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-3">{app.her_name}&apos;s App</p>

          <h1 className="text-2xl font-bold text-white">{app.her_name}&apos;s App Manager</h1>
          <p className="text-sm text-slate-400 mt-1">Manage coupons and photos for {app.her_name}&apos;s coupon dashboard</p>
          <p className="text-xs text-blue-400 mt-3">✓ All changes save automatically</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 mt-6 space-y-5">

        {/* ====== HER COUPONS ====== */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <h2 className="font-semibold text-white">Her Coupons</h2>
          </div>
          {coupons.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">No coupons yet. Add some below!</div>
          ) : (
            <div className="p-3 space-y-2">
              {coupons.map((coupon) => (
                <div key={coupon.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${coupon.status === 'redeemed' ? 'bg-slate-700/30' : 'bg-slate-700/60'}`}>
                  <span className="text-2xl">{coupon.emoji_override || coupon.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${coupon.status === 'redeemed' ? 'text-slate-500 line-through' : 'text-white'}`}>{coupon.name}</div>
                    <div className="text-xs text-slate-500">
                      {coupon.status === 'redeemed' ? 'Redeemed' : 'Active'}
                      {coupon.is_custom && ' · Custom'}
                      {coupon.coupon_type === 'b' && ' · Multi-select'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {coupon.status === 'redeemed' && (
                      <button onClick={() => handleReactivate(coupon.id)}
                        className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-500/30 font-medium transition-colors">Reactivate</button>
                    )}
                    <button onClick={() => handleDelete(coupon.id)}
                      className="text-xs text-slate-600 hover:text-red-400 px-2 py-1.5 transition-colors">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ====== ADD COUPONS ====== */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <h2 className="font-semibold text-white">Add Coupons</h2>
            {atMax ? (
              <p className="text-xs text-red-400 mt-1">Maximum 5 coupons reached. Remove one to add another.</p>
            ) : (
              <p className="text-xs text-slate-500 mt-1">You can add up to 5 coupons.</p>
            )}
          </div>

          {configuringPreset && (
            <div className="p-3">
              <ConfigModal preset={configuringPreset} herName={app.her_name} hisName={app.his_name}
                onSave={handleConfigSave} onCancel={() => setConfiguringPreset(null)} />
            </div>
          )}

          {availablePresets.length > 0 && !atMax && !configuringPreset && (
            <div className="p-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Preset coupons</p>
              <div className="grid grid-cols-2 gap-2">
                {availablePresets.map((preset) => (
                  <button key={preset.name} onClick={() => handlePresetClick(preset)}
                    className="flex items-center gap-2 px-3 py-3 rounded-xl border border-slate-700 bg-slate-700/40 hover:border-blue-500/50 hover:bg-slate-700/80 text-sm text-slate-200 transition-all">
                    <span className="text-xl">{preset.emoji}</span>
                    <span className="text-left">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!atMax && !configuringPreset && (
            <div className="p-3 border-t border-slate-700">
              {!showCustomForm ? (
                <button onClick={() => setShowCustomForm(true)}
                  className="w-full py-3 rounded-xl border border-dashed border-slate-600 text-sm text-slate-500 hover:border-blue-500/50 hover:text-blue-400 transition-colors">
                  + Create custom coupon
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input type="text" value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)}
                      className="w-14 text-center text-2xl border border-slate-600 rounded-lg p-2 bg-slate-700 text-white" maxLength={2} />
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                      placeholder="Coupon name..." className="flex-1 border border-slate-600 rounded-lg px-3 py-2 bg-slate-700 text-white placeholder-slate-500 outline-none focus:border-blue-400" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={newAsksDetails} onChange={(e) => setNewAsksDetails(e.target.checked)}
                      className="rounded border-slate-600 text-blue-400 focus:ring-blue-400 bg-slate-700" />
                    Ask {app.her_name} for details when redeeming
                  </label>
                  {newAsksDetails && (
                    <input type="text" value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)}
                      placeholder={`e.g., "What flavor do you want?"`}
                      className="w-full border border-slate-600 rounded-lg px-3 py-2 bg-slate-700 text-white placeholder-slate-500 outline-none focus:border-blue-400 text-sm" />
                  )}
                  <div className="flex gap-2">
                    <button onClick={handleAddCustom} disabled={!newName.trim() || saving}
                      className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors">
                      {saving ? 'Adding...' : 'Add Coupon'}</button>
                    <button onClick={() => { setShowCustomForm(false); setNewName(''); setNewEmoji('🎁'); setNewAsksDetails(false); setNewPrompt('') }}
                      className="px-4 py-2.5 rounded-lg border border-slate-600 text-sm text-slate-400">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ====== RECENT REDEMPTIONS ====== */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <h2 className="font-semibold text-white">Recent Redemptions</h2>
          </div>
          {redemptions.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">No redemptions yet. They&apos;ll show up here when {app.her_name} uses a coupon!</div>
          ) : (
            <div className="p-3 space-y-2">
              {redemptions.slice(0, 10).map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-slate-700/40 flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{r.coupons?.emoji || '🎟️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{app.her_name} redeemed {r.coupons?.name || 'a coupon'}</div>
                    {r.details && <div className="text-sm text-blue-300 italic mt-1">&ldquo;{r.details}&rdquo;</div>}
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(r.redeemed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ====== APP THEME ====== */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <h2 className="font-semibold text-white">App Theme</h2>
            <p className="text-xs text-slate-500 mt-1">Tap a theme to see what {app.her_name}&apos;s app will look like.</p>
          </div>

          {/* Theme buttons */}
          <div className="px-4 pt-3 flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => handleChangeTheme(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-all ${
                  app.theme === t.id ? 'border-blue-400 bg-blue-400/20 text-blue-300 font-medium' : 'border-slate-600 text-slate-400 hover:border-slate-500'
                }`}>
                <div className={`w-4 h-4 rounded-full ${t.dot}`} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Live theme preview */}
          <div className="p-4">
            <div className={`${tp.bg} rounded-2xl p-5 transition-all duration-300`}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-xl bg-white/30 border-2 border-white/40 flex items-center justify-center mb-3">
                  <span className="text-2xl">📷</span>
                </div>
                <h3 className={`text-lg font-bold ${tp.text}`}>{app.her_name}&apos;s Coupon Dashboard</h3>
                <p className={`text-xs italic ${tp.sub} mt-1`}>Made with ❤️ by {app.his_name}, just for {app.her_name}</p>
                <div className="mt-4 space-y-2 max-w-[200px] mx-auto">
                  <div className={`${tp.accent} h-9 rounded-xl`} />
                  <div className={`${tp.accent} h-9 rounded-xl opacity-70`} />
                  <div className={`${tp.accent} h-9 rounded-xl opacity-40`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====== PHOTOS ====== */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <h2 className="font-semibold text-white">Photos</h2>
            <p className="text-xs text-slate-500 mt-1">Tap any slot to upload or replace a photo.</p>
          </div>
          <div className="px-4 py-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Photos of {app.her_name} (3)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <PhotoUploader
                    key={`her-${i}`}
                    appId={app.id}
                    photoType="her"
                    displayOrder={i + 1}
                    currentUrl={herPhotos[i]?.photo_url || null}
                    themeAccent="bg-blue-500"
                    onUploaded={(url: string) => handlePhotoUploaded('her', i, url)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Photos of {app.his_name} (3)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <PhotoUploader
                    key={`him-${i}`}
                    appId={app.id}
                    photoType="him"
                    displayOrder={i + 1}
                    currentUrl={hisPhotos[i]?.photo_url || null}
                    themeAccent="bg-blue-500"
                    onUploaded={(url: string) => handlePhotoUploaded('him', i, url)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Photos together (3)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <PhotoUploader
                    key={`couple-${i}`}
                    appId={app.id}
                    photoType="couple"
                    displayOrder={i + 1}
                    currentUrl={couplePhotos[i]?.photo_url || null}
                    themeAccent="bg-blue-500"
                    onUploaded={(url: string) => handlePhotoUploaded('couple', i, url)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* ====== APP ICON ====== */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <h2 className="font-semibold text-white">App Icon</h2>
            <p className="text-xs text-slate-500 mt-1">Pick which photo appears as the app icon on her home screen.</p>
          </div>
          <div className="px-4 py-4">
            {[...herPhotos, ...hisPhotos, ...couplePhotos].filter((p: any) => p?.photo_url).length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {[...herPhotos, ...hisPhotos, ...couplePhotos].filter((p: any) => p?.photo_url).map((photo: any) => (
                  <button key={photo.id} onClick={async () => {
                    await supabase.from('apps').update({ icon_photo_url: photo.photo_url }).eq('id', app.id)
                    setApp({ ...app, icon_photo_url: photo.photo_url })
                    showToast('App icon updated!')
                  }}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      app.icon_photo_url === photo.photo_url ? 'border-blue-400 ring-2 ring-blue-400/30' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                    <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Upload photos first, then pick one as the icon.</p>
            )}
          </div>
        </div>

        {/* ====== RE-SEND LINK ====== */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
          <h2 className="font-semibold text-white mb-1">Re-send Her Gift Link</h2>
          <p className="text-xs text-slate-500 mb-3">If {app.her_name} needs to re-add the app to her phone, share this link with her.</p>
          <div className="flex gap-2">
            <input type="text" readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/app/${app.her_slug}`}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none" />
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/app/${app.her_slug}`); showToast('Link copied!') }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">Copy</button>
          </div>
        </div>
      </div>
    </div>
  )
}
