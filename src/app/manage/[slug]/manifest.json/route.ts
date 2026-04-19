import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const manifest = {
    name: 'App Manager',
    short_name: 'App Manager',
    start_url: '/manage/' + slug,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#5DD3C2',
    icons: [
      { src: '/GiftHerAnApp_Logo_small.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/GiftHerAnApp_Logo_small.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  }

  return NextResponse.json(manifest, {
    headers: { 'Content-Type': 'application/manifest+json' },
  })
}
