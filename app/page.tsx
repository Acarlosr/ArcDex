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
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
        
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
              <div className="card-professional p-5 text-center">
                <p className="text-3xl font-bold text-primary mb-1">$2.4M</p>
                <p className="text-muted-foreground text-sm">Total Value Locked</p>
              </div>
              <div className="card-professional p-5 text-center">
                <p className="text-3xl font-bold text-primary mb-1">$340K</p>
                <p className="text-muted-foreground text-sm">24h Volume</p>
              </div>
              <div className="card-professional p-5 text-center">
                <p className="text-3xl font-bold text-primary mb-1">2.8K</p>
                <p className="text-muted-foreground text-sm">Active Users</p>
              </div>
              <div className="card-professional p-5 text-center">
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
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for DeFi trading, yield generation, and cross-border payments
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Swaps */}
            <div className="group card-professional p-8">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Instant Swaps</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Swap between USDC, EURC, and other tokens with minimal slippage and instant settlement.
              </p>
              <Link
                href="/app/swap"
                className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-2 group/link"
              >
                Try Swaps <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Staking */}
            <div className="group card-professional p-8">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Yield Staking</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Stake your tokens in secure vaults and earn up to 25% APY with daily compounding rewards.
              </p>
              <Link
                href="/app/stake"
                className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-2 group/link"
              >
                Start Staking <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Liquidity Pools */}
            <div className="group card-professional p-8">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Droplets className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Liquidity Pools</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Provide liquidity to earn a share of all trading fees proportional to your contribution.
              </p>
              <Link
                href="/app/pools"
                className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-2 group/link"
              >
                Provide Liquidity <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Payments */}
            <div className="group card-professional p-8">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Send className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Fast Payments</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Send stablecoins globally with near-zero fees and instant settlement.
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
      <section id="features" className="py-20 px-4 border-t border-border bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Why ARCDex?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for traders and developers who demand performance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-professional p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Bolt className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">High Performance</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Built on Arc Network's optimized infrastructure for sub-second transactions.
              </p>
            </div>
            <div className="card-professional p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Battle-Tested</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Smart contracts following best security practices with multi-sig governance.
              </p>
            </div>
            <div className="card-professional p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-sm">0.3%</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Low Fees</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Minimal swap fees and near-zero gas costs on Arc Network.
              </p>
            </div>
            <div className="card-professional p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">24/7 Access</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Trade and manage positions anytime, anywhere, without restrictions.
              </p>
            </div>
            <div className="card-professional p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-sm">API</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Developer Friendly</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Open smart contracts with full documentation for integration.
              </p>
            </div>
            <div className="card-professional p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Instant Settlement</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All transactions settle immediately with full on-chain transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Ready to Start?</h2>
          <p className="text-muted-foreground mb-8">
            Join traders on Arc Network Testnet. Get testnet USDC and start trading in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app"
              className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all"
            >
              Launch App
            </Link>
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 rounded-lg border border-border text-foreground font-semibold hover:bg-muted hover:border-primary/30 transition-all"
            >
              Get Testnet USDC
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo showText={true} href="/" size="sm" />
              <p className="text-muted-foreground text-sm mt-4">DeFi trading on Arc Network Testnet.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="/app/swap" className="hover:text-primary transition-colors block">Swap</a>
                <a href="/app/stake" className="hover:text-primary transition-colors block">Stake</a>
                <a href="/app/pools" className="hover:text-primary transition-colors block">Pools</a>
                <a href="/app/payments" className="hover:text-primary transition-colors block">Payments</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="/app/docs" className="hover:text-primary transition-colors block">Documentation</a>
                <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors block">ArcScan</a>
                <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors block">USDC Faucet</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Community</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="https://x.com/ArcStablecoins" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors block">Twitter</a>
                <a href="https://discord.gg/buildonarc" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors block">Discord</a>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-muted-foreground text-sm">
            <p>© 2025 ARCDex. Built on Arc Network.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
