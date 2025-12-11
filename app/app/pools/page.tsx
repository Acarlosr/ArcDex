"use client"

import { useState, useEffect } from "react"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Loader2, Lock } from "lucide-react"
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
import { ARCDEX, POOLS, PoolPair, parseTokenAmount } from "@/lib/contracts"

export default function PoolsPage() {
  const [selectedPool, setSelectedPool] = useState<PoolPair>("USDC_EURC")
  const [liquidityPercentage, setLiquidityPercentage] = useState(50)
  const [amount0, setAmount0] = useState("")
  const [amount1, setAmount1] = useState("")

  const { isConnected } = useAccount()
  const pool = POOLS[selectedPool]

  // Get real balances for all tokens
  const { formatted: usdcBalance, isLoading: usdcLoading, refetch: refetchUSDC } = useTokenBalance('USDC')
  const { formatted: eurcBalance, isLoading: eurcLoading, refetch: refetchEURC } = useTokenBalance('EURC')
  const { formatted: usycBalance, isLoading: usycLoading, refetch: refetchUSYC } = useTokenBalance('USYC')
  const { formatted: lpBalance, balance: lpBalanceRaw, isLoading: lpLoading, refetch: refetchLP } = useLPBalance()
  const { totalSupply: lpTotalSupplyRaw } = useLPTotalSupply()
  const { formattedUSDC: poolUSDC, formattedEURC: poolEURC, reserveUSDC, reserveEURC } = useSwapReserves()

  // Get balance for selected pool tokens
  const getBalance = (token: string) => {
    if (token === 'USDC') return { balance: usdcBalance, loading: usdcLoading }
    if (token === 'EURC') return { balance: eurcBalance, loading: eurcLoading }
    if (token === 'USYC') return { balance: usycBalance, loading: usycLoading }
    return { balance: '0.00', loading: false }
  }

  const token0Balance = getBalance(pool.token0)
  const token1Balance = getBalance(pool.token1)

  // Allowances (only for enabled pools)
  const { allowance: token0Allowance } = useTokenAllowance(
    pool.token0 as 'USDC' | 'EURC',
    pool.swapContract
  )
  const { allowance: token1Allowance } = useTokenAllowance(
    pool.token1 as 'USDC' | 'EURC',
    pool.swapContract
  )

  // Hooks for operations
  const { approve, isPending: approving } = useApprove()
  const { addLiquidity, isPending: adding, isSuccess: addSuccess, error: addError } = useAddLiquidity()
  const { removeLiquidity, isPending: removing, isSuccess: removeSuccess, error: removeError } = useRemoveLiquidity()

  // Calculate pool share
  const poolShare = lpBalanceRaw && lpTotalSupplyRaw && lpTotalSupplyRaw > BigInt(0)
    ? (Number(lpBalanceRaw) / Number(lpTotalSupplyRaw) * 100).toFixed(2)
    : "0"

  // Calculate LP tokens to receive
  const estimatedLP = amount0 ? (Number(amount0) * 1.5).toFixed(2) : "0.00"

  // Calculate amounts to receive on remove
  const lpToRemove = lpBalanceRaw ? (Number(lpBalanceRaw) * liquidityPercentage / 100) : 0
  const amount0ToReceive = reserveUSDC && lpTotalSupplyRaw && lpTotalSupplyRaw > BigInt(0)
    ? (Number(reserveUSDC) * lpToRemove / Number(lpTotalSupplyRaw) / 1e6).toFixed(2)
    : "0.00"
  const amount1ToReceive = reserveEURC && lpTotalSupplyRaw && lpTotalSupplyRaw > BigInt(0)
    ? (Number(reserveEURC) * lpToRemove / Number(lpTotalSupplyRaw) / 1e6).toFixed(2)
    : "0.00"

  // Check if approvals needed
  const needsToken0Approval = pool.enabled && amount0 && token0Allowance !== undefined &&
    parseTokenAmount(amount0) > token0Allowance
  const needsToken1Approval = pool.enabled && amount1 && token1Allowance !== undefined &&
    parseTokenAmount(amount1) > token1Allowance

  // Refetch on success
  useEffect(() => {
    if (addSuccess || removeSuccess) {
      refetchUSDC()
      refetchEURC()
      refetchUSYC()
      refetchLP()
      setAmount0("")
      setAmount1("")
    }
  }, [addSuccess, removeSuccess, refetchUSDC, refetchEURC, refetchUSYC, refetchLP])

  const handleAddLiquidity = async () => {
    if (!amount0 || !amount1 || !pool.enabled) return
    await addLiquidity(amount0, amount1)
  }

  const handleRemoveLiquidity = async () => {
    if (!lpBalanceRaw || liquidityPercentage === 0 || !pool.enabled) return
    const lpAmount = (Number(lpBalanceRaw) * liquidityPercentage / 100 / 1e6).toFixed(6)
    await removeLiquidity(lpAmount)
  }

  const handleApproveToken0 = async () => {
    if (!amount0 || !pool.enabled) return
    await approve(pool.token0 as 'USDC' | 'EURC', pool.swapContract, amount0)
  }

  const handleApproveToken1 = async () => {
    if (!amount1 || !pool.enabled) return
    await approve(pool.token1 as 'USDC' | 'EURC', pool.swapContract, amount1)
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

      {/* Pool Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(Object.keys(POOLS) as PoolPair[]).map((poolKey) => {
          const p = POOLS[poolKey]
          const isSelected = selectedPool === poolKey
          return (
            <button
              key={poolKey}
              onClick={() => {
                setSelectedPool(poolKey)
                setAmount0("")
                setAmount1("")
              }}
              className={`relative p-6 rounded-2xl border transition-all text-left ${isSelected
                ? 'bg-gradient-to-br from-sky-500/20 to-cyan-400/20 border-cyan-500/50 glow-border'
                : 'bg-card border-border hover:border-cyan-500/30'
                } ${!p.enabled ? 'opacity-60' : ''}`}
            >
              {!p.enabled && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{p.icon}</span>
                <span className="text-lg font-semibold text-foreground">{p.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">APR</span>
                <span className="text-accent font-semibold">{p.apr}%</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Status</span>
                <span className={p.enabled ? 'text-green-400' : 'text-yellow-400'}>
                  {p.enabled ? 'Active' : 'Coming Soon'}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title={`Pool ${pool.token0}`} value={pool.enabled ? poolUSDC || "0.00" : "—"} subtitle={`${pool.token0} in pool`} />
        <StatCard title={`Pool ${pool.token1}`} value={pool.enabled ? poolEURC || "0.00" : "—"} subtitle={`${pool.token1} in pool`} />
        <StatCard title="Your LP" value={pool.enabled ? (lpLoading ? "..." : lpBalance) : "—"} subtitle="LP token balance" />
        <StatCard title="Pool Share" value={pool.enabled ? `${poolShare}%` : "—"} subtitle="Your share of pool" />
      </div>

      {/* My Pools Section */}
      {isConnected && lpBalanceRaw && lpBalanceRaw > BigInt(0) && (
        <div className="bg-card rounded-2xl p-6 border border-border mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">💼</span>
            My Pools
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Pool</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">LP Tokens</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">USDC</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">EURC</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Share</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💱</span>
                      <span className="font-medium text-foreground">USDC / EURC</span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 font-mono text-foreground">
                    {lpBalance}
                  </td>
                  <td className="text-right py-4 px-4 text-foreground">
                    {reserveUSDC && lpBalanceRaw && lpTotalSupplyRaw && lpTotalSupplyRaw > BigInt(0)
                      ? (Number(reserveUSDC) * Number(lpBalanceRaw) / Number(lpTotalSupplyRaw) / 1e6).toFixed(2)
                      : "0.00"
                    }
                  </td>
                  <td className="text-right py-4 px-4 text-foreground">
                    {reserveEURC && lpBalanceRaw && lpTotalSupplyRaw && lpTotalSupplyRaw > BigInt(0)
                      ? (Number(reserveEURC) * Number(lpBalanceRaw) / Number(lpTotalSupplyRaw) / 1e6).toFixed(2)
                      : "0.00"
                    }
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className="text-accent font-semibold">{poolShare}%</span>
                  </td>
                  <td className="text-right py-4 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPool("USDC_EURC")
                        setLiquidityPercentage(100)
                        // Scroll to remove section
                        document.getElementById('remove-liquidity')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      Remove
                    </Button>
                  </td>
                </tr>

                {/* Placeholder rows for future pools */}
                {/*
                <tr className="border-b border-border/50 opacity-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📈</span>
                      <span className="font-medium text-foreground">USYC / USDC</span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-right py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-right py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-right py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-right py-4 px-4 text-muted-foreground text-xs">Coming Soon</td>
                </tr>
                */}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-xl">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Value Deposited</p>
                <p className="text-2xl font-bold text-foreground">
                  ${reserveUSDC && reserveEURC && lpBalanceRaw && lpTotalSupplyRaw && lpTotalSupplyRaw > BigInt(0)
                    ? (
                      (Number(reserveUSDC) * Number(lpBalanceRaw) / Number(lpTotalSupplyRaw) / 1e6) +
                      (Number(reserveEURC) * Number(lpBalanceRaw) / Number(lpTotalSupplyRaw) / 1e6)
                    ).toFixed(2)
                    : "0.00"
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Estimated APR Earnings (Year)</p>
                <p className="text-xl font-bold text-accent">
                  +${reserveUSDC && reserveEURC && lpBalanceRaw && lpTotalSupplyRaw && lpTotalSupplyRaw > BigInt(0)
                    ? (
                      ((Number(reserveUSDC) * Number(lpBalanceRaw) / Number(lpTotalSupplyRaw) / 1e6) +
                        (Number(reserveEURC) * Number(lpBalanceRaw) / Number(lpTotalSupplyRaw) / 1e6)) * 0.124
                    ).toFixed(2)
                    : "0.00"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Pool Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Liquidity Card */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl p-8 border border-border glow-border">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{pool.icon}</span>
              <h2 className="text-xl font-semibold text-foreground">{pool.name} Pool</h2>
              {!pool.enabled && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Coming Soon</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-6">Add liquidity to earn {pool.apr}% APR on trades</p>

            {pool.enabled ? (
              <div className="space-y-6">
                {/* Token 0 Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-foreground">{pool.token0} Amount</Label>
                    {amount0 && !needsToken0Approval && (
                      <span className="text-xs text-green-400">✓ Approved</span>
                    )}
                  </div>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount0}
                    onChange={(e) => {
                      setAmount0(e.target.value)
                      setAmount1(e.target.value ? (Number(e.target.value) * 0.92).toFixed(2) : "")
                    }}
                    className="bg-input text-foreground border-border h-14 text-xl rounded-xl"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Balance: {token0Balance.loading ? "..." : token0Balance.balance} {pool.token0}
                    </p>
                    {isConnected && (
                      <button
                        onClick={() => setAmount0(token0Balance.balance.replace(',', ''))}
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        MAX
                      </button>
                    )}
                  </div>
                </div>

                {/* Combine Icon */}
                <div className="flex flex-col items-center gap-1 my-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500/20 to-cyan-400/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xl">
                    +
                  </div>
                  <span className="text-xs text-muted-foreground">Combine tokens</span>
                </div>

                {/* Token 1 Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-foreground">{pool.token1} Amount</Label>
                    {amount1 && !needsToken1Approval && (
                      <span className="text-xs text-green-400">✓ Approved</span>
                    )}
                  </div>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount1}
                    onChange={(e) => setAmount1(e.target.value)}
                    className="bg-input text-foreground border-border h-14 text-xl rounded-xl"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Balance: {token1Balance.loading ? "..." : token1Balance.balance} {pool.token1}
                    </p>
                    {isConnected && (
                      <button
                        onClick={() => setAmount1(token1Balance.balance.replace(',', ''))}
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        MAX
                      </button>
                    )}
                  </div>
                </div>

                {/* LP Estimate */}
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">You will receive</p>
                  <p className="text-2xl font-bold text-accent mt-1">{estimatedLP} LP Shares</p>
                </div>

                {/* Action Buttons */}
                {!isConnected ? (
                  <Button className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl" disabled>
                    Connect Wallet
                  </Button>
                ) : needsToken0Approval ? (
                  <Button
                    onClick={handleApproveToken0}
                    disabled={approving}
                    className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl"
                  >
                    {approving ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Approving...</>
                    ) : (
                      `Approve ${pool.token0}`
                    )}
                  </Button>
                ) : needsToken1Approval ? (
                  <Button
                    onClick={handleApproveToken1}
                    disabled={approving}
                    className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl"
                  >
                    {approving ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Approving...</>
                    ) : (
                      `Approve ${pool.token1}`
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleAddLiquidity}
                    disabled={adding || !amount0 || !amount1}
                    className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl"
                  >
                    {adding ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding Liquidity...</>
                    ) : (
                      "Add Liquidity"
                    )}
                  </Button>
                )}

                {addError && (
                  <p className="text-red-400 text-sm text-center">Error: {addError.message}</p>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  The {pool.name} pool will be available after the USYC contracts are deployed.
                </p>
              </div>
            )}
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
                <span className="text-foreground font-medium">{usdcLoading ? "..." : usdcBalance}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">€</div>
                  <span className="text-foreground">EURC</span>
                </div>
                <span className="text-foreground font-medium">{eurcLoading ? "..." : eurcBalance}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">Y</div>
                  <span className="text-foreground">USYC</span>
                </div>
                <span className="text-foreground font-medium">{usycLoading ? "..." : usycBalance}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">LP</div>
                  <span className="text-foreground">LP Tokens</span>
                </div>
                <span className="text-foreground font-medium">{lpLoading ? "..." : lpBalance}</span>
              </div>
            </div>
          </div>

          {/* Remove Liquidity */}
          {pool.enabled && (
            <div id="remove-liquidity" className="bg-card rounded-2xl p-6 border border-border">
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
                    <p className="text-xs text-muted-foreground">{pool.token0}</p>
                    <p className="text-lg font-bold text-accent">{amount0ToReceive}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{pool.token1}</p>
                    <p className="text-lg font-bold text-accent">{amount1ToReceive}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleRemoveLiquidity}
                  disabled={removing || !lpBalanceRaw || lpBalanceRaw === BigInt(0)}
                  className="w-full border-border text-foreground hover:bg-muted"
                >
                  {removing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Removing...</>
                  ) : (
                    "Remove Liquidity"
                  )}
                </Button>

                {removeError && (
                  <p className="text-red-400 text-xs text-center">Error: {removeError.message}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
