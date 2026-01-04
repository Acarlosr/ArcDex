"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Droplet, Loader2, Copy, Check, ExternalLink, Smartphone } from "lucide-react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTokenBalance } from "@/hooks/use-contracts"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

// Deep link URLs for mobile wallets
const WALLET_DEEP_LINKS = {
  metamask: 'https://metamask.app.link/dapp/www.arc-dex.xyz/app',
  trust: 'https://link.trustwallet.com/open_url?coin_id=60&url=https://www.arc-dex.xyz/app',
}

export function Navbar() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [hasInjectedProvider, setHasInjectedProvider] = useState(false)
  const pathname = usePathname()

  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const { formatted: usdcBalance } = useTokenBalance('USDC')
  const { formatted: eurcBalance } = useTokenBalance('EURC')

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
    setIsMobile(mobile)
    setHasInjectedProvider(!!(window as any).ethereum)
  }, [])

  const handleWalletConnect = () => {
    const wcConnector = connectors.find(c => c.id === 'walletConnect')
    if (wcConnector) {
      connect({ connector: wcConnector })
      setIsDialogOpen(false)
    }
  }

  const handleInjectedConnect = () => {
    if (!hasInjectedProvider) return
    const injectedConnector = connectors.find(c => c.id === 'injected')
    if (injectedConnector) {
      connect({ connector: injectedConnector })
      setIsDialogOpen(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setIsDialogOpen(false)
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyDappLink = () => {
    navigator.clipboard.writeText('https://www.arc-dex.xyz/app')
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const navItems = [
    { label: "Swap", href: "/app/swap" },
    { label: "Pools", href: "/app/pools" },
    { label: "Payments", href: "/app/payments" },
    { label: "Stake", href: "/app/stake" },
    { label: "Contracts", href: "/app/contracts" },
    { label: "History", href: "/app/history" },
    { label: "Docs", href: "/app/docs" },
  ]

  const showBrowserWalletButton = !isMobile || hasInjectedProvider
  const showMobileDeepLinks = isMobile && !hasInjectedProvider

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo href="/" size="md" />

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${pathname === item.href ? "text-accent font-semibold" : "text-muted-foreground hover:text-foreground"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="relative group">
              <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 transition-colors cursor-pointer">
                <Droplet size={20} />
              </a>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                faucet
              </div>
            </div>

            <span className="text-sm text-muted-foreground font-medium">Arc Testnet</span>

            {isConnected && address ? (
              <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="border-border text-foreground hover:bg-muted">
                {formatAddress(address)}
              </Button>
            ) : (
              <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isConnecting || isPending}>
                {isConnecting || isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connecting...</>
                ) : (
                  "Connect Wallet"
                )}
              </Button>
            )}
          </div>
        </div>
      </nav>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {isConnected ? "Wallet Connected" : "Connect Wallet"}
            </DialogTitle>
          </DialogHeader>

          {isConnected && address ? (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">Address</p>
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-mono text-sm">{formatAddress(address)}</span>
                  <div className="flex gap-2">
                    <button onClick={copyAddress} className="p-1.5 rounded hover:bg-background transition-colors" title="Copy address">
                      {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <a href={`https://testnet.arcscan.app/address/${address}`} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-background transition-colors" title="View on explorer">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">USDC Balance</p>
                  <p className="text-lg font-semibold text-foreground">{usdcBalance}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">EURC Balance</p>
                  <p className="text-lg font-semibold text-foreground">{eurcBalance}</p>
                </div>
              </div>

              <Button onClick={handleDisconnect} variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10">
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* WalletConnect */}
              <button
                onClick={handleWalletConnect}
                className="w-full p-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-foreground text-sm font-medium transition-all border border-primary/30 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">WC</span>
                </div>
                <div className="text-left">
                  <span className="block font-semibold">WalletConnect</span>
                  <span className="text-xs text-muted-foreground">
                    {isMobile ? 'Connect your mobile wallet' : 'Scan QR with mobile wallet'}
                  </span>
                </div>
                <span className="ml-auto text-xs text-primary">Recommended</span>
              </button>

              {/* Browser Wallet */}
              {showBrowserWalletButton && (
                <button
                  onClick={handleInjectedConnect}
                  className="w-full p-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors border border-border flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🦊</span>
                  </div>
                  <div className="text-left">
                    <span className="block">Browser Wallet</span>
                    <span className="text-xs text-muted-foreground">MetaMask, Rabby, etc.</span>
                  </div>
                  {hasInjectedProvider && (
                    <span className="ml-auto text-xs text-green-400">✓ Detected</span>
                  )}
                </button>
              )}

              {/* Mobile Deep Links */}
              {showMobileDeepLinks && (
                <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <span className="font-medium">Or open in wallet browser</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <a href={WALLET_DEEP_LINKS.metamask} className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition-colors">
                      <span className="text-sm font-medium text-foreground">Open in MetaMask</span>
                      <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                    </a>
                    <a href={WALLET_DEEP_LINKS.trust} className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-colors">
                      <span className="text-sm font-medium text-foreground">Open in Trust Wallet</span>
                      <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                    </a>
                  </div>

                  <button onClick={copyDappLink} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground">
                    {copiedLink ? (
                      <><Check className="h-4 w-4 text-green-400" /><span className="text-green-400">Link copied!</span></>
                    ) : (
                      <><Copy className="h-4 w-4" /><span>Copy dApp link</span></>
                    )}
                  </button>
                </div>
              )}

              {/* Faucet Links */}
              <div className="flex gap-2">
                <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="flex-1 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors text-center">
                  💧 USDC Faucet
                </a>
                <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors text-center">
                  🔍 Explorer
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
