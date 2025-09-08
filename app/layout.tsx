import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider' // Adjust the import path if necessary
import './globals.css'

export const metadata: Metadata = {
  title: 'GNSS : IITTNIF',
  description: 'Global Navigation Satellite System Laboratory at IIT Tirupati', 
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
