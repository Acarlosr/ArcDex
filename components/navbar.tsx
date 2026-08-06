"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Droplet, Loader2, Copy, Check, ExternalLink, Smartphone, Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useTokenBalance } from "@/hooks/use-contracts"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/lib/i18n"
import { useCompliance } from "@/hooks/useCompliance"
import { ARCSCAN_URL, FAUCET_URL, IS_MAINNET, NETWORK_LABEL } from "@/lib/contracts"

const WALLET_DEEP_LINKS = {
  metamask: 'https://metamask.app.link/dapp/www.arc-dex.xyz/app',
  trust: 'https://link.trustwallet.com/open_url?coin_id=60&url=https://www.arc-dex.xyz/app',
}

const SEPOLIA_FAUCET_URL = "https://cloud.google.com/application/web3/faucet/ethereum/sepolia"

export function Navbar() {
  const { t } = useI18n()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [hasInjectedProvider, setHasInjectedProvider] = useState(false)
  const [isManualConnecting, setIsManualConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const pathname = usePathname()

  const { address, isConnected, isConnecting } = useAccount()
  const { connectAsync, connectors, isPending, reset: resetConnect } = useConnect()
  const { disconnect } = useDisconnect()
  const { result: complianceResult, checkCompliance, loading: complianceLoading } = useCompliance()

  const { formatted: usdcBalance } = useTokenBalance('USDC', isDialogOpen && isConnected)
  const { formatted: eurcBalance } = useTokenBalance('EURC', isDialogOpen && isConnected)

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
    setIsMobile(mobile)
    setHasInjectedProvider(!!(window as any).ethereum)
  }, [])

  // Verificar compliance ao conectar
  useEffect(() => {
    if (isConnected && address && !complianceResult) {
      checkCompliance(address)
    }
  }, [isConnected, address, complianceResult, checkCompliance])

  useEffect(() => {
    if (!isManualConnecting) return
    const timeout = window.setTimeout(() => {
      setIsManualConnecting(false)
      setConnectionError(t("wallet.connectionTimedOut"))
      resetConnect()
    }, 30000)
    return () => window.clearTimeout(timeout)
  }, [isManualConnecting, resetConnect, t])

  useEffect(() => {
    if (isConnected) {
      setIsManualConnecting(false)
      setConnectionError(null)
    }
  }, [isConnected])

  const openWalletDialog = () => {
    if (isPending) resetConnect()
    setConnectionError(null)
    setIsDialogOpen(true)
  }

  const handleWalletConnect = async () => {
    const wcConnector = connectors.find(c => c.id === 'walletConnect')
    if (wcConnector) {
      try {
        setConnectionError(null)
        setIsManualConnecting(true)
        await connectAsync({ connector: wcConnector })
        setIsDialogOpen(false)
      } catch (error) {
        setConnectionError(error instanceof Error ? error.message : t("wallet.connectionFailed"))
        resetConnect()
      } finally {
        setIsManualConnecting(false)
      }
    } else {
      setConnectionError(t("wallet.walletConnectUnavailable"))
    }
  }

  const handleInjectedConnect = async () => {
    if (!hasInjectedProvider) {
      setConnectionError(t("wallet.noBrowserWallet"))
      return
    }
    const injectedConnector = connectors.find(c => c.id === 'injected')
    if (injectedConnector) {
      try {
        setConnectionError(null)
        setIsManualConnecting(true)
        await connectAsync({ connector: injectedConnector })
        setIsDialogOpen(false)
      } catch (error) {
        setConnectionError(error instanceof Error ? error.message : t("wallet.connectionFailed"))
        resetConnect()
      } finally {
        setIsManualConnecting(false)
      }
    } else {
      setConnectionError(t("wallet.noBrowserWallet"))
    }
  }

  const handleDisconnect = () => {
    disconnect()
    resetConnect()
    setIsManualConnecting(false)
    setConnectionError(null)
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
    { label: t("nav.swap"), href: "/app/swap" },
    { label: "Bridge", href: "/app/bridge" },
    { label: t("nav.pools"), href: "/app/pools" },
    { label: t("nav.payments"), href: "/app/payments" },
    { label: t("nav.portfolio"), href: "/app/portfolio" },
    { label: t("nav.history"), href: "/app/history" },
  ]

  const showBrowserWalletButton = !isMobile || hasInjectedProvider
  const showMobileDeepLinks = isMobile && !hasInjectedProvider

  // Compliance badge
  const ComplianceBadge = () => {
    if (!isConnected || !address) return null
    if (complianceLoading) return (
      <span className="compliance-loading">
        <Loader2 className="h-3 w-3 animate-spin" /> Screening
      </span>
    )
    if (!complianceResult) return null
    if (complianceResult.isBlocked) return (
      <span className="compliance-blocked">
        <ShieldAlert className="h-3 w-3" /> Bloqueado
      </span>
    )
    return (
      <span className="compliance-safe">
        <ShieldCheck className="h-3 w-3" /> Verificado
      </span>
    )
  }

  return (
    <>
      <nav className="navbar-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Logo href="/" size="md" />

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />

            {/* Faucets — só existem em testnet */}
            {!IS_MAINNET && FAUCET_URL && (
            <div className="flex items-center gap-1">
              <div className="relative group">
                <a
                  href={FAUCET_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Circle Faucet"
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                >
                  <Droplet size={16} />
                </a>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {t("nav.faucet")}
                </div>
              </div>

              <div className="relative group">
                <a
                  href={SEPOLIA_FAUCET_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Ethereum Sepolia Faucet"
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                >
                  <span className="font-mono text-base font-semibold leading-none">Ξ</span>
                </a>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Sepolia ETH
                </div>
              </div>
            </div>
            )}

            {/* Badge da rede ativa */}
            <span
              className={`hidden sm:flex badge-arc items-center gap-1.5 ${
                IS_MAINNET ? "badge-arc-green" : "badge-arc-blue"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
              {NETWORK_LABEL}
            </span>

            {/* Wallet button */}
            {isConnected && address ? (
              <button
                onClick={openWalletDialog}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-muted transition-all text-sm font-medium text-foreground"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {formatAddress(address)}
              </button>
            ) : (
              <Button
                onClick={openWalletDialog}
                className="btn-arc-primary px-4 py-2 text-sm h-auto"
              >
                {isConnecting || isPending || isManualConnecting ? (
                  <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />{t("wallet.connecting")}</>
                ) : (
                  t("wallet.connect")
                )}
              </Button>
            )}
          </div>
        </div>
      </nav>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              {isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {t("wallet.connected")}
                </>
              ) : t("wallet.connect")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("wallet.connect")}
            </DialogDescription>
          </DialogHeader>

          {isConnected && address ? (
            <div className="space-y-4">
              {/* Compliance status */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status Compliance</span>
                <ComplianceBadge />
              </div>

              {/* Address box */}
              <div className="bg-muted rounded-xl p-4 glow-border">
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                  {t("wallet.address")}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-mono text-sm">{formatAddress(address)}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={copyAddress}
                      className="p-1.5 rounded-lg hover:bg-background transition-colors"
                      title={t("wallet.copyAddress")}
                    >
                      {copied
                        ? <Check className="h-3.5 w-3.5 text-green-400" />
                        : <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                    </button>
                    <a
                      href={`${ARCSCAN_URL}/address/${address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg hover:bg-background transition-colors"
                      title={t("wallet.viewExplorer")}
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Balances */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="stat-card">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">USDC</p>
                  <p className="text-lg font-bold text-foreground font-tabular">{usdcBalance}</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">EURC</p>
                  <p className="text-lg font-bold text-foreground font-tabular">{eurcBalance}</p>
                </div>
              </div>

              {/* Explorer link */}
              <a
                href={`${ARCSCAN_URL}/address/${address}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver no ArcScan
              </a>

              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                {t("wallet.disconnect")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {connectionError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/8 p-3 text-sm text-destructive">
                  <p className="font-semibold">{t("wallet.connectionFailed")}</p>
                  <p className="mt-1 text-xs opacity-75">{connectionError}</p>
                  <button
                    type="button"
                    onClick={() => { resetConnect(); setIsManualConnecting(false); setConnectionError(null) }}
                    className="mt-2 text-xs font-bold underline underline-offset-4"
                  >
                    {t("wallet.tryAgain")}
                  </button>
                </div>
              )}

              {/* WalletConnect */}
              <button
                onClick={handleWalletConnect}
                disabled={isManualConnecting}
                className="w-full p-4 rounded-xl bg-primary/8 hover:bg-primary/15 border border-primary/25 hover:border-primary/50 text-foreground text-sm font-medium transition-all flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl btn-arc-primary flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-xs">WC</span>
                </div>
                <div className="text-left flex-1">
                  <span className="block font-semibold">{t("wallet.walletConnect")}</span>
                  <span className="text-xs text-muted-foreground">
                    {isMobile ? t("wallet.walletConnectMobile") : t("wallet.walletConnectDesktop")}
                  </span>
                </div>
                <span className="badge-arc badge-arc-blue text-[10px]">{t("wallet.recommended")}</span>
              </button>

              {/* Browser Wallet */}
              {showBrowserWalletButton && (
                <button
                  onClick={handleInjectedConnect}
                  disabled={isManualConnecting}
                  className="w-full p-3.5 rounded-xl bg-muted hover:bg-muted/70 border border-border hover:border-primary/25 text-foreground text-sm font-medium transition-all flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 text-base">
                    🦊
                  </div>
                  <div className="text-left flex-1">
                    <span className="block">{t("wallet.browserWallet")}</span>
                    <span className="text-xs text-muted-foreground">{t("wallet.browserWalletDesc")}</span>
                  </div>
                  {hasInjectedProvider && (
                    <span className="badge-arc badge-arc-green text-[10px]">✓ {t("wallet.detected")}</span>
                  )}
                </button>
              )}

              {/* Mobile Deep Links */}
              {showMobileDeepLinks && (
                <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <span className="font-medium">{t("wallet.openWalletBrowser")}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <a href={WALLET_DEEP_LINKS.metamask} className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 transition-colors">
                      <span className="text-sm font-medium text-foreground">{t("wallet.openMetaMask")}</span>
                      <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                    <a href={WALLET_DEEP_LINKS.trust} className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 transition-colors">
                      <span className="text-sm font-medium text-foreground">{t("wallet.openTrust")}</span>
                      <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  </div>
                  <button onClick={copyDappLink} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground">
                    {copiedLink ? (
                      <><Check className="h-3.5 w-3.5 text-green-400" /><span className="text-green-400">{t("wallet.linkCopied")}</span></>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /><span>{t("wallet.copyDappLink")}</span></>
                    )}
                  </button>
                </div>
              )}

              {/* Faucet / Explorer */}
              <div className="flex gap-2">
                {!IS_MAINNET && FAUCET_URL && (
                  <a href={FAUCET_URL} target="_blank" rel="noreferrer" className="flex-1 px-3 py-2 rounded-lg bg-primary/8 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors text-center">
                    {t("wallet.usdcFaucet")}
                  </a>
                )}
                <a href={ARCSCAN_URL} target="_blank" rel="noreferrer" className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-muted-foreground text-xs font-medium hover:bg-muted/70 transition-colors text-center">

                  ArcScan ↗
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
