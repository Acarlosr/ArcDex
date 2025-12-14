"use client"

import { useState } from "react"

export default function PortfolioPage() {
    const [activeTab, setActiveTab] = useState<"tokens" | "nfts" | "transactions">("tokens")

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
                    <p className="text-muted-foreground mt-1">Track your assets and positions on Arc Network</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-card rounded-2xl p-6 border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Total Balance</p>
                    <p className="text-2xl font-bold text-foreground">$0.00</p>
                </div>
                <div className="bg-card rounded-2xl p-6 border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Staked Value</p>
                    <p className="text-2xl font-bold text-foreground">$0.00</p>
                </div>
                <div className="bg-card rounded-2xl p-6 border border-border">
                    <p className="text-sm text-muted-foreground mb-2">LP Positions</p>
                    <p className="text-2xl font-bold text-foreground">$0.00</p>
                </div>
                <div className="bg-card rounded-2xl p-6 border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Pending Rewards</p>
                    <p className="text-2xl font-bold text-foreground">$0.00</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Area - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-2xl p-8 border border-border glow-border">
                        <h2 className="text-lg font-semibold text-foreground mb-6">Portfolio Value</h2>
                        {/* Chart Placeholder */}
                        <div className="h-64 rounded-xl bg-muted/50 flex items-center justify-center border border-border">
                            <p className="text-muted-foreground">Chart coming soon</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card rounded-2xl p-6 border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Network</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center">
                                <span className="text-white font-bold">A</span>
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Arc Testnet</p>
                                <p className="text-sm text-muted-foreground">Chain ID: 5042002</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-8">
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    {/* Tab Headers */}
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => setActiveTab("tokens")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "tokens"
                                    ? "text-accent border-b-2 border-accent bg-muted/30"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Tokens
                        </button>
                        <button
                            onClick={() => setActiveTab("nfts")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "nfts"
                                    ? "text-accent border-b-2 border-accent bg-muted/30"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            NFTs
                        </button>
                        <button
                            onClick={() => setActiveTab("transactions")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "transactions"
                                    ? "text-accent border-b-2 border-accent bg-muted/30"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Transactions
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {activeTab === "tokens" && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-3xl">💰</span>
                                </div>
                                <p className="text-foreground font-medium mb-2">No tokens yet</p>
                                <p className="text-sm text-muted-foreground">
                                    Your token balances will appear here
                                </p>
                            </div>
                        )}
                        {activeTab === "nfts" && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-3xl">🖼️</span>
                                </div>
                                <p className="text-foreground font-medium mb-2">No NFTs yet</p>
                                <p className="text-sm text-muted-foreground">
                                    Your NFT collection will appear here
                                </p>
                            </div>
                        )}
                        {activeTab === "transactions" && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-3xl">📋</span>
                                </div>
                                <p className="text-foreground font-medium mb-2">No transactions yet</p>
                                <p className="text-sm text-muted-foreground">
                                    Your transaction history will appear here
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
