"use client"

import { useState, useEffect } from "react"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Loader2 } from "lucide-react"
import { useAccount } from "wagmi"
import {
  useTokenBalance,
  useLPBalance,
  useLPTotalSupply,
  useSwapReserves,
  useAddLiquidity,
  useRemoveLiquidity,
  useApprove,
  useTokenAllowance
} from "@/hooks/use-contracts"
import { ARCDEX, parseTokenAmount } from "@/lib/contracts"

export default function PoolsPage() {
  const [liquidityPercentage, setLiquidityPercentage] = useState(50)
  const [usdcAmount, setUsdcAmount] = useState("")
  const [eurcAmount, setEurcAmount] = useState("")

  const { isConnected } = useAccount()

  // Get real balances
  const { formatted: usdcBalance, isLoading: usdcLoading, refetch: refetchUSDC } = useTokenBalance('USDC')
  const { formatted: eurcBalance, isLoading: eurcLoading, refetch: refetchEURC } = useTokenBalance('EURC')
  const { formatted: lpBalance, balance: lpBalanceRaw, isLoading: lpLoading, refetch: refetchLP } = useLPBalance()
  const { formatted: lpTotalSupply, totalSupply: lpTotalSupplyRaw } = useLPTotalSupply()
  const { formattedUSDC: poolUSDC, formattedEURC: poolEURC, reserveUSDC, reserveEURC } = useSwapReserves()

  // Allowances
  const { allowance: usdcAllowance } = useTokenAllowance('USDC', ARCDEX.Swap)
  const { allowance: eurcAllowance } = useTokenAllowance('EURC', ARCDEX.Swap)

  // Hooks for operations
  const { approve, isPending: approving, isSuccess: approveSuccess } = useApprove()
  const { addLiquidity, isPending: adding, isSuccess: addSuccess, error: addError } = useAddLiquidity()
  const { removeLiquidity, isPending: removing, isSuccess: removeSuccess, error: removeError } = useRemoveLiquidity()

  // Calculate pool share
  const poolShare = lpBalanceRaw && lpTotalSupplyRaw && lpTotalSupplyRaw > BigInt(0)
    ? (Number(lpBalanceRaw) / Number(lpTotalSupplyRaw) * 100).toFixed(2)
    : "0"

  // Calculate LP tokens to receive
  const estimatedLP = usdcAmount ? (Number(usdcAmount) * 1.5).toFixed(2) : "0.00"

  // Calculate amounts to receive on remove
  const lpToRemove = lpBalanceRaw ? (Number(lpBalanceRaw) * liquidityPercentage / 100) : 0
  const usdcToReceive = reserveUSDC && lpTotalSupplyRaw && lpTotalSupplyRaw > BigInt(0)
    ? (Number(reserveUSDC) * lpToRemove / Number(lpTotalSupplyRaw) / 1e6).toFixed(2)
    : "0.00"
  const eurcToReceive = reserveEURC && lpTotalSupplyRaw && lpTotalSupplyRaw > BigInt(0)
    ? (Number(reserveEURC) * lpToRemove / Number(lpTotalSupplyRaw) / 1e6).toFixed(2)
    : "0.00"

  // Check if approvals needed
  const needsUSDCApproval = usdcAmount && usdcAllowance !== undefined &&
    parseTokenAmount(usdcAmount) > usdcAllowance
  const needsEURCApproval = eurcAmount && eurcAllowance !== undefined &&
    parseTokenAmount(eurcAmount) > eurcAllowance

  // Refetch on success
  useEffect(() => {
    if (addSuccess || removeSuccess) {
      refetchUSDC()
      refetchEURC()
      refetchLP()
      setUsdcAmount("")
      setEurcAmount("")
    }
  }, [addSuccess, removeSuccess, refetchUSDC, refetchEURC, refetchLP])

  const handleAddLiquidity = async () => {
    if (!usdcAmount || !eurcAmount) return
    await addLiquidity(usdcAmount, eurcAmount)
  }

  const handleRemoveLiquidity = async () => {
    if (!lpBalanceRaw || liquidityPercentage === 0) return
    const lpAmount = (Number(lpBalanceRaw) * liquidityPercentage / 100 / 1e6).toFixed(6)
    await removeLiquidity(lpAmount)
  }

  const handleApproveUSDC = async () => {
    if (!usdcAmount) return
    await approve('USDC', ARCDEX.Swap, usdcAmount)
  }

  const handleApproveEURC = async () => {
    if (!eurcAmount) return
    await approve('EURC', ARCDEX.Swap, eurcAmount)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Liquidity Pools</h1>
          <p className="text-muted-foreground mt-1">Provide liquidity to pools and earn trading fees.</p>
        </div>
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pool USDC"
          value={poolUSDC || "0.00"}
          subtitle="USDC in pool"
        />
        <StatCard
          title="Pool EURC"
          value={poolEURC || "0.00"}
          subtitle="EURC in pool"
        />
        <StatCard
          title="Your LP"
          value={lpLoading ? "..." : lpBalance}
          subtitle="LP token balance"
        />
        <StatCard
          title="Pool Share"
          value={`${poolShare}%`}
          subtitle="Your share of pool"
        />
      </div>

      {/* Main Pool Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Liquidity Card */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl p-8 border border-border glow-border">
            <h2 className="text-xl font-semibold text-foreground mb-2">USDC / EURC Pool</h2>
            <p className="text-sm text-muted-foreground mb-6">Add liquidity to earn 0.3% on every trade</p>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="usdc-add" className="text-foreground">USDC Amount</Label>
                <Input
                  id="usdc-add"
                  type="number"
                  placeholder="0.00"
                  value={usdcAmount}
                  onChange={(e) => {
                    setUsdcAmount(e.target.value)
                    setEurcAmount(e.target.value ? (Number(e.target.value) * 0.92).toFixed(2) : "")
                  }}
                  className="bg-input text-foreground border-border h-14 text-xl rounded-xl"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Balance: {usdcLoading ? "..." : usdcBalance} USDC
                  </p>
                  {isConnected && (
                    <button
                      onClick={() => setUsdcAmount(usdcBalance.replace(',', ''))}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      MAX
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  +
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="eurc-add" className="text-foreground">EURC Amount</Label>
                <Input
                  id="eurc-add"
                  type="number"
                  placeholder="0.00"
                  value={eurcAmount}
                  onChange={(e) => setEurcAmount(e.target.value)}
                  className="bg-input text-foreground border-border h-14 text-xl rounded-xl"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Balance: {eurcLoading ? "..." : eurcBalance} EURC
                  </p>
                  {isConnected && (
                    <button
                      onClick={() => setEurcAmount(eurcBalance.replace(',', ''))}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      MAX
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-muted-foreground">You will receive</p>
                <p className="text-2xl font-bold text-accent mt-1">
                  {estimatedLP} LP Shares
                </p>
              </div>

              {/* Action Buttons */}
              {!isConnected ? (
                <Button className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl" disabled>
                  Connect Wallet
                </Button>
              ) : needsUSDCApproval ? (
                <Button
                  onClick={handleApproveUSDC}
                  disabled={approving}
                  className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl"
                >
                  {approving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    "Approve USDC"
                  )}
                </Button>
              ) : needsEURCApproval ? (
                <Button
                  onClick={handleApproveEURC}
                  disabled={approving}
                  className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl"
                >
                  {approving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    "Approve EURC"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleAddLiquidity}
                  disabled={adding || !usdcAmount || !eurcAmount}
                  className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl"
                >
                  {adding ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Adding Liquidity...
                    </>
                  ) : (
                    "Add Liquidity"
                  )}
                </Button>
              )}

              {addError && (
                <p className="text-red-400 text-sm text-center">
                  Error: {addError.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
              <div className="flex justify-between items-center border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">LP</div>
                  <span className="text-foreground">LP Tokens</span>
                </div>
                <span className="text-foreground font-medium">
                  {lpLoading ? "..." : lpBalance}
                </span>
              </div>
            </div>
          </div>

          {/* Remove Liquidity */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Remove Liquidity</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Percentage: {liquidityPercentage}%</Label>
                <Slider
                  value={[liquidityPercentage]}
                  onValueChange={(value) => setLiquidityPercentage(value[0])}
                  max={100}
                  step={25}
                  className="w-full mt-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-input rounded-xl p-4">
                <div>
                  <p className="text-xs text-muted-foreground">USDC</p>
                  <p className="text-lg font-bold text-accent">{usdcToReceive}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">EURC</p>
                  <p className="text-lg font-bold text-accent">{eurcToReceive}</p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleRemoveLiquidity}
                disabled={removing || !lpBalanceRaw || lpBalanceRaw === BigInt(0)}
                className="w-full border-border text-foreground hover:bg-muted"
              >
                {removing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove Liquidity"
                )}
              </Button>

              {removeError && (
                <p className="text-red-400 text-xs text-center">
                  Error: {removeError.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
