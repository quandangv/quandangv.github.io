import type { Metadata } from 'next'
import './globals.css'


export const metadata: Metadata = {
  title: 'Dumbphrase',
  description: 'Generate dumb phrases for passwords',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <link rel="icon" href="/icon?<generated>" type="image/png" sizes="32x32" />
      <body className="h-screen flex flex-col p-4 bg-teal h-full">{children}</body>
    </html>
  )
}
