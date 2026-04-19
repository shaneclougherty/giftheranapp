import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

type Props = {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

  return {
    appleWebApp: {
      capable: true,
      title: 'My App \u2764\uFE0F',
      statusBarStyle: 'default',
    },
    icons: {
      apple: iconUrl,
    },
    other: {
      'apple-mobile-web-app-capable': 'yes',
    },
  }
}

export default function AppSlugLayout({ children }: Props) {
  return children
}
