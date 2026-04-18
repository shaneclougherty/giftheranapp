import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: app } = await supabase
    .from('apps')
    .select('icon_photo_url')
    .eq('her_slug', slug)
    .single()

  const iconUrl = app?.icon_photo_url || '/GiftHerAnApp_Logo_small.png'

  const manifest = {
    name: 'My App \u2764\uFE0F',
    short_name: 'My App \u2764\uFE0F',
    start_url: '/app/' + slug,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: iconUrl, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: iconUrl, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  }

  return NextResponse.json(manifest, {
    headers: { 'Content-Type': 'application/manifest+json' },
  })
}
