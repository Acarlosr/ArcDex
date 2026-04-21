"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Copy, Check, BookOpen, Zap, FileCode, DollarSign, Gift, Users, HelpCircle, BarChart3, History, AlertTriangle, Code2, Shield, Settings, ArrowRight, Info, TrendingUp, Droplets, Send, PieChart } from "lucide-react"
import Link from "next/link"

type Section = 
  | "introduction" 
  | "quick-start" 
  | "why-arcdex"
  | "features-swap" 
  | "features-stake" 
  | "features-pools" 
  | "features-payments"
  | "features-portfolio"
  | "features-history"
  | "contracts"
  | "tokens"
  | "network"
  | "api-reference"
  | "error-codes"
  | "troubleshooting"
  | "best-practices"
  | "faq"

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
                        {/* Introduction */}
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Introduction
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
                            <NavItem
                                icon={<Info className="w-4 h-4" />}
                                label="Why ArcDex"
                                active={activeSection === "why-arcdex"}
                                onClick={() => setActiveSection("why-arcdex")}
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
                                icon={<TrendingUp className="w-4 h-4" />}
                                label="Stake & Earn"
                                active={activeSection === "features-stake"}
                                onClick={() => setActiveSection("features-stake")}
                            />
                            <NavItem
                                icon={<Droplets className="w-4 h-4" />}
                                label="Liquidity Pools"
                                active={activeSection === "features-pools"}
                                onClick={() => setActiveSection("features-pools")}
                            />
                            <NavItem
                                icon={<Send className="w-4 h-4" />}
                                label="Payments"
                                active={activeSection === "features-payments"}
                                onClick={() => setActiveSection("features-payments")}
                            />
                            <NavItem
                                icon={<PieChart className="w-4 h-4" />}
                                label="Portfolio"
                                active={activeSection === "features-portfolio"}
                                onClick={() => setActiveSection("features-portfolio")}
                            />
                            <NavItem
                                icon={<History className="w-4 h-4" />}
                                label="Transaction History"
                                active={activeSection === "features-history"}
                                onClick={() => setActiveSection("features-history")}
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
                                icon={<Settings className="w-4 h-4" />}
                                label="Network Config"
                                active={activeSection === "network"}
                                onClick={() => setActiveSection("network")}
                            />
                            <NavItem
                                icon={<Code2 className="w-4 h-4" />}
                                label="API Reference"
                                active={activeSection === "api-reference"}
                                onClick={() => setActiveSection("api-reference")}
                            />
                        </div>

                        {/* Documentation */}
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Documentation
                            </p>
                            <NavItem
                                icon={<AlertTriangle className="w-4 h-4" />}
                                label="Error Codes"
                                active={activeSection === "error-codes"}
                                onClick={() => setActiveSection("error-codes")}
                            />
                            <NavItem
                                icon={<HelpCircle className="w-4 h-4" />}
                                label="Troubleshooting"
                                active={activeSection === "troubleshooting"}
                                onClick={() => setActiveSection("troubleshooting")}
                            />
                            <NavItem
                                icon={<Shield className="w-4 h-4" />}
                                label="Best Practices"
                                active={activeSection === "best-practices"}
                                onClick={() => setActiveSection("best-practices")}
                            />
                            <NavItem
                                icon={<HelpCircle className="w-4 h-4" />}
                                label="FAQ"
                                active={activeSection === "faq"}
                                onClick={() => setActiveSection("faq")}
                            />
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Content */}
            <main className="ml-64 flex-1 p-8 max-w-4xl">
                {activeSection === "introduction" && <IntroductionSection />}
                {activeSection === "quick-start" && <QuickStartSection />}
                {activeSection === "why-arcdex" && <WhyArcDexSection />}
                {activeSection === "features-swap" && <SwapSection />}
                {activeSection === "features-stake" && <StakeSection />}
                {activeSection === "features-pools" && <PoolsSection />}
                {activeSection === "features-payments" && <PaymentsSection />}
                {activeSection === "features-portfolio" && <PortfolioSection />}
                {activeSection === "features-history" && <HistorySection />}
                {activeSection === "contracts" && <ContractsSection />}
                {activeSection === "tokens" && <TokensSection />}
                {activeSection === "network" && <NetworkSection />}
                {activeSection === "api-reference" && <APIReferenceSection />}
                {activeSection === "error-codes" && <ErrorCodesSection />}
                {activeSection === "troubleshooting" && <TroubleshootingSection />}
                {activeSection === "best-practices" && <BestPracticesSection />}
                {activeSection === "faq" && <FAQSection />}
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
                        <li><strong className="text-foreground">Token Swaps</strong> - Exchange USDC ↔ EURC with minimal slippage using AMM</li>
                        <li><strong className="text-foreground">Staking</strong> - Earn up to 10% APR on USDC and 8% APR on EURC deposits</li>
                        <li><strong className="text-foreground">Liquidity Pools</strong> - Provide liquidity and earn 0.3% trading fees</li>
                        <li><strong className="text-foreground">P2P Payments</strong> - Send stablecoins with on-chain memos</li>
                        <li><strong className="text-foreground">Portfolio Dashboard</strong> - Track balances, transactions, and portfolio value</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Key Features</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Fast Transactions</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Sub-second finality on Arc Network</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Low Fees</span>
                            </div>
                            <p className="text-sm text-muted-foreground">USDC as native gas token</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Secure</span>
                            </div>
                            <p className="text-sm text-muted-foreground">OpenZeppelin audited contracts</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Code2 className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Open Source</span>
                            </div>
                            <p className="text-sm text-muted-foreground">MIT licensed on GitHub</p>
                        </div>
                    </div>
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
                <p className="text-xl text-muted-foreground">Get started with ARCDex in 5 simple steps</p>
            </div>

            <div className="space-y-4">
                <StepCard step={1} title="Install Wallet">
                    <p className="text-muted-foreground mb-3">
                        Install MetaMask or any Web3 wallet that supports EVM chains.
                    </p>
                    <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                        <p className="font-semibold text-foreground">Recommended Wallets:</p>
                        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                            <li>MetaMask (Desktop & Mobile)</li>
                            <li>WalletConnect compatible wallets</li>
                            <li>Rabby Wallet</li>
                        </ul>
                    </div>
                </StepCard>

                <StepCard step={2} title="Add Arc Testnet">
                    <p className="text-muted-foreground mb-3">
                        Add Arc Testnet to your wallet manually or let ARCDex add it automatically when you connect.
                    </p>
                    <div className="bg-muted p-3 rounded-lg text-sm">
                        <p className="font-semibold text-foreground mb-2">Network Details:</p>
                        <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                            <li>• Network Name: Arc Testnet</li>
                            <li>• Chain ID: 5042002</li>
                            <li>• RPC URL: https://rpc.testnet.arc.network</li>
                            <li>• Currency Symbol: USDC</li>
                            <li>• Block Explorer: https://testnet.arcscan.app</li>
                        </ul>
                    </div>
                </StepCard>

                <StepCard step={3} title="Get Testnet Tokens">
                    <p className="text-muted-foreground mb-3">
                        You need USDC for gas fees and trading. Get testnet tokens from the Circle Faucet:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <a 
                            href="https://faucet.circle.com" 
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                            Get Testnet USDC <ExternalLink className="w-4 h-4" />
                        </a>
                        <a 
                            href="https://faucet.circle.com" 
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium border border-border"
                        >
                            Get Testnet EURC <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Select <strong>Arc Testnet</strong> as the network when requesting tokens.
                    </p>
                </StepCard>

                <StepCard step={4} title="Connect Wallet">
                    <p className="text-muted-foreground mb-3">
                        Click <strong className="text-primary">"Connect Wallet"</strong> in the top right corner and select your wallet.
                    </p>
                    <div className="bg-muted p-3 rounded-lg text-sm">
                        <p className="font-semibold text-foreground mb-2">Supported Connection Methods:</p>
                        <ul className="space-y-1 text-muted-foreground">
                            <li>• Browser Extension (MetaMask, Rabby, etc.)</li>
                            <li>• WalletConnect (Mobile wallets)</li>
                            <li>• Deep Links (Mobile wallet browsers)</li>
                        </ul>
                    </div>
                </StepCard>

                <StepCard step={5} title="Start Using ARCDex">
                    <p className="text-muted-foreground mb-3">
                        Once connected, you can access all features:
                    </p>
                    <div className="grid gap-2">
                        <Link href="/app/swap" className="flex items-center gap-2 text-primary hover:underline text-sm">
                            <ArrowRight className="w-4 h-4" /> Swap USDC for EURC
                        </Link>
                        <Link href="/app/stake" className="flex items-center gap-2 text-primary hover:underline text-sm">
                            <ArrowRight className="w-4 h-4" /> Stake tokens to earn APY
                        </Link>
                        <Link href="/app/pools" className="flex items-center gap-2 text-primary hover:underline text-sm">
                            <ArrowRight className="w-4 h-4" /> Provide liquidity
                        </Link>
                        <Link href="/app/payments" className="flex items-center gap-2 text-primary hover:underline text-sm">
                            <ArrowRight className="w-4 h-4" /> Send payments
                        </Link>
                        <Link href="/app/portfolio" className="flex items-center gap-2 text-primary hover:underline text-sm">
                            <ArrowRight className="w-4 h-4" /> View portfolio
                        </Link>
                    </div>
                </StepCard>
            </div>
        </div>
    )
}

function WhyArcDexSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Why ArcDex?</h1>
                <p className="text-xl text-muted-foreground">Built on Arc Network for stablecoin-native DeFi</p>
            </div>

            <Card className="bg-card border-primary/30">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Arc Network Advantages</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-primary" />
                                USDC as Native Gas
                            </h4>
                            <p className="text-muted-foreground text-sm">
                                No need to convert to ETH or other volatile tokens. Pay gas fees directly with USDC, 
                                making transactions simpler and more predictable.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" />
                                Fast Finality
                            </h4>
                            <p className="text-muted-foreground text-sm">
                                Sub-second transaction confirmation means your swaps, stakes, and payments are 
                                confirmed almost instantly.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Low Fees
                            </h4>
                            <p className="text-muted-foreground text-sm">
                                Optimized for high-frequency DeFi operations with minimal gas costs, 
                                making small transactions economically viable.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Stablecoin-First Design
                            </h4>
                            <p className="text-muted-foreground text-sm">
                                Built specifically for stablecoins (USDC, EURC) and yield-bearing tokens (USYC), 
                                optimized for real-world financial applications.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">ArcDex Features</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="font-medium text-foreground">Complete DeFi Suite</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Swap, stake, provide liquidity, and send payments all in one platform</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="font-medium text-foreground">Portfolio Tracking</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Real-time balance tracking and transaction history</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="font-medium text-foreground">Mobile Support</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Works seamlessly on desktop and mobile devices</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="font-medium text-foreground">Open Source</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Fully auditable codebase on GitHub</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
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
                        ARCDex uses an Automated Market Maker (AMM) model with a constant product formula (x * y = k) 
                        to enable instant token swaps. The exchange rate is determined by the ratio of tokens in the liquidity pool.
                    </p>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <p className="text-sm"><strong className="text-foreground">Trading Fee:</strong> 0.3% per swap (30 basis points)</p>
                        <p className="text-sm"><strong className="text-foreground">Slippage:</strong> Configurable (default 0.5%)</p>
                        <p className="text-sm"><strong className="text-foreground">Min Amount:</strong> 0.01 tokens</p>
                        <p className="text-sm"><strong className="text-foreground">Supported Pairs:</strong> USDC ↔ EURC</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Step-by-Step Guide</h3>
                    <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                        <li>
                            <strong className="text-foreground">Navigate to Swap:</strong> Go to the Swap page from the navigation menu
                        </li>
                        <li>
                            <strong className="text-foreground">Select Tokens:</strong> Choose the token you want to swap from (USDC or EURC) 
                            and the token you want to receive
                        </li>
                        <li>
                            <strong className="text-foreground">Enter Amount:</strong> Type the amount you want to swap. 
                            The output amount will be calculated automatically
                        </li>
                        <li>
                            <strong className="text-foreground">Approve Token (First Time):</strong> If this is your first swap with this token, 
                            you'll need to approve the contract to spend your tokens
                        </li>
                        <li>
                            <strong className="text-foreground">Review & Swap:</strong> Check the exchange rate, slippage, and fees, 
                            then click "Swap" and confirm the transaction in your wallet
                        </li>
                    </ol>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Understanding Slippage</h3>
                    <p className="text-muted-foreground text-sm">
                        Slippage is the difference between the expected price and the actual execution price. 
                        Higher slippage tolerance allows larger trades but may result in less favorable rates. 
                        For stablecoin pairs like USDC/EURC, slippage is typically very low.
                    </p>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-sm text-blue-200">
                            <strong>💡 Tip:</strong> For stablecoin swaps, 0.5% slippage is usually sufficient. 
                            Increase only if your transaction is failing.
                        </p>
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
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">How Staking Works</h3>
                    <p className="text-muted-foreground">
                        When you stake tokens, they are locked in the staking contract and you earn rewards based on the APR. 
                        Rewards accumulate over time and can be claimed at any time.
                    </p>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <p className="text-sm"><strong className="text-foreground">No Lock Period:</strong> Unstake at any time (testnet feature)</p>
                        <p className="text-sm"><strong className="text-foreground">Rewards:</strong> Accumulate continuously based on APR</p>
                        <p className="text-sm"><strong className="text-foreground">Claim:</strong> Claim rewards individually or all at once</p>
                        <p className="text-sm"><strong className="text-foreground">Minimum:</strong> No minimum stake amount required</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Step-by-Step Guide</h3>
                    <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                        <li>
                            <strong className="text-foreground">Open Stake Panel:</strong> Click "Open Stake Panel" on the Stake page
                        </li>
                        <li>
                            <strong className="text-foreground">Select Token:</strong> Choose USDC or EURC to stake
                        </li>
                        <li>
                            <strong className="text-foreground">Enter Amount:</strong> Enter the amount you want to stake or click "Max"
                        </li>
                        <li>
                            <strong className="text-foreground">Approve (First Time):</strong> Approve the staking contract to spend your tokens
                        </li>
                        <li>
                            <strong className="text-foreground">Stake:</strong> Click "Stake" and confirm the transaction
                        </li>
                        <li>
                            <strong className="text-foreground">View Rewards:</strong> Check the "Claim" tab to see pending rewards
                        </li>
                    </ol>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Important Notes</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• <strong className="text-foreground">Validation:</strong> The system validates your balance and allowance before allowing staking</p>
                        <p>• <strong className="text-foreground">Errors:</strong> If you see "insufficient allowance", approve the token first</p>
                        <p>• <strong className="text-foreground">Rewards:</strong> Rewards are calculated based on time staked and APR</p>
                        <p>• <strong className="text-foreground">Unstaking:</strong> You can unstake any amount up to your staked balance</p>
                    </div>
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
                        When you provide liquidity, you deposit an equal value of both tokens (USDC and EURC) into the pool. 
                        In return, you receive LP (Liquidity Provider) tokens representing your share of the pool.
                    </p>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <p className="text-sm"><strong className="text-foreground">Trading Fee Share:</strong> Earn 0.3% of all swap fees proportional to your LP tokens</p>
                        <p className="text-sm"><strong className="text-foreground">LP Tokens:</strong> ERC-20 tokens representing your pool share</p>
                        <p className="text-sm"><strong className="text-foreground">Withdrawal:</strong> Burn LP tokens to get back your share of both tokens</p>
                        <p className="text-sm"><strong className="text-foreground">Active Pool:</strong> USDC/EURC (50/50 ratio)</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Step-by-Step Guide</h3>
                    <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                        <li>
                            <strong className="text-foreground">Navigate to Pools:</strong> Go to the Pools page
                        </li>
                        <li>
                            <strong className="text-foreground">Enter Amounts:</strong> Enter the amount of USDC and EURC you want to provide. 
                            The ratio must be approximately 50/50
                        </li>
                        <li>
                            <strong className="text-foreground">Approve Tokens:</strong> Approve both USDC and EURC for the swap contract
                        </li>
                        <li>
                            <strong className="text-foreground">Add Liquidity:</strong> Click "Add Liquidity" and confirm the transaction
                        </li>
                        <li>
                            <strong className="text-foreground">Receive LP Tokens:</strong> You'll receive LP tokens representing your share
                        </li>
                    </ol>
                </CardContent>
            </Card>

            <Card className="bg-card border-amber-500/30">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        Understanding Impermanent Loss
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Impermanent loss occurs when the price ratio of the two tokens in the pool changes. 
                        For stablecoin pairs like USDC/EURC, this risk is minimal since both tokens maintain a relatively stable ratio.
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                        <p className="text-sm text-amber-200">
                            <strong>⚠️ Note:</strong> While stablecoin pairs have lower impermanent loss risk, 
                            always understand the risks before providing liquidity.
                        </p>
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
                        <li>• Send USDC or EURC to any address on Arc Network</li>
                        <li>• Add optional memo (stored on-chain, max 256 characters)</li>
                        <li>• View payment history in the History page</li>
                        <li>• Track sent and received payments</li>
                        <li>• Low fees: 0.05 USDC per payment</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Step-by-Step Guide</h3>
                    <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                        <li>
                            <strong className="text-foreground">Navigate to Payments:</strong> Go to the Payments page
                        </li>
                        <li>
                            <strong className="text-foreground">Select Token:</strong> Choose USDC or EURC
                        </li>
                        <li>
                            <strong className="text-foreground">Enter Recipient:</strong> Paste the recipient's wallet address
                        </li>
                        <li>
                            <strong className="text-foreground">Enter Amount:</strong> Specify the amount to send
                        </li>
                        <li>
                            <strong className="text-foreground">Add Memo (Optional):</strong> Add a message that will be stored on-chain
                        </li>
                        <li>
                            <strong className="text-foreground">Approve & Send:</strong> Approve the token (first time) and send the payment
                        </li>
                    </ol>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Payment Methods</h3>
                    <div className="space-y-3">
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-foreground mb-1">sendPayment</p>
                            <p className="text-sm text-muted-foreground">
                                Sends the specified amount plus the payment fee. The recipient receives the exact amount you specify.
                            </p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-foreground mb-1">sendExactPayment</p>
                            <p className="text-sm text-muted-foreground">
                                Sends an exact amount. The fee is deducted from your balance separately.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function PortfolioSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Portfolio Dashboard</h1>
                <p className="text-xl text-muted-foreground">Track your assets, balances, and portfolio value</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Features</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Portfolio Stats</span>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Total Balance</li>
                                <li>Staked Value</li>
                                <li>LP Positions</li>
                                <li>Pending Rewards</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Charts</span>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>24H Portfolio Evolution</li>
                                <li>7D Portfolio Evolution</li>
                                <li>30D Portfolio Evolution</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Token Balances</span>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>USDC Balance</li>
                                <li>EURC Balance</li>
                                <li>USYC Balance</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Transactions</span>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Recent Transactions</li>
                                <li>Transaction Classification</li>
                                <li>Explorer Links</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">How it Works</h3>
                    <p className="text-muted-foreground">
                        The Portfolio dashboard reads your on-chain balances in real-time using wagmi hooks. 
                        Transaction history is fetched from the ArcScan Explorer API and automatically classified 
                        into categories (Swaps, Staking, Liquidity, Transfers).
                    </p>
                    <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">Note:</strong> Portfolio values are estimated based on 
                            off-chain price data. All values are labeled as "Estimated (testnet)" for transparency.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function HistorySection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Transaction History</h1>
                <p className="text-xl text-muted-foreground">View and track all your on-chain transactions</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Features</h3>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• View all transactions for your connected wallet</li>
                        <li>• Automatic transaction classification (Swap, Staking, Liquidity, Transfer)</li>
                        <li>• Direct links to ArcScan Explorer</li>
                        <li>• Transaction details including amounts, fees, and status</li>
                        <li>• Filter by transaction type</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Transaction Types</h3>
                    <div className="space-y-3">
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-foreground mb-1">Swap Transactions</p>
                            <p className="text-sm text-muted-foreground">
                                Interactions with the ArcDexSwap contract for token exchanges
                            </p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-foreground mb-1">Staking Transactions</p>
                            <p className="text-sm text-muted-foreground">
                                Stake, unstake, and claim reward transactions
                            </p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-foreground mb-1">Liquidity Transactions</p>
                            <p className="text-sm text-muted-foreground">
                                Adding or removing liquidity from pools
                            </p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-foreground mb-1">Transfer Transactions</p>
                            <p className="text-sm text-muted-foreground">
                                Standard ERC-20 token transfers
                            </p>
                        </div>
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
                    address="0x6e25a59770b243113efd205b8722fe2aa942ba21"
                    desc="Automated Market Maker for USDC/EURC swaps using constant product formula (x * y = k)"
                    functions={["swap", "addLiquidity", "removeLiquidity", "getReserves", "getAmountOut"]}
                />
                <ContractCard
                    name="ArcDexStaking"
                    address="0xe58b6a269ab1c65e62203bd131ef5935214ce726"
                    desc="Yield vault for staking USDC and EURC with APR rewards (10% USDC, 8% EURC)"
                    functions={["stake", "unstake", "claimRewards", "claimAllRewards", "getStakedBalance", "getPendingRewards", "getAPR"]}
                />
                <ContractCard
                    name="ArcDexLP"
                    address="0x5dc0ff7148cd906817e6d07cf2317fedd0f04a03"
                    desc="ERC-20 Liquidity Provider tokens representing pool shares for USDC/EURC pool"
                    functions={["balanceOf", "totalSupply", "transfer", "approve", "mint", "burn"]}
                />
                <ContractCard
                    name="ArcDexPayments"
                    address="0x9dd9ce65012b595a9dae8014ea6d1f4a8cc21a68"
                    desc="P2P payment system with on-chain memo support (0.05 USDC fee per payment)"
                    functions={["sendPayment", "sendExactPayment", "paymentFee"]}
                />
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Security Features</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• <strong className="text-foreground">ReentrancyGuard:</strong> All state-changing functions protected</p>
                        <p>• <strong className="text-foreground">SafeERC20:</strong> Safe token transfers using OpenZeppelin</p>
                        <p>• <strong className="text-foreground">Ownable:</strong> Admin functions restricted to contract owner</p>
                        <p>• <strong className="text-foreground">Input Validation:</strong> All inputs validated before execution</p>
                    </div>
                </CardContent>
            </Card>
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
                            <th className="p-4 font-medium">Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        <TokenRow symbol="USDC" address="0x3600000000000000000000000000000000000000" type="Native Gas Token" />
                        <TokenRow symbol="EURC" address="0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" type="Stablecoin" />
                        <TokenRow symbol="USYC" address="0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C" type="Yield-Bearing" />
                    </tbody>
                </table>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Token Details</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">USDC (USD Coin)</h4>
                            <p className="text-sm text-muted-foreground">
                                USDC is the native EVM asset on Arc Network and is used for gas fees. 
                                It has an optional ERC-20 interface for DeFi interactions. Native balance uses 18 decimals, 
                                while ERC-20 interface uses 6 decimals.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">EURC (Euro Coin)</h4>
                            <p className="text-sm text-muted-foreground">
                                EURC is the euro-denominated stablecoin issued by Circle. It uses 6 decimals 
                                and is fully supported for swaps, staking, and payments.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">USYC (US Yield Coin)</h4>
                            <p className="text-sm text-muted-foreground">
                                USYC is a yield-bearing token representing tokenized money market fund shares. 
                                It uses 6 decimals and requires allowlisting for minting/redeeming on testnet.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
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
                            <span className="text-muted-foreground text-sm">Currency Symbol</span>
                            <p className="font-semibold">USDC</p>
                        </div>
                        <div className="space-y-2">
                            <span className="text-muted-foreground text-sm">Block Explorer</span>
                            <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                testnet.arcscan.app <ExternalLink size={14} />
                            </a>
                        </div>
                        <div className="space-y-2">
                            <span className="text-muted-foreground text-sm">Faucet</span>
                            <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                faucet.circle.com <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Adding Network to MetaMask</h3>
                    <ol className="space-y-2 list-decimal list-inside text-muted-foreground text-sm">
                        <li>Open MetaMask and click the network dropdown</li>
                        <li>Click "Add Network" or "Add Network Manually"</li>
                        <li>Enter the network details from above</li>
                        <li>Click "Save" to add the network</li>
                        <li>Switch to Arc Testnet to start using ARCDex</li>
                    </ol>
                </CardContent>
            </Card>
        </div>
    )
}

function APIReferenceSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">API Reference</h1>
                <p className="text-xl text-muted-foreground">Contract functions and hooks reference</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">React Hooks</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        ARCDex provides custom React hooks for interacting with contracts. All hooks are available in <code className="bg-muted px-1 rounded">hooks/use-contracts.ts</code>
                    </p>
                    <div className="space-y-3">
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">useTokenBalance(token)</p>
                            <p className="text-xs text-muted-foreground">Get ERC-20 token balance for connected wallet</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">useTokenAllowance(token, spender)</p>
                            <p className="text-xs text-muted-foreground">Check token allowance for a spender address</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">useSwapReserves()</p>
                            <p className="text-xs text-muted-foreground">Get current pool reserves (USDC and EURC)</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">useGetAmountOut(tokenIn, amountIn)</p>
                            <p className="text-xs text-muted-foreground">Calculate output amount for a swap</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">useStakedBalance(token)</p>
                            <p className="text-xs text-muted-foreground">Get staked balance for a token</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">usePendingRewards(token)</p>
                            <p className="text-xs text-muted-foreground">Get pending staking rewards</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Contract Functions</h3>
                    <div className="space-y-3">
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">ArcDexSwap.swap(tokenIn, amountIn, minAmountOut)</p>
                            <p className="text-xs text-muted-foreground">Swap tokens with slippage protection</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">ArcDexStaking.stake(token, amount)</p>
                            <p className="text-xs text-muted-foreground">Stake tokens to earn rewards</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">ArcDexPayments.sendPayment(token, recipient, amount, memo)</p>
                            <p className="text-xs text-muted-foreground">Send payment with optional memo</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function ErrorCodesSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Error Codes</h1>
                <p className="text-xl text-muted-foreground">Common errors and how to resolve them</p>
            </div>

            <div className="space-y-3">
                <ErrorCard
                    code="ERC20: transfer amount exceeds allowance"
                    title="Insufficient Allowance"
                    description="The contract doesn't have permission to spend your tokens"
                    solution="Click 'Approve' button to grant permission. You only need to do this once per token."
                />
                <ErrorCard
                    code="ERC20: transfer amount exceeds balance"
                    title="Insufficient Balance"
                    description="You don't have enough tokens to complete the transaction"
                    solution="Check your balance and reduce the amount, or get more tokens from the faucet."
                />
                <ErrorCard
                    code="InsufficientOutputAmount"
                    title="Slippage Too High"
                    description="The price moved too much during the transaction"
                    solution="Increase your slippage tolerance in settings, or try again with a smaller amount."
                />
                <ErrorCard
                    code="User rejected the request"
                    title="Transaction Rejected"
                    description="You rejected the transaction in your wallet"
                    solution="Approve the transaction in your wallet to proceed."
                />
                <ErrorCard
                    code="Network error"
                    title="Network Connection Issue"
                    description="Unable to connect to Arc Network"
                    solution="Check your internet connection and ensure you're connected to Arc Testnet in your wallet."
                />
            </div>
        </div>
    )
}

function TroubleshootingSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Troubleshooting</h1>
                <p className="text-xl text-muted-foreground">Common issues and solutions</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Wallet Connection Issues</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="font-semibold text-foreground mb-1">Wallet not connecting</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Refresh the page and try again</li>
                                <li>Ensure your wallet extension is unlocked</li>
                                <li>Try disconnecting and reconnecting</li>
                                <li>Check if your wallet supports WalletConnect</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground mb-1">Wrong network</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Switch to Arc Testnet in your wallet</li>
                                <li>Add Arc Testnet if it's not in your network list</li>
                                <li>Check the network configuration in the docs</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Transaction Issues</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="font-semibold text-foreground mb-1">Transaction stuck or pending</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Wait a few seconds - Arc Network has fast finality</li>
                                <li>Check the transaction on ArcScan Explorer</li>
                                <li>Try increasing gas limit if available</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground mb-1">Transaction failed</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Check the error message for details</li>
                                <li>Verify you have sufficient balance and allowance</li>
                                <li>Check if slippage tolerance is too low</li>
                                <li>View the transaction on ArcScan for more details</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Balance Issues</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="font-semibold text-foreground mb-1">Balance not updating</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Wait a few seconds for the blockchain to update</li>
                                <li>Refresh the page</li>
                                <li>Check the transaction on ArcScan to confirm it succeeded</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground mb-1">Zero balance showing</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Get testnet tokens from the faucet</li>
                                <li>Ensure you're on Arc Testnet</li>
                                <li>Check your wallet address is correct</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function BestPracticesSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Best Practices</h1>
                <p className="text-xl text-muted-foreground">Tips for safe and efficient usage</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Security</h3>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• <strong className="text-foreground">Verify addresses:</strong> Always double-check contract addresses before interacting</li>
                        <li>• <strong className="text-foreground">Start small:</strong> Test with small amounts first</li>
                        <li>• <strong className="text-foreground">Check transactions:</strong> Review transaction details before confirming</li>
                        <li>• <strong className="text-foreground">Use official links:</strong> Only access ARCDex through official channels</li>
                        <li>• <strong className="text-foreground">Keep private keys safe:</strong> Never share your private keys or seed phrases</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Trading</h3>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• <strong className="text-foreground">Check slippage:</strong> For stablecoin swaps, 0.5% is usually sufficient</li>
                        <li>• <strong className="text-foreground">Monitor reserves:</strong> Larger pools have better liquidity and lower slippage</li>
                        <li>• <strong className="text-foreground">Approve wisely:</strong> Only approve the amount you need, or use max approval for convenience</li>
                        <li>• <strong className="text-foreground">Gas optimization:</strong> Batch multiple operations when possible</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Staking</h3>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• <strong className="text-foreground">Claim regularly:</strong> Claim rewards periodically to compound earnings</li>
                        <li>• <strong className="text-foreground">Monitor APR:</strong> APR rates may change, check current rates before staking</li>
                        <li>• <strong className="text-foreground">Understand risks:</strong> While testnet is safe, understand smart contract risks</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Liquidity Provision</h3>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• <strong className="text-foreground">Understand impermanent loss:</strong> Research before providing liquidity</li>
                        <li>• <strong className="text-foreground">Stable pairs:</strong> USDC/EURC pairs have minimal impermanent loss risk</li>
                        <li>• <strong className="text-foreground">Monitor pool health:</strong> Check pool reserves and trading volume</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}

function FAQSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
                <p className="text-xl text-muted-foreground">Common questions about ARCDex</p>
            </div>

            <div className="space-y-4">
                <FAQItem
                    question="Is ARCDex safe to use?"
                    answer="ARCDex is deployed on Arc Testnet for testing purposes. The smart contracts use OpenZeppelin libraries and include security features like ReentrancyGuard. However, this is testnet software - always do your own research and never use real funds on testnet."
                />
                <FAQItem
                    question="How do I get testnet tokens?"
                    answer="Visit the Circle Faucet at faucet.circle.com, select Arc Testnet as the network, and request USDC or EURC. You'll need USDC for gas fees."
                />
                <FAQItem
                    question="Why do I need to approve tokens?"
                    answer="Token approval is an ERC-20 security feature. It allows a contract to spend your tokens up to a certain amount. You only need to approve once per token per contract."
                />
                <FAQItem
                    question="What is slippage?"
                    answer="Slippage is the difference between the expected price and the actual execution price. For stablecoin pairs, slippage is typically very low (under 0.5%)."
                />
                <FAQItem
                    question="Can I unstake immediately?"
                    answer="Yes, on testnet there's no lock period. You can unstake your tokens at any time without penalties."
                />
                <FAQItem
                    question="How are rewards calculated?"
                    answer="Rewards are calculated based on the APR (Annual Percentage Rate), the amount staked, and the time staked. Rewards accumulate continuously and can be claimed at any time."
                />
                <FAQItem
                    question="What happens if a transaction fails?"
                    answer="If a transaction fails, you won't lose any tokens. The transaction will revert and your balance will remain unchanged. Check the error message for details on why it failed."
                />
                <FAQItem
                    question="Is ARCDex open source?"
                    answer="Yes, ARCDex is open source and available on GitHub. The smart contracts and frontend code are MIT licensed."
                />
            </div>
        </div>
    )
}

// Helper Components
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

function ContractCard({ name, address, desc, functions }: { name: string, address: string, desc: string, functions?: string[] }) {
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
                        <div className="flex items-center gap-2 bg-muted p-2 rounded font-mono text-xs mb-3">
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
                        {functions && (
                            <div className="mt-3">
                                <p className="text-xs font-semibold text-muted-foreground mb-2">Key Functions:</p>
                                <div className="flex flex-wrap gap-1">
                                    {functions.map((func) => (
                                        <Badge key={func} variant="secondary" className="text-xs">
                                            {func}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function TokenRow({ symbol, address, type }: { symbol: string, address: string, type?: string }) {
    return (
        <tr className="border-t border-border hover:bg-muted/50 transition-colors">
            <td className="p-4 font-semibold">{symbol}</td>
            <td className="p-4 font-mono text-sm text-muted-foreground">{address}</td>
            <td className="p-4">6</td>
            <td className="p-4 text-sm text-muted-foreground">{type || "ERC-20"}</td>
        </tr>
    )
}

function ErrorCard({ code, title, description, solution }: { code: string, title: string, description: string, solution: string }) {
    return (
        <Card className="bg-card border-red-500/30">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{description}</p>
                        <div className="bg-muted p-2 rounded font-mono text-xs text-muted-foreground mb-2">{code}</div>
                        <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                            <p className="text-xs text-green-200">
                                <strong>Solution:</strong> {solution}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    return (
        <Card className="bg-card border-border">
            <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2">{question}</h3>
                <p className="text-sm text-muted-foreground">{answer}</p>
            </CardContent>
        </Card>
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
