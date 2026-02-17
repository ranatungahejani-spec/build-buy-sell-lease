import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppShell } from '@/components/app-shell'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Buy Sell Lease — Australian Real Estate',
  description: 'Find properties, agents, agencies and real estate services across Australia.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
