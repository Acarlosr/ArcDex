"use client"

import Link from "next/link"
import { ExternalLink, Shield, FileCode, Copy, Check, ChevronLeft } from "lucide-react"
import { useState } from "react"
import { ARCDEX, TOKENS, USYC_CONTRACTS, CCTP, PAYMENTS, ARCSCAN_URL } from "@/lib/contracts"

interface ContractCardProps {
    name: string
    address: string
    description: string
    category?: string
}

function ContractCard({ name, address, description }: ContractCardProps) {
    const [copied, setCopied] = useState(false)

    const copyAddress = () => {
        navigator.clipboard.writeText(address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-lg p-4 border border-cyan-500/20">
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-white">{name}</h3>
                <div className="flex gap-1">
                    <button
                        onClick={copyAddress}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                        title="Copy address"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-green-400" />
                        ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                        )}
                    </button>
                    <a
                        href={`${ARCSCAN_URL}/address/${address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                        title="View on ArcScan"
                    >
                        <ExternalLink className="w-4 h-4 text-cyan-400" />
                    </a>
                </div>
            </div>
            <p className="text-xs text-slate-400 mb-2">{description}</p>
            <code className="text-xs text-cyan-400 font-mono bg-black/20 px-2 py-1 rounded block truncate">
                {address}
            </code>
        </div>
    )
}

export default function ContractsPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-[#0A304F] via-[#114B6E] to-[#D1D5DB] text-slate-50">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Back Link */}
                <Link
                    href="/app"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 mb-6 text-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to App
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                            <FileCode className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Contracts & Security</h1>
                    </div>
                    <p className="text-slate-400">
                        All smart contracts deployed on Arc Testnet (Chain ID: 5042002). Verify addresses on ArcScan.
                    </p>
                </div>

                {/* Security Status */}
                <div className="mb-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-amber-400 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-200 mb-1">Testnet Status</h3>
                            <p className="text-sm text-amber-200/80">
                                These contracts are deployed on Arc Testnet for evaluation purposes. They have not been audited.
                                Use testnet tokens only. Do not send real funds to these addresses.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ARCDex Core Contracts */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        ARCDex Core Contracts
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
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        Supported Tokens
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
                            name="USYC"
                            address={TOKENS.USYC}
                            description="Yield-bearing tokenized money market fund"
                        />
                    </div>
                </section>

                {/* Arc Protocol Contracts */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        Arc Protocol Infrastructure
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <ContractCard
                            name="USYC Teller"
                            address={USYC_CONTRACTS.Teller}
                            description="Mint/redeem USYC from USDC"
                        />
                        <ContractCard
                            name="USYC Entitlements"
                            address={USYC_CONTRACTS.Entitlements}
                            description="Access control for USYC"
                        />
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
                    <h2 className="text-xl font-bold text-white mb-4">Resources</h2>
                    <div className="grid gap-3 md:grid-cols-3">
                        <a
                            href="https://explorer.testnet.arc.network"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 border border-cyan-500/20 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-white">Arc Explorer</span>
                        </a>
                        <a
                            href={ARCSCAN_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 border border-cyan-500/20 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-white">ArcScan</span>
                        </a>
                        <a
                            href="https://docs.arc.network"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 border border-cyan-500/20 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-white">Arc Docs</span>
                        </a>
                    </div>
                </section>
            </div>
        </main>
    )
}
