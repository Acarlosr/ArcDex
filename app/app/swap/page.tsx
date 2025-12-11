"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTokenBalance, useGetAmountOut, useSwap, useApprove, useTokenAllowance } from "@/hooks/use-contracts"
import { useAccount } from "wagmi"
import { ARCDEX, parseTokenAmount } from "@/lib/contracts"
import { Loader2 } from "lucide-react"

export default function SwapPage() {
  const [fromToken, setFromToken] = useState<"USDC" | "EURC">("USDC")
  const [toToken, setToToken] = useState<"USDC" | "EURC">("EURC")
  const [fromAmount, setFromAmount] = useState("")

  const { isConnected } = useAccount()

  // Get real balances from blockchain
  const { formatted: usdcBalance, isLoading: usdcLoading, refetch: refetchUSDC } = useTokenBalance('USDC')
  const { formatted: eurcBalance, isLoading: eurcLoading, refetch: refetchEURC } = useTokenBalance('EURC')

  // Get amount out from contract
  const { formatted: amountOut, isLoading: quoteLoading } = useGetAmountOut(fromToken, fromAmount)

  // Allowance check
  const { allowance } = useTokenAllowance(fromToken, ARCDEX.Swap)

  // Approve hook
  const { approve, isPending: approving, isSuccess: approveSuccess } = useApprove()

  // Swap hook
  const { swap, isPending: swapping, isSuccess: swapSuccess, error: swapError } = useSwap()

  const fromBalance = fromToken === 'USDC' ? usdcBalance : eurcBalance
  const toBalance = toToken === 'USDC' ? usdcBalance : eurcBalance
  const fromLoading = fromToken === 'USDC' ? usdcLoading : eurcLoading
  const toLoading = toToken === 'USDC' ? usdcLoading : eurcLoading

  // Check if approval needed
  const needsApproval = fromAmount && allowance !== undefined &&
    parseTokenAmount(fromAmount) > allowance

  // Refetch balances after successful swap
  useEffect(() => {
    if (swapSuccess) {
      refetchUSDC()
      refetchEURC()
      setFromAmount("")
    }
  }, [swapSuccess, refetchUSDC, refetchEURC])

  // Refetch allowance after approval
  useEffect(() => {
    if (approveSuccess) {
      // Trigger a re-render to update allowance
    }
  }, [approveSuccess])

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount("")
  }

  const handleMaxClick = () => {
    setFromAmount(fromBalance.replace(',', ''))
  }

  const handleApprove = async () => {
    if (!fromAmount) return
    await approve(fromToken, ARCDEX.Swap, fromAmount)
  }

  const handleSwap = async () => {
    if (!fromAmount || !amountOut) return
    // Apply 0.5% slippage
    const minOut = (parseFloat(amountOut.replace(',', '')) * 0.995).toFixed(2)
    await swap(fromToken, fromAmount, minOut)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Swap Tokens</h1>
          <p className="text-muted-foreground mt-1">Exchange tokens instantly on Arc Network</p>
        </div>
        <Button
          variant="outline"
          className="border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/10 rounded-lg bg-transparent"
          asChild
        >
          <a href="https://faucet.circle.com" target="_blank" rel="noreferrer">
            Get Test Tokens
          </a>
        </Button>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Swap Card - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl p-8 border border-border glow-border">
            {/* From */}
            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium text-muted-foreground">From</label>
              <div className="flex gap-4">
                <select
                  value={fromToken}
                  onChange={(e) => {
                    const newFrom = e.target.value as "USDC" | "EURC"
                    setFromToken(newFrom)
                    setToToken(newFrom === "USDC" ? "EURC" : "USDC")
                  }}
                  className="bg-input text-foreground border border-border rounded-xl p-4 w-32 text-lg font-medium"
                >
                  <option value="USDC">USDC</option>
                  <option value="EURC">EURC</option>
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
                    const newTo = e.target.value as "USDC" | "EURC"
                    setToToken(newTo)
                    setFromToken(newTo === "USDC" ? "EURC" : "USDC")
                  }}
                  className="bg-input text-foreground border border-border rounded-xl p-4 w-32 text-lg font-medium"
                >
                  <option value="USDC">USDC</option>
                  <option value="EURC">EURC</option>
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
