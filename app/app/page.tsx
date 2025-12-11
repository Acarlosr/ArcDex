"use client"

import Link from "next/link"
import { ArrowRight, Zap, TrendingUp, Droplets, Send } from "lucide-react"

export default function AppHome() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A304F] via-[#114B6E] to-[#D1D5DB] text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">ARCDex V2</h1>
          <p className="text-xl text-slate-300 mb-2">The most advanced DeFi platform on Arc Network</p>
          <p className="text-slate-400">Trade, stake, provide liquidity, and send payments securely and efficiently.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/app/swap" className="group">
            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-400/60 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Swap Tokens</h2>
              <p className="text-slate-300 text-sm mb-4">Instantly swap between USDC and EURC with minimal slippage.</p>
              <div className="flex items-center gap-2 text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">Go to Swap</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/app/stake" className="group">
            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-400/60 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Stake & Earn</h2>
              <p className="text-slate-300 text-sm mb-4">Earn up to 25% APY by staking tokens in secure vaults.</p>
              <div className="flex items-center gap-2 text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">Go to Stake</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/app/pools" className="group">
            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-400/60 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Liquidity Pools</h2>
              <p className="text-slate-300 text-sm mb-4">Provide liquidity and earn a share of trading fees.</p>
              <div className="flex items-center gap-2 text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">Go to Pools</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/app/payments" className="group">
            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-400/60 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                <Send className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Send Payments</h2>
              <p className="text-slate-300 text-sm mb-4">Send stablecoins globally with near-zero fees.</p>
              <div className="flex items-center gap-2 text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">Send Payment</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

        {/* Network Info Card */}
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-8 border border-cyan-500/30">
          <h3 className="text-sm font-semibold text-slate-300 mb-6 uppercase tracking-wide">Network Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Network</p>
              <p className="text-xl font-bold text-white">Arc Network Testnet</p>
              <p className="text-sm text-slate-400 mt-1">Building the future of DeFi</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Status</p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
                <p className="text-xl font-bold text-white">Active</p>
              </div>
              <p className="text-sm text-slate-400 mt-1">All systems operational</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Supported Tokens</p>
              <p className="text-xl font-bold text-white">USDC, EURC</p>
              <p className="text-sm text-slate-400 mt-1">Stablecoin trading focus</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-600/10 rounded-lg p-4 border border-cyan-500/20">
            <p className="text-xs text-slate-400 mb-1">Total Value Locked</p>
            <p className="text-2xl font-bold text-cyan-400">$2.4M</p>
          </div>
          <div className="bg-blue-600/10 rounded-lg p-4 border border-cyan-500/20">
            <p className="text-xs text-slate-400 mb-1">24h Trading Volume</p>
            <p className="text-2xl font-bold text-cyan-400">$340K</p>
          </div>
          <div className="bg-blue-600/10 rounded-lg p-4 border border-cyan-500/20">
            <p className="text-xs text-slate-400 mb-1">Active Users</p>
            <p className="text-2xl font-bold text-cyan-400">2.8K</p>
          </div>
          <div className="bg-blue-600/10 rounded-lg p-4 border border-cyan-500/20">
            <p className="text-xs text-slate-400 mb-1">Active Pools</p>
            <p className="text-2xl font-bold text-cyan-400">12</p>
          </div>
        </div>
      </div>
    </main>
  )
}
