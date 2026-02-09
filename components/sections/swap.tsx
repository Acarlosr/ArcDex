"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import {
  useTokenBalance,
  useTokenAllowance,
  useApprove,
  useGetAmountOut,
  useSwap,
  useSwapReserves
} from "@/hooks/use-contracts"
import { ARCDEX, PROTOCOL } from "@/lib/contracts"

export function SwapSection() {
  const { isConnected } = useAccount()
  const queryClient = useQueryClient()
  const [fromToken, setFromToken] = useState<"USDC" | "EURC">("USDC")
  const [toToken, setToToken] = useState<"USDC" | "EURC">("EURC")
  const [fromAmount, setFromAmount] = useState("")
  const [slippage, setSlippage] = useState(0.5)

  // Contract data
  const { formatted: fromBalance, refetch: refetchFromBalance } = useTokenBalance(fromToken)
  const { formatted: toBalance, refetch: refetchToBalance } = useTokenBalance(toToken)
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(fromToken, ARCDEX.Swap)
  const { formatted: amountOut, amountOut: rawAmountOut } = useGetAmountOut(fromToken, fromAmount)
  const { formattedUSDC, formattedEURC } = useSwapReserves()

  // Actions
  const { approve, isPending: isApproving, isConfirming: isApprovingConfirm, isSuccess: approveSuccess } = useApprove()
  const { swap, isPending: isSwapping, isConfirming: isSwapConfirm, isSuccess: swapSuccess, error: swapError } = useSwap()

  // Check if approval needed
  const parsedFromAmount = fromAmount ? BigInt(Math.floor(parseFloat(fromAmount) * 1e6)) : BigInt(0)
  const needsApproval = allowance !== undefined && parsedFromAmount > BigInt(0) && allowance < parsedFromAmount

  // Handle swap token toggle
  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount("")
  }

  // Handle approve
  const handleApprove = async () => {
    if (!fromAmount) {
      console.warn("Swap: Cannot approve - no amount specified")
      return
    }
    try {
      // Approve max amount for convenience
      await approve(fromToken, ARCDEX.Swap, "999999999999")
    } catch (error) {
      console.error("Swap: Approve error", error)
    }
  }

  // Handle swap
  const handleSwap = async () => {
    if (!fromAmount) {
      console.warn("Swap: Cannot swap - no amount specified")
      return
    }
    if (!rawAmountOut) {
      console.warn("Swap: Cannot swap - no output amount calculated")
      return
    }
    try {
      // Calculate min amount with slippage
      const minOut = (rawAmountOut * BigInt(Math.floor((100 - slippage) * 100))) / BigInt(10000)
      const minOutFormatted = (Number(minOut) / 1e6).toFixed(6)
      await swap(fromToken, fromAmount, minOutFormatted)
    } catch (error) {
      console.error("Swap: Swap error", error)
    }
  }

  // Refetch after successful approve - delay + cache invalidation for reliable update
  useEffect(() => {
    if (approveSuccess) {
      const t1 = setTimeout(() => {
        queryClient.invalidateQueries()
        refetchAllowance()
      }, 2500)
      return () => clearTimeout(t1)
    }
  }, [approveSuccess, queryClient, refetchAllowance])

  // Refetch after successful swap - delay + invalidation so balances/allowance stay in sync
  useEffect(() => {
    if (swapSuccess) {
      const t1 = setTimeout(() => {
        queryClient.invalidateQueries()
        refetchFromBalance()
        refetchToBalance()
        refetchAllowance()
        setFromAmount("")
      }, 3000)
      return () => clearTimeout(t1)
    }
  }, [swapSuccess, queryClient, refetchFromBalance, refetchToBalance, refetchAllowance])

  const isLoading = isApproving || isApprovingConfirm || isSwapping || isSwapConfirm

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Swap</h2>
        <p className="text-muted-foreground mt-1">Trade USDC and EURC with minimal slippage</p>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border glow-border max-w-md">
        {/* From */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <label className="text-sm text-muted-foreground">From</label>
            <span className="text-xs text-muted-foreground">Balance: {fromBalance}</span>
          </div>
          <div className="flex gap-2">
            <select
              value={fromToken}
              onChange={(e) => {
                const newToken = e.target.value as "USDC" | "EURC"
                setFromToken(newToken)
                setToToken(newToken === "USDC" ? "EURC" : "USDC")
              }}
              className="bg-input text-foreground border border-border rounded-lg p-2 w-24"
            >
              <option>USDC</option>
              <option>EURC</option>
            </select>
            <Input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1 bg-input text-foreground border-border"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFromAmount(fromBalance)}
              className="border-border text-accent hover:bg-muted bg-transparent"
            >
              Max
            </Button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center mb-4">
          <Button
            onClick={handleSwapTokens}
            variant="outline"
            className="border-border text-accent hover:bg-muted rounded-full p-2 w-10 h-10 bg-transparent"
          >
            ⇅
          </Button>
        </div>

        {/* To */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <label className="text-sm text-muted-foreground">To</label>
            <span className="text-xs text-muted-foreground">Balance: {toBalance}</span>
          </div>
          <div className="flex gap-2">
            <select
              value={toToken}
              disabled
              className="bg-input text-foreground border border-border rounded-lg p-2 w-24 opacity-60"
            >
              <option>USDC</option>
              <option>EURC</option>
            </select>
            <Input
              type="text"
              placeholder="0.00"
              value={amountOut}
              readOnly
              className="flex-1 bg-input text-foreground border-border"
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm mb-6 pb-6 border-b border-border">
          <div className="flex justify-between text-muted-foreground">
            <span>Price</span>
            <span className="text-foreground">
              1 {fromToken} ≈ {fromToken === "USDC"
                ? (parseFloat(formattedEURC) / parseFloat(formattedUSDC) || 0.92).toFixed(4)
                : (parseFloat(formattedUSDC) / parseFloat(formattedEURC) || 1.08).toFixed(4)
              } {toToken}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Slippage</span>
            <div className="flex gap-1">
              {[0.5, 1, 2].map((s) => (
                <Badge
                  key={s}
                  onClick={() => setSlippage(s)}
                  className={`cursor-pointer ${slippage === s ? 'bg-accent text-background' : 'bg-muted text-foreground'}`}
                >
                  {s}%
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Swap Fee</span>
            <span className="text-foreground">{PROTOCOL.SWAP_FEE_BPS / 100}%</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Min. Received</span>
            <span className="text-foreground">
              {rawAmountOut
                ? (Number(rawAmountOut * BigInt(Math.floor((100 - slippage) * 100)) / BigInt(10000)) / 1e6).toFixed(4)
                : "0.00"
              } {toToken}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {!isConnected ? (
          <Button className="w-full" disabled>
            Connect Wallet
          </Button>
        ) : needsApproval ? (
          <Button
            className="w-full btn-gradient"
            onClick={handleApprove}
            disabled={isLoading || !fromAmount}
          >
            {isApproving || isApprovingConfirm ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              `Approve ${fromToken}`
            )}
          </Button>
        ) : (
          <Button
            className="w-full btn-gradient"
            onClick={handleSwap}
            disabled={isLoading || !fromAmount || parseFloat(fromAmount) <= 0}
          >
            {isSwapping || isSwapConfirm ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : (
              "Swap"
            )}
          </Button>
        )}

        {swapError && (
          <p className="text-xs text-destructive mt-2 text-center">
            {swapError.message.slice(0, 100)}
          </p>
        )}
      </div>

      {/* Pool Info */}
      <div className="bg-card rounded-xl p-4 border border-border max-w-md">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Pool Reserves</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">USDC</p>
            <p className="text-lg font-semibold text-foreground">{formattedUSDC}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">EURC</p>
            <p className="text-lg font-semibold text-foreground">{formattedEURC}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
