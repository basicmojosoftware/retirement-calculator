import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Retirement Calculator',
  description: 'Plan your financial future',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">
        {children}
      </body>
    </html>
  )
}
