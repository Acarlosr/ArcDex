"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import {
  useTokenBalance,
  useTokenAllowance,
  useApprove,
  useStakedBalance,
  usePendingRewards,
  useAPR,
  useTotalStaked,
  useStake,
  useUnstake,
  useClaimRewards,
} from "@/hooks/use-contracts"
import { ARCDEX } from "@/lib/contracts"

export function StakeSection() {
  const { isConnected } = useAccount()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<"USDC" | "EURC">("USDC")
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")

  // Token balances
  const { formatted: tokenBalance, refetch: refetchBalance } = useTokenBalance(selectedToken)
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(selectedToken, ARCDEX.Staking)

  // Staking data
  const { formatted: stakedBalance, refetch: refetchStaked } = useStakedBalance(selectedToken)
  const { formatted: pendingRewards, refetch: refetchRewards } = usePendingRewards(selectedToken)
  const { baseAPR, boostAPR, totalAPR } = useAPR(selectedToken)
  const { formatted: totalStakedUSDC } = useTotalStaked("USDC")
  const { formatted: totalStakedEURC } = useTotalStaked("EURC")

  // Actions
  const { approve, isPending: isApproving, isConfirming: isApprovingConfirm, isSuccess: approveSuccess } = useApprove()
  const { stake, isPending: isStaking, isConfirming: isStakingConfirm, isSuccess: stakeSuccess, error: stakeError } = useStake()
  const { unstake, isPending: isUnstaking, isConfirming: isUnstakingConfirm, isSuccess: unstakeSuccess } = useUnstake()
  const { claimRewards, claimAllRewards, isPending: isClaiming, isConfirming: isClaimingConfirm, isSuccess: claimSuccess } = useClaimRewards()

  // Validation helpers
  const parsedStakeAmount = stakeAmount ? BigInt(Math.floor(parseFloat(stakeAmount) * 1e6)) : BigInt(0)
  const parsedUnstakeAmount = unstakeAmount ? BigInt(Math.floor(parseFloat(unstakeAmount) * 1e6)) : BigInt(0)
  const balanceBigInt = tokenBalance ? BigInt(Math.floor(parseFloat(tokenBalance) * 1e6)) : BigInt(0)
  const stakedBalanceBigInt = stakedBalance ? BigInt(Math.floor(parseFloat(stakedBalance) * 1e6)) : BigInt(0)

  // Validation checks
  const stakeAmountNum = parseFloat(stakeAmount || "0")
  const unstakeAmountNum = parseFloat(unstakeAmount || "0")
  const balanceNum = parseFloat(tokenBalance || "0")
  const stakedBalanceNum = parseFloat(stakedBalance || "0")

  const hasInsufficientBalance = stakeAmountNum > balanceNum
  const hasInsufficientStaked = unstakeAmountNum > stakedBalanceNum
  const hasInvalidStakeAmount = stakeAmountNum <= 0 || isNaN(stakeAmountNum)
  const hasInvalidUnstakeAmount = unstakeAmountNum <= 0 || isNaN(unstakeAmountNum)
  const needsApproval = allowance !== undefined && parsedStakeAmount > BigInt(0) && allowance < parsedStakeAmount

  // Handlers with validation
  const handleApprove = async () => {
    if (!selectedToken || (selectedToken !== "USDC" && selectedToken !== "EURC")) {
      return
    }
    await approve(selectedToken, ARCDEX.Staking, "999999999999")
  }

  const handleStake = async () => {
    // Validate before staking
    if (!stakeAmount || hasInvalidStakeAmount) {
      return
    }
    if (hasInsufficientBalance) {
      return
    }
    if (needsApproval) {
      return
    }
    if (selectedToken !== "USDC" && selectedToken !== "EURC") {
      return
    }
    await stake(selectedToken, stakeAmount)
  }

  const handleUnstake = async () => {
    // Validate before unstaking
    if (!unstakeAmount || hasInvalidUnstakeAmount) {
      return
    }
    if (hasInsufficientStaked) {
      return
    }
    if (selectedToken !== "USDC" && selectedToken !== "EURC") {
      return
    }
    await unstake(selectedToken, unstakeAmount)
  }

  const handleClaim = async () => {
    await claimRewards(selectedToken)
  }

  const handleClaimAll = async () => {
    await claimAllRewards()
  }

  // Reset amounts when token changes
  useEffect(() => {
    setStakeAmount("")
    setUnstakeAmount("")
  }, [selectedToken])

  // Refresh after actions
  useEffect(() => {
    if (approveSuccess) {
      refetchAllowance()
      // Small delay to ensure allowance is updated
      setTimeout(() => refetchAllowance(), 1000)
    }
  }, [approveSuccess, refetchAllowance])

  useEffect(() => {
    if (stakeSuccess) {
      refetchBalance()
      refetchStaked()
      setStakeAmount("")
    }
  }, [stakeSuccess, refetchBalance, refetchStaked])

  useEffect(() => {
    if (unstakeSuccess) {
      refetchBalance()
      refetchStaked()
      setUnstakeAmount("")
    }
  }, [unstakeSuccess, refetchBalance, refetchStaked])

  useEffect(() => {
    if (claimSuccess) {
      refetchRewards()
      refetchBalance()
    }
  }, [claimSuccess, refetchRewards, refetchBalance])

  const isLoading = isApproving || isApprovingConfirm || isStaking || isStakingConfirm ||
    isUnstaking || isUnstakingConfirm || isClaiming || isClaimingConfirm

  // Calculate estimated earnings
  const estimatedEarnings = stakeAmount && totalAPR
    ? (parseFloat(stakeAmount) * totalAPR / 100).toFixed(2)
    : "0.00"

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Stake & Earn</h2>
        <p className="text-muted-foreground">Stake your USDC or EURC to earn annual yield on Arc Testnet.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total Staked"
          value={`$${(parseFloat(totalStakedUSDC) + parseFloat(totalStakedEURC)).toLocaleString()}`}
          subtitle="Across all tokens"
        />
        <StatCard
          title="Average APR"
          value={`${((totalAPR || 10)).toFixed(1)}%`}
          subtitle="Base APR + Boost"
        />
      </div>

      {/* Open Stake Panel Button */}
      <Button onClick={() => setIsModalOpen(true)} className="btn-gradient w-full md:w-auto">
        Open Stake Panel
      </Button>

      {/* Stake Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Stake & Earn</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="stake" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted border-border">
              <TabsTrigger value="stake">Stake</TabsTrigger>
              <TabsTrigger value="unstake">Unstake</TabsTrigger>
              <TabsTrigger value="claim">Claim</TabsTrigger>
            </TabsList>

            {/* Stake Tab */}
            <TabsContent value="stake" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token-select" className="text-foreground">
                  Token
                </Label>
                <select
                  id="token-select"
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value as "USDC" | "EURC")}
                  className="w-full bg-input text-foreground border border-border rounded-lg p-2"
                >
                  <option>USDC</option>
                  <option>EURC</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="stake-amount" className="text-foreground">Amount</Label>
                  <span className="text-xs text-muted-foreground">Balance: {tokenBalance} {selectedToken}</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="stake-amount"
                    type="number"
                    step="0.000001"
                    min="0"
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(e) => {
                      const value = e.target.value
                      // Allow empty, numbers, and single decimal point
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setStakeAmount(value)
                      }
                    }}
                    className={`bg-input text-foreground border-border flex-1 ${
                      hasInsufficientBalance ? "border-destructive" : ""
                    }`}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setStakeAmount(tokenBalance)}
                    className="border-border text-accent hover:bg-muted bg-transparent"
                    disabled={!tokenBalance || parseFloat(tokenBalance) <= 0}
                  >
                    Max
                  </Button>
                </div>
                {hasInsufficientBalance && (
                  <p className="text-xs text-destructive">
                    Insufficient balance. You have {tokenBalance} {selectedToken}
                  </p>
                )}
                {hasInvalidStakeAmount && stakeAmount && (
                  <p className="text-xs text-destructive">
                    Please enter a valid amount greater than 0
                  </p>
                )}
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base APR</span>
                  <span className="text-accent font-semibold">{baseAPR}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Boost APR</span>
                  <span className="text-accent font-semibold">+{boostAPR}%</span>
                </div>
              </div>

              <div className="bg-input rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">Estimated Earnings Per Year</p>
                <p className="text-2xl font-bold text-accent">
                  {estimatedEarnings} {selectedToken}
                </p>
              </div>

              {!isConnected ? (
                <Button className="w-full" disabled>Connect Wallet</Button>
              ) : needsApproval ? (
                <Button 
                  className="w-full btn-gradient" 
                  onClick={handleApprove} 
                  disabled={isLoading || !selectedToken || (selectedToken !== "USDC" && selectedToken !== "EURC")}
                >
                  {isApproving || isApprovingConfirm ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Approving...</>
                  ) : (
                    `Approve ${selectedToken}`
                  )}
                </Button>
              ) : (
                <Button
                  className="w-full btn-gradient"
                  onClick={handleStake}
                  disabled={
                    isLoading || 
                    !stakeAmount || 
                    hasInvalidStakeAmount || 
                    hasInsufficientBalance ||
                    !selectedToken ||
                    (selectedToken !== "USDC" && selectedToken !== "EURC")
                  }
                >
                  {isStaking || isStakingConfirm ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Staking...</>
                  ) : (
                    "Stake"
                  )}
                </Button>
              )}

              {stakeError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-xs text-destructive font-medium mb-1">Transaction Error</p>
                  <p className="text-xs text-destructive/80">
                    {stakeError.message?.includes("allowance") 
                      ? "Insufficient allowance. Please approve the token first."
                      : stakeError.message?.includes("balance")
                      ? "Insufficient balance. Please check your token balance."
                      : stakeError.message?.slice(0, 150) || "Transaction failed. Please try again."}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Unstake Tab */}
            <TabsContent value="unstake" className="space-y-4">
              <div className="bg-muted rounded-lg p-4 mb-4">
                <p className="text-xs text-muted-foreground">Staked Balance</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stakedBalance} {selectedToken}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unstake-amount" className="text-foreground">
                  Amount to Unstake
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="unstake-amount"
                    type="number"
                    step="0.000001"
                    min="0"
                    placeholder="0.00"
                    value={unstakeAmount}
                    onChange={(e) => {
                      const value = e.target.value
                      // Allow empty, numbers, and single decimal point
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setUnstakeAmount(value)
                      }
                    }}
                    className={`bg-input text-foreground border-border flex-1 ${
                      hasInsufficientStaked ? "border-destructive" : ""
                    }`}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setUnstakeAmount(stakedBalance)}
                    className="border-border text-accent hover:bg-muted bg-transparent"
                    disabled={!stakedBalance || parseFloat(stakedBalance) <= 0}
                  >
                    Max
                  </Button>
                </div>
                {hasInsufficientStaked && (
                  <p className="text-xs text-destructive">
                    Insufficient staked balance. You have {stakedBalance} {selectedToken} staked
                  </p>
                )}
                {hasInvalidUnstakeAmount && unstakeAmount && (
                  <p className="text-xs text-destructive">
                    Please enter a valid amount greater than 0
                  </p>
                )}
              </div>

              <Button
                className="w-full btn-gradient"
                onClick={handleUnstake}
                disabled={
                  isLoading || 
                  !unstakeAmount || 
                  hasInvalidUnstakeAmount || 
                  hasInsufficientStaked || 
                  !isConnected ||
                  !selectedToken ||
                  (selectedToken !== "USDC" && selectedToken !== "EURC")
                }
              >
                {isUnstaking || isUnstakingConfirm ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Unstaking...</>
                ) : (
                  "Unstake"
                )}
              </Button>
            </TabsContent>

            {/* Claim Tab */}
            <TabsContent value="claim" className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{selectedToken} Rewards</span>
                  <span className="text-foreground font-semibold">{pendingRewards}</span>
                </div>
              </div>

              <Button
                className="w-full btn-gradient"
                onClick={handleClaim}
                disabled={isLoading || parseFloat(pendingRewards) <= 0 || !isConnected}
              >
                {isClaiming || isClaimingConfirm ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Claiming...</>
                ) : (
                  "Claim Rewards"
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full border-border text-accent hover:bg-muted bg-transparent"
                onClick={handleClaimAll}
                disabled={isLoading || !isConnected}
              >
                Claim All Rewards
              </Button>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground text-center pt-2">
            APR and Boost APR are defined by the protocol and may change over time.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
