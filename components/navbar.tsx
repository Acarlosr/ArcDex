"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Droplet, Loader2, Copy, Check, ExternalLink } from "lucide-react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTokenBalance } from "@/hooks/use-contracts"

export function Navbar() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const pathname = usePathname()

  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const { formatted: usdcBalance } = useTokenBalance('USDC')
  const { formatted: eurcBalance } = useTokenBalance('EURC')

  const handleConnect = (connectorId: string) => {
    const connector = connectors.find((c) => c.id === connectorId)
    if (connector) {
      connect({ connector })
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

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const navItems = [
    { label: "Stake", href: "/app/stake" },
    { label: "Swap", href: "/app/swap" },
    { label: "Pools", href: "/app/pools" },
    { label: "Payments", href: "/app/payments" },
    { label: "History", href: "/app/history" },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400" />
            <span className="text-xl font-bold text-foreground">ARCDex V2</span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${pathname === item.href ? "text-accent font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Connect Wallet Button */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <Droplet size={20} />
              </a>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                faucet
              </div>
            </div>

            <span className="text-sm text-muted-foreground font-medium">Arc Testnet</span>

            {isConnected && address ? (
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
                className="border-cyan-500/30 text-foreground hover:bg-muted"
              >
                {formatAddress(address)}
              </Button>
            ) : (
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="btn-gradient"
                disabled={isConnecting || isPending}
              >
                {isConnecting || isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Wallet Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {isConnected ? "Wallet Connected" : "Connect Wallet"}
            </DialogTitle>
          </DialogHeader>

          {isConnected && address ? (
            <div className="space-y-4">
              {/* Address */}
              <div className="bg-muted rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">Address</p>
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-mono text-sm">{formatAddress(address)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={copyAddress}
                      className="p-1.5 rounded hover:bg-background transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <a
                      href={`https://explorer.testnet.arc.network/address/${address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded hover:bg-background transition-colors"
                      title="View on explorer"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Balances */}
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

              {/* Disconnect */}
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="w-full border-destructive text-destructive hover:bg-destructive/10"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Check if MetaMask or other wallet is detected */}
              {typeof window !== 'undefined' && (window as unknown as { ethereum?: unknown }).ethereum ? (
                <>
                  <button
                    onClick={() => {
                      const injectedConnector = connectors.find(c => c.id === 'injected')
                      if (injectedConnector) {
                        connect({ connector: injectedConnector })
                        setIsDialogOpen(false)
                      }
                    }}
                    className="w-full p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 text-foreground text-sm font-medium transition-all border border-orange-500/30 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">M</span>
                    </div>
                    <span>MetaMask</span>
                    <span className="ml-auto text-xs text-green-400">● Detected</span>
                  </button>

                  {connectors.filter(c => c.id !== 'injected').map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => handleConnect(connector.id)}
                      className="w-full p-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors border border-border"
                    >
                      {connector.name}
                    </button>
                  ))}
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-3xl">🦊</span>
                  </div>
                  <p className="text-foreground font-medium mb-2">No Wallet Detected</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please install MetaMask to connect to this app.
                  </p>
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    Install MetaMask
                  </a>
                </div>
              )}

              <p className="text-xs text-muted-foreground pt-2">
                <span className="block font-semibold mb-1">Note:</span>
                Make sure your wallet is configured for Arc Testnet (Chain ID: 5042002).
                Get testnet USDC from the{" "}
                <a
                  href="https://faucet.circle.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  Circle Faucet
                </a>.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
