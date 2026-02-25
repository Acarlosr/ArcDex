"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ExternalLink, CheckCircle2, XCircle, Clock, RefreshCw, Plus, Trash2, Send, Users, ShieldCheck, ShieldAlert } from "lucide-react"
import { useAccount } from "wagmi"
import {
  useTokenBalance,
  useSendPayment,
  useBatchPayment,
  useApprove,
  useTokenAllowance,
  usePaymentFee,
  usePaymentStats,
} from "@/hooks/use-contracts"
import { ARCDEX, parseTokenAmount, ARCSCAN_URL } from "@/lib/contracts"
import { MobileWalletHint } from "@/components/mobile-wallet-hint"
import { useCompliance } from "@/hooks/useCompliance"

const ARCSCAN_API = "https://testnet.arcscan.app/api"

type TxStatus = "idle" | "signing" | "pending" | "confirmed" | "failed"

interface PaymentTx {
  hash: string
  to: string
  value: string
  timeStamp: string
  isError: string
  functionName?: string
}

interface BatchRow {
  recipient: string
  amount: string
}

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

function formatAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function PaymentHistory({ address }: { address: string | undefined }) {
  const [transactions, setTransactions] = useState<PaymentTx[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    if (!address) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${ARCSCAN_API}?module=account&action=txlist&address=${address}&sort=desc&page=1&offset=20`,
        { signal: AbortSignal.timeout(10000) }
      )
      if (!response.ok) throw new Error('API error')
      const data = await response.json()
      if (data.status === '1' && Array.isArray(data.result)) {
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

  useEffect(() => { fetchPayments() }, [fetchPayments])

  if (!address) return <p className="text-muted-foreground text-center py-6">Connect wallet to see payment history</p>
  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3"><div className="w-6 h-6 bg-muted rounded-full" /><div className="w-24 h-3 bg-muted rounded" /></div>
          <div className="w-16 h-3 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
  if (error) return (
    <div className="text-center py-6">
      <p className="text-red-400 mb-3 text-sm">{error}</p>
      <Button variant="outline" size="sm" onClick={fetchPayments}><RefreshCw className="w-3 h-3 mr-1" /> Retry</Button>
    </div>
  )
  if (transactions.length === 0) return <p className="text-muted-foreground text-center py-6 text-sm">No payments sent yet</p>

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const isSuccess = tx.isError === '0'
        const method = tx.functionName?.split("(")[0] || "payment"
        const label = method === "batchPayment" ? "Batch" : method === "sendExactPayment" ? "Exact" : "Payment"
        return (
          <a key={tx.hash} href={`${ARCSCAN_URL}/tx/${tx.hash}`} target="_blank" rel="noreferrer"
            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-2">
              {isSuccess
                ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
              <div>
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded ${isSuccess ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {isSuccess ? "OK" : "Failed"}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(tx.timeStamp)}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-mono group-hover:text-accent transition-colors">
              {formatAddress(tx.hash)} <ExternalLink className="w-3 h-3 inline" />
            </span>
          </a>
        )
      })}
      <div className="text-center pt-1">
        <a href={`${ARCSCAN_URL}/address/${address}`} target="_blank" rel="noreferrer"
          className="text-cyan-400 hover:underline text-xs inline-flex items-center gap-1">
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
  const [useExactPayment, setUseExactPayment] = useState(false)
  const [txStatus, setTxStatus] = useState<TxStatus>("idle")
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null)

  // Batch payment state
  const [batchRows, setBatchRows] = useState<BatchRow[]>([{ recipient: "", amount: "" }, { recipient: "", amount: "" }])
  const [batchTxStatus, setBatchTxStatus] = useState<TxStatus>("idle")
  const [batchTxHash, setBatchTxHash] = useState<string | null>(null)

  const { isConnected, address } = useAccount()

  const { formatted: usdcBalance, isLoading: usdcLoading, refetch: refetchUSDC } = useTokenBalance('USDC')
  const { formatted: eurcBalance, isLoading: eurcLoading, refetch: refetchEURC } = useTokenBalance('EURC')
  const selectedBalance = selectedToken === 'USDC' ? usdcBalance : eurcBalance
  const selectedLoading = selectedToken === 'USDC' ? usdcLoading : eurcLoading

  const { formatted: paymentFee } = usePaymentFee()
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(selectedToken, ARCDEX.Payments)
  const { totalPayments, userPaymentCount } = usePaymentStats()

  const { approve, isPending: approving, isSuccess: approveSuccess, hash: approveHash } = useApprove()
  const { sendPayment, sendExactPayment, isPending: sending, isSuccess: sendSuccess, hash: sendHash, error: sendError } = useSendPayment()
  const { batchPayment, isPending: batchSending, isSuccess: batchSuccess, hash: batchHash, error: batchError } = useBatchPayment()

  // Compliance
  const { checkCompliance, preTransactionCheck, isVerified: complianceVerified, isBlocked: complianceBlocked, result: complianceResult } = useCompliance()
  useEffect(() => { if (isConnected && address) checkCompliance() }, [isConnected, address, checkCompliance])

  // Single payment: calculate total cost
  const feeNum = parseFloat(paymentFee) || 0.05
  const singleTotal = useExactPayment
    ? (parseFloat(amount || "0") + feeNum)
    : parseFloat(amount || "0")
  const needsApproval = amount && allowance !== undefined &&
    parseTokenAmount(singleTotal.toString()) > allowance

  // Batch: calculate total needed
  const batchTotalAmount = batchRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  const batchTotalFees = batchRows.filter(r => r.recipient && r.amount).length * feeNum
  const batchGrandTotal = batchTotalAmount + batchTotalFees
  const batchNeedsApproval = batchGrandTotal > 0 && allowance !== undefined &&
    parseTokenAmount(batchGrandTotal.toFixed(6)) > allowance

  const addBatchRow = () => setBatchRows(prev => [...prev, { recipient: "", amount: "" }])
  const removeBatchRow = (idx: number) => setBatchRows(prev => prev.filter((_, i) => i !== idx))
  const updateBatchRow = (idx: number, field: keyof BatchRow, value: string) => {
    setBatchRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  useEffect(() => { refetchAllowance() }, [selectedToken, refetchAllowance])
  useEffect(() => {
    if (approveSuccess && approveHash) {
      const t = setTimeout(() => refetchAllowance(), 1500)
      return () => clearTimeout(t)
    }
  }, [approveSuccess, approveHash, refetchAllowance])

  // Single payment status tracking
  useEffect(() => { if (sending) setTxStatus("signing") }, [sending])
  useEffect(() => { if (sendHash) { setCurrentTxHash(sendHash); setTxStatus("pending") } }, [sendHash])
  useEffect(() => {
    if (sendSuccess && sendHash) {
      setTxStatus("confirmed")
      setTimeout(() => { refetchUSDC(); refetchEURC(); refetchAllowance(); setAmount(""); setRecipient(""); setMemo("") }, 1000)
      setTimeout(() => { setTxStatus("idle"); setCurrentTxHash(null) }, 6000)
    }
  }, [sendSuccess, sendHash, refetchUSDC, refetchEURC, refetchAllowance])
  useEffect(() => {
    if (sendError) { setTxStatus("failed"); setTimeout(() => { setTxStatus("idle"); setCurrentTxHash(null) }, 5000) }
  }, [sendError])

  // Batch payment status tracking
  useEffect(() => { if (batchSending) setBatchTxStatus("signing") }, [batchSending])
  useEffect(() => { if (batchHash) { setBatchTxHash(batchHash); setBatchTxStatus("pending") } }, [batchHash])
  useEffect(() => {
    if (batchSuccess && batchHash) {
      setBatchTxStatus("confirmed")
      setTimeout(() => { refetchUSDC(); refetchEURC(); refetchAllowance(); setBatchRows([{ recipient: "", amount: "" }, { recipient: "", amount: "" }]) }, 1000)
      setTimeout(() => { setBatchTxStatus("idle"); setBatchTxHash(null) }, 6000)
    }
  }, [batchSuccess, batchHash, refetchUSDC, refetchEURC, refetchAllowance])
  useEffect(() => {
    if (batchError) { setBatchTxStatus("failed"); setTimeout(() => { setBatchTxStatus("idle"); setBatchTxHash(null) }, 5000) }
  }, [batchError])

  const handleApprove = async () => {
    const needed = Math.max(singleTotal, batchGrandTotal)
    if (needed <= 0) return
    await approve(selectedToken, ARCDEX.Payments, (needed * 10).toFixed(6))
  }

  const handleSendPayment = async () => {
    if (!amount || !recipient) return
    const allowed = await preTransactionCheck()
    if (!allowed) return
    setTxStatus("signing")
    if (useExactPayment) {
      await sendExactPayment(selectedToken, recipient, amount, memo)
    } else {
      await sendPayment(selectedToken, recipient, amount, memo)
    }
  }

  const handleBatchPayment = async () => {
    const validRows = batchRows.filter(r => r.recipient.startsWith('0x') && r.recipient.length === 42 && parseFloat(r.amount) > 0)
    if (validRows.length < 1) return
    const allowed = await preTransactionCheck()
    if (!allowed) return
    setBatchTxStatus("signing")
    await batchPayment(selectedToken, validRows.map(r => r.recipient), validRows.map(r => r.amount))
  }

  const handleMaxClick = () => {
    const balance = parseFloat(selectedBalance.replace(',', '')) || 0
    const maxAmount = Math.max(0, balance - feeNum)
    setAmount(maxAmount.toFixed(2))
  }

  const isValidAddress = recipient.startsWith('0x') && recipient.length === 42

  const StatusBanner = ({ status, hash, error: err }: { status: TxStatus; hash: string | null; error?: Error | null }) => {
    if (status === "idle") return null
    const colors = status === "confirmed" ? "bg-green-500/10 border-green-500/30" :
      status === "failed" ? "bg-red-500/10 border-red-500/30" : "bg-yellow-500/10 border-yellow-500/30"
    return (
      <div className={`rounded-lg p-3 border ${colors}`}>
        <div className="flex items-center gap-2">
          {status === "signing" && <><Clock className="w-4 h-4 text-yellow-400 animate-pulse" /><span className="text-yellow-400 text-sm">Waiting for wallet signature...</span></>}
          {status === "pending" && <><Loader2 className="w-4 h-4 text-yellow-400 animate-spin" /><span className="text-yellow-400 text-sm">Transaction pending...</span></>}
          {status === "confirmed" && <><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-green-400 text-sm">Confirmed!</span></>}
          {status === "failed" && <><XCircle className="w-4 h-4 text-red-400" /><span className="text-red-400 text-sm">{err?.message?.includes('User rejected') ? 'Cancelled' : 'Failed'}</span></>}
        </div>
        {hash && (status === "pending" || status === "confirmed") && (
          <a href={`${ARCSCAN_URL}/tx/${hash}`} target="_blank" rel="noreferrer"
            className="text-xs text-cyan-400 hover:underline mt-1 inline-flex items-center gap-1">
            View on ArcScan <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">Send stablecoins to any address on Arc Network.</p>
        </div>
      </div>

      <MobileWalletHint />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main payment area - 2 cols */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl p-6 border border-border glow-border">
            {/* Token selector */}
            <div className="mb-6 space-y-2">
              <Label className="text-foreground">Token</Label>
              <select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value as "USDC" | "EURC")}
                className="w-full bg-input text-foreground border border-border rounded-xl p-3 text-lg">
                <option value="USDC">USDC</option>
                <option value="EURC">EURC</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Balance: {!isConnected ? "---" : selectedLoading ? "..." : `${selectedBalance} ${selectedToken}`}
              </p>
            </div>

            {/* Compliance Status */}
            {isConnected && complianceVerified && (
              <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 rounded-lg p-2 mb-4">
                <ShieldCheck className="w-3.5 h-3.5" /> Compliance Verified
              </div>
            )}
            {isConnected && complianceBlocked && (
              <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/30 mb-4">
                <p className="text-sm text-red-400 font-medium flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Wallet Blocked</p>
                <p className="text-xs text-red-400/70 mt-1">Compliance screening flagged this wallet. Payments are disabled.</p>
              </div>
            )}

            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted border-border mb-6">
                <TabsTrigger value="single" className="flex items-center gap-2"><Send className="w-3.5 h-3.5" /> Single</TabsTrigger>
                <TabsTrigger value="batch" className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Batch</TabsTrigger>
              </TabsList>

              {/* Single Payment Tab */}
              <TabsContent value="single" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Recipient Address</Label>
                  <Input type="text" placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)}
                    className="bg-input text-foreground border-border" />
                  {recipient && !isValidAddress && <p className="text-xs text-red-400">Invalid address format</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Amount</Label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 bg-input text-foreground border-border" />
                    <Button variant="outline" onClick={handleMaxClick} disabled={!isConnected}
                      className="border-border text-accent hover:bg-muted bg-transparent">Max</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Memo <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input type="text" placeholder="Payment for..." value={memo} onChange={(e) => setMemo(e.target.value)}
                    className="bg-input text-foreground border-border" maxLength={256} />
                </div>

                {/* Exact payment toggle */}
                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div>
                    <p className="text-sm text-foreground font-medium">Exact Amount Mode</p>
                    <p className="text-xs text-muted-foreground">
                      {useExactPayment
                        ? "Recipient gets the exact amount. Fee added on top."
                        : "Fee deducted from amount. Recipient gets amount minus fee."}
                    </p>
                  </div>
                  <button onClick={() => setUseExactPayment(!useExactPayment)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${useExactPayment ? 'bg-accent' : 'bg-muted'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${useExactPayment ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                {/* Cost breakdown */}
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-foreground">{amount || "0.00"} {selectedToken}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Protocol Fee</span>
                    <span className="text-foreground">{paymentFee} {selectedToken}</span>
                  </div>
                  {useExactPayment && amount && (
                    <div className="flex justify-between text-sm border-t border-border pt-2">
                      <span className="text-muted-foreground">You Pay (Total)</span>
                      <span className="text-foreground font-semibold">{singleTotal.toFixed(2)} {selectedToken}</span>
                    </div>
                  )}
                  {!useExactPayment && amount && (
                    <div className="flex justify-between text-sm border-t border-border pt-2">
                      <span className="text-muted-foreground">Recipient Gets</span>
                      <span className="text-foreground font-semibold">{Math.max(0, parseFloat(amount) - feeNum).toFixed(2)} {selectedToken}</span>
                    </div>
                  )}
                </div>

                <StatusBanner status={txStatus} hash={currentTxHash} error={sendError} />

                {!isConnected ? (
                  <Button className="w-full btn-gradient h-12" disabled>Connect Wallet</Button>
                ) : needsApproval ? (
                  <Button className="w-full btn-gradient h-12" onClick={handleApprove} disabled={approving || !amount || !isValidAddress}>
                    {approving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Approving...</> : `Approve ${selectedToken}`}
                  </Button>
                ) : (
                  <Button className="w-full btn-gradient h-12" onClick={handleSendPayment}
                    disabled={sending || !amount || !isValidAddress || parseFloat(amount) <= 0 || txStatus !== "idle"}>
                    {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : "Send Payment"}
                  </Button>
                )}
              </TabsContent>

              {/* Batch Payment Tab */}
              <TabsContent value="batch" className="space-y-4">
                <div className="space-y-3">
                  {batchRows.map((row, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        <Input type="text" placeholder="0x... recipient" value={row.recipient}
                          onChange={(e) => updateBatchRow(idx, "recipient", e.target.value)}
                          className="bg-input text-foreground border-border text-sm" />
                      </div>
                      <div className="w-28">
                        <Input type="number" placeholder="0.00" value={row.amount}
                          onChange={(e) => updateBatchRow(idx, "amount", e.target.value)}
                          className="bg-input text-foreground border-border text-sm" />
                      </div>
                      {batchRows.length > 2 && (
                        <Button variant="ghost" size="sm" onClick={() => removeBatchRow(idx)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button variant="outline" size="sm" onClick={addBatchRow}
                  className="border-border text-accent hover:bg-muted bg-transparent">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Recipient
                </Button>

                {/* Batch cost summary */}
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recipients</span>
                    <span className="text-foreground">{batchRows.filter(r => r.recipient && r.amount).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="text-foreground">{batchTotalAmount.toFixed(2)} {selectedToken}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Fees</span>
                    <span className="text-foreground">{batchTotalFees.toFixed(2)} {selectedToken}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border pt-2">
                    <span className="text-muted-foreground font-medium">Grand Total</span>
                    <span className="text-foreground font-bold">{batchGrandTotal.toFixed(2)} {selectedToken}</span>
                  </div>
                </div>

                <StatusBanner status={batchTxStatus} hash={batchTxHash} error={batchError} />

                {!isConnected ? (
                  <Button className="w-full btn-gradient h-12" disabled>Connect Wallet</Button>
                ) : batchNeedsApproval ? (
                  <Button className="w-full btn-gradient h-12" onClick={handleApprove} disabled={approving}>
                    {approving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Approving...</> : `Approve ${selectedToken}`}
                  </Button>
                ) : (
                  <Button className="w-full btn-gradient h-12" onClick={handleBatchPayment}
                    disabled={batchSending || batchTotalAmount <= 0 || batchTxStatus !== "idle"}>
                    {batchSending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Batch...</> : `Send Batch Payment`}
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar - 1 col */}
        <div className="space-y-6">
          {/* Balances */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Your Balances</h3>
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-lg p-4 flex justify-between items-center">
                <span className="text-muted-foreground">USDC</span>
                <span className="text-foreground font-bold font-mono">{!isConnected ? "---" : usdcLoading ? "..." : usdcBalance}</span>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 flex justify-between items-center">
                <span className="text-muted-foreground">EURC</span>
                <span className="text-foreground font-bold font-mono">{!isConnected ? "---" : eurcLoading ? "..." : eurcBalance}</span>
              </div>
            </div>
          </div>

          {/* Protocol Stats */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Payment Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Protocol Payments</span>
                <span className="text-foreground font-medium">{totalPayments !== undefined ? totalPayments.toString() : "..."}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your Payments</span>
                <span className="text-foreground font-medium">{userPaymentCount !== undefined ? userPaymentCount.toString() : isConnected ? "..." : "---"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Protocol Fee</span>
                <span className="text-foreground font-medium">{paymentFee} per tx</span>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Payment History</h3>
            <PaymentHistory address={address} />
          </div>
        </div>
      </div>
    </div>
  )
}
