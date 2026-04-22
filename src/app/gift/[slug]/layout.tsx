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
    .select('her_name')
    .eq('her_slug', slug)
    .single()

  const herName = app?.her_name || 'Someone special'

  return {
    title: `${herName} has a gift!`,
    description: 'Someone special made you your own app.',
  }
}

export default function GiftSlugLayout({ children }: Props) {
  return children
}
