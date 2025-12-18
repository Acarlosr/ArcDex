"use client"

import Link from "next/link"
import { ChevronRight, Zap, TrendingUp, Droplets, Send } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020617] via-[#041322] to-[#020617] text-slate-200 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-[#020617]/80 to-transparent backdrop-blur-sm border-b border-cyan-500/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">ARC</span>
            </div>
            <span className="text-lg font-semibold text-white">ARCDex</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-cyan-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-slate-300 hover:text-cyan-400 transition-colors">
              How It Works
            </a>
            <a href="#stats" className="text-slate-300 hover:text-cyan-400 transition-colors">
              Stats
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://docs.arc.network/arc/concepts/welcome-to-arc" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
              Docs
            </a>
            <Link
              href="/app"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/30"
            >
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5">
            <span className="text-cyan-400 text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Live on Arc Network Testnet
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Decentralized Trading
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            The most advanced DeFi platform on Arc Network. Swap, stake, provide liquidity, and send stablecoin payments
            — with zero compromises.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/app"
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-bold hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/40 flex items-center justify-center gap-2 group"
            >
              Launch App
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-lg border border-cyan-500/30 text-slate-200 font-semibold hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all"
            >
              Learn More
            </a>
          </div>

          {/* Live Stats - Demo Data */}
          <div id="stats" className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium rounded">DEMO METRICS</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">TVL</p>
                <p className="text-2xl font-bold text-cyan-400">$2.4M</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">24h Volume</p>
                <p className="text-2xl font-bold text-cyan-400">$340K</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Users</p>
                <p className="text-2xl font-bold text-cyan-400">2.8K</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Pools</p>
                <p className="text-2xl font-bold text-cyan-400">12</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4 border-t border-cyan-500/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need for advanced DeFi trading, yield generation, and cross-border payments
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Swaps */}
            <div className="group bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-xl p-8 hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant Swaps</h3>
              <p className="text-slate-400 mb-4">
                Swap between USDC, EURC, and other tokens with minimal slippage and instant settlement. Perfect for
                traders who want fast execution and competitive rates.
              </p>
              <Link
                href="/app/swap"
                className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold flex items-center gap-2 group/link"
              >
                Try Swaps <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Staking */}
            <div className="group bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-xl p-8 hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Yield Staking</h3>
              <p className="text-slate-400 mb-4">
                Stake your tokens in our secure vaults and earn up to 25% APY. Fully automated yield farming with daily
                compounding rewards and no minimum lock-up periods.
              </p>
              <Link
                href="/app/stake"
                className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold flex items-center gap-2 group/link"
              >
                Start Staking <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Liquidity Pools */}
            <div className="group bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-xl p-8 hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Liquidity Pools</h3>
              <p className="text-slate-400 mb-4">
                Provide liquidity to earn a share of all trading fees. Contribute to multiple pools and earn passive
                income proportional to your liquidity contribution.
              </p>
              <Link
                href="/app/pools"
                className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold flex items-center gap-2 group/link"
              >
                Provide Liquidity{" "}
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Payments */}
            <div className="group bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-xl p-8 hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                <Send className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fast Payments</h3>
              <p className="text-slate-400 mb-4">
                Send stablecoins globally with near-zero fees and instant settlement. Perfect for cross-border
                transfers, payouts, and remittances on Arc Network.
              </p>
              <Link
                href="/app/payments"
                className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold flex items-center gap-2 group/link"
              >
                Send Payment <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 border-t border-cyan-500/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose ARCDex?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Enterprise-grade features designed for traders and liquidity providers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">⚡ High Performance</h3>
              <p className="text-slate-400">
                Built on Arc Network's optimized infrastructure for fast transactions and minimal latency.
              </p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">🔒 Secure & Audited</h3>
              <p className="text-slate-400">
                Smart contracts audited by leading security firms with multi-signature governance.
              </p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">💰 Low Fees</h3>
              <p className="text-slate-400">
                Minimal gas fees and competitive spreads on every trade and liquidity operation.
              </p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">🌍 24/7 Access</h3>
              <p className="text-slate-400">
                Trade and manage positions anytime with no trading hours or market restrictions.
              </p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">📊 Advanced Tools</h3>
              <p className="text-slate-400">Professional-grade charting, analytics, and trading history tracking.</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">🤝 Community</h3>
              <p className="text-slate-400">
                Join thousands of traders and liquidity providers in our growing ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-cyan-500/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Trading?</h2>
          <p className="text-slate-400 mb-8">
            Join thousands of traders already using ARCDex for seamless DeFi access on Arc Network Testnet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app"
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-bold hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/40"
            >
              Launch App
            </Link>
            <a
              href="https://www.arc.network/litepaper"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 rounded-lg border border-cyan-500/30 text-slate-200 font-semibold hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all"
            >
              Read Litepaper
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/10 py-12 px-4 mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">ARC</span>
                </div>
                <span className="font-semibold text-white">ARCDex</span>
              </div>
              <p className="text-slate-400 text-sm">The premier DeFi platform on Arc Network Testnet.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href="/app/swap" className="hover:text-cyan-400 transition-colors block">
                  Swap
                </a>
                <a href="/app/stake" className="hover:text-cyan-400 transition-colors block">
                  Stake
                </a>
                <a href="/app/pools" className="hover:text-cyan-400 transition-colors block">
                  Pools
                </a>
                <a href="/app/payments" className="hover:text-cyan-400 transition-colors block">
                  Payments
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Docs</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href="https://docs.arc.network/arc/concepts/welcome-to-arc" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors block">
                  Documentation
                </a>
                <a href="#" className="hover:text-cyan-400 transition-colors block">
                  API Reference
                </a>
                <a href="#" className="hover:text-cyan-400 transition-colors block">
                  Litepaper
                </a>
                <a href="#" className="hover:text-cyan-400 transition-colors block">
                  Security
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href="https://x.com/ArcStablecoins" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors block">
                  Twitter
                </a>
                <a href="https://discord.gg/buildonarc" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors block">
                  Discord
                </a>
                <a href="#" className="hover:text-cyan-400 transition-colors block">
                  GitHub
                </a>
                <a href="#" className="hover:text-cyan-400 transition-colors block">
                  Blog
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-cyan-500/10 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-400 text-sm">
            <p>© 2025 ARCDex. Built on Arc Network Testnet.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Status
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
