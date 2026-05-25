"use client"

import Link from "next/link"
import { ExternalLink, Shield, FileCode, Copy, Check, ChevronLeft } from "lucide-react"
import { useState } from "react"
import { ARCDEX, TOKENS, CCTP, PAYMENTS, ARCSCAN_URL } from "@/lib/contracts"
import { useI18n } from "@/lib/i18n"

interface ContractCardProps {
    name: string
    address: string
    description: string
    category?: string
}

function ContractCard({ name, address, description }: ContractCardProps) {
    const { t } = useI18n()
    const [copied, setCopied] = useState(false)

    const copyAddress = () => {
        navigator.clipboard.writeText(address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="card-professional p-4">
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground">{name}</h3>
                <div className="flex gap-1">
                    <button
                        onClick={copyAddress}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        title={t("contracts.copyAddress")}
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-green-500" />
                        ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                    </button>
                    <a
                        href={`${ARCSCAN_URL}/address/${address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        title={t("contracts.viewArcScan")}
                    >
                        <ExternalLink className="w-4 h-4 text-primary" />
                    </a>
                </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
            <code className="text-xs text-primary font-mono bg-muted px-2 py-1 rounded block truncate">
                {address}
            </code>
        </div>
    )
}

export default function ContractsPage() {
    const { t } = useI18n()
    return (
        <main className="min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Back Link */}
                <Link
                    href="/app"
                    className="inline-flex items-center gap-1 text-primary hover:text-primary/80 mb-6 text-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    {t("contracts.back")}
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                            <FileCode className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">{t("contracts.title")}</h1>
                    </div>
                    <p className="text-muted-foreground">
                        {t("contracts.subtitle")}
                    </p>
                </div>

                {/* Security Status */}
                <div className="mb-8 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-amber-400 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-700 dark:text-amber-200 mb-1">{t("contracts.testnetStatus")}</h3>
                            <p className="text-sm text-amber-700 dark:text-amber-200/80">
                                {t("contracts.testnetText")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ARCDex Core Contracts */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        {t("contracts.core")}
                    </h2>
                    <div className="grid gap-4">
                        <ContractCard
                            name="Swap (AMM)"
                            address={ARCDEX.Swap}
                            description="Automated Market Maker for USDC/EURC swaps with 0.3% fee"
                        />
                        <ContractCard
                            name="Staking Vault"
                            address={ARCDEX.Staking}
                            description="Stake USDC/EURC to earn testnet yield"
                        />
                        <ContractCard
                            name="Payments"
                            address={ARCDEX.Payments}
                            description="P2P stablecoin transfers with minimal fees"
                        />
                        <ContractCard
                            name="LP Token"
                            address={ARCDEX.LP}
                            description="Liquidity Provider token for USDC/EURC pool"
                        />
                    </div>
                </section>

                {/* Token Addresses */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {t("contracts.tokens")}
                    </h2>
                    <div className="grid gap-4">
                        <ContractCard
                            name="USDC"
                            address={TOKENS.USDC}
                            description="Native USDC on Arc - also used for gas fees"
                        />
                        <ContractCard
                            name="EURC"
                            address={TOKENS.EURC}
                            description="Euro-denominated stablecoin by Circle"
                        />
                        <ContractCard
                            name="cirBTC"
                            address={TOKENS.CIRBTC}
                            description="Circle Wrapped Bitcoin on Arc Testnet"
                        />
                    </div>
                </section>

                {/* Arc Protocol Contracts */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {t("contracts.infrastructure")}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <ContractCard
                            name="CCTP Token Messenger"
                            address={CCTP.TokenMessengerV2}
                            description="Cross-chain USDC transfers"
                        />
                        <ContractCard
                            name="FX Escrow"
                            address={PAYMENTS.FxEscrow}
                            description="StableFX settlement"
                        />
                    </div>
                </section>

                {/* Resources */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-foreground mb-4">{t("contracts.resources")}</h2>
                    <div className="grid gap-3 md:grid-cols-2">
                        <a
                            href={ARCSCAN_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 p-3 rounded-lg bg-card hover:bg-muted border border-border hover:border-primary/30 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4 text-primary" />
                            <span className="text-sm text-foreground font-medium">ArcScan</span>
                        </a>
                        <a
                            href="https://docs.arc.network"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 p-3 rounded-lg bg-card hover:bg-muted border border-border hover:border-primary/30 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4 text-primary" />
                            <span className="text-sm text-foreground font-medium">Arc Docs</span>
                        </a>
                    </div>
                </section>
            </div>
        </main>
    )
}
