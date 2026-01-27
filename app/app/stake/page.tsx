"use client"

import { useState, useEffect } from "react"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useAccount } from "wagmi"
import {
  useTokenBalance,
  useStakedBalance,
  usePendingRewards,
  useAPR,
  useTotalStaked,
  useStake,
  useUnstake,
  useClaimRewards,
  useApprove,
  useTokenAllowance
} from "@/hooks/use-contracts"
import { ARCDEX, parseTokenAmount } from "@/lib/contracts"
import { MobileWalletHint } from "@/components/mobile-wallet-hint"
import { PriceChart } from "@/components/price-chart"

export default function StakePage() {
  const [selectedToken, setSelectedToken] = useState<"USDC" | "EURC">("USDC")
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")

  const { isConnected } = useAccount()

  // Token balances
  const { formatted: usdcBalance, isLoading: usdcLoading, refetch: refetchUSDC } = useTokenBalance('USDC')
  const { formatted: eurcBalance, isLoading: eurcLoading, refetch: refetchEURC } = useTokenBalance('EURC')

  const selectedBalance = selectedToken === 'USDC' ? usdcBalance : eurcBalance
  const selectedLoading = selectedToken === 'USDC' ? usdcLoading : eurcLoading

  // Staked balances
  const { formatted: stakedUSDC, refetch: refetchStakedUSDC } = useStakedBalance('USDC')
  const { formatted: stakedEURC, refetch: refetchStakedEURC } = useStakedBalance('EURC')
  const selectedStaked = selectedToken === 'USDC' ? stakedUSDC : stakedEURC

  // Pending rewards
  const { formatted: usdcRewards, refetch: refetchUSDCRewards } = usePendingRewards('USDC')
  const { formatted: eurcRewards, refetch: refetchEURCRewards } = usePendingRewards('EURC')

  // APR data - use fallback static values if contract returns 0
  const { baseAPR: contractBaseAPR, boostAPR: contractBoostAPR, totalAPR: contractTotalAPR } = useAPR(selectedToken)

  // Fallback APR values (from PROTOCOL constants)
  const fallbackAPR = {
    USDC: { base: 8, boost: 2, total: 10 },
    EURC: { base: 6, boost: 2, total: 8 },
  }

  const baseAPR = contractBaseAPR > 0 ? contractBaseAPR : fallbackAPR[selectedToken].base
  const boostAPR = contractBoostAPR > 0 ? contractBoostAPR : fallbackAPR[selectedToken].boost
  const totalAPR = contractTotalAPR > 0 ? contractTotalAPR : fallbackAPR[selectedToken].total

  // Total staked in protocol
  const { formatted: totalStakedUSDC } = useTotalStaked('USDC')
  const { formatted: totalStakedEURC } = useTotalStaked('EURC')

  // Allowance
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(selectedToken, ARCDEX.Staking)

  // Operations
  const { approve, isPending: approving, isSuccess: approveSuccess, hash: approveHash } = useApprove()
  const { stake, isPending: staking, isSuccess: stakeSuccess, error: stakeError } = useStake()
  const { unstake, isPending: unstaking, isSuccess: unstakeSuccess, error: unstakeError } = useUnstake()
  const { claimAllRewards, isPending: claiming, isSuccess: claimSuccess } = useClaimRewards()

  // Check if approval needed
  const needsApproval = stakeAmount && allowance !== undefined &&
    parseTokenAmount(stakeAmount) > allowance

  // Refetch allowance when token changes
  useEffect(() => {
    refetchAllowance()
  }, [selectedToken, refetchAllowance])

  // Refetch allowance after approval (using hash as trigger for each new approval)
  useEffect(() => {
    if (approveSuccess && approveHash) {
      // Small delay to ensure blockchain state is updated
      const timer = setTimeout(() => {
        refetchAllowance()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [approveSuccess, approveHash, refetchAllowance])

  // Refetch all on success
  useEffect(() => {
    if (stakeSuccess || unstakeSuccess || claimSuccess) {
      refetchUSDC()
      refetchEURC()
      refetchStakedUSDC()
      refetchStakedEURC()
      refetchUSDCRewards()
      refetchEURCRewards()
      refetchAllowance()
      setStakeAmount("")
      setUnstakeAmount("")
    }
  }, [stakeSuccess, unstakeSuccess, claimSuccess, refetchUSDC, refetchEURC, refetchStakedUSDC, refetchStakedEURC, refetchUSDCRewards, refetchEURCRewards, refetchAllowance])

  // Calculate estimated earnings
  const estimatedEarnings = stakeAmount && totalAPR
    ? (parseFloat(stakeAmount) * totalAPR / 100).toFixed(2)
    : "0.00"

  // Calculate total staked value
  const totalStakedValue = (parseFloat(stakedUSDC.replace(',', '')) || 0) + (parseFloat(stakedEURC.replace(',', '')) || 0)

  // Handlers
  const handleApprove = async () => {
    if (!stakeAmount) return
    await approve(selectedToken, ARCDEX.Staking, stakeAmount)
  }

  const handleStake = async () => {
    if (!stakeAmount) return
    await stake(selectedToken, stakeAmount)
  }

  const handleUnstake = async () => {
    if (!unstakeAmount) return
    await unstake(selectedToken, unstakeAmount)
  }

  const handleClaimAll = async () => {
    await claimAllRewards()
  }

  const handleMaxStake = () => {
    setStakeAmount(selectedBalance.replace(',', ''))
  }

  const handleMaxUnstake = () => {
    setUnstakeAmount(selectedStaked.replace(',', ''))
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stake & Earn</h1>
          <p className="text-muted-foreground mt-1">Stake your USDC or EURC to earn annual yield on Arc Testnet.</p>
        </div>
      </div>

      <MobileWalletHint />

      {/* Staking Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stake Card */}
        <div className="bg-card rounded-2xl p-8 border border-border glow-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">Stake Tokens</h2>

          <div className="space-y-4 mb-6">
            {/* Token Selection */}
            <div className="space-y-2">
              <Label htmlFor="token-select" className="text-foreground">Token</Label>
              <select
                id="token-select"
                value={selectedToken}
                onChange={(e) => {
                  setSelectedToken(e.target.value as "USDC" | "EURC")
                  setStakeAmount("")
                }}
                className="w-full bg-input text-foreground border border-border rounded-xl p-4 text-lg"
              >
                <option value="USDC">USDC</option>
                <option value="EURC">EURC</option>
              </select>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="stake-amount" className="text-foreground">Amount</Label>
              <div className="flex gap-3">
                <Input
                  id="stake-amount"
                  type="number"
                  placeholder="0.00"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="bg-input text-foreground border-border flex-1 h-14 text-xl rounded-xl"
                />
                <Button
                  onClick={handleMaxStake}
                  variant="outline"
                  className="border-border text-accent hover:bg-muted bg-transparent h-14 px-6"
                >
                  Max
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Balance: {selectedLoading ? "..." : selectedBalance} {selectedToken}
              </p>
            </div>
          </div>

          {/* APR Info */}
          <div className="bg-muted rounded-xl p-4 space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base APR</span>
              <span className="text-accent font-semibold">{baseAPR}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Boost APR</span>
              <span className="text-accent font-semibold">+{boostAPR}%</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-3">
              <span className="text-muted-foreground">Total APR</span>
              <span className="text-accent font-bold">{totalAPR}%</span>
            </div>
          </div>

          {/* Estimated Earnings */}
          <div className="bg-input rounded-xl p-4 mb-6">
            <p className="text-xs text-muted-foreground mb-1">Estimated Earnings Per Year</p>
            <p className="text-2xl font-bold text-accent">
              {estimatedEarnings} {selectedToken}
            </p>
          </div>

          {/* Stake Button */}
          {!isConnected ? (
            <Button className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl" disabled>
              Connect Wallet
            </Button>
          ) : needsApproval ? (
            <Button
              onClick={handleApprove}
              disabled={approving || !stakeAmount}
              className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl"
            >
              {approving ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Approving...</>
              ) : (
                `Approve ${selectedToken}`
              )}
            </Button>
          ) : (
            <Button
              onClick={handleStake}
              disabled={staking || !stakeAmount || parseFloat(stakeAmount) <= 0}
              className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl"
            >
              {staking ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Staking...</>
              ) : (
                `Stake ${selectedToken}`
              )}
            </Button>
          )}

          {stakeError && (
            <p className="text-red-400 text-sm text-center mt-4">Error: {stakeError.message}</p>
          )}
        </div>

        {/* Right Column - Position & Actions */}
        <div className="space-y-6">
          {/* Your Position */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Your Position</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Staked USDC</span>
                <span className="text-foreground font-medium">{stakedUSDC}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Staked EURC</span>
                <span className="text-foreground font-medium">{stakedEURC}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Total Value</span>
                <span className="text-foreground font-bold">${totalStakedValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Pending Rewards */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Pending Rewards</h3>
              <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">Testnet</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">USDC Rewards</span>
                <span className="text-accent font-semibold">{usdcRewards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">EURC Rewards</span>
                <span className="text-accent font-semibold">{eurcRewards}</span>
              </div>
            </div>

            {/* Info about rewards */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <p className="flex items-center gap-1">
                <span>ℹ️</span>
                Rewards accumulate based on APR. Claim requires treasury to be configured.
              </p>
            </div>

            <Button
              onClick={handleClaimAll}
              disabled={claiming || (usdcRewards === '0.00' && eurcRewards === '0.00')}
              className="w-full mt-4 btn-gradient"
            >
              {claiming ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Claiming...</>
              ) : (
                "Claim All Rewards"
              )}
            </Button>
          </div>

          {/* Unstake */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Unstake {selectedToken}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Withdraw your staked tokens. No lock period on Arc Testnet.
            </p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  className="bg-input text-foreground border-border flex-1 rounded-xl"
                />
                <Button
                  onClick={handleMaxUnstake}
                  variant="outline"
                  size="sm"
                  className="border-border text-accent hover:bg-muted bg-transparent"
                >
                  Max
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Staked: {selectedStaked} {selectedToken}
              </p>
              <Button
                onClick={handleUnstake}
                disabled={unstaking || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                variant="outline"
                className="w-full border-border text-foreground hover:bg-muted"
              >
                {unstaking ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Unstaking...</>
                ) : (
                  "Unstake Tokens"
                )}
              </Button>
              {unstakeError && (
                <p className="text-red-400 text-xs text-center">Error: {unstakeError.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* APY Chart - Below Stake Button */}
      <div className="mt-8 mb-8">
        <PriceChart
          title="APY Evolution"
          subtitle={`Current: ${totalAPR.toFixed(2)}% APR`}
          currentValue={`${totalAPR.toFixed(2)}%`}
          type="apy"
          height={250}
        />
      </div>

      {/* Stats - Below Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total USDC Staked"
          value={totalStakedUSDC}
          subtitle="In staking contract"
        />
        <StatCard
          title="Total EURC Staked"
          value={totalStakedEURC}
          subtitle="In staking contract"
        />
        <StatCard
          title="Your Staked"
          value={`$${totalStakedValue.toFixed(2)}`}
          subtitle="USDC + EURC value"
        />
        <StatCard
          title="APR"
          value={`${totalAPR.toFixed(0)}%`}
          subtitle="USDC staking rate"
        />
      </div>
    </div>
  )
}
