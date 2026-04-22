import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Purchase Complete — GiftHerAnApp',
  description: 'Your app is ready. Here are your links to get started.',
}

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return children
}
