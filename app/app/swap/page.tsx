"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTokenBalance, useGetAmountOut, useSwap, useApprove, useTokenAllowance } from "@/hooks/use-contracts"
import { useAccount } from "wagmi"
import { ARCDEX, parseTokenAmount, ARCSCAN_URL, ARCSCAN_API } from "@/lib/contracts"
import { Loader2, ExternalLink, CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { MobileWalletHint } from "@/components/mobile-wallet-hint"

type SwapToken = "USDC" | "EURC" | "USYC"

// Check if a swap pair is available (USYC pairs not deployed yet)
function isSwapEnabled(from: SwapToken, to: SwapToken): boolean {
  if (from === "USYC" || to === "USYC") return false // USYC contracts not deployed
  return from !== to
}

// Transaction type for history
interface SwapTx {
  hash: string
  timeStamp: string
  isError: string
  value: string
}

// Format relative time
function formatRelativeTime(timestamp: string): string {
  const now = Date.now()
  const txTime = parseInt(timestamp) * 1000
  const diff = now - txTime

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(txTime).toLocaleDateString()
}

// Format address
function formatAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// Swap History Component
function SwapHistory({ address }: { address: string | undefined }) {
  const [transactions, setTransactions] = useState<SwapTx[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSwaps = useCallback(async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${ARCSCAN_API}?module=account&action=txlist&address=${address}&sort=desc&page=1&offset=20`,
        { signal: AbortSignal.timeout(10000) }
      )

      if (!response.ok) throw new Error('API error')

      const data = await response.json()

      if (data.status === '1' && Array.isArray(data.result)) {
        // Filter for transactions to Swap contract
        const swapTxs = data.result.filter((tx: SwapTx & { to?: string }) =>
          tx.to?.toLowerCase() === ARCDEX.Swap.toLowerCase()
        ).slice(0, 5)

        setTransactions(swapTxs)
      } else {
        setTransactions([])
      }
    } catch (err) {
      console.error('Failed to fetch swaps:', err)
      setError('Failed to load swap history')
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchSwaps()
  }, [fetchSwaps])

  if (!address) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground text-sm">Connect wallet to see history</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-muted rounded-full" />
              <div className="w-16 h-3 bg-muted rounded" />
            </div>
            <div className="w-12 h-3 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-400 text-sm mb-2">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchSwaps}>
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground text-sm">No swaps yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <a
          key={tx.hash}
          href={`${ARCSCAN_URL}/tx/${tx.hash}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border hover:border-cyan-500/30 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {tx.isError === '0' ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <div>
              <span className={`text-xs px-1.5 py-0.5 rounded ${tx.isError === '0'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
                }`}>
                {tx.isError === '0' ? 'Confirmed' : 'Failed'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{formatRelativeTime(tx.timeStamp)}</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </div>
        </a>
      ))}
      <div className="text-center pt-1">
        <a
          href={`${ARCSCAN_URL}/address/${address}`}
          target="_blank"
          rel="noreferrer"
          className="text-cyan-400 hover:underline text-xs inline-flex items-center gap-1"
        >
          View all on ArcScan <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

export default function SwapPage() {
  const [fromToken, setFromToken] = useState<SwapToken>("USDC")
  const [toToken, setToToken] = useState<SwapToken>("EURC")
  const [fromAmount, setFromAmount] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  const swapEnabled = isSwapEnabled(fromToken, toToken)

  const { isConnected, address } = useAccount()

  // Get real balances from blockchain
  const { formatted: usdcBalance, isLoading: usdcLoading, refetch: refetchUSDC } = useTokenBalance('USDC')
  const { formatted: eurcBalance, isLoading: eurcLoading, refetch: refetchEURC } = useTokenBalance('EURC')
  const { formatted: usycBalance, isLoading: usycLoading, refetch: refetchUSYC } = useTokenBalance('USYC')

  // Get amount out from contract (only for USDC/EURC pairs)
  const swapFromToken = fromToken === 'USYC' ? 'USDC' : fromToken
  const { formatted: amountOut, isLoading: quoteLoading } = useGetAmountOut(
    swapEnabled ? swapFromToken : 'USDC',
    swapEnabled ? fromAmount : ''
  )

  // Allowance check (only for enabled pairs)
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(
    swapEnabled ? swapFromToken : 'USDC',
    ARCDEX.Swap
  )

  // Approve hook
  const { approve, isPending: approving, isSuccess: approveSuccess, hash: approveHash } = useApprove()

  // Swap hook
  const { swap, isPending: swapping, isSuccess: swapSuccess, hash: swapHash, error: swapError } = useSwap()

  const getBalance = (token: SwapToken) => {
    if (token === 'USDC') return { balance: usdcBalance, loading: usdcLoading }
    if (token === 'EURC') return { balance: eurcBalance, loading: eurcLoading }
    return { balance: usycBalance, loading: usycLoading }
  }

  const fromBalance = getBalance(fromToken).balance
  const toBalance = getBalance(toToken).balance
  const fromLoading = getBalance(fromToken).loading
  const toLoading = getBalance(toToken).loading

  // Check if approval needed
  const needsApproval = fromAmount && allowance !== undefined &&
    parseTokenAmount(fromAmount) > allowance

  // Refetch allowance when fromToken changes
  useEffect(() => {
    refetchAllowance()
  }, [fromToken, refetchAllowance])

  // Refetch balances after successful swap
  useEffect(() => {
    if (swapSuccess && swapHash) {
      // Small delay to ensure blockchain state is updated
      const timer = setTimeout(() => {
        refetchUSDC()
        refetchEURC()
        refetchAllowance()
        setFromAmount("")
        // Trigger history refresh
        setRefreshKey((k) => k + 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [swapSuccess, swapHash, refetchUSDC, refetchEURC, refetchAllowance])

  // Refetch allowance after approval
  useEffect(() => {
    if (approveSuccess && approveHash) {
      // Small delay to ensure blockchain state is updated
      const timer = setTimeout(() => {
        refetchAllowance()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [approveSuccess, approveHash, refetchAllowance])

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount("")
  }

  const handleMaxClick = () => {
    setFromAmount(fromBalance.replace(',', ''))
  }

  const handleApprove = async () => {
    if (!fromAmount || !swapEnabled) return
    await approve(swapFromToken, ARCDEX.Swap, fromAmount)
  }

  const handleSwap = async () => {
    if (!fromAmount || !amountOut || !swapEnabled) return
    // Apply 0.5% slippage
    const minOut = (parseFloat(amountOut.replace(',', '')) * 0.995).toFixed(2)
    await swap(swapFromToken, fromAmount, minOut)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Swap Tokens</h1>
          <p className="text-muted-foreground mt-1">Exchange tokens instantly on Arc Network</p>
        </div>
      </div>

      <MobileWalletHint />

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Swap Card - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl p-8 border border-border glow-border">
            {/* From */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">From</label>
                {!swapEnabled && (
                  <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full">USYC Coming Soon</span>
                )}
              </div>
              <div className="flex gap-4">
                <select
                  value={fromToken}
                  onChange={(e) => {
                    const newFrom = e.target.value as SwapToken
                    setFromToken(newFrom)
                    // Auto-select appropriate toToken
                    if (newFrom === "USDC") setToToken("EURC")
                    else if (newFrom === "EURC") setToToken("USDC")
                    else if (newFrom === "USYC") setToToken("USDC")
                  }}
                  className="bg-input text-foreground border border-border rounded-xl p-4 w-32 text-lg font-medium"
                >
                  <option value="USDC">USDC</option>
                  <option value="EURC">EURC</option>
                  <option value="USYC">USYC ⏳</option>
                </select>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="flex-1 bg-input text-foreground border-border h-14 text-xl font-medium rounded-xl"
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Balance: {fromLoading ? "..." : fromBalance} {fromToken}
                </p>
                {isConnected && (
                  <button
                    onClick={handleMaxClick}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    MAX
                  </button>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center my-6">
              <Button
                onClick={handleSwapTokens}
                variant="outline"
                className="border-border text-accent hover:bg-muted rounded-full p-3 w-12 h-12 bg-card"
              >
                ⇅
              </Button>
            </div>

            {/* To */}
            <div className="space-y-3 mb-8">
              <label className="text-sm font-medium text-muted-foreground">To</label>
              <div className="flex gap-4">
                <select
                  value={toToken}
                  onChange={(e) => {
                    const newTo = e.target.value as SwapToken
                    setToToken(newTo)
                    // Auto-select appropriate fromToken
                    if (newTo === "USDC") setFromToken(fromToken === "USDC" ? "EURC" : fromToken)
                    else if (newTo === "EURC") setFromToken(fromToken === "EURC" ? "USDC" : fromToken)
                    else if (newTo === "USYC") setFromToken(fromToken === "USYC" ? "USDC" : fromToken)
                  }}
                  className="bg-input text-foreground border border-border rounded-xl p-4 w-32 text-lg font-medium"
                >
                  <option value="USDC">USDC</option>
                  <option value="EURC">EURC</option>
                  <option value="USYC">USYC ⏳</option>
                </select>
                <Input
                  type="text"
                  placeholder="0.00"
                  value={quoteLoading ? "..." : amountOut}
                  readOnly
                  className="flex-1 bg-input text-foreground border-border h-14 text-xl font-medium rounded-xl"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Balance: {toLoading ? "..." : toBalance} {toToken}
              </p>
            </div>

            {/* Action Buttons */}
            {!isConnected ? (
              <Button className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl" disabled>
                Connect Wallet to Swap
              </Button>
            ) : needsApproval ? (
              <Button
                onClick={handleApprove}
                disabled={approving || !fromAmount}
                className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl"
              >
                {approving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Approving...
                  </>
                ) : (
                  `Approve ${fromToken}`
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSwap}
                disabled={swapping || !fromAmount || parseFloat(fromAmount) <= 0}
                className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl"
              >
                {swapping ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Swapping...
                  </>
                ) : (
                  "Swap"
                )}
              </Button>
            )}

            {swapError && (
              <p className="text-red-400 text-sm mt-4 text-center">
                Error: {swapError.message}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar - Stats Panel */}
        <div className="space-y-6">
          {/* Price Info */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Swap Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="text-foreground font-medium">
                  1 {fromToken} ≈ {fromAmount && amountOut ? (parseFloat(amountOut) / parseFloat(fromAmount)).toFixed(4) : "0.92"} {toToken}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slippage</span>
                <Badge className="bg-accent text-background">0.5%</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="text-foreground font-medium">~0.05 USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Route</span>
                <span className="text-foreground font-medium">Direct</span>
              </div>
            </div>
          </div>

          {/* Your Balances */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Your Balances</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">$</div>
                  <span className="text-foreground">USDC</span>
                </div>
                <span className="text-foreground font-medium">
                  {usdcLoading ? "..." : usdcBalance}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">€</div>
                  <span className="text-foreground">EURC</span>
                </div>
                <span className="text-foreground font-medium">
                  {eurcLoading ? "..." : eurcBalance}
                </span>
              </div>
            </div>
          </div>

          {/* Swap History */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Swap History</h3>
            <SwapHistory key={refreshKey} address={address} />
          </div>

          {/* Network Info */}
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
    </div>
  )
}
