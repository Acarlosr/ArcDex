"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import { useTokenBalance } from "@/hooks/use-contracts"
import { Loader2, RefreshCw, Wallet, ExternalLink, ArrowUpRight, ArrowDownLeft, FileCode, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCompliance } from "@/hooks/useCompliance"
import { useI18n } from "@/lib/i18n"

// ArcScan API configuration
const ARCSCAN_API = "https://testnet.arcscan.app/api"
const ARCSCAN_URL = "https://testnet.arcscan.app"

// Transaction type from ArcScan API (Etherscan-compatible)
interface ArcScanTx {
    hash: string
    timeStamp: string
    from: string
    to: string
    value: string
    isError: string
    functionName?: string
    methodId?: string
    blockNumber: string
}

// Format timestamp to relative time
function formatRelativeTime(timestamp: string): string {
    const date = new Date(parseInt(timestamp) * 1000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Format hash for display
function formatHash(hash: string): string {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

// Get transaction type based on function name
function getTxType(tx: ArcScanTx, userAddress: string): { type: string; icon: 'sent' | 'received' | 'contract' } {
    const from = tx.from.toLowerCase()
    const to = tx.to?.toLowerCase() || ''
    const user = userAddress.toLowerCase()
    const fn = tx.functionName?.toLowerCase() || ''

    // Check for known function names
    if (fn.includes('swap')) return { type: 'Swap', icon: 'contract' }
    if (fn.includes('stake') || fn.includes('unstake')) return { type: 'Stake', icon: 'contract' }
    if (fn.includes('addliquidity') || fn.includes('removeliquidity')) return { type: 'LP', icon: 'contract' }
    if (fn.includes('approve')) return { type: 'Approve', icon: 'contract' }
    if (fn.includes('transfer')) return { type: 'Transfer', icon: from === user ? 'sent' : 'received' }

    // Check if it's a contract call
    if (tx.functionName || (tx.methodId && tx.methodId !== '0x')) {
        return { type: tx.functionName?.split('(')[0] || 'Contract', icon: 'contract' }
    }

    // Simple transfer
    if (from === user) return { type: 'Sent', icon: 'sent' }
    if (to === user) return { type: 'Received', icon: 'received' }

    return { type: 'Unknown', icon: 'contract' }
}

// Token configuration for display with default prices
const TOKEN_CONFIG = [
    { key: 'USDC' as const, symbol: 'USDC', name: 'USD Coin', icon: '$', bgColor: 'bg-blue-500', coingeckoId: 'usd-coin', defaultPrice: 1.00 },
    { key: 'EURC' as const, symbol: 'EURC', name: 'Euro Coin', icon: '€', bgColor: 'bg-blue-600', coingeckoId: 'euro-coin', defaultPrice: 1.00 },
]

// Default prices (fallback for testnet)
const DEFAULT_PRICES: Record<string, number> = {
    USDC: 1.00,
    EURC: 1.00,
}

// Format USD value
function formatUSD(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}

// Generate deterministic chart data based on address and current value
function generateChartData(
    period: '24H' | '7D' | '30D',
    currentValue: number,
    addressSeed: string
): { time: string; value: number }[] {
    if (currentValue <= 0) {
        return [{ time: 'Now', value: 0 }]
    }

    // Create a simple hash from address for deterministic variation
    const hash = addressSeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

    const periods = {
        '24H': { points: 7, labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'], variance: 0.02 },
        '7D': { points: 7, labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Now'], variance: 0.05 },
        '30D': { points: 5, labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Now'], variance: 0.08 },
    }

    const config = periods[period]
    const data: { time: string; value: number }[] = []

    for (let i = 0; i < config.points; i++) {
        // Deterministic variation based on hash and position
        const variation = ((hash + i * 17) % 100) / 100 - 0.5 // -0.5 to 0.5
        const multiplier = 1 + (variation * config.variance)

        // Last point is always current value
        const value = i === config.points - 1 ? currentValue : currentValue * multiplier

        data.push({
            time: config.labels[i],
            value: Math.max(0, value),
        })
    }

    return data
}

// Custom hook for fetching prices
function usePrices() {
    const [prices, setPrices] = useState<Record<string, number>>(DEFAULT_PRICES)
    const [isLoading, setIsLoading] = useState(true)
    const [isEstimated, setIsEstimated] = useState(true)

    const fetchPrices = useCallback(async () => {
        setIsLoading(true)
        try {
            // Try CoinGecko API for real prices
            const ids = TOKEN_CONFIG
                .filter(t => t.coingeckoId)
                .map(t => t.coingeckoId)
                .join(',')

            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
                { signal: AbortSignal.timeout(5000) }
            )

            if (response.ok) {
                const data = await response.json()
                const newPrices: Record<string, number> = { ...DEFAULT_PRICES }

                for (const token of TOKEN_CONFIG) {
                    if (token.coingeckoId && data[token.coingeckoId]?.usd) {
                        newPrices[token.key] = data[token.coingeckoId].usd
                    }
                }

                setPrices(newPrices)
                setIsEstimated(false)
            } else {
                throw new Error('API failed')
            }
        } catch {
            // Use default prices on failure
            setPrices(DEFAULT_PRICES)
            setIsEstimated(true)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPrices()
    }, [fetchPrices])

    return { prices, isLoading, isEstimated, refetch: fetchPrices }
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

// Token Row Component with loading state and price
function TokenRow({
    config,
    balance,
    isLoading,
    price,
    priceLoading
}: {
    config: typeof TOKEN_CONFIG[0]
    balance: string
    isLoading: boolean
    price: number
    priceLoading: boolean
}) {
    const { t } = useI18n()
    const numericBalance = parseFloat(balance.replace(',', '')) || 0
    const value = numericBalance * price

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
            <div className="text-center">
                <p className="text-xs text-muted-foreground">{t("portfolio.price")}</p>
                {priceLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground mx-auto" />
                ) : (
                    <p className="font-medium text-foreground">${price.toFixed(2)}</p>
                )}
            </div>
            <div className="text-right">
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />
                ) : (
                    <>
                        <p className="font-medium text-foreground font-mono">{balance}</p>
                        <p className="text-xs text-accent font-medium">{formatUSD(value)}</p>
                    </>
                )}
            </div>
        </div>
    )
}

// Transactions List Component
function TransactionsList({ address }: { address: string }) {
    const { t } = useI18n()
    const [transactions, setTransactions] = useState<ArcScanTx[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchTransactions = useCallback(async () => {
        if (!address) return

        setIsLoading(true)
        setError(null)

        try {
            const url = `${ARCSCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc`
            const response = await fetch(url)
            const data = await response.json()

            if (data.status === '1' && Array.isArray(data.result)) {
                setTransactions(data.result)
            } else if (data.message === 'No transactions found') {
                setTransactions([])
            } else {
                setTransactions([])
            }
        } catch (err) {
            console.error('Failed to fetch transactions:', err)
            setError(t("portfolio.couldNotLoad"))
        } finally {
            setIsLoading(false)
        }
    }, [address, t])

    useEffect(() => {
        fetchTransactions()
    }, [fetchTransactions])

    // Loading state
    if (isLoading) {
        return (
            <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
                <p className="text-muted-foreground">{t("portfolio.loadingTx")}</p>
            </div>
        )
    }

    // Error state with fallback
    if (error) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-foreground font-medium mb-2">{error}</p>
                <p className="text-sm text-muted-foreground mb-4">
                    {t("portfolio.viewExplorer")}
                </p>
                <a
                    href={`${ARCSCAN_URL}/address/${address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    {t("common.viewArcScan")} <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        )
    }

    // Empty state
    if (transactions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-3xl">📋</span>
                </div>
                <p className="text-foreground font-medium mb-2">{t("portfolio.noTx")}</p>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                    {t("portfolio.noTxText")}
                </p>
                <a
                    href={`${ARCSCAN_URL}/address/${address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-cyan-400 hover:underline text-sm"
                >
                    {t("common.viewArcScan")} <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header with Refresh */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t("portfolio.last10")}</p>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchTransactions}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <RefreshCw className="w-3 h-3 mr-1" /> {t("common.refresh")}
                </Button>
            </div>

            {/* Transaction List */}
            <div className="space-y-2">
                {transactions.map((tx) => {
                    const { type, icon } = getTxType(tx, address)
                    const isSuccess = tx.isError === '0'

                    return (
                        <a
                            key={tx.hash}
                            href={`${ARCSCAN_URL}/tx/${tx.hash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border hover:border-cyan-500/30 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${icon === 'sent' ? 'bg-orange-500/20 text-orange-400' :
                                    icon === 'received' ? 'bg-green-500/20 text-green-400' :
                                        'bg-purple-500/20 text-purple-400'
                                    }`}>
                                    {icon === 'sent' ? <ArrowUpRight className="w-5 h-5" /> :
                                        icon === 'received' ? <ArrowDownLeft className="w-5 h-5" /> :
                                            <FileCode className="w-5 h-5" />}
                                </div>

                                {/* Info */}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-foreground">{type}</p>
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {isSuccess ? 'Success' : 'Failed'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        {formatHash(tx.hash)}
                                    </p>
                                </div>
                            </div>

                            {/* Right side */}
                            <div className="text-right flex items-center gap-3">
                                <p className="text-sm text-muted-foreground">
                                    {formatRelativeTime(tx.timeStamp)}
                                </p>
                                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </a>
                    )
                })}
            </div>

            {/* Footer link */}
            <p className="text-xs text-muted-foreground text-center pt-2">
                <a
                    href={`${ARCSCAN_URL}/address/${address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                    {t("common.viewAllArcScan")} <ExternalLink className="w-3 h-3" />
                </a>
            </p>
        </div>
    )
}

export default function PortfolioPage() {
    const { t } = useI18n()
    const [activeTab, setActiveTab] = useState<"tokens" | "nfts" | "transactions">("tokens")
    const [chartPeriod, setChartPeriod] = useState<"24H" | "7D" | "30D">("7D")

    // Web3 hooks
    const { isConnected, address } = useAccount()

    // Compliance
    const { checkCompliance, isVerified: complianceVerified } = useCompliance()
    useEffect(() => { if (isConnected && address) checkCompliance() }, [isConnected, address, checkCompliance])

    // Prices hook
    const { prices, isLoading: pricesLoading, isEstimated, refetch: refetchPrices } = usePrices()

    // Token balances - real blockchain data
    const { formatted: usdcBalance, isLoading: usdcLoading, refetch: refetchUSDC } = useTokenBalance('USDC')
    const { formatted: eurcBalance, isLoading: eurcLoading, refetch: refetchEURC } = useTokenBalance('EURC')

    const isAnyLoading = usdcLoading || eurcLoading || pricesLoading

    // Calculate total tokens (sum of all balances in token units)
    const totalTokens = isConnected && !isAnyLoading
        ? (parseFloat(usdcBalance.replace(',', '')) || 0) +
        (parseFloat(eurcBalance.replace(',', '')) || 0)
        : 0

    // Calculate Net Worth in USD
    const netWorthUSD = isConnected && !isAnyLoading
        ? (parseFloat(usdcBalance.replace(',', '')) || 0) * prices.USDC +
        (parseFloat(eurcBalance.replace(',', '')) || 0) * prices.EURC
        : 0

    // Generate chart data based on current value
    const chartData = generateChartData(chartPeriod, netWorthUSD, address || 'default')

    // Count tokens with balance > 0
    const tokensWithBalance = [
        parseFloat(usdcBalance.replace(',', '')) || 0,
        parseFloat(eurcBalance.replace(',', '')) || 0,
    ].filter(b => b > 0).length

    // Get balance for each token
    const getBalanceData = (key: 'USDC' | 'EURC') => {
        switch (key) {
            case 'USDC': return { balance: usdcBalance, isLoading: usdcLoading }
            case 'EURC': return { balance: eurcBalance, isLoading: eurcLoading }
        }
    }

    // Refetch all data (manual refresh, no polling)
    const handleRefresh = () => {
        refetchUSDC()
        refetchEURC()
        refetchPrices()
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t("portfolio.title")}</h1>
                    <p className="text-muted-foreground mt-1">{t("portfolio.subtitle")}</p>
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
                        {t("common.refresh")}
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Total Balance (USD) Card */}
                <div className="bg-card rounded-2xl p-6 border border-border hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm text-muted-foreground">{t("portfolio.totalBalance")}</p>
                        {isEstimated && (
                            <span
                                className="text-[10px] text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded cursor-help"
                                title={t("portfolio.estimatedTitle")}
                            >
                                {t("portfolio.estimated")}
                            </span>
                        )}
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-1 font-mono">
                        {!isConnected ? "—" : isAnyLoading ? "..." : formatUSD(netWorthUSD)}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                        {isConnected ? t(tokensWithBalance === 1 ? "portfolio.tokenHeld" : "portfolio.tokensHeld", { count: tokensWithBalance }) : t("common.connectWallet")}
                    </p>
                </div>

                {/* USDC Balance Card */}
                <div className="bg-card rounded-2xl p-6 border border-border hover:border-cyan-500/30 transition-colors">
                    <p className="text-sm text-muted-foreground mb-2">{t("portfolio.usdcBalance")}</p>
                    <p className="text-2xl font-bold text-foreground mb-1 font-mono">
                        {!isConnected ? "—" : usdcLoading ? "..." : usdcBalance}
                    </p>
                    <p className="text-sm font-medium text-accent">
                        {!isConnected ? "—" : isAnyLoading ? "..." : formatUSD((parseFloat(usdcBalance.replace(',', '')) || 0) * prices.USDC)}
                    </p>
                </div>

                {/* EURC Balance Card */}
                <div className="bg-card rounded-2xl p-6 border border-border hover:border-cyan-500/30 transition-colors">
                    <p className="text-sm text-muted-foreground mb-2">{t("portfolio.eurcBalance")}</p>
                    <p className="text-2xl font-bold text-foreground mb-1 font-mono">
                        {!isConnected ? "—" : eurcLoading ? "..." : eurcBalance}
                    </p>
                    <p className="text-sm font-medium text-accent">
                        {!isConnected ? "—" : isAnyLoading ? "..." : formatUSD((parseFloat(eurcBalance.replace(',', '')) || 0) * prices.EURC)}
                    </p>
                </div>

            </div>

            {/* Compliance Badge */}
            {isConnected && complianceVerified && (
                <div className="mb-6 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">{t("common.complianceVerified")}</span>
                    <span className="text-xs text-green-400/60">{t("portfolio.amlPassed")}</span>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Area - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-2xl p-6 md:p-8 border border-border glow-border">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-semibold text-foreground">{t("portfolio.value")}</h2>
                                {isEstimated && (
                                    <span
                                        className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full cursor-help"
                                        title={t("portfolio.estimatedTitle")}
                                    >
                                        {t("portfolio.estimated")}
                                    </span>
                                )}
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
                        {!isConnected ? (
                            <div className="h-48 md:h-64 flex items-center justify-center">
                                <div className="text-center">
                                    <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">{t("portfolio.connectValue")}</p>
                                </div>
                            </div>
                        ) : (
                            <LineChart data={chartData} />
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card rounded-2xl p-6 border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-4">{t("portfolio.network")}</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold">A</span>
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Arc Testnet</p>
                                <p className="text-sm text-muted-foreground">Chain ID: 5042002</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-card rounded-2xl p-6 border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-4">{t("portfolio.summary")}</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("portfolio.tokens")}</span>
                                <span className="text-foreground font-medium">
                                    {isConnected ? tokensWithBalance : "—"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("portfolio.nfts")}</span>
                                <span className="text-foreground font-medium">—</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("portfolio.transactions")}</span>
                                <span className="text-foreground font-medium">—</span>
                            </div>
                        </div>
                    </div>

                    {/* Wallet Info */}
                    {isConnected && address && (
                        <div className="bg-card rounded-2xl p-6 border border-border">
                            <h3 className="text-lg font-semibold text-foreground mb-4">{t("portfolio.wallet")}</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground text-sm">{t("portfolio.connected")}</p>
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
                            {t("portfolio.tokens")}
                        </button>
                        <button
                            onClick={() => setActiveTab("nfts")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "nfts"
                                ? "text-accent border-b-2 border-accent bg-muted/30"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {t("portfolio.nfts")}
                        </button>
                        <button
                            onClick={() => setActiveTab("transactions")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "transactions"
                                ? "text-accent border-b-2 border-accent bg-muted/30"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {t("portfolio.transactions")}
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
                                        <p className="text-foreground font-medium mb-2">{t("portfolio.walletNotConnected")}</p>
                                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                            {t("portfolio.connectTokens")}
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
                                                    price={prices[config.key]}
                                                    priceLoading={pricesLoading}
                                                />
                                            )
                                        })}
                                        <p className="text-xs text-muted-foreground text-center pt-2">
                                            {t("portfolio.showingBalances")} • {t("portfolio.getTokensFrom")}{" "}
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
                                <p className="text-foreground font-medium mb-2">{t("portfolio.noNfts")}</p>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    {t("portfolio.noNftsText")}
                                </p>
                            </div>
                        )}
                        {activeTab === "transactions" && (
                            !isConnected ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                        <Wallet className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-foreground font-medium mb-2">{t("portfolio.walletNotConnected")}</p>
                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                        {t("portfolio.connectTransactions")}
                                    </p>
                                </div>
                            ) : (
                                <TransactionsList address={address!} />
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
