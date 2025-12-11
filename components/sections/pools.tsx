"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Loader2 } from "lucide-react"
import {
  useTokenBalance,
  useTokenAllowance,
  useApprove,
  useSwapReserves,
  useLPBalance,
  useLPTotalSupply,
  useAddLiquidity,
  useRemoveLiquidity,
} from "@/hooks/use-contracts"
import { ARCDEX, PROTOCOL } from "@/lib/contracts"

export function PoolsSection() {
  const { isConnected } = useAccount()
  const [usdcAmount, setUsdcAmount] = useState("")
  const [eurcAmount, setEurcAmount] = useState("")
  const [liquidityPercentage, setLiquidityPercentage] = useState(50)

  // Balances
  const { formatted: usdcBalance, refetch: refetchUsdc } = useTokenBalance("USDC")
  const { formatted: eurcBalance, refetch: refetchEurc } = useTokenBalance("EURC")
  const { formatted: lpBalance, balance: rawLpBalance, refetch: refetchLp } = useLPBalance()
  const { formatted: lpTotalSupply } = useLPTotalSupply()

  // Allowances
  const { allowance: usdcAllowance, refetch: refetchUsdcAllowance } = useTokenAllowance("USDC", ARCDEX.Swap)
  const { allowance: eurcAllowance, refetch: refetchEurcAllowance } = useTokenAllowance("EURC", ARCDEX.Swap)

  // Pool reserves
  const { reserveUSDC, reserveEURC, formattedUSDC, formattedEURC, refetch: refetchReserves } = useSwapReserves()

  // Actions
  const { approve: approveUsdc, isPending: isApprovingUsdc, isConfirming: isConfirmingUsdc, isSuccess: approveUsdcSuccess } = useApprove()
  const { approve: approveEurc, isPending: isApprovingEurc, isConfirming: isConfirmingEurc, isSuccess: approveEurcSuccess } = useApprove()
  const { addLiquidity, isPending: isAdding, isConfirming: isAddingConfirm, isSuccess: addSuccess, error: addError } = useAddLiquidity()
  const { removeLiquidity, isPending: isRemoving, isConfirming: isRemovingConfirm, isSuccess: removeSuccess } = useRemoveLiquidity()

  // Check approvals
  const parsedUsdc = usdcAmount ? BigInt(Math.floor(parseFloat(usdcAmount) * 1e6)) : BigInt(0)
  const parsedEurc = eurcAmount ? BigInt(Math.floor(parseFloat(eurcAmount) * 1e6)) : BigInt(0)
  const needsUsdcApproval = usdcAllowance !== undefined && parsedUsdc > BigInt(0) && usdcAllowance < parsedUsdc
  const needsEurcApproval = eurcAllowance !== undefined && parsedEurc > BigInt(0) && eurcAllowance < parsedEurc

  // Calculate LP tokens to receive
  const estimatedLpTokens = () => {
    if (!usdcAmount || !eurcAmount || !reserveUSDC || !reserveEURC) return "0.00"
    const lpFromUsdc = (parsedUsdc * BigInt(lpTotalSupply ? Math.floor(parseFloat(lpTotalSupply) * 1e6) : 0)) / (reserveUSDC || BigInt(1))
    const lpFromEurc = (parsedEurc * BigInt(lpTotalSupply ? Math.floor(parseFloat(lpTotalSupply) * 1e6) : 0)) / (reserveEURC || BigInt(1))
    const minLp = lpFromUsdc < lpFromEurc ? lpFromUsdc : lpFromEurc
    return (Number(minLp) / 1e6).toFixed(2)
  }

  // Calculate amounts to receive on remove
  const lpToRemove = rawLpBalance ? (rawLpBalance * BigInt(liquidityPercentage)) / BigInt(100) : BigInt(0)
  const usdcToReceive = reserveUSDC && rawLpBalance && lpTotalSupply
    ? (lpToRemove * reserveUSDC) / BigInt(Math.floor(parseFloat(lpTotalSupply) * 1e6) || 1)
    : BigInt(0)
  const eurcToReceive = reserveEURC && rawLpBalance && lpTotalSupply
    ? (lpToRemove * reserveEURC) / BigInt(Math.floor(parseFloat(lpTotalSupply) * 1e6) || 1)
    : BigInt(0)

  // Handlers
  const handleApproveUsdc = () => approveUsdc("USDC", ARCDEX.Swap, "999999999999")
  const handleApproveEurc = () => approveEurc("EURC", ARCDEX.Swap, "999999999999")

  const handleAddLiquidity = async () => {
    if (!usdcAmount || !eurcAmount) return
    await addLiquidity(usdcAmount, eurcAmount)
  }

  const handleRemoveLiquidity = async () => {
    if (!rawLpBalance || liquidityPercentage === 0) return
    const lpAmount = (Number(lpToRemove) / 1e6).toFixed(6)
    await removeLiquidity(lpAmount)
  }

  // Refresh after actions
  useEffect(() => {
    if (approveUsdcSuccess) refetchUsdcAllowance()
  }, [approveUsdcSuccess, refetchUsdcAllowance])

  useEffect(() => {
    if (approveEurcSuccess) refetchEurcAllowance()
  }, [approveEurcSuccess, refetchEurcAllowance])

  useEffect(() => {
    if (addSuccess) {
      refetchUsdc()
      refetchEurc()
      refetchLp()
      refetchReserves()
      setUsdcAmount("")
      setEurcAmount("")
    }
  }, [addSuccess, refetchUsdc, refetchEurc, refetchLp, refetchReserves])

  useEffect(() => {
    if (removeSuccess) {
      refetchUsdc()
      refetchEurc()
      refetchLp()
      refetchReserves()
    }
  }, [removeSuccess, refetchUsdc, refetchEurc, refetchLp, refetchReserves])

  const isLoading = isApprovingUsdc || isConfirmingUsdc || isApprovingEurc || isConfirmingEurc ||
    isAdding || isAddingConfirm || isRemoving || isRemovingConfirm

  // Calculate TVL and APR
  const tvl = reserveUSDC && reserveEURC
    ? (Number(reserveUSDC) / 1e6 + Number(reserveEURC) / 1e6).toFixed(2)
    : "0.00"
  const myLiquidity = rawLpBalance && lpTotalSupply && parseFloat(lpTotalSupply) > 0
    ? ((Number(rawLpBalance) / 1e6 / parseFloat(lpTotalSupply)) * parseFloat(tvl)).toFixed(2)
    : "0.00"

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Pools</h2>
        <p className="text-muted-foreground">Provide liquidity to earn fees from swaps</p>
      </div>

      {/* Pool Stats */}
      <div className="bg-card rounded-xl p-6 border border-border glow-border">
        <h3 className="text-xl font-semibold text-foreground mb-6">USDC / EURC Pool</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard title="TVL" value={`$${tvl}`} />
          <StatCard title="My Liquidity" value={`$${myLiquidity}`} subtitle={`${lpBalance} LP`} />
          <StatCard title="APR" value={`${(PROTOCOL.SWAP_FEE_BPS / 100 * 365).toFixed(1)}%`} subtitle="From swap fees" />
        </div>

        {/* Add/Remove Tabs */}
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted border-border mb-6">
            <TabsTrigger value="add">Add Liquidity</TabsTrigger>
            <TabsTrigger value="remove">Remove Liquidity</TabsTrigger>
          </TabsList>

          {/* Add Liquidity */}
          <TabsContent value="add" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="usdc-add" className="text-foreground">USDC Amount</Label>
                <span className="text-xs text-muted-foreground">Balance: {usdcBalance}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="usdc-add"
                  type="number"
                  placeholder="0.00"
                  value={usdcAmount}
                  onChange={(e) => setUsdcAmount(e.target.value)}
                  className="bg-input text-foreground border-border flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUsdcAmount(usdcBalance)}
                  className="border-border text-accent hover:bg-muted bg-transparent"
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="eurc-add" className="text-foreground">EURC Amount</Label>
                <span className="text-xs text-muted-foreground">Balance: {eurcBalance}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="eurc-add"
                  type="number"
                  placeholder="0.00"
                  value={eurcAmount}
                  onChange={(e) => setEurcAmount(e.target.value)}
                  className="bg-input text-foreground border-border flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEurcAmount(eurcBalance)}
                  className="border-border text-accent hover:bg-muted bg-transparent"
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <p className="text-xs text-muted-foreground">You will receive</p>
              <p className="text-2xl font-bold text-accent mt-1">{estimatedLpTokens()} LP Tokens</p>
            </div>

            {!isConnected ? (
              <Button className="w-full" disabled>Connect Wallet</Button>
            ) : needsUsdcApproval ? (
              <Button className="w-full btn-gradient" onClick={handleApproveUsdc} disabled={isLoading}>
                {isApprovingUsdc || isConfirmingUsdc ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Approving USDC...</>
                ) : (
                  "Approve USDC"
                )}
              </Button>
            ) : needsEurcApproval ? (
              <Button className="w-full btn-gradient" onClick={handleApproveEurc} disabled={isLoading}>
                {isApprovingEurc || isConfirmingEurc ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Approving EURC...</>
                ) : (
                  "Approve EURC"
                )}
              </Button>
            ) : (
              <Button
                className="w-full btn-gradient"
                onClick={handleAddLiquidity}
                disabled={isLoading || !usdcAmount || !eurcAmount}
              >
                {isAdding || isAddingConfirm ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding Liquidity...</>
                ) : (
                  "Add Liquidity"
                )}
              </Button>
            )}

            {addError && (
              <p className="text-xs text-destructive text-center">{addError.message.slice(0, 100)}</p>
            )}
          </TabsContent>

          {/* Remove Liquidity */}
          <TabsContent value="remove" className="space-y-4">
            <div className="bg-muted rounded-lg p-4 mb-4">
              <p className="text-xs text-muted-foreground">LP Balance</p>
              <p className="text-2xl font-bold text-foreground mt-1">{lpBalance} LP Tokens</p>
            </div>

            <div className="space-y-3">
              <Label className="text-foreground">Percentage: {liquidityPercentage}%</Label>
              <Slider
                value={[liquidityPercentage]}
                onValueChange={(value) => setLiquidityPercentage(value[0])}
                max={100}
                step={25}
                className="w-full"
              />
              <div className="flex justify-between">
                {[25, 50, 75, 100].map((p) => (
                  <Button
                    key={p}
                    variant="outline"
                    size="sm"
                    onClick={() => setLiquidityPercentage(p)}
                    className={`${liquidityPercentage === p ? 'border-accent' : 'border-border'} bg-transparent`}
                  >
                    {p}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-input rounded-lg p-4">
              <div>
                <p className="text-xs text-muted-foreground">You will receive (USDC)</p>
                <p className="text-lg font-bold text-accent">{(Number(usdcToReceive) / 1e6).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">You will receive (EURC)</p>
                <p className="text-lg font-bold text-accent">{(Number(eurcToReceive) / 1e6).toFixed(2)}</p>
              </div>
            </div>

            <Button
              className="w-full btn-gradient"
              onClick={handleRemoveLiquidity}
              disabled={isLoading || liquidityPercentage === 0 || !rawLpBalance || rawLpBalance === BigInt(0) || !isConnected}
            >
              {isRemoving || isRemovingConfirm ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Removing Liquidity...</>
              ) : (
                "Remove Liquidity"
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      {/* Pool Reserves */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Pool Reserves</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground">USDC Reserve</p>
            <p className="text-xl font-bold text-foreground">{formattedUSDC}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground">EURC Reserve</p>
            <p className="text-xl font-bold text-foreground">{formattedEURC}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
