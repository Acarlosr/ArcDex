"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ExternalLink, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react"
import { useAccount } from "wagmi"
import {
  useTokenBalance,
  useSendPayment,
  useApprove,
  useTokenAllowance,
  usePaymentFee
} from "@/hooks/use-contracts"
import { ARCDEX, parseTokenAmount, ARCSCAN_URL } from "@/lib/contracts"

// ArcScan API for transaction history
const ARCSCAN_API = "https://testnet.arcscan.app/api"

// Transaction status type
type TxStatus = "idle" | "signing" | "pending" | "confirmed" | "failed"

// Payment history item
interface PaymentTx {
  hash: string
  to: string
  value: string
  timeStamp: string
  isError: string
  tokenSymbol?: string
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

// Payment History Component
function PaymentHistory({ address }: { address: string | undefined }) {
  const [transactions, setTransactions] = useState<PaymentTx[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      // Fetch outgoing transactions to Payments contract
      const response = await fetch(
        `${ARCSCAN_API}?module=account&action=txlist&address=${address}&sort=desc&page=1&offset=20`,
        { signal: AbortSignal.timeout(10000) }
      )

      if (!response.ok) throw new Error('API error')

      const data = await response.json()

      if (data.status === '1' && Array.isArray(data.result)) {
        // Filter for transactions to Payments contract
        const paymentTxs = data.result.filter((tx: PaymentTx) =>
          tx.to?.toLowerCase() === ARCDEX.Payments.toLowerCase()
        ).slice(0, 10)

        setTransactions(paymentTxs)
      } else {
        setTransactions([])
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err)
      setError('Failed to load payment history')
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  if (!address) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Connect wallet to see payment history</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="space-y-2">
                <div className="w-24 h-4 bg-muted rounded" />
                <div className="w-16 h-3 bg-muted rounded" />
              </div>
            </div>
            <div className="w-16 h-4 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" size="sm" onClick={fetchPayments}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <a
            href={`${ARCSCAN_URL}/address/${address}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-cyan-400 hover:underline text-sm"
          >
            View on ArcScan <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-2">No payments sent yet</p>
        <p className="text-sm text-muted-foreground">Your payment transactions will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div
          key={tx.hash}
          className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-cyan-500/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.isError === '0' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
              {tx.isError === '0' ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${tx.isError === '0'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
                  }`}>
                  {tx.isError === '0' ? 'Confirmed' : 'Failed'}
                </span>
                <span className="text-foreground font-medium">Payment</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatRelativeTime(tx.timeStamp)}
              </p>
            </div>
          </div>
          <a
            href={`${ARCSCAN_URL}/tx/${tx.hash}`}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline text-xs flex items-center gap-1"
          >
            {formatAddress(tx.hash)} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ))}
      <div className="text-center pt-2">
        <a
          href={`${ARCSCAN_URL}/address/${address}`}
          target="_blank"
          rel="noreferrer"
          className="text-cyan-400 hover:underline text-sm inline-flex items-center gap-1"
        >
          View all on ArcScan <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

export default function PaymentsPage() {
  const [selectedToken, setSelectedToken] = useState<"USDC" | "EURC">("USDC")
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [txStatus, setTxStatus] = useState<TxStatus>("idle")
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null)

  const { isConnected, address } = useAccount()

  // Token balances
  const { formatted: usdcBalance, isLoading: usdcLoading, refetch: refetchUSDC } = useTokenBalance('USDC')
  const { formatted: eurcBalance, isLoading: eurcLoading, refetch: refetchEURC } = useTokenBalance('EURC')

  const selectedBalance = selectedToken === 'USDC' ? usdcBalance : eurcBalance
  const selectedLoading = selectedToken === 'USDC' ? usdcLoading : eurcLoading

  // Payment fee
  const { formatted: paymentFee } = usePaymentFee()

  // Allowance
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(selectedToken, ARCDEX.Payments)

  // Hooks for operations
  const { approve, isPending: approving, isSuccess: approveSuccess, hash: approveHash } = useApprove()
  const { sendPayment, isPending: sending, isSuccess: sendSuccess, hash: sendHash, error: sendError } = useSendPayment()

  // Check if approval needed (amount + fee)
  const totalAmount = amount ? parseFloat(amount) + parseFloat(paymentFee) : 0
  const needsApproval = amount && allowance !== undefined &&
    parseTokenAmount(totalAmount.toString()) > allowance

  // Refetch allowance when token changes
  useEffect(() => {
    refetchAllowance()
  }, [selectedToken, refetchAllowance])

  // Refetch allowance after approval
  useEffect(() => {
    if (approveSuccess && approveHash) {
      const timer = setTimeout(() => {
        refetchAllowance()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [approveSuccess, approveHash, refetchAllowance])

  // Track transaction status
  useEffect(() => {
    if (sending) {
      setTxStatus("signing")
    }
  }, [sending])

  useEffect(() => {
    if (sendHash) {
      setCurrentTxHash(sendHash)
      setTxStatus("pending")
    }
  }, [sendHash])

  useEffect(() => {
    if (sendSuccess && sendHash) {
      setTxStatus("confirmed")
      const timer = setTimeout(() => {
        refetchUSDC()
        refetchEURC()
        refetchAllowance()
        setAmount("")
        setRecipient("")
        setMemo("")
        // Reset status after showing confirmation
        setTimeout(() => {
          setTxStatus("idle")
          setCurrentTxHash(null)
        }, 5000)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [sendSuccess, sendHash, refetchUSDC, refetchEURC, refetchAllowance])

  useEffect(() => {
    if (sendError) {
      setTxStatus("failed")
      setTimeout(() => {
        setTxStatus("idle")
        setCurrentTxHash(null)
      }, 5000)
    }
  }, [sendError])

  const handleApprove = async () => {
    if (!amount) return
    await approve(selectedToken, ARCDEX.Payments, totalAmount.toString())
  }

  const handleSendPayment = async () => {
    if (!amount || !recipient) return
    setTxStatus("signing")
    await sendPayment(selectedToken, recipient, amount, memo)
  }

  const handleMaxClick = () => {
    const balance = parseFloat(selectedBalance.replace(',', '')) || 0
    const fee = parseFloat(paymentFee) || 0.05
    const maxAmount = Math.max(0, balance - fee)
    setAmount(maxAmount.toFixed(2))
  }

  const isValidAddress = recipient.startsWith('0x') && recipient.length === 42

  // Status display component
  const StatusDisplay = () => {
    if (txStatus === "idle") return null

    return (
      <div className={`rounded-lg p-4 ${txStatus === "confirmed" ? "bg-green-500/10 border border-green-500/30" :
        txStatus === "failed" ? "bg-red-500/10 border border-red-500/30" :
          "bg-yellow-500/10 border border-yellow-500/30"
        }`}>
        <div className="flex items-center gap-3">
          {txStatus === "signing" && (
            <>
              <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
              <div>
                <p className="text-yellow-400 font-medium">Waiting for signature</p>
                <p className="text-xs text-muted-foreground">Please confirm in your wallet</p>
              </div>
            </>
          )}
          {txStatus === "pending" && (
            <>
              <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
              <div>
                <p className="text-yellow-400 font-medium">Transaction pending</p>
                <p className="text-xs text-muted-foreground">Waiting for confirmation...</p>
                {currentTxHash && (
                  <a
                    href={`${ARCSCAN_URL}/tx/${currentTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    View on ArcScan <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </>
          )}
          {txStatus === "confirmed" && (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-medium">Payment confirmed!</p>
                {currentTxHash && (
                  <a
                    href={`${ARCSCAN_URL}/tx/${currentTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    View on ArcScan <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </>
          )}
          {txStatus === "failed" && (
            <>
              <XCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-red-400 font-medium">Transaction failed</p>
                <p className="text-xs text-muted-foreground">
                  {sendError?.message?.includes('User rejected')
                    ? 'Transaction was cancelled'
                    : 'Please try again'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A304F] via-[#114B6E] to-[#D1D5DB] text-slate-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Send Payments</h1>
          <p className="text-muted-foreground">Send stablecoins to other addresses on Arc Network.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Payment Card */}
          <div className="bg-card rounded-xl p-6 border border-border glow-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">New Payment</h2>
            <div className="space-y-4">
              {/* Token Selector */}
              <div className="space-y-2">
                <Label htmlFor="token" className="text-foreground">Token</Label>
                <select
                  id="token"
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value as "USDC" | "EURC")}
                  className="w-full bg-input text-foreground border border-border rounded-lg p-2"
                >
                  <option value="USDC">USDC</option>
                  <option value="EURC">EURC</option>
                </select>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balance:</span>
                  <span className="text-foreground font-mono">
                    {!isConnected ? "—" : selectedLoading ? "..." : `${selectedBalance} ${selectedToken}`}
                  </span>
                </div>
              </div>

              {/* Recipient */}
              <div className="space-y-2">
                <Label htmlFor="recipient" className="text-foreground">Recipient Address</Label>
                <Input
                  id="recipient"
                  type="text"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="bg-input text-foreground border-border"
                />
                {recipient && !isValidAddress && (
                  <p className="text-xs text-red-400">Invalid address format</p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-foreground">Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-input text-foreground border-border"
                  />
                  <Button
                    variant="outline"
                    onClick={handleMaxClick}
                    disabled={!isConnected}
                    className="border-border text-accent hover:bg-muted bg-transparent"
                  >
                    Max
                  </Button>
                </div>
              </div>

              {/* Memo */}
              <div className="space-y-2">
                <Label htmlFor="memo" className="text-foreground">
                  Memo <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="memo"
                  type="text"
                  placeholder="Payment for..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="bg-input text-foreground border-border"
                  maxLength={256}
                />
              </div>

              {/* Fee Display */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="text-foreground">~{paymentFee} USDC</span>
                </div>
                {amount && (
                  <div className="flex justify-between text-sm mt-2 pt-2 border-t border-border">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-foreground font-semibold">
                      {totalAmount.toFixed(2)} {selectedToken}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Display */}
              <StatusDisplay />

              {/* Action Button */}
              {!isConnected ? (
                <Button className="w-full btn-gradient" disabled>
                  Connect Wallet
                </Button>
              ) : needsApproval ? (
                <Button
                  className="w-full btn-gradient"
                  onClick={handleApprove}
                  disabled={approving || !amount || !isValidAddress}
                >
                  {approving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    `Approve ${selectedToken}`
                  )}
                </Button>
              ) : (
                <Button
                  className="w-full btn-gradient"
                  onClick={handleSendPayment}
                  disabled={sending || !amount || !isValidAddress || txStatus !== "idle"}
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Payment"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar: Balances + History */}
          <div className="space-y-6">
            {/* Balances Card */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Your Balances</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">USDC</p>
                  <p className="text-xl font-bold text-foreground font-mono">
                    {!isConnected ? "—" : usdcLoading ? "..." : usdcBalance}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">EURC</p>
                  <p className="text-xl font-bold text-foreground font-mono">
                    {!isConnected ? "—" : eurcLoading ? "..." : eurcBalance}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment History Card */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Payment History</h3>
              <PaymentHistory address={address} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
