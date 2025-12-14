"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { useTokenBalance } from "@/hooks/use-contracts"
import { Loader2, RefreshCw, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

// Token configuration for display
const TOKEN_CONFIG = [
    { key: 'USDC' as const, symbol: 'USDC', name: 'USD Coin', icon: '$', bgColor: 'bg-blue-500' },
    { key: 'EURC' as const, symbol: 'EURC', name: 'Euro Coin', icon: '€', bgColor: 'bg-blue-600' },
    { key: 'USYC' as const, symbol: 'USYC', name: 'US Yield Coin', icon: 'Y', bgColor: 'bg-green-500' },
]

// Mock data for chart (keeping as mock per Phase 3 requirement)
const chartData = {
    "24H": [
        { time: "00:00", value: 1200 },
        { time: "04:00", value: 1180 },
        { time: "08:00", value: 1220 },
        { time: "12:00", value: 1250 },
        { time: "16:00", value: 1230 },
        { time: "20:00", value: 1234 },
        { time: "Now", value: 1234.56 },
    ],
    "7D": [
        { time: "Mon", value: 1100 },
        { time: "Tue", value: 1150 },
        { time: "Wed", value: 1080 },
        { time: "Thu", value: 1200 },
        { time: "Fri", value: 1180 },
        { time: "Sat", value: 1220 },
        { time: "Sun", value: 1234.56 },
    ],
    "30D": [
        { time: "Week 1", value: 950 },
        { time: "Week 2", value: 1050 },
        { time: "Week 3", value: 1100 },
        { time: "Week 4", value: 1234.56 },
    ],
}

// Simple SVG Line Chart Component
function LineChart({ data }: { data: { time: string; value: number }[] }) {
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

    const width = 600
    const height = 200
    const padding = 40

    const values = data.map(d => d.value)
    const minValue = Math.min(...values) * 0.95
    const maxValue = Math.max(...values) * 1.05

    const getX = (index: number) => padding + (index / (data.length - 1)) * (width - padding * 2)
    const getY = (value: number) => height - padding - ((value - minValue) / (maxValue - minValue)) * (height - padding * 2)

    const pathD = data
        .map((point, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(point.value)}`)
        .join(" ")

    const areaD = `${pathD} L ${getX(data.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`

    return (
        <div className="relative w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 md:h-64">
                <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0, 1, 2, 3].map(i => (
                    <line
                        key={i}
                        x1={padding}
                        y1={padding + (i * (height - padding * 2)) / 3}
                        x2={width - padding}
                        y2={padding + (i * (height - padding * 2)) / 3}
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeDasharray="4"
                    />
                ))}

                {/* Area fill */}
                <path d={areaD} fill="url(#areaGradient)" />

                {/* Line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="rgb(6, 182, 212)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data points */}
                {data.map((point, i) => (
                    <g key={i}>
                        <circle
                            cx={getX(i)}
                            cy={getY(point.value)}
                            r={hoveredPoint === i ? 6 : 4}
                            fill="rgb(6, 182, 212)"
                            stroke="rgb(8, 145, 178)"
                            strokeWidth="2"
                            className="cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredPoint(i)}
                            onMouseLeave={() => setHoveredPoint(null)}
                        />
                    </g>
                ))}

                {/* X-axis labels */}
                {data.map((point, i) => (
                    <text
                        key={i}
                        x={getX(i)}
                        y={height - 10}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[10px]"
                    >
                        {point.time}
                    </text>
                ))}

                {/* Y-axis labels */}
                {[maxValue, (maxValue + minValue) / 2, minValue].map((value, i) => (
                    <text
                        key={i}
                        x={padding - 8}
                        y={padding + (i * (height - padding * 2)) / 2}
                        textAnchor="end"
                        dominantBaseline="middle"
                        className="fill-muted-foreground text-[10px]"
                    >
                        ${value.toFixed(0)}
                    </text>
                ))}
            </svg>

            {/* Tooltip */}
            {hoveredPoint !== null && (
                <div
                    className="absolute bg-card border border-border rounded-lg px-3 py-2 shadow-lg pointer-events-none z-10"
                    style={{
                        left: `${(hoveredPoint / (data.length - 1)) * 100}%`,
                        top: "20%",
                        transform: "translateX(-50%)"
                    }}
                >
                    <p className="text-xs text-muted-foreground">{data[hoveredPoint].time}</p>
                    <p className="text-sm font-semibold text-foreground">${data[hoveredPoint].value.toFixed(2)}</p>
                </div>
            )}
        </div>
    )
}

// Token Row Component with loading state
function TokenRow({
    config,
    balance,
    isLoading
}: {
    config: typeof TOKEN_CONFIG[0]
    balance: string
    isLoading: boolean
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border hover:border-cyan-500/20 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center text-white font-bold`}>
                    {config.icon}
                </div>
                <div>
                    <p className="font-medium text-foreground">{config.symbol}</p>
                    <p className="text-xs text-muted-foreground">{config.name}</p>
                </div>
            </div>
            <div className="text-right">
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />
                ) : (
                    <>
                        <p className="font-medium text-foreground font-mono">{balance}</p>
                        <p className="text-xs text-muted-foreground">—</p>
                    </>
                )}
            </div>
        </div>
    )
}

export default function PortfolioPage() {
    const [activeTab, setActiveTab] = useState<"tokens" | "nfts" | "transactions">("tokens")
    const [chartPeriod, setChartPeriod] = useState<"24H" | "7D" | "30D">("7D")

    // Web3 hooks
    const { isConnected, address } = useAccount()

    // Token balances - real blockchain data
    const { formatted: usdcBalance, isLoading: usdcLoading, refetch: refetchUSDC } = useTokenBalance('USDC')
    const { formatted: eurcBalance, isLoading: eurcLoading, refetch: refetchEURC } = useTokenBalance('EURC')
    const { formatted: usycBalance, isLoading: usycLoading, refetch: refetchUSYC } = useTokenBalance('USYC')

    const isAnyLoading = usdcLoading || eurcLoading || usycLoading

    // Calculate total tokens (sum of all balances in token units)
    const totalTokens = isConnected && !isAnyLoading
        ? (parseFloat(usdcBalance.replace(',', '')) || 0) +
        (parseFloat(eurcBalance.replace(',', '')) || 0) +
        (parseFloat(usycBalance.replace(',', '')) || 0)
        : 0

    // Count tokens with balance > 0
    const tokensWithBalance = [
        parseFloat(usdcBalance.replace(',', '')) || 0,
        parseFloat(eurcBalance.replace(',', '')) || 0,
        parseFloat(usycBalance.replace(',', '')) || 0,
    ].filter(b => b > 0).length

    // Get balance for each token
    const getBalanceData = (key: 'USDC' | 'EURC' | 'USYC') => {
        switch (key) {
            case 'USDC': return { balance: usdcBalance, isLoading: usdcLoading }
            case 'EURC': return { balance: eurcBalance, isLoading: eurcLoading }
            case 'USYC': return { balance: usycBalance, isLoading: usycLoading }
        }
    }

    // Refetch all balances (manual refresh, no polling)
    const handleRefresh = () => {
        refetchUSDC()
        refetchEURC()
        refetchUSYC()
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
                    <p className="text-muted-foreground mt-1">Track your assets and positions on Arc Network</p>
                </div>
                {isConnected && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isAnyLoading}
                        className="border-border text-muted-foreground hover:text-foreground"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isAnyLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Tokens Card */}
                <div className="bg-card rounded-2xl p-6 border border-border hover:border-cyan-500/30 transition-colors">
                    <p className="text-sm text-muted-foreground mb-2">Total Tokens</p>
                    <p className="text-2xl font-bold text-foreground mb-1 font-mono">
                        {!isConnected ? "—" : isAnyLoading ? "..." : totalTokens.toFixed(2)}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                        {isConnected ? `${tokensWithBalance} token${tokensWithBalance !== 1 ? 's' : ''} held` : "Connect wallet"}
                    </p>
                </div>

                {/* USDC Balance Card */}
                <div className="bg-card rounded-2xl p-6 border border-border hover:border-cyan-500/30 transition-colors">
                    <p className="text-sm text-muted-foreground mb-2">USDC Balance</p>
                    <p className="text-2xl font-bold text-foreground mb-1 font-mono">
                        {!isConnected ? "—" : usdcLoading ? "..." : usdcBalance}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">Value: —</p>
                </div>

                {/* EURC Balance Card */}
                <div className="bg-card rounded-2xl p-6 border border-border hover:border-cyan-500/30 transition-colors">
                    <p className="text-sm text-muted-foreground mb-2">EURC Balance</p>
                    <p className="text-2xl font-bold text-foreground mb-1 font-mono">
                        {!isConnected ? "—" : eurcLoading ? "..." : eurcBalance}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">Value: —</p>
                </div>

                {/* USYC Balance Card */}
                <div className="bg-card rounded-2xl p-6 border border-border hover:border-cyan-500/30 transition-colors">
                    <p className="text-sm text-muted-foreground mb-2">USYC Balance</p>
                    <p className="text-2xl font-bold text-foreground mb-1 font-mono">
                        {!isConnected ? "—" : usycLoading ? "..." : usycBalance}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">Value: —</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Area - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-2xl p-6 md:p-8 border border-border glow-border">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-semibold text-foreground">Portfolio Value</h2>
                                <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">Mock Data</span>
                            </div>
                            {/* Period Filter */}
                            <div className="flex gap-1 bg-muted rounded-lg p-1">
                                {(["24H", "7D", "30D"] as const).map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setChartPeriod(period)}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${chartPeriod === period
                                            ? "bg-accent text-background"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chart */}
                        <LineChart data={chartData[chartPeriod]} />
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

                    {/* Quick Stats */}
                    <div className="bg-card rounded-2xl p-6 border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tokens</span>
                                <span className="text-foreground font-medium">
                                    {isConnected ? tokensWithBalance : "—"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">NFTs</span>
                                <span className="text-foreground font-medium">—</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Transactions</span>
                                <span className="text-foreground font-medium">—</span>
                            </div>
                        </div>
                    </div>

                    {/* Wallet Info */}
                    {isConnected && address && (
                        <div className="bg-card rounded-2xl p-6 border border-border">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Wallet</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground text-sm">Connected</p>
                                    <p className="text-xs text-muted-foreground font-mono truncate">
                                        {address.slice(0, 6)}...{address.slice(-4)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
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
                    <div className="p-6 md:p-8">
                        {activeTab === "tokens" && (
                            <div className="space-y-4">
                                {!isConnected ? (
                                    /* Disconnected State */
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                            <Wallet className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-foreground font-medium mb-2">Wallet Not Connected</p>
                                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                            Connect your wallet to view your token balances on Arc Testnet.
                                        </p>
                                    </div>
                                ) : (
                                    /* Token List */
                                    <>
                                        {TOKEN_CONFIG.map((config) => {
                                            const { balance, isLoading } = getBalanceData(config.key)
                                            return (
                                                <TokenRow
                                                    key={config.key}
                                                    config={config}
                                                    balance={balance}
                                                    isLoading={isLoading}
                                                />
                                            )
                                        })}
                                        <p className="text-xs text-muted-foreground text-center pt-2">
                                            Showing Arc Testnet balances • Get tokens from{" "}
                                            <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                                                Circle Faucet
                                            </a>
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                        {activeTab === "nfts" && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-3xl">🖼️</span>
                                </div>
                                <p className="text-foreground font-medium mb-2">No NFTs on Arc Testnet</p>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    NFT support is coming soon. Your collection will appear here once available.
                                </p>
                            </div>
                        )}
                        {activeTab === "transactions" && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-3xl">📋</span>
                                </div>
                                <p className="text-foreground font-medium mb-2">Transaction History</p>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    View your recent transactions in the{" "}
                                    <a href="/app/history" className="text-cyan-400 hover:underline">
                                        History
                                    </a>{" "}
                                    page for detailed activity.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
