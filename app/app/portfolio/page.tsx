"use client"

import { useState } from "react"

// Mock data for different time periods
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
function LineChart({ data, period }: { data: { time: string; value: number }[]; period: string }) {
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

export default function PortfolioPage() {
    const [activeTab, setActiveTab] = useState<"tokens" | "nfts" | "transactions">("tokens")
    const [chartPeriod, setChartPeriod] = useState<"24H" | "7D" | "30D">("7D")

    // Mock stats data
    const stats = [
        {
            label: "Total Balance",
            value: "$1,234.56",
            change: "+2.4%",
            changeType: "positive" as const,
        },
        {
            label: "Staked Value",
            value: "$500.00",
            change: "+5.2%",
            changeType: "positive" as const,
        },
        {
            label: "LP Positions",
            value: "2 pools",
            change: "USDC/EURC",
            changeType: "neutral" as const,
        },
        {
            label: "Pending Rewards",
            value: "12.50 USDC",
            change: "Claimable",
            changeType: "highlight" as const,
        },
    ]

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
                {stats.map((stat, index) => (
                    <div key={index} className="bg-card rounded-2xl p-6 border border-border hover:border-cyan-500/30 transition-colors">
                        <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                        <p className={`text-sm font-medium ${stat.changeType === "positive" ? "text-green-400" :
                                stat.changeType === "highlight" ? "text-cyan-400" :
                                    "text-muted-foreground"
                            }`}>
                            {stat.change}
                        </p>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Area - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-2xl p-6 md:p-8 border border-border glow-border">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <h2 className="text-lg font-semibold text-foreground">Portfolio Value</h2>
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
                        <LineChart data={chartData[chartPeriod]} period={chartPeriod} />
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
                                <span className="text-foreground font-medium">2</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">NFTs</span>
                                <span className="text-foreground font-medium">0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Transactions</span>
                                <span className="text-foreground font-medium">5</span>
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
                    <div className="p-6 md:p-8">
                        {activeTab === "tokens" && (
                            <div className="space-y-4">
                                {/* Mock Token List */}
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">$</div>
                                        <div>
                                            <p className="font-medium text-foreground">USDC</p>
                                            <p className="text-xs text-muted-foreground">USD Coin</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-foreground">734.56</p>
                                        <p className="text-xs text-muted-foreground">≈ $734.56</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">€</div>
                                        <div>
                                            <p className="font-medium text-foreground">EURC</p>
                                            <p className="text-xs text-muted-foreground">Euro Coin</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-foreground">500.00</p>
                                        <p className="text-xs text-muted-foreground">≈ $500.00</p>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground text-center pt-2">
                                    Showing testnet balances • Get tokens from{" "}
                                    <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                                        Circle Faucet
                                    </a>
                                </p>
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
