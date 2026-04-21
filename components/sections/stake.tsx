"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useQueryClient } from "@tanstack/react-query"
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
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<"USDC" | "EURC">("USDC")
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [approveStatus, setApproveStatus] = useState<"idle" | "pending" | "confirming" | "verified" | "error">("idle")
  const [approveErrorMsg, setApproveErrorMsg] = useState("")

  // Token balances
  const { formatted: tokenBalance, refetch: refetchBalance } = useTokenBalance(selectedToken)
  const { allowance, isLoading: allowanceLoading, refetch: refetchAllowance } = useTokenAllowance(selectedToken, ARCDEX.Staking)

  // Staking data
  const { formatted: stakedBalance, refetch: refetchStaked } = useStakedBalance(selectedToken)
  const { formatted: pendingRewards, refetch: refetchRewards } = usePendingRewards(selectedToken)
  const { baseAPR, boostAPR, totalAPR } = useAPR(selectedToken)
  const { formatted: totalStakedUSDC } = useTotalStaked("USDC")
  const { formatted: totalStakedEURC } = useTotalStaked("EURC")

  // Actions
  const { approve, isPending: isApproving, isConfirming: isApprovingConfirm, isSuccess: approveSuccess, error: approveError, reset: resetApprove } = useApprove()
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
  const needsApproval =
    allowance !== undefined &&
    parsedStakeAmount > BigInt(0) &&
    allowance < parsedStakeAmount
  const allowanceUnknown = allowance === undefined && !!stakeAmount

  // Handlers with validation and error handling
  const handleApprove = async () => {
    if (!selectedToken || (selectedToken !== "USDC" && selectedToken !== "EURC")) {
      console.warn("Stake: Invalid token selected for approval")
      return
    }
    setApproveStatus("pending")
    setApproveErrorMsg("")
    resetApprove()
    try {
      console.log(`Stake: Approving ${selectedToken} for staking contract...`)
      const hash = await approve(selectedToken, ARCDEX.Staking, "999999999999")
      console.log(`Stake: Approve tx submitted: ${hash}`)
      setApproveStatus("confirming")
      // The useEffect for approveSuccess will handle the rest
    } catch (error: any) {
      console.error("Stake: Approve error", error)
      setApproveStatus("error")
      setApproveErrorMsg(
        error?.shortMessage || error?.message?.slice(0, 150) || "Approve transaction failed. Please try again."
      )
    }
  }

  const handleStake = async () => {
    // Validate before staking with better error logging
    if (!stakeAmount || hasInvalidStakeAmount) {
      console.warn("Stake: Invalid stake amount", { stakeAmount, hasInvalidStakeAmount })
      return
    }
    if (hasInsufficientBalance) {
      console.warn("Stake: Insufficient balance", { stakeAmount, balance: tokenBalance })
      return
    }
    if (selectedToken !== "USDC" && selectedToken !== "EURC") {
      console.warn("Stake: Invalid token", { selectedToken })
      return
    }

    // Pre-flight: force a fresh allowance read before sending the tx
    console.log("Stake: Pre-flight allowance check...")
    try {
      queryClient.invalidateQueries()
      const result = await refetchAllowance()
      const freshAllowance = result?.data as bigint | undefined
      const required = parsedStakeAmount
      console.log(`Stake: Fresh allowance = ${freshAllowance}, required = ${required}`)

      if (freshAllowance === undefined || freshAllowance < required) {
        console.warn("Stake: Allowance still insufficient after fresh read", { freshAllowance, required })
        setApproveStatus("error")
        setApproveErrorMsg(
          `Allowance is still insufficient (${freshAllowance?.toString() ?? "0"} < ${required.toString()}). ` +
          `Please click "Approve ${selectedToken}" first and confirm in your wallet.`
        )
        return
      }
    } catch (err) {
      console.warn("Stake: Pre-flight allowance read failed, proceeding anyway", err)
    }

    try {
      console.log(`Stake: Sending stake tx for ${stakeAmount} ${selectedToken}...`)
      await stake(selectedToken, stakeAmount)
    } catch (error) {
      console.error("Stake: Stake error", error)
    }
  }

  const handleUnstake = async () => {
    // Validate before unstaking with better error logging
    if (!unstakeAmount || hasInvalidUnstakeAmount) {
      console.warn("Stake: Invalid unstake amount", { unstakeAmount, hasInvalidUnstakeAmount })
      return
    }
    if (hasInsufficientStaked) {
      console.warn("Stake: Insufficient staked balance", { unstakeAmount, stakedBalance })
      return
    }
    if (selectedToken !== "USDC" && selectedToken !== "EURC") {
      console.warn("Stake: Invalid token", { selectedToken })
      return
    }
    try {
      await unstake(selectedToken, unstakeAmount)
    } catch (error) {
      console.error("Stake: Unstake error", error)
    }
  }

  const handleClaim = async () => {
    try {
      await claimRewards(selectedToken)
    } catch (error) {
      console.error("Stake: Claim error", error)
    }
  }

  const handleClaimAll = async () => {
    try {
      await claimAllRewards()
    } catch (error) {
      console.error("Stake: Claim all error", error)
    }
  }

  const handleRefreshAllowance = async () => {
    setIsRefreshing(true)
    try {
      queryClient.invalidateQueries()
      await Promise.all([refetchAllowance(), refetchBalance(), refetchStaked()])
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  // Reset amounts and approve status when token changes
  useEffect(() => {
    setStakeAmount("")
    setUnstakeAmount("")
    setApproveStatus("idle")
    setApproveErrorMsg("")
  }, [selectedToken])

  // When opening stake modal, refetch allowance and balance so existing approvals are detected ("já tinha aprovado antes")
  useEffect(() => {
    if (isModalOpen && isConnected) {
      queryClient.invalidateQueries()
      refetchAllowance()
      refetchBalance()
      refetchStaked()
    }
  }, [isModalOpen, isConnected, queryClient, refetchAllowance, refetchBalance, refetchStaked])

  // After approve confirmed on-chain: invalidate cache, verify allowance, update status
  useEffect(() => {
    if (approveSuccess) {
      console.log("Stake: Approve confirmed on-chain, verifying allowance...")
      setApproveStatus("confirming")
      const t = setTimeout(async () => {
        queryClient.invalidateQueries()
        try {
          const result = await refetchAllowance()
          const freshAllowance = result?.data as bigint | undefined
          console.log(`Stake: Post-approve allowance = ${freshAllowance}`)
          if (freshAllowance !== undefined && freshAllowance > BigInt(0)) {
            setApproveStatus("verified")
            setApproveErrorMsg("")
          } else {
            setApproveStatus("error")
            setApproveErrorMsg("Approve confirmed but allowance is still 0. The token may not support standard approve. Try again or click Refresh.")
          }
        } catch (err) {
          console.warn("Stake: Post-approve refetch failed", err)
          setApproveStatus("error")
          setApproveErrorMsg("Could not verify allowance. Click Refresh and try again.")
        }
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [approveSuccess, queryClient, refetchAllowance])

  // If approve hook reports an error, surface it
  useEffect(() => {
    if (approveError) {
      setApproveStatus("error")
      setApproveErrorMsg(
        (approveError as any)?.shortMessage || approveError.message?.slice(0, 150) || "Approve failed"
      )
    }
  }, [approveError])

  useEffect(() => {
    if (stakeSuccess) {
      const t = setTimeout(() => {
        queryClient.invalidateQueries()
        refetchBalance()
        refetchStaked()
        refetchAllowance()
        setStakeAmount("")
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [stakeSuccess, queryClient, refetchBalance, refetchStaked, refetchAllowance])

  useEffect(() => {
    if (unstakeSuccess) {
      const t = setTimeout(() => {
        queryClient.invalidateQueries()
        refetchBalance()
        refetchStaked()
        setUnstakeAmount("")
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [unstakeSuccess, queryClient, refetchBalance, refetchStaked])

  useEffect(() => {
    if (claimSuccess) {
      const t = setTimeout(() => {
        queryClient.invalidateQueries()
        refetchRewards()
        refetchBalance()
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [claimSuccess, queryClient, refetchRewards, refetchBalance])

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
                <div className="flex justify-between items-center gap-2">
                  <Label htmlFor="stake-amount" className="text-foreground">Amount</Label>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    Balance: {tokenBalance} {selectedToken}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={handleRefreshAllowance}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? "…" : "Refresh"}
                    </Button>
                  </span>
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
              ) : allowanceLoading || (allowanceUnknown && stakeAmount) ? (
                <Button className="w-full" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking allowance…
                </Button>
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

              {/* Approve status / errors */}
              {approveStatus === "confirming" && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  <p className="text-xs text-accent">Approve confirmed, verifying allowance...</p>
                </div>
              )}
              {approveStatus === "verified" && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium">Allowance verified. You can now stake.</p>
                </div>
              )}
              {(approveStatus === "error" || approveErrorMsg) && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-xs text-destructive font-medium mb-1">Approve Error</p>
                  <p className="text-xs text-destructive/80">{approveErrorMsg || "Approve failed. Please try again."}</p>
                </div>
              )}

              {/* Stake tx errors */}
              {stakeError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-xs text-destructive font-medium mb-1">Stake Error</p>
                  <p className="text-xs text-destructive/80">
                    {stakeError.message?.includes("allowance") 
                      ? "Insufficient allowance. Please click Approve first, confirm in wallet, wait for verification, then Stake."
                      : stakeError.message?.includes("balance")
                      ? "Insufficient balance. Please check your token balance."
                      : stakeError.message?.includes("treasury")
                      ? "Treasury not configured for rewards. Contact the protocol team."
                      : (stakeError as any)?.shortMessage || stakeError.message?.slice(0, 150) || "Transaction failed. Please try again."}
                  </p>
                </div>
              )}

              {/* Debug: current allowance */}
              <p className="text-xs text-muted-foreground text-center">
                Current allowance: {allowance !== undefined ? (Number(allowance) / 1e6).toFixed(2) : "loading..."} {selectedToken}
              </p>
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
