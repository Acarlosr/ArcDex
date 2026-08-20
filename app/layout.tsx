import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/components/web3-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/lib/i18n"
import { IS_MAINNET, MAINNET_LAUNCH_LABEL } from "@/lib/contracts"


const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  metadataBase: new URL("https://www.arc-dex.xyz"),
  // Condicional: enquanto a mainnet não está configurada o app roda na testnet,
  // e afirmar "Mainnet" no título/SEO era simplesmente falso.
  title: IS_MAINNET
    ? "ARCDex — DeFi on Arc Mainnet"
    : "ARCDex — DeFi on Arc Testnet",
  description: IS_MAINNET
    ? "Swap, bridge, pools and stablecoin payments on Arc — Circle's Layer 1 for onchain finance."
    : `Swap, bridge, pools and stablecoin payments on Arc Testnet — Circle's Layer 1 for onchain finance. Public Mainnet live ${MAINNET_LAUNCH_LABEL}.`,
  applicationName: "ArcDex",
  manifest: "/site.webmanifest",
  icons: {
    // Order matters: browsers/crawlers use the first matching entry. A real
    // favicon.ico at the root is what Google's favicon fetcher looks for
    // first — without it, search results can fall back to a generic icon
    // (e.g. the platform's default logo) instead of the ArcDex mark.
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#4B0830",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="arcdex-theme"
          disableTransitionOnChange
        >
          <I18nProvider>
            <Web3Provider>
              {children}
            </Web3Provider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
