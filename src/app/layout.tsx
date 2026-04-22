import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ogImage = 'https://kckxnvyorzzayhfapadc.supabase.co/storage/v1/object/public/photos/Iphone_w_Dashboardv2.png'

export const metadata: Metadata = {
  title: "GiftHerAnApp \u2014 The most thoughtful gift you'll ever give her",
  description: "Build her her own app full of coupons she can redeem anytime. When she taps one, you get a text. Then you deliver. $14.99 one-time.",
  icons: {
    icon: 'https://kckxnvyorzzayhfapadc.supabase.co/storage/v1/object/public/photos/GiftHerAnApp_Logo_small_NBG.png',
  },
  openGraph: {
    title: "GiftHerAnApp \u2014 The most thoughtful gift you'll ever give her",
    description: "Build her her own app full of coupons she can redeem anytime. When she taps one, you get a text. Then you deliver. $14.99 one-time.",
    url: 'https://www.giftheranapp.com',
    siteName: 'GiftHerAnApp',
    type: 'website',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: "GiftHerAnApp \u2014 The most thoughtful gift you'll ever give her",
    description: "Build her her own app full of coupons she can redeem anytime. When she taps one, you get a text. Then you deliver. $14.99 one-time.",
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
