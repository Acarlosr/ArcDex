"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Copy, Check, BookOpen, Zap, FileCode, DollarSign, Gift, Users, HelpCircle } from "lucide-react"
import Link from "next/link"

type Section = 
  | "introduction" 
  | "quick-start" 
  | "features-swap" 
  | "features-stake" 
  | "features-pools" 
  | "features-payments"
  | "contracts"
  | "tokens"
  | "network"

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState<Section>("introduction")

    return (
        <div className="flex min-h-screen -mx-6 -mt-8">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border fixed h-full overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-foreground">Documentation</h2>
                        <p className="text-xs text-muted-foreground">Complete guide to ARCDex</p>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-6">
                        {/* Getting Started */}
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Getting Started
                            </p>
                            <NavItem
                                icon={<BookOpen className="w-4 h-4" />}
                                label="Introduction"
                                active={activeSection === "introduction"}
                                onClick={() => setActiveSection("introduction")}
                            />
                            <NavItem
                                icon={<Zap className="w-4 h-4" />}
                                label="Quick Start"
                                active={activeSection === "quick-start"}
                                onClick={() => setActiveSection("quick-start")}
                            />
                        </div>

                        {/* Features */}
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Features
                            </p>
                            <NavItem
                                icon={<Zap className="w-4 h-4" />}
                                label="Swap Tokens"
                                active={activeSection === "features-swap"}
                                onClick={() => setActiveSection("features-swap")}
                            />
                            <NavItem
                                icon={<Gift className="w-4 h-4" />}
                                label="Stake & Earn"
                                active={activeSection === "features-stake"}
                                onClick={() => setActiveSection("features-stake")}
                            />
                            <NavItem
                                icon={<Users className="w-4 h-4" />}
                                label="Liquidity Pools"
                                active={activeSection === "features-pools"}
                                onClick={() => setActiveSection("features-pools")}
                            />
                            <NavItem
                                icon={<DollarSign className="w-4 h-4" />}
                                label="Payments"
                                active={activeSection === "features-payments"}
                                onClick={() => setActiveSection("features-payments")}
                            />
                        </div>

                        {/* Reference */}
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Reference
                            </p>
                            <NavItem
                                icon={<FileCode className="w-4 h-4" />}
                                label="Smart Contracts"
                                active={activeSection === "contracts"}
                                onClick={() => setActiveSection("contracts")}
                            />
                            <NavItem
                                icon={<DollarSign className="w-4 h-4" />}
                                label="Supported Tokens"
                                active={activeSection === "tokens"}
                                onClick={() => setActiveSection("tokens")}
                            />
                            <NavItem
                                icon={<HelpCircle className="w-4 h-4" />}
                                label="Network Config"
                                active={activeSection === "network"}
                                onClick={() => setActiveSection("network")}
                            />
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Content */}
            <main className="ml-64 flex-1 p-8 max-w-4xl">
                {activeSection === "introduction" && <IntroductionSection />}
                {activeSection === "quick-start" && <QuickStartSection />}
                {activeSection === "features-swap" && <SwapSection />}
                {activeSection === "features-stake" && <StakeSection />}
                {activeSection === "features-pools" && <PoolsSection />}
                {activeSection === "features-payments" && <PaymentsSection />}
                {activeSection === "contracts" && <ContractsSection />}
                {activeSection === "tokens" && <TokensSection />}
                {activeSection === "network" && <NetworkSection />}
            </main>
        </div>
    )
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    )
}

// Content Sections
function IntroductionSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Introduction</h1>
                <p className="text-xl text-muted-foreground">
                    Welcome to ARCDex - A decentralized exchange built on Arc Network Testnet
                </p>
            </div>

            <Card className="bg-card border-primary/30">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">What is ARCDex?</h3>
                    <p className="text-muted-foreground mb-4">
                        ARCDex is a comprehensive DeFi platform built on Arc Network Testnet that enables:
                    </p>
                    <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                        <li><strong className="text-foreground">Token Swaps</strong> - Exchange USDC ↔ EURC with minimal slippage</li>
                        <li><strong className="text-foreground">Staking</strong> - Earn up to 25% APY on stablecoin deposits</li>
                        <li><strong className="text-foreground">Liquidity Pools</strong> - Provide liquidity and earn trading fees</li>
                        <li><strong className="text-foreground">P2P Payments</strong> - Send stablecoins with on-chain memos</li>
                    </ul>
                </CardContent>
            </Card>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-sm text-amber-200">
                    <strong>⚠️ Testnet Only:</strong> ARCDex is currently deployed on Arc Testnet for evaluation purposes. 
                    Do not use real funds. All tokens are testnet tokens with no real value.
                </p>
            </div>
        </div>
    )
}

function QuickStartSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Quick Start</h1>
                <p className="text-xl text-muted-foreground">Get started with ARCDex in 3 simple steps</p>
            </div>

            <div className="space-y-4">
                <StepCard step={1} title="Connect Your Wallet">
                    <p className="text-muted-foreground mb-3">
                        Click <strong className="text-primary">"Connect Wallet"</strong> in the top right corner and select MetaMask or WalletConnect.
                    </p>
                    <div className="bg-muted p-3 rounded-lg text-sm">
                        <p className="font-semibold text-foreground mb-2">Add Arc Testnet:</p>
                        <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                            <li>• Network: Arc Testnet</li>
                            <li>• Chain ID: 5042002</li>
                            <li>• RPC: https://rpc.testnet.arc.network</li>
                        </ul>
                    </div>
                </StepCard>

                <StepCard step={2} title="Get Testnet Tokens">
                    <p className="text-muted-foreground mb-3">
                        You need USDC for gas fees and trading. Get testnet USDC from the Arc faucet:
                    </p>
                    <a 
                        href="https://faucet.testnet.arc.network" 
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                        Get Testnet USDC <ExternalLink className="w-4 h-4" />
                    </a>
                </StepCard>

                <StepCard step={3} title="Start Trading">
                    <p className="text-muted-foreground mb-3">
                        Once you have testnet tokens, you can:
                    </p>
                    <div className="grid gap-2">
                        <Link href="/app/swap" className="text-primary hover:underline text-sm">→ Swap USDC for EURC</Link>
                        <Link href="/app/stake" className="text-primary hover:underline text-sm">→ Stake tokens to earn APY</Link>
                        <Link href="/app/pools" className="text-primary hover:underline text-sm">→ Provide liquidity</Link>
                        <Link href="/app/payments" className="text-primary hover:underline text-sm">→ Send payments</Link>
                    </div>
                </StepCard>
            </div>
        </div>
    )
}

function StepCard({ step, title, children }: { step: number, title: string, children: React.ReactNode }) {
    return (
        <Card className="bg-card border-border">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                        {step}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                        {children}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function SwapSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Swap Tokens</h1>
                <p className="text-xl text-muted-foreground">Exchange stablecoins instantly with minimal slippage</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">How it Works</h3>
                    <p className="text-muted-foreground">
                        ARCDex uses an Automated Market Maker (AMM) model to enable instant token swaps. 
                        The exchange rate is determined by the ratio of tokens in the liquidity pool.
                    </p>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <p className="text-sm"><strong className="text-foreground">Trading Fee:</strong> 0.3% per swap</p>
                        <p className="text-sm"><strong className="text-foreground">Slippage:</strong> Configurable (default 0.5%)</p>
                        <p className="text-sm"><strong className="text-foreground">Min Amount:</strong> 0.01 tokens</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function StakeSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Stake & Earn</h1>
                <p className="text-xl text-muted-foreground">Earn yield by staking your stablecoins</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">APY Rates</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-muted p-4 rounded-lg">
                            <p className="font-semibold text-foreground mb-2">USDC Staking</p>
                            <p className="text-2xl font-bold text-primary">10% APR</p>
                            <p className="text-sm text-muted-foreground mt-1">8% Base + 2% Boost</p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                            <p className="font-semibold text-foreground mb-2">EURC Staking</p>
                            <p className="text-2xl font-bold text-primary">8% APR</p>
                            <p className="text-sm text-muted-foreground mt-1">6% Base + 2% Boost</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Rewards accumulate based on APR. Claiming requires treasury configuration.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

function PoolsSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Liquidity Pools</h1>
                <p className="text-xl text-muted-foreground">Provide liquidity and earn trading fees</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">How it Works</h3>
                    <p className="text-muted-foreground">
                        When you provide liquidity, you deposit an equal value of both tokens (USDC and EURC). 
                        In return, you receive LP tokens representing your share of the pool.
                    </p>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <p className="text-sm"><strong className="text-foreground">Trading Fee Share:</strong> Proportional to your LP tokens</p>
                        <p className="text-sm"><strong className="text-foreground">Withdrawal:</strong> Burn LP tokens to get back your share</p>
                        <p className="text-sm"><strong className="text-foreground">Risk:</strong> Impermanent loss may occur with price changes</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function PaymentsSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Payments</h1>
                <p className="text-xl text-muted-foreground">Send stablecoins with on-chain memos</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Features</h3>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• Send USDC or EURC to any address</li>
                        <li>• Add optional memo (stored on-chain)</li>
                        <li>• View payment history</li>
                        <li>• Track sent and received payments</li>
                    </ul>
                    <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm"><strong className="text-foreground">Fee:</strong> 0.05 USDC per payment</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function ContractsSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Smart Contracts</h1>
                <p className="text-xl text-muted-foreground">Verified contract addresses on Arc Testnet</p>
            </div>

            <div className="space-y-3">
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
        </div>
    )
}

function TokensSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Supported Tokens</h1>
                <p className="text-xl text-muted-foreground">ERC20 tokens available on Arc Testnet</p>
            </div>

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
        </div>
    )
}

function NetworkSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Network Configuration</h1>
                <p className="text-xl text-muted-foreground">Add Arc Testnet to your wallet</p>
            </div>

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
                            <div className="flex items-center gap-2">
                                <p className="font-mono text-sm bg-muted p-2 rounded flex-1">https://rpc.testnet.arc.network</p>
                                <CopyButton text="https://rpc.testnet.arc.network" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-muted-foreground text-sm">Explorer</span>
                            <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                testnet.arcscan.app <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function ContractCard({ name, address, desc }: { name: string, address: string, desc: string }) {
    return (
        <Card className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
                            {name}
                            <Badge variant="outline" className="text-xs font-normal">Contract</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">{desc}</p>
                        <div className="flex items-center gap-2 bg-muted p-2 rounded font-mono text-xs">
                            <span className="truncate flex-1">{address}</span>
                            <CopyButton text={address} />
                            <a 
                                href={`https://testnet.arcscan.app/address/${address}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:text-primary/80"
                            >
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>
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
        <button onClick={handleCopy} className="text-muted-foreground hover:text-primary transition-colors">
            {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
    )
}
