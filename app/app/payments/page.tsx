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
import { ARCDEX, PROTOCOL, parseTokenAmount, ARCSCAN_API, ARCSCAN_URL } from "@/lib/contracts"
import { MobileWalletHint } from "@/components/mobile-wallet-hint"
import { useCompliance } from "@/hooks/useCompliance"
import { useI18n } from "@/lib/i18n"



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

function PaymentHistory({ address, refreshKey }: { address: string | undefined; refreshKey?: string | number }) {
  const { t } = useI18n()
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
      setError(t("payments.failedLoad"))
    } finally {
      setIsLoading(false)
    }
  }, [address, t])

  // Re-fetch on mount AND whenever refreshKey changes (bumped by the parent
  // right after a payment/batch confirms). Without this, a successful payment
  // never showed up here until the whole page was manually reloaded.
  useEffect(() => { fetchPayments() }, [fetchPayments, refreshKey])

  if (!address) return <p className="text-muted-foreground text-center py-6">{t("payments.connectHistory")}</p>
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
      <Button variant="outline" size="sm" onClick={fetchPayments}><RefreshCw className="w-3 h-3 mr-1" /> {t("common.retry")}</Button>
    </div>
  )
  if (transactions.length === 0) return (
    <div className="text-center py-6">
      <p className="text-muted-foreground text-sm mb-3">{t("payments.noPayments")}</p>
      <Button variant="outline" size="sm" onClick={fetchPayments}><RefreshCw className="w-3 h-3 mr-1" /> {t("common.refresh")}</Button>
    </div>
  )

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const isSuccess = tx.isError === '0'
        const method = tx.functionName?.split("(")[0] || "payment"
        const label = method === "batchPayment" ? t("payments.batch") : method === "sendExactPayment" ? t("payments.exact") : t("payments.payment")
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
                    {isSuccess ? "OK" : t("common.failed")}
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
          {t("common.viewAllArcScan")} <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

export default function PaymentsPage() {
  const { t } = useI18n()
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

  // Bumped after a payment confirms so <PaymentHistory> refetches from ArcScan
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  const { isConnected, address } = useAccount()

  const { formatted: usdcBalance, isLoading: usdcLoading, refetch: refetchUSDC } = useTokenBalance('USDC')
  const { formatted: eurcBalance, isLoading: eurcLoading, refetch: refetchEURC } = useTokenBalance('EURC')
  const selectedBalance = selectedToken === 'USDC' ? usdcBalance : eurcBalance
  const selectedLoading = selectedToken === 'USDC' ? usdcLoading : eurcLoading

  const { formatted: paymentFee } = usePaymentFee()
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(selectedToken, ARCDEX.Payments)
  const { totalPayments, userPaymentCount, refetch: refetchPaymentStats } = usePaymentStats()

  const { approve, isPending: approving, isConfirming: approveConfirming, isSuccess: approveSuccess, hash: approveHash } = useApprove()
  const [justApproved, setJustApproved] = useState(false)
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
  const needsApproval = !justApproved && amount && allowance !== undefined &&
    parseTokenAmount(singleTotal.toString()) > allowance

  // Batch: calculate total needed
  const batchTotalAmount = batchRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  const batchTotalFees = batchRows.filter(r => r.recipient && r.amount).length * feeNum
  const batchGrandTotal = batchTotalAmount + batchTotalFees
  const batchNeedsApproval = !justApproved && batchGrandTotal > 0 && allowance !== undefined &&
    parseTokenAmount(batchGrandTotal.toFixed(6)) > allowance

  const addBatchRow = () => setBatchRows(prev => [...prev, { recipient: "", amount: "" }])
  const removeBatchRow = (idx: number) => setBatchRows(prev => prev.filter((_, i) => i !== idx))
  const updateBatchRow = (idx: number, field: keyof BatchRow, value: string) => {
    setBatchRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  useEffect(() => { refetchAllowance(); setJustApproved(false) }, [selectedToken, refetchAllowance])
  useEffect(() => {
    if (approveSuccess && approveHash) {
      setJustApproved(true)
      const t1 = setTimeout(() => refetchAllowance(), 1000)
      const t2 = setTimeout(() => refetchAllowance(), 3000)
      const t3 = setTimeout(() => refetchAllowance(), 5000)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }
  }, [approveSuccess, approveHash, refetchAllowance])

  // Single payment status tracking
  useEffect(() => { if (sending) setTxStatus("signing") }, [sending])
  useEffect(() => { if (sendHash) { setCurrentTxHash(sendHash); setTxStatus("pending") } }, [sendHash])
  useEffect(() => {
    if (sendSuccess && sendHash) {
      setTxStatus("confirmed")
      setTimeout(() => { refetchUSDC(); refetchEURC(); refetchAllowance(); setJustApproved(false); setAmount(""); setRecipient(""); setMemo("") }, 1000)
      setTimeout(() => { setTxStatus("idle"); setCurrentTxHash(null) }, 6000)
      // Refresh on-chain stats + the ArcScan-backed history. Staggered because
      // the explorer indexer can lag a few seconds behind the confirmed tx.
      refetchPaymentStats()
      setHistoryRefreshKey((k) => k + 1)
      const h1 = setTimeout(() => { refetchPaymentStats(); setHistoryRefreshKey((k) => k + 1) }, 3000)
      const h2 = setTimeout(() => { refetchPaymentStats(); setHistoryRefreshKey((k) => k + 1) }, 7000)
      return () => { clearTimeout(h1); clearTimeout(h2) }
    }
  }, [sendSuccess, sendHash, refetchUSDC, refetchEURC, refetchAllowance, refetchPaymentStats])
  useEffect(() => {
    if (sendError) { setTxStatus("failed"); setTimeout(() => { setTxStatus("idle"); setCurrentTxHash(null) }, 5000) }
  }, [sendError])

  // Batch payment status tracking
  useEffect(() => { if (batchSending) setBatchTxStatus("signing") }, [batchSending])
  useEffect(() => { if (batchHash) { setBatchTxHash(batchHash); setBatchTxStatus("pending") } }, [batchHash])
  useEffect(() => {
    if (batchSuccess && batchHash) {
      setBatchTxStatus("confirmed")
      setTimeout(() => { refetchUSDC(); refetchEURC(); refetchAllowance(); setJustApproved(false); setBatchRows([{ recipient: "", amount: "" }, { recipient: "", amount: "" }]) }, 1000)
      setTimeout(() => { setBatchTxStatus("idle"); setBatchTxHash(null) }, 6000)
      refetchPaymentStats()
      setHistoryRefreshKey((k) => k + 1)
      const h1 = setTimeout(() => { refetchPaymentStats(); setHistoryRefreshKey((k) => k + 1) }, 3000)
      const h2 = setTimeout(() => { refetchPaymentStats(); setHistoryRefreshKey((k) => k + 1) }, 7000)
      return () => { clearTimeout(h1); clearTimeout(h2) }
    }
  }, [batchSuccess, batchHash, refetchUSDC, refetchEURC, refetchAllowance, refetchPaymentStats])
  useEffect(() => {
    if (batchError) { setBatchTxStatus("failed"); setTimeout(() => { setBatchTxStatus("idle"); setBatchTxHash(null) }, 5000) }
  }, [batchError])

  const handleApprove = async () => {
    const needed = Math.max(singleTotal, batchGrandTotal)
    if (needed <= 0) return
    try {
      await approve(selectedToken, ARCDEX.Payments, '999999999')
      setJustApproved(true)
    } catch {
      // User rejected or error
    }
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

  /**
   * MAX descontando a taxa do protocolo E o gas.
   *
   * Na Arc o USDC é ao mesmo tempo o gas token nativo (18 casas) e o ERC-20
   * (6 casas) — o MESMO saldo. Descontar só a taxa do protocolo, como antes,
   * ainda deixava o pagamento sem gas e a transação revertia.
   * Ver: arc.io/blog/building-with-usdc-on-arc-one-token-two-interfaces
   */
  const handleMaxClick = () => {
    const balance = parseFloat(selectedBalance.replace(',', '')) || 0
    const gasReserve = selectedToken === 'USDC' ? PROTOCOL.GAS_RESERVE_USDC : 0
    const maxAmount = Math.max(0, balance - feeNum - gasReserve)
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
          {status === "signing" && <><Clock className="w-4 h-4 text-yellow-400 animate-pulse" /><span className="text-yellow-600 dark:text-yellow-400 text-sm">{t("payments.waitingSignature")}</span></>}
          {status === "pending" && <><Loader2 className="w-4 h-4 text-yellow-400 animate-spin" /><span className="text-yellow-600 dark:text-yellow-400 text-sm">{t("payments.pending")}</span></>}
          {status === "confirmed" && <><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-green-600 dark:text-green-400 text-sm">{t("common.confirmed")}!</span></>}
          {status === "failed" && <><XCircle className="w-4 h-4 text-red-400" /><span className="text-red-400 text-sm">{err?.message?.includes('User rejected') ? t("payments.cancelled") : t("common.failed")}</span></>}
        </div>
        {hash && (status === "pending" || status === "confirmed") && (
          <a href={`${ARCSCAN_URL}/tx/${hash}`} target="_blank" rel="noreferrer"
            className="text-xs text-cyan-400 hover:underline mt-1 inline-flex items-center gap-1">
            {t("common.viewArcScan")} <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("payments.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("payments.subtitle")}</p>
        </div>
      </div>

      <MobileWalletHint />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main payment area - 2 cols */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl p-6 border border-border glow-border">
            {/* Token selector */}
            <div className="mb-6 space-y-2">
              <Label className="text-foreground">{t("common.token")}</Label>
              <select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value as "USDC" | "EURC")}
                className="w-full bg-input text-foreground border border-border rounded-xl p-3 text-lg">
                <option value="USDC">USDC</option>
                <option value="EURC">EURC</option>
              </select>
              <p className="text-xs text-muted-foreground">
                {t("common.balance")}: {!isConnected ? "---" : selectedLoading ? "..." : `${selectedBalance} ${selectedToken}`}
              </p>
            </div>

            {/* Compliance Status */}
            {isConnected && complianceVerified && (
              <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 rounded-lg p-2 mb-4">
                <ShieldCheck className="w-3.5 h-3.5" /> {t("common.complianceVerified")}
              </div>
            )}
            {isConnected && complianceBlocked && (
              <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/30 mb-4">
                <p className="text-sm text-red-400 font-medium flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> {t("common.walletBlocked")}</p>
                <p className="text-xs text-red-400/70 mt-1">{t("payments.flagged")}</p>
              </div>
            )}

            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted border-border mb-6">
                <TabsTrigger value="single" className="flex items-center gap-2"><Send className="w-3.5 h-3.5" /> {t("payments.single")}</TabsTrigger>
                <TabsTrigger value="batch" className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> {t("payments.batch")}</TabsTrigger>
              </TabsList>

              {/* Single Payment Tab */}
              <TabsContent value="single" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">{t("payments.recipient")}</Label>
                  <Input type="text" placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)}
                    className="bg-input text-foreground border-border" />
                  {recipient && !isValidAddress && <p className="text-xs text-red-400">{t("payments.invalidAddress")}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">{t("common.amount")}</Label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 bg-input text-foreground border-border" />
                    <Button variant="outline" onClick={handleMaxClick} disabled={!isConnected}
                      className="border-border text-accent hover:bg-muted bg-transparent">{t("common.max")}</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">{t("payments.memo")} <span className="text-muted-foreground text-xs">{t("payments.memoOptional")}</span></Label>
                  <Input type="text" placeholder={t("payments.memoPlaceholder")} value={memo} onChange={(e) => setMemo(e.target.value)}
                    className="bg-input text-foreground border-border" maxLength={256} />
                </div>

                {/* Exact payment toggle */}
                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div>
                    <p className="text-sm text-foreground font-medium">{t("payments.exactMode")}</p>
                    <p className="text-xs text-muted-foreground">
                      {useExactPayment
                        ? t("payments.exactOn")
                        : t("payments.exactOff")}
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
                    <span className="text-muted-foreground">{t("common.amount")}</span>
                    <span className="text-foreground">{amount || "0.00"} {selectedToken}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("payments.protocolFee")}</span>
                    <span className="text-foreground">{paymentFee} {selectedToken}</span>
                  </div>
                  {useExactPayment && amount && (
                    <div className="flex justify-between text-sm border-t border-border pt-2">
                      <span className="text-muted-foreground">{t("payments.youPay")}</span>
                      <span className="text-foreground font-semibold">{singleTotal.toFixed(2)} {selectedToken}</span>
                    </div>
                  )}
                  {!useExactPayment && amount && (
                    <div className="flex justify-between text-sm border-t border-border pt-2">
                      <span className="text-muted-foreground">{t("payments.recipientGets")}</span>
                      <span className="text-foreground font-semibold">{Math.max(0, parseFloat(amount) - feeNum).toFixed(2)} {selectedToken}</span>
                    </div>
                  )}
                </div>

                <StatusBanner status={txStatus} hash={currentTxHash} error={sendError} />

                {!isConnected ? (
                  <Button className="w-full btn-gradient h-12" disabled>{t("common.connectWallet")}</Button>
                ) : needsApproval ? (
                  <Button className="w-full btn-gradient h-12" onClick={handleApprove} disabled={approving || approveConfirming || !amount || !isValidAddress}>
                    {approving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("common.approving")}</> : approveConfirming ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("common.confirming")}</> : `${t("common.approve")} ${selectedToken}`}
                  </Button>
                ) : (
                  <Button className="w-full btn-gradient h-12" onClick={handleSendPayment}
                    disabled={sending || approveConfirming || !amount || !isValidAddress || parseFloat(amount) <= 0 || txStatus !== "idle"}>
                    {approveConfirming ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("common.confirmingApproval")}</> : sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("payments.sending")}</> : t("payments.sendPayment")}
                  </Button>
                )}
              </TabsContent>

              {/* Batch Payment Tab */}
              <TabsContent value="batch" className="space-y-4">
                <div className="space-y-3">
                  {batchRows.map((row, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        <Input type="text" placeholder={t("payments.recipientPlaceholder")} value={row.recipient}
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
                  <Plus className="w-3.5 h-3.5 mr-1" /> {t("payments.addRecipient")}
                </Button>

                {/* Batch cost summary */}
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("payments.recipients")}</span>
                    <span className="text-foreground">{batchRows.filter(r => r.recipient && r.amount).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("payments.totalAmount")}</span>
                    <span className="text-foreground">{batchTotalAmount.toFixed(2)} {selectedToken}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("payments.totalFees")}</span>
                    <span className="text-foreground">{batchTotalFees.toFixed(2)} {selectedToken}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border pt-2">
                    <span className="text-muted-foreground font-medium">{t("payments.grandTotal")}</span>
                    <span className="text-foreground font-bold">{batchGrandTotal.toFixed(2)} {selectedToken}</span>
                  </div>
                </div>

                <StatusBanner status={batchTxStatus} hash={batchTxHash} error={batchError} />

                {!isConnected ? (
                  <Button className="w-full btn-gradient h-12" disabled>{t("common.connectWallet")}</Button>
                ) : batchNeedsApproval ? (
                  <Button className="w-full btn-gradient h-12" onClick={handleApprove} disabled={approving || approveConfirming}>
                    {approving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("common.approving")}</> : approveConfirming ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("common.confirming")}</> : `${t("common.approve")} ${selectedToken}`}
                  </Button>
                ) : (
                  <Button className="w-full btn-gradient h-12" onClick={handleBatchPayment}
                    disabled={batchSending || approveConfirming || batchTotalAmount <= 0 || batchTxStatus !== "idle"}>
                    {approveConfirming ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("common.confirmingApproval")}</> : batchSending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("payments.sendingBatch")}</> : t("payments.sendBatch")}
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
            <h3 className="text-lg font-semibold text-foreground mb-4">{t("common.yourBalances")}</h3>
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
            <h3 className="text-lg font-semibold text-foreground mb-4">{t("payments.stats")}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("payments.totalProtocolPayments")}</span>
                <span className="text-foreground font-medium">{totalPayments !== undefined ? totalPayments.toString() : "..."}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("payments.yourPayments")}</span>
                <span className="text-foreground font-medium">{userPaymentCount !== undefined ? userPaymentCount.toString() : isConnected ? "..." : "---"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("payments.protocolFee")}</span>
                <span className="text-foreground font-medium">{paymentFee} {t("payments.perTx")}</span>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t("payments.history")}</h3>
            <PaymentHistory address={address} refreshKey={historyRefreshKey} />
          </div>
        </div>
      </div>
    </div>
  )
}
