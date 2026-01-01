"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Zap, TrendingUp, Droplets, Send, PieChart, Rocket, HelpCircle } from "lucide-react"
import { OnboardingModal } from "@/components/onboarding-modal"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export default function AppHome() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  return (
    <main className="min-h-screen">
      <OnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Testnet Banner */}
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded">TESTNET</span>
            <span className="text-amber-200 text-sm">You are using Arc Network Testnet. All data is for testing purposes only.</span>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="text-amber-400 text-sm font-medium hover:text-amber-300 flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" />
            How to Test
          </button>
        </div>

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="mb-3">
              <Logo size="lg" href="/app" />
            </div>
            <p className="text-xl text-foreground mb-2">The most advanced DeFi platform on Arc Network</p>
            <p className="text-muted-foreground">Trade, stake, provide liquidity, and send payments securely and efficiently.</p>
          </div>
          <Button
            onClick={() => setShowOnboarding(true)}
            className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex items-center gap-2 px-6 py-3 text-base"
          >
            <Rocket className="w-5 h-5" />
            Start Here
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Link href="/app/stake" className="group">
            <div className="card-professional p-6 hover:shadow-lg hover:shadow-primary/10 h-full">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Stake & Earn</h2>
              <p className="text-muted-foreground text-sm mb-4">Earn up to 25% APY by staking tokens in secure vaults.</p>
              <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">Go to Stake</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/app/swap" className="group">
            <div className="card-professional p-6 hover:shadow-lg hover:shadow-primary/10 h-full">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Swap Tokens</h2>
              <p className="text-muted-foreground text-sm mb-4">Instantly swap between USDC and EURC with minimal slippage.</p>
              <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">Go to Swap</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/app/pools" className="group">
            <div className="card-professional p-6 hover:shadow-lg hover:shadow-primary/10 h-full">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <Droplets className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Liquidity Pools</h2>
              <p className="text-muted-foreground text-sm mb-4">Provide liquidity and earn a share of trading fees.</p>
              <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">Go to Pools</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/app/payments" className="group">
            <div className="card-professional p-6 hover:shadow-lg hover:shadow-primary/10 h-full">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <Send className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Send Payments</h2>
              <p className="text-muted-foreground text-sm mb-4">Send stablecoins globally with near-zero fees.</p>
              <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">Send Payment</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/app/portfolio" className="group">
            <div className="card-professional p-6 hover:shadow-lg hover:shadow-primary/10 h-full">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <PieChart className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Portfolio</h2>
              <p className="text-muted-foreground text-sm mb-4">Track your assets, balances, and transaction history.</p>
              <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">View Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>


        {/* Network Info Card */}
        <div className="card-professional p-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wide">Network Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Network</p>
              <p className="text-xl font-bold text-foreground">Arc Network Testnet</p>
              <p className="text-sm text-muted-foreground mt-1">Building the future of DeFi</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Status</p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xl font-bold text-foreground">Active</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">All systems operational</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Supported Tokens</p>
              <p className="text-xl font-bold text-foreground">USDC, EURC</p>
              <p className="text-sm text-muted-foreground mt-1">Stablecoin trading focus</p>
            </div>
          </div>
        </div>

        {/* Quick Stats - Demo Data */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Platform Metrics</h3>
            <span className="px-2 py-0.5 bg-muted border border-border text-muted-foreground text-xs font-medium rounded">DEMO DATA</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-professional p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Value Locked</p>
              <p className="text-2xl font-bold text-primary">$2.4M</p>
              <p className="text-[10px] text-muted-foreground mt-1">Sample testnet metric</p>
            </div>
            <div className="card-professional p-4">
              <p className="text-xs text-muted-foreground mb-1">24h Trading Volume</p>
              <p className="text-2xl font-bold text-primary">$340K</p>
              <p className="text-[10px] text-muted-foreground mt-1">Sample testnet metric</p>
            </div>
            <div className="card-professional p-4">
              <p className="text-xs text-muted-foreground mb-1">Active Users</p>
              <p className="text-2xl font-bold text-primary">2.8K</p>
              <p className="text-[10px] text-muted-foreground mt-1">Sample testnet metric</p>
            </div>
            <div className="card-professional p-4">
              <p className="text-xs text-muted-foreground mb-1">Active Pools</p>
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-[10px] text-muted-foreground mt-1">Sample testnet metric</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
