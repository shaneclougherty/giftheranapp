import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await params

  return {
    appleWebApp: {
      capable: true,
      title: 'App Manager',
      statusBarStyle: 'default',
    },
    icons: {
      apple: '/GiftHerAnApp_Logo_small.png',
    },
    other: {
      'apple-mobile-web-app-capable': 'yes',
    },
  }
}

export default function ManageSlugLayout({ children }: Props) {
  return children
}
