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
    .select('her_name, his_name')
    .eq('her_slug', slug)
    .single()

  const herName = app?.her_name || 'She'
  const hisName = app?.his_name || 'someone'

  return {
    title: `${herName} just got her own app from ${hisName}`,
    description: 'See what it looks like and get your own at GiftHerAnApp.',
  }
}

export default function ShareSlugLayout({ children }: Props) {
  return children
}
