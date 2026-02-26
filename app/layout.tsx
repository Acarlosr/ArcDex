import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/components/web3-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ArcBot } from "@/features/ai/ArcBot"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "ARCDex V2 - DeFi Trading on Arc Network",
  description: "Multi-page DeFi dApp for trading on Arc Network Testnet",
  generator: 'v0.app',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Web3Provider>
            {children}
            {/* ArcBot AI Assistant */}
            <ArcBot />
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}