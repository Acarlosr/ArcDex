"use client"

import { useState, useEffect, useCallback } from "react"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, RefreshCw, ExternalLink, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react"
import { useAccount, useReadContract } from "wagmi"
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
import { ARCDEX, TOKENS, ARCSCAN_API, ARCSCAN_URL, parseTokenAmount, formatTokenAmount } from "@/lib/contracts"
import { ERC20_ABI, ARCDEX_STAKING_ABI } from "@/lib/abi"
import { MobileWalletHint } from "@/components/mobile-wallet-hint"
import { PriceChart } from "@/components/price-chart"
import { useCompliance } from "@/hooks/useCompliance"
import { useI18n } from "@/lib/i18n"

interface StakeTx {
  hash: string
  timeStamp: string
  isError: string
  txreceipt_status: string
  functionName: string
  value: string
  to: string
}

export default function StakePage() {
  const { t } = useI18n()
  const [selectedToken, setSelectedToken] = useState<"USDC" | "EURC">("USDC")
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")

  const { address, isConnected } = useAccount()

  // Transaction history state
  const [stakeTxs, setStakeTxs] = useState<StakeTx[]>([])
  const [txLoading, setTxLoading] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)

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

  // Compliance screening
  const { result: complianceResult, checkCompliance, preTransactionCheck, isVerified: complianceVerified, isBlocked: complianceBlocked } = useCompliance()
  useEffect(() => {
    if (isConnected && address) checkCompliance()
  }, [isConnected, address, checkCompliance])

  // Operations
  const { approve, isPending: approving, isConfirming: approveConfirming, isSuccess: approveSuccess, hash: approveHash } = useApprove()
  const { stake, isPending: staking, isSuccess: stakeSuccess, error: stakeError } = useStake()
  const { unstake, isPending: unstaking, isSuccess: unstakeSuccess, error: unstakeError } = useUnstake()
  const { claimAllRewards, isPending: claiming, isSuccess: claimSuccess } = useClaimRewards()
  const [justApproved, setJustApproved] = useState(false)

  // These 5 treasury diagnostic reads are extra load on top of the ~11 other
  // RPC calls the Stake page already fires on mount (staked balance, pending
  // rewards, APR, total staked x2 tokens, token balance, allowance...). Firing
  // all ~16 at once was enough to trip the public testnet RPC's rate limit
  // (429 Too Many Requests). Since this diagnostic info is not time-critical,
  // delay it briefly so it doesn't compete with the page's primary data in
  // the very first render, and cache it longer so it isn't re-fetched on
  // every remount/reconnect.
  const [treasuryDiagReady, setTreasuryDiagReady] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setTreasuryDiagReady(true), 1500)
    return () => clearTimeout(timer)
  }, [])
  const TREASURY_QUERY_OPTS = { staleTime: 5 * 60_000, gcTime: 10 * 60_000, retry: false } as const

  // Treasury diagnostic: read treasury address from staking contract
  const { data: treasuryAddress } = useReadContract({
    address: ARCDEX.Staking as `0x${string}`,
    abi: ARCDEX_STAKING_ABI,
    functionName: 'treasury',
    query: { enabled: treasuryDiagReady, ...TREASURY_QUERY_OPTS },
  })

  // Treasury diagnostic: check if treasury has enough EURC balance
  const { data: treasuryEurcBalance } = useReadContract({
    address: TOKENS.EURC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: treasuryAddress ? [treasuryAddress as `0x${string}`] : undefined,
    query: { enabled: !!treasuryAddress, ...TREASURY_QUERY_OPTS },
  })

  // Treasury diagnostic: check if treasury approved staking contract for EURC
  const { data: treasuryEurcAllowance } = useReadContract({
    address: TOKENS.EURC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: treasuryAddress ? [treasuryAddress as `0x${string}`, ARCDEX.Staking as `0x${string}`] : undefined,
    query: { enabled: !!treasuryAddress, ...TREASURY_QUERY_OPTS },
  })

  // Treasury diagnostic: same for USDC
  const { data: treasuryUsdcBalance } = useReadContract({
    address: TOKENS.USDC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: treasuryAddress ? [treasuryAddress as `0x${string}`] : undefined,
    query: { enabled: !!treasuryAddress, ...TREASURY_QUERY_OPTS },
  })

  const { data: treasuryUsdcAllowance } = useReadContract({
    address: TOKENS.USDC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: treasuryAddress ? [treasuryAddress as `0x${string}`, ARCDEX.Staking as `0x${string}`] : undefined,
    query: { enabled: !!treasuryAddress, ...TREASURY_QUERY_OPTS },
  })

  // Detect treasury issues for each token
  const eurcTreasuryIssue = (() => {
    if (!treasuryAddress) return null
    const balance = treasuryEurcBalance as bigint | undefined
    const allowanceVal = treasuryEurcAllowance as bigint | undefined
    if (balance !== undefined && balance === BigInt(0)) return "Treasury has no EURC balance to pay rewards."
    if (allowanceVal !== undefined && allowanceVal === BigInt(0)) return "Treasury has not approved EURC for the staking contract."
    return null
  })()

  const usdcTreasuryIssue = (() => {
    if (!treasuryAddress) return null
    const balance = treasuryUsdcBalance as bigint | undefined
    const allowanceVal = treasuryUsdcAllowance as bigint | undefined
    if (balance !== undefined && balance === BigInt(0)) return "Treasury has no USDC balance to pay rewards."
    if (allowanceVal !== undefined && allowanceVal === BigInt(0)) return "Treasury has not approved USDC for the staking contract."
    return null
  })()

  const currentTreasuryIssue = selectedToken === "EURC" ? eurcTreasuryIssue : usdcTreasuryIssue

  // Helper to parse error messages
  const parseStakeError = (error: Error | null): string | null => {
    if (!error) return null
    const msg = (error as any)?.shortMessage || error.message || ""
    if (msg.includes("transfer amount exceeds allowance") || msg.includes("insufficient allowance")) {
      return "Transaction failed: The treasury does not have sufficient allowance to transfer reward tokens. This is a protocol-level issue — the treasury owner needs to approve EURC for the staking contract."
    }
    if (msg.includes("transfer amount exceeds balance")) {
      return "Transaction failed: The treasury does not have enough token balance to pay rewards."
    }
    if (msg.includes("InvalidToken")) {
      return "Invalid token selected. Only USDC and EURC are supported."
    }
    if (msg.includes("ZeroAmount")) {
      return "Amount must be greater than zero."
    }
    if (msg.includes("InsufficientBalance")) {
      return "Insufficient staked balance for this operation."
    }
    if (msg.includes("User rejected") || msg.includes("user rejected")) {
      return "Transaction was rejected in your wallet."
    }
    return msg.length > 200 ? msg.slice(0, 200) + "..." : msg
  }

  // Check if approval needed (skip if just approved on-chain)
  const needsApproval = !justApproved && stakeAmount && allowance !== undefined &&
    parseTokenAmount(stakeAmount) > allowance

  // Fetch staking transaction history from ArcScan
  const fetchStakeTxs = useCallback(async () => {
    if (!address) return
    setTxLoading(true)
    setTxError(null)
    try {
      const response = await fetch(
        `${ARCSCAN_API}?module=account&action=txlist&address=${address}&sort=desc&page=1&offset=50`,
        { signal: AbortSignal.timeout(10000) }
      )
      if (!response.ok) throw new Error("API error")
      const data = await response.json()
      if (data.status === "1" && Array.isArray(data.result)) {
        const filtered = data.result
          .filter((tx: StakeTx & { to?: string }) =>
            tx.to?.toLowerCase() === ARCDEX.Staking.toLowerCase()
          )
          .slice(0, 8)
        setStakeTxs(filtered)
      } else {
        setStakeTxs([])
      }
    } catch (err) {
      console.error("Failed to fetch stake txs:", err)
      setTxError("Failed to load history")
    } finally {
      setTxLoading(false)
    }
  }, [address])

  // Fetch on mount and after successful actions
  useEffect(() => {
    fetchStakeTxs()
  }, [fetchStakeTxs])

  useEffect(() => {
    if (stakeSuccess || unstakeSuccess || claimSuccess || approveSuccess) {
      const t = setTimeout(() => fetchStakeTxs(), 4000)
      return () => clearTimeout(t)
    }
  }, [stakeSuccess, unstakeSuccess, claimSuccess, approveSuccess, fetchStakeTxs])

  // Refetch allowance when token changes
  useEffect(() => {
    refetchAllowance()
    setJustApproved(false)
  }, [selectedToken, refetchAllowance])

  // After approval confirms, update local state and aggressively refetch
  useEffect(() => {
    if (approveSuccess && approveHash) {
      setJustApproved(true)
      const t1 = setTimeout(() => refetchAllowance(), 1000)
      const t2 = setTimeout(() => refetchAllowance(), 3000)
      const t3 = setTimeout(() => refetchAllowance(), 5000)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
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
      setJustApproved(false)
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
    try {
      await approve(selectedToken, ARCDEX.Staking, '999999999')
      setJustApproved(true)
    } catch {
      // User rejected or error
    }
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
          <h1 className="text-3xl font-bold text-foreground">{t("stake.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("stake.subtitle")}</p>
        </div>
      </div>

      <MobileWalletHint />

      {/* Staking Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stake Card */}
        <div className="bg-card rounded-2xl p-8 border border-border glow-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">{t("stake.tokens")}</h2>

          <div className="space-y-4 mb-6">
            {/* Token Selection */}
            <div className="space-y-2">
              <Label htmlFor="token-select" className="text-foreground">{t("common.token")}</Label>
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
              <Label htmlFor="stake-amount" className="text-foreground">{t("common.amount")}</Label>
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
                  {t("common.max")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("common.balance")}: {selectedLoading ? "..." : selectedBalance} {selectedToken}
              </p>
            </div>
          </div>

          {/* APR Info */}
          <div className="bg-muted rounded-xl p-4 space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("stake.baseApr")}</span>
              <span className="text-accent font-semibold">{baseAPR}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("stake.boostApr")}</span>
              <span className="text-accent font-semibold">+{boostAPR}%</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-3">
              <span className="text-muted-foreground">{t("stake.totalApr")}</span>
              <span className="text-accent font-bold">{totalAPR}%</span>
            </div>
          </div>

          {/* Estimated Earnings */}
          <div className="bg-input rounded-xl p-4 mb-6">
            <p className="text-xs text-muted-foreground mb-1">{t("stake.estimatedYear")}</p>
            <p className="text-2xl font-bold text-accent">
              {estimatedEarnings} {selectedToken}
            </p>
          </div>

          {/* Compliance Status */}
          {isConnected && complianceVerified && (
            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 rounded-lg p-2 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> {t("common.complianceVerified")}
            </div>
          )}
          {isConnected && complianceBlocked && (
            <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/30 mb-2">
              <p className="text-sm text-red-400 font-medium flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> {t("common.walletBlocked")}</p>
              <p className="text-xs text-red-400/70 mt-1">Compliance screening flagged this wallet. Staking is disabled.</p>
            </div>
          )}

          {/* Stake Button */}
          {!isConnected ? (
            <Button className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl" disabled>
              {t("common.connectWallet")}
            </Button>
          ) : complianceBlocked ? (
            <Button className="w-full h-14 text-lg font-semibold rounded-xl" disabled variant="outline">
              {t("common.walletBlockedCompliance")}
            </Button>
          ) : needsApproval ? (
            <Button
              onClick={handleApprove}
              disabled={approving || approveConfirming || !stakeAmount}
              className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl"
            >
              {approving ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("common.approving")}</>
              ) : approveConfirming ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("common.confirmingApproval")}</>
              ) : (
                `${t("common.approve")} ${selectedToken}`
              )}
            </Button>
          ) : (
            <Button
              onClick={handleStake}
              disabled={staking || approveConfirming || !stakeAmount || parseFloat(stakeAmount) <= 0}
              className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl"
            >
              {approveConfirming ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("common.confirmingApproval")}</>
              ) : staking ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("stake.staking")}</>
              ) : (
                t("stake.stakeToken", { token: selectedToken })
              )}
            </Button>
          )}

          {/* Treasury warning */}
          {currentTreasuryIssue && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-yellow-400 font-medium">Treasury Issue Detected</p>
                <p className="text-xs text-yellow-400/80 mt-1">{currentTreasuryIssue}</p>
                <p className="text-xs text-yellow-400/60 mt-1">
                  If you have pending rewards, stake/unstake/claim operations may fail because the contract tries to pay rewards first.
                  The protocol treasury owner needs to fund and approve {selectedToken} for the staking contract.
                </p>
              </div>
            </div>
          )}

          {stakeError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-xs text-red-400 font-medium mb-1">Stake Error</p>
              <p className="text-xs text-red-400/80">{parseStakeError(stakeError)}</p>
            </div>
          )}
        </div>

        {/* Right Column - Position & Actions */}
        <div className="space-y-6">
          {/* Your Position */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t("stake.position")}</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("stake.stakedUsdc")}</span>
                <span className="text-foreground font-medium">{stakedUSDC}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("stake.stakedEurc")}</span>
                <span className="text-foreground font-medium">{stakedEURC}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">{t("stake.totalValue")}</span>
                <span className="text-foreground font-bold">${totalStakedValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Pending Rewards */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{t("stake.pendingRewards")}</h3>
              <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">Testnet</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("stake.usdcRewards")}</span>
                <span className="text-accent font-semibold">{usdcRewards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("stake.eurcRewards")}</span>
                <span className="text-accent font-semibold">{eurcRewards}</span>
              </div>
            </div>

            {/* Info about rewards */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-2">
              <p className="flex items-center gap-1">
                <span>ℹ️</span>
                Rewards accumulate based on APR. Claim requires treasury to be configured.
              </p>
              {/* Treasury Status */}
              {treasuryAddress && (
                <div className="border-t border-border pt-2 space-y-1">
                  <p className="font-medium text-muted-foreground">Treasury Status:</p>
                  <div className="flex justify-between">
                    <span>USDC Balance:</span>
                    <span className={(treasuryUsdcBalance as bigint | undefined) === BigInt(0) ? "text-red-400" : "text-green-400"}>
                      {treasuryUsdcBalance !== undefined ? formatTokenAmount(treasuryUsdcBalance as bigint) : "..."}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>EURC Balance:</span>
                    <span className={(treasuryEurcBalance as bigint | undefined) === BigInt(0) ? "text-red-400" : "text-green-400"}>
                      {treasuryEurcBalance !== undefined ? formatTokenAmount(treasuryEurcBalance as bigint) : "..."}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>USDC Allowance:</span>
                    <span className={(treasuryUsdcAllowance as bigint | undefined) === BigInt(0) ? "text-red-400" : "text-green-400"}>
                      {treasuryUsdcAllowance !== undefined ? (Number(treasuryUsdcAllowance as bigint) > 1e15 ? "Unlimited" : formatTokenAmount(treasuryUsdcAllowance as bigint)) : "..."}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>EURC Allowance:</span>
                    <span className={(treasuryEurcAllowance as bigint | undefined) === BigInt(0) ? "text-red-400" : "text-green-400"}>
                      {treasuryEurcAllowance !== undefined ? (Number(treasuryEurcAllowance as bigint) > 1e15 ? "Unlimited" : formatTokenAmount(treasuryEurcAllowance as bigint)) : "..."}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Treasury Issue Alert */}
            {(eurcTreasuryIssue || usdcTreasuryIssue) && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-xs text-yellow-400 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Treasury Configuration Issue
                </p>
                {eurcTreasuryIssue && (
                  <p className="text-xs text-yellow-400/80 mt-1">EURC: {eurcTreasuryIssue}</p>
                )}
                {usdcTreasuryIssue && (
                  <p className="text-xs text-yellow-400/80 mt-1">USDC: {usdcTreasuryIssue}</p>
                )}
              </div>
            )}

            <Button
              onClick={handleClaimAll}
              disabled={claiming || (usdcRewards === '0.00' && eurcRewards === '0.00')}
              className="w-full mt-4 btn-gradient"
            >
              {claiming ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("stake.claiming")}</>
              ) : (
                t("stake.claimAll")
              )}
            </Button>
          </div>

          {/* Unstake */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t("stake.unstake")} {selectedToken}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("stake.unstakeDescription")}
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
                  {t("common.max")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("stake.staked")}: {selectedStaked} {selectedToken}
              </p>
              <Button
                onClick={handleUnstake}
                disabled={unstaking || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                variant="outline"
                className="w-full border-border text-foreground hover:bg-muted"
              >
                {unstaking ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("stake.unstaking")}</>
                ) : (
                  t("stake.unstakeTokens")
                )}
              </Button>
              {/* Treasury warning for unstake */}
              {currentTreasuryIssue && parseFloat(selectedStaked) > 0 && (
                <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-400/80">
                    Unstake may fail because the contract claims pending rewards first, and the treasury has issues with {selectedToken}.
                  </p>
                </div>
              )}
              {unstakeError && (
                <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-xs text-red-400 font-medium mb-0.5">Unstake Error</p>
                  <p className="text-xs text-red-400/80">{parseStakeError(unstakeError)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Staking Transaction History */}
      <div className="mt-8">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">{t("stake.history")}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchStakeTxs}
              disabled={txLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              {txLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>

          {!isConnected ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("stake.connectHistory")}</p>
          ) : txLoading && stakeTxs.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-muted rounded-full" />
                    <div className="w-20 h-3 bg-muted rounded" />
                  </div>
                  <div className="w-14 h-3 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : txError ? (
            <div className="text-center py-6">
              <p className="text-red-400 text-sm mb-2">{txError}</p>
              <Button variant="outline" size="sm" onClick={fetchStakeTxs}>
                <RefreshCw className="w-3 h-3 mr-1" /> {t("common.retry")}
              </Button>
            </div>
          ) : stakeTxs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("stake.noHistory")}</p>
          ) : (
            <div className="space-y-2">
              {stakeTxs.map((tx) => {
                const isSuccess = tx.txreceipt_status === "1" && tx.isError === "0"
                const date = new Date(parseInt(tx.timeStamp) * 1000)
                const method = tx.functionName?.split("(")[0] || "unknown"
                const methodLabel =
                  method === "stake" ? "Stake" :
                  method === "unstake" ? "Unstake" :
                  method === "claimRewards" ? "Claim" :
                  method === "claimAllRewards" ? "Claim All" :
                  method === "approve" ? "Approve" :
                  method

                return (
                  <a
                    key={tx.hash}
                    href={`${ARCSCAN_URL}/tx/${tx.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {isSuccess ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                          {methodLabel}
                          <span className={`text-xs px-1.5 py-0.5 rounded ${isSuccess ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {isSuccess ? t("common.success") : t("common.failed")}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* APY Chart - Below Stake Button */}
      <div className="mt-8 mb-8">
        <PriceChart
          title={t("stake.apyEvolution")}
          subtitle={t("stake.currentApr", { apr: totalAPR.toFixed(2) })}
          currentValue={`${totalAPR.toFixed(2)}%`}
          type="apy"
          height={250}
        />
      </div>

      {/* Stats - Below Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t("stake.totalUsdcStaked")}
          value={totalStakedUSDC}
          subtitle={t("stake.inContract")}
        />
        <StatCard
          title={t("stake.totalEurcStaked")}
          value={totalStakedEURC}
          subtitle={t("stake.inContract")}
        />
        <StatCard
          title={t("stake.yourStaked")}
          value={`$${totalStakedValue.toFixed(2)}`}
          subtitle={t("stake.usdcEurcValue")}
        />
        <StatCard
          title="APR"
          value={`${totalAPR.toFixed(0)}%`}
          subtitle={t("stake.usdcRate")}
        />
      </div>
    </div>
  )
}
