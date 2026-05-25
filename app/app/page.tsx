"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Zap, TrendingUp, Droplets, Send, PieChart, Rocket, HelpCircle } from "lucide-react"
import { OnboardingModal } from "@/components/onboarding-modal"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useI18n } from "@/lib/i18n"

export default function AppHome() {
  const { t } = useI18n()
  const [showOnboarding, setShowOnboarding] = useState(false)

  return (
    <main className="min-h-screen">
      <OnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Testnet Banner */}
        <div className="mb-6 bg-amber-500/10 border border-amber-500/40 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded">{t("app.testnet")}</span>
            <span className="text-amber-700 dark:text-amber-200 text-sm font-medium">{t("app.testnetNotice")}</span>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="text-amber-700 dark:text-amber-300 text-sm font-semibold hover:text-amber-800 dark:hover:text-amber-200 flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" />
            {t("app.howToTest")}
          </button>
        </div>

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="mb-3">
              <Logo size="lg" href="/app" />
            </div>
            <p className="text-xl text-foreground mb-2">{t("app.homeTitle")}</p>
            <p className="text-muted-foreground">{t("app.homeSubtitle")}</p>
          </div>
          <Button
            onClick={() => setShowOnboarding(true)}
            className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex items-center gap-2 px-6 py-3 text-base"
          >
            <Rocket className="w-5 h-5" />
            {t("app.startHere")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Link href="/app/swap" prefetch={false} className="group">
            <div className="card-professional p-6 hover:shadow-lg hover:shadow-primary/10 h-full">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">{t("app.swapTokens")}</h2>
              <p className="text-muted-foreground text-sm mb-4">{t("app.swapTokensText")}</p>
              <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">{t("app.goToSwap")}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/app/pools" prefetch={false} className="group">
            <div className="card-professional p-6 hover:shadow-lg hover:shadow-primary/10 h-full">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <Droplets className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">{t("app.liquidityPools")}</h2>
              <p className="text-muted-foreground text-sm mb-4">{t("app.liquidityPoolsText")}</p>
              <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">{t("app.goToPools")}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/app/payments" prefetch={false} className="group">
            <div className="card-professional p-6 hover:shadow-lg hover:shadow-primary/10 h-full">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <Send className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">{t("app.sendPayments")}</h2>
              <p className="text-muted-foreground text-sm mb-4">{t("app.sendPaymentsText")}</p>
              <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">{t("landing.sendPayment")}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/app/stake" prefetch={false} className="group">
            <div className="card-professional p-6 hover:shadow-lg hover:shadow-primary/10 h-full">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">{t("app.stakeEarn")}</h2>
              <p className="text-muted-foreground text-sm mb-4">{t("app.stakeEarnText")}</p>
              <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">{t("app.goToStake")}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/app/portfolio" prefetch={false} className="group">
            <div className="card-professional p-6 hover:shadow-lg hover:shadow-primary/10 h-full">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <PieChart className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">{t("nav.portfolio")}</h2>
              <p className="text-muted-foreground text-sm mb-4">{t("app.portfolioText")}</p>
              <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">{t("app.viewPortfolio")}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>


        {/* Network Info Card */}
        <div className="card-professional p-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wide">{t("app.networkInformation")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{t("app.network")}</p>
              <p className="text-xl font-bold text-foreground">{t("app.networkName")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("app.networkTagline")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{t("app.status")}</p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xl font-bold text-foreground">{t("app.active")}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t("app.operational")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{t("app.supportedTokens")}</p>
              <p className="text-xl font-bold text-foreground">USDC, EURC, cirBTC</p>
              <p className="text-sm text-muted-foreground mt-1">{t("app.stablecoinFocus")}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats - Demo Data */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">{t("app.platformMetrics")}</h3>
            <span className="px-2 py-0.5 bg-muted border border-border text-muted-foreground text-xs font-medium rounded">{t("app.demoData")}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-professional p-4">
              <p className="text-xs text-muted-foreground mb-1">{t("landing.tvl")}</p>
              <p className="text-2xl font-bold text-primary">$2.4M</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t("app.sampleMetric")}</p>
            </div>
            <div className="card-professional p-4">
              <p className="text-xs text-muted-foreground mb-1">{t("landing.volume")}</p>
              <p className="text-2xl font-bold text-primary">$340K</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t("app.sampleMetric")}</p>
            </div>
            <div className="card-professional p-4">
              <p className="text-xs text-muted-foreground mb-1">{t("landing.activeUsers")}</p>
              <p className="text-2xl font-bold text-primary">2.8K</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t("app.sampleMetric")}</p>
            </div>
            <div className="card-professional p-4">
              <p className="text-xs text-muted-foreground mb-1">{t("landing.activePools")}</p>
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t("app.sampleMetric")}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
