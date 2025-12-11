import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/components/web3-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ARCDex V2 - DeFi Trading on Arc Network",
  description: "Multi-page DeFi dApp for trading on Arc Network Testnet",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  )
}

