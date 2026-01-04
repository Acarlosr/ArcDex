"use client"

import Link from "next/link"
import { ChevronRight, Zap, TrendingUp, Droplets, Send, ArrowRight, Shield, Globe, Bolt } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo href="/" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              How It Works
            </a>
            <a href="#stats" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Stats
            </a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="https://docs.arc.network/arc/concepts/welcome-to-arc" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium hidden sm:inline">
              Docs
            </a>
            <Link
              href="/app"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all text-sm"
            >
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-block mb-6 px-4 py-2 rounded-full border border-primary/30 bg-primary/5">
            <span className="text-primary text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live on Arc Network Testnet
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight tracking-tight">
            The Future of
            <span className="block text-primary">
              DeFi Trading
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Swap, stake, provide liquidity, and send stablecoin payments on Arc Network. 
            Built for speed, security, and simplicity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              href="/app"
              className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group"
            >
              Launch App
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-lg border border-border text-foreground font-semibold hover:bg-muted hover:border-primary/30 transition-all"
            >
              Learn More
            </a>
          </div>

          {/* Live Stats - Demo Data */}
          <div id="stats" className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="px-2 py-1 bg-muted border border-border text-muted-foreground text-xs font-medium rounded">
                DEMO METRICS
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-5 text-center">
                <p className="text-3xl font-bold text-primary mb-1">$2.4M</p>
                <p className="text-muted-foreground text-sm">Total Value Locked</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5 text-center">
                <p className="text-3xl font-bold text-primary mb-1">$340K</p>
                <p className="text-muted-foreground text-sm">24h Volume</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5 text-center">
                <p className="text-3xl font-bold text-primary mb-1">2.8K</p>
                <p className="text-muted-foreground text-sm">Active Users</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5 text-center">
                <p className="text-3xl font-bold text-primary mb-1">12</p>
                <p className="text-muted-foreground text-sm">Active Pools</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for advanced DeFi trading, yield generation, and cross-border payments
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Swaps */}
            <div className="group bg-card border border-border rounded-xl p-8 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Instant Swaps</h3>
              <p className="text-muted-foreground mb-4">
                Swap between USDC, EURC, and other tokens with minimal slippage and instant settlement. Perfect for
                traders who want fast execution and competitive rates.
              </p>
              <Link
                href="/app/swap"
                className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-2 group/link"
              >
                Try Swaps <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Staking */}
            <div className="group bg-card border border-border rounded-xl p-8 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Yield Staking</h3>
              <p className="text-muted-foreground mb-4">
                Stake your tokens in our secure vaults and earn up to 25% APY. Fully automated yield farming with daily
                compounding rewards and no minimum lock-up periods.
              </p>
              <Link
                href="/app/stake"
                className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-2 group/link"
              >
                Start Staking <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Liquidity Pools */}
            <div className="group bg-card border border-border rounded-xl p-8 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <Droplets className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Liquidity Pools</h3>
              <p className="text-muted-foreground mb-4">
                Provide liquidity to earn a share of all trading fees. Contribute to multiple pools and earn passive
                income proportional to your liquidity contribution.
              </p>
              <Link
                href="/app/pools"
                className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-2 group/link"
              >
                Provide Liquidity{" "}
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Payments */}
            <div className="group bg-card border border-border rounded-xl p-8 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <Send className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Fast Payments</h3>
              <p className="text-muted-foreground mb-4">
                Send stablecoins globally with near-zero fees and instant settlement. Perfect for cross-border
                transfers, payouts, and remittances on Arc Network.
              </p>
              <Link
                href="/app/payments"
                className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-2 group/link"
              >
                Send Payment <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose ARCDex?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade features designed for traders and liquidity providers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">⚡ High Performance</h3>
              <p className="text-muted-foreground">
                Built on Arc Network's optimized infrastructure for fast transactions and minimal latency.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">🔒 Secure & Audited</h3>
              <p className="text-muted-foreground">
                Smart contracts audited by leading security firms with multi-signature governance.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">💰 Low Fees</h3>
              <p className="text-muted-foreground">
                Minimal gas fees and competitive spreads on every trade and liquidity operation.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">🌍 24/7 Access</h3>
              <p className="text-muted-foreground">
                Trade and manage positions anytime with no trading hours or market restrictions.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">📊 Advanced Tools</h3>
              <p className="text-muted-foreground">Professional-grade charting, analytics, and trading history tracking.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">🤝 Community</h3>
              <p className="text-muted-foreground">
                Join thousands of traders and liquidity providers in our growing ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Ready to Start Trading?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of traders already using ARCDex for seamless DeFi access on Arc Network Testnet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app"
              className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all"
            >
              Launch App
            </Link>
            <a
              href="https://www.arc.network/litepaper"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 rounded-lg border border-border text-foreground font-semibold hover:bg-muted hover:border-primary/30 transition-all"
            >
              Read Litepaper
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo size="sm" href="/" />
              </div>
              <p className="text-muted-foreground text-sm">The premier DeFi platform on Arc Network Testnet.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/app/swap" className="hover:text-primary transition-colors block">
                  Swap
                </Link>
                <Link href="/app/stake" className="hover:text-primary transition-colors block">
                  Stake
                </Link>
                <Link href="/app/pools" className="hover:text-primary transition-colors block">
                  Pools
                </Link>
                <Link href="/app/payments" className="hover:text-primary transition-colors block">
                  Payments
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Community</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="https://x.com/ArcStablecoins" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors block">
                  Twitter
                </a>
                <a href="https://discord.gg/buildonarc" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors block">
                  Discord
                </a>
                <a href="https://github.com/Acarlosr/ArcDex" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors block">
                  GitHub
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-muted-foreground text-sm">
            <p>© 2025 ARCDex. Built on Arc Network Testnet.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Status
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
