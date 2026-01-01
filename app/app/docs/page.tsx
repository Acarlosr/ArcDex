"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Copy, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function DocsPage() {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-foreground">
                    ArcDex Documentation
                </h1>
                <p className="text-xl text-muted-foreground">
                    Decentralized exchange built on Arc Testnet
                </p>
            </div>

            {/* Network Config */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">🔗 Network Configuration</h2>
                <Card className="bg-card border-border">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <span className="text-muted-foreground text-sm">Network Name</span>
                                <p className="font-semibold">Arc Testnet</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-muted-foreground text-sm">Chain ID</span>
                                <p className="font-mono">5042002</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-muted-foreground text-sm">RPC URL</span>
                                <p className="font-mono text-sm bg-muted p-2 rounded">https://rpc.testnet.arc.network</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-muted-foreground text-sm">Explorer</span>
                                <a href="https://testnet.arcscan.app" target="_blank" className="text-cyan-400 hover:underline flex items-center gap-1">
                                    testnet.arcscan.app <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Contracts */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">📜 Smart Contracts</h2>
                <div className="grid gap-4">
                    <ContractCard
                        name="ArcDexSwap"
                        address="0x50bb26da53555585c606280435469bfb15cac4cf"
                        desc="Automated Market Maker for stablecoin swaps"
                    />
                    <ContractCard
                        name="ArcDexStaking"
                        address="0x5d1ddbafd6a11131154a635563699230f0b9229b"
                        desc="Yield vault for staking rewards"
                    />
                    <ContractCard
                        name="ArcDexLP"
                        address="0x823f387a392bdc1ef57bc30cc005be7e6d067f13"
                        desc="Liquidity Provider tokens"
                    />
                    <ContractCard
                        name="ArcDexPayments"
                        address="0x515683c9399445df4a38915c2130cc498aba4319"
                        desc="P2P payment system with memo support"
                    />
                </div>
            </section>

            {/* Features */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">⚡ Features</h2>

                <div className="grid gap-6 md:grid-cols-2">
                    <FeatureCard title="Swap">
                        Exchange stablecoins (USDC ↔ EURC) with minimal slippage and 0.3% fee. Uses an automated market maker (AMM) model.
                    </FeatureCard>

                    <FeatureCard title="Pools">
                        Provide liquidity to the USDC/EURC pool and earn trading fees. Liquid providers receive LP tokens representing their share.
                    </FeatureCard>

                    <FeatureCard title="Stake">
                        Stake your stablecoins to earn APR.
                        <ul className="mt-2 text-sm space-y-1 list-disc list-inside text-muted-foreground">
                            <li>USDC: 8% Base + 2% Boost</li>
                            <li>EURC: 6% Base + 2% Boost</li>
                        </ul>
                    </FeatureCard>

                    <FeatureCard title="Payments">
                        Send stablecoins directly to other addresses with an optional on-chain memo. Requires a small 0.05 USDC fee.
                    </FeatureCard>
                </div>
            </section>

            {/* Tokens */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">💰 Supported Tokens</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border border-border rounded-lg overflow-hidden">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-4 font-medium">Token</th>
                                <th className="p-4 font-medium">Address</th>
                                <th className="p-4 font-medium">Decimals</th>
                            </tr>
                        </thead>
                        <tbody>
                            <TokenRow symbol="USDC" address="0x3600000000000000000000000000000000000000" />
                            <TokenRow symbol="EURC" address="0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" />
                            <TokenRow symbol="USYC" address="0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C" />
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}

function ContractCard({ name, address, desc }: { name: string, address: string, desc: string }) {
    return (
        <Card className="bg-card border-border hover:border-cyan-500/30 transition-colors">
            <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {name}
                        <Badge variant="outline" className="text-xs font-normal">Contract</Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                <div className="flex items-center gap-2 bg-muted p-2 rounded text-xs font-mono">
                    {address}
                    <CopyButton text={address} />
                </div>
            </CardContent>
        </Card>
    )
}

function FeatureCard({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <Card className="bg-card border-border">
            <CardHeader>
                <CardTitle className="text-lg text-cyan-400">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
                {children}
            </CardContent>
        </Card>
    )
}

function TokenRow({ symbol, address }: { symbol: string, address: string }) {
    return (
        <tr className="border-t border-border hover:bg-muted/50 transition-colors">
            <td className="p-4 font-semibold">{symbol}</td>
            <td className="p-4 font-mono text-sm text-muted-foreground">{address}</td>
            <td className="p-4">6</td>
        </tr>
    )
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button onClick={handleCopy} className="hover:text-cyan-400 transition-colors">
            {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
    )
}
