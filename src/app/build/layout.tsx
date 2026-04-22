import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build Her App — GiftHerAnApp',
  description: 'Pick a theme, upload photos, choose coupons. Takes 5 minutes.',
}

export default function BuildLayout({ children }: { children: React.ReactNode }) {
  return children
}
