"use client"

import Link from "next/link"
import { ChevronRight, Zap, Globe, Droplets, Send, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/lib/i18n"

export default function LandingPage() {
  const { t } = useI18n()

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo href="/" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {t("nav.features")}
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {t("nav.howItWorks")}
            </a>
            <a href="#stats" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {t("nav.stats")}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
            <a href="https://www.arc-dex.xyz/app/docs" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium hidden sm:inline">
              {t("nav.docs")}
            </a>
            <Link
              href="/app"
              prefetch={false}
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all text-sm"
            >
              {t("nav.launchApp")}
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
              {t("landing.badge")}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight tracking-tight">
            {t("landing.heroPrefix")}
            <span className="block text-primary">
              {t("landing.heroMain")}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {t("landing.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              href="/app"
              prefetch={false}
              className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group"
            >
              {t("nav.launchApp")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-lg border border-border text-foreground font-semibold hover:bg-muted hover:border-primary/30 transition-all"
            >
              {t("landing.learnMore")}
            </a>
          </div>

          {/* Live Stats - Demo Data */}
          <div id="stats" className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="px-2 py-1 bg-muted border border-border text-muted-foreground text-xs font-medium rounded">
                {t("landing.demoMetrics")}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-5 text-center">
                <p className="text-3xl font-bold text-primary mb-1">$2.4M</p>
                <p className="text-muted-foreground text-sm">{t("landing.tvl")}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5 text-center">
                <p className="text-3xl font-bold text-primary mb-1">$340K</p>
                <p className="text-muted-foreground text-sm">{t("landing.volume")}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5 text-center">
                <p className="text-3xl font-bold text-primary mb-1">2.8K</p>
                <p className="text-muted-foreground text-sm">{t("landing.activeUsers")}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5 text-center">
                <p className="text-3xl font-bold text-primary mb-1">12</p>
                <p className="text-muted-foreground text-sm">{t("landing.activePools")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t("landing.howTitle")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("landing.howSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Swaps */}
            <div className="group bg-card border border-border rounded-xl p-8 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t("landing.instantSwaps")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("landing.instantSwapsText")}
              </p>
              <Link
                href="/app/swap"
                prefetch={false}
                className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-2 group/link"
              >
                {t("landing.trySwaps")} <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Bridge */}
            <div className="group bg-card border border-border rounded-xl p-8 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t("landing.bridge")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("landing.bridgeText")}
              </p>
              <Link
                href="/app/bridge"
                prefetch={false}
                className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-2 group/link"
              >
                {t("landing.startBridge")} <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Liquidity Pools */}
            <div className="group bg-card border border-border rounded-xl p-8 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <Droplets className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t("landing.liquidityPools")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("landing.liquidityPoolsText")}
              </p>
              <Link
                href="/app/pools"
                prefetch={false}
                className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-2 group/link"
              >
                {t("landing.provideLiquidity")}{" "}
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Payments */}
            <div className="group bg-card border border-border rounded-xl p-8 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                <Send className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t("landing.fastPayments")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("landing.fastPaymentsText")}
              </p>
              <Link
                href="/app/payments"
                prefetch={false}
                className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-2 group/link"
              >
                {t("landing.sendPayment")} <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t("landing.whyTitle")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("landing.whySubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">⚡ {t("landing.highPerformance")}</h3>
              <p className="text-muted-foreground">
                {t("landing.highPerformanceText")}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">🔒 {t("landing.secureAudited")}</h3>
              <p className="text-muted-foreground">
                {t("landing.secureAuditedText")}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">💰 {t("landing.lowFees")}</h3>
              <p className="text-muted-foreground">
                {t("landing.lowFeesText")}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">🌍 {t("landing.access247")}</h3>
              <p className="text-muted-foreground">
                {t("landing.access247Text")}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">📊 {t("landing.advancedTools")}</h3>
              <p className="text-muted-foreground">{t("landing.advancedToolsText")}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">🤝 {t("landing.community")}</h3>
              <p className="text-muted-foreground">
                {t("landing.communityText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">{t("landing.ctaTitle")}</h2>
          <p className="text-muted-foreground mb-8">
            {t("landing.ctaText")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app"
              prefetch={false}
              className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all"
            >
              {t("nav.launchApp")}
            </Link>
            <a
              href="https://www.arc.io/litepaper"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 rounded-lg border border-border text-foreground font-semibold hover:bg-muted hover:border-primary/30 transition-all"
            >
              {t("landing.readLitepaper")}
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
              <p className="text-muted-foreground text-sm">{t("landing.footerText")}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t("landing.product")}</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/app/swap" prefetch={false} className="hover:text-primary transition-colors block">
                  {t("nav.swap")}
                </Link>
                <Link href="/app/bridge" prefetch={false} className="hover:text-primary transition-colors block">
                  {t("landing.bridge")}
                </Link>
                <Link href="/app/pools" prefetch={false} className="hover:text-primary transition-colors block">
                  {t("nav.pools")}
                </Link>
                <Link href="/app/payments" prefetch={false} className="hover:text-primary transition-colors block">
                  {t("nav.payments")}
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t("landing.communityFooter")}</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="https://x.com/arcdexarc" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors block">
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
            <p>{t("landing.copyright")}</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition-colors">
                {t("landing.terms")}
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                {t("landing.privacy")}
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                {t("landing.status")}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
