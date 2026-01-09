"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import {
  useTokenBalance,
  useTokenAllowance,
  useApprove,
  usePaymentFee,
  useSendPayment,
} from "@/hooks/use-contracts"
import { ARCDEX, PROTOCOL } from "@/lib/contracts"

export function PaymentsSection() {
  const { isConnected, address } = useAccount()
  const [token, setToken] = useState<"USDC" | "EURC">("USDC")
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [recentPayments, setRecentPayments] = useState<Array<{
    date: string
    token: string
    amount: string
    to: string
    ref: string
    tx: string
  }>>([])

  // Balances and data
  const { formatted: tokenBalance, refetch: refetchBalance } = useTokenBalance(token)
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(token, ARCDEX.Payments)
  const { formatted: paymentFee } = usePaymentFee()

  // Actions
  const { approve, isPending: isApproving, isConfirming: isApprovingConfirm, isSuccess: approveSuccess } = useApprove()
  const { sendPayment, hash, isPending: isSending, isConfirming: isSendingConfirm, isSuccess: sendSuccess, error: sendError } = useSendPayment()

  // Check approval
  const totalCost = amount ? parseFloat(amount) + PROTOCOL.PAYMENT_FEE / 1e6 : 0
  const parsedTotal = totalCost ? BigInt(Math.floor(totalCost * 1e6)) : BigInt(0)
  const needsApproval = allowance !== undefined && parsedTotal > BigInt(0) && allowance < parsedTotal

  // Handlers
  const handleApprove = () => approve(token, ARCDEX.Payments, "999999999999")

  const handleSendPayment = async () => {
    if (!recipient || !amount) return
    await sendPayment(token, recipient, amount, memo)
  }

  // Add to recent payments on success
  useEffect(() => {
    if (sendSuccess && hash) {
      const newPayment = {
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        token,
        amount,
        to: `${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
        ref: memo || "No memo",
        tx: `${hash.slice(0, 6)}...${hash.slice(-4)}`,
      }
      setRecentPayments((prev) => [newPayment, ...prev.slice(0, 4)])
      setRecipient("")
      setAmount("")
      setMemo("")
      refetchBalance()
    }
  }, [sendSuccess, hash, token, amount, recipient, memo, refetchBalance])

  // Refresh allowance after approve
  useEffect(() => {
    if (approveSuccess) refetchAllowance()
  }, [approveSuccess, refetchAllowance])

  const isLoading = isApproving || isApprovingConfirm || isSending || isSendingConfirm

  // Validate address
  const isValidAddress = recipient.startsWith("0x") && recipient.length === 42

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Send Payment</h2>
        <p className="text-muted-foreground mt-1">Send stablecoins globally with minimal fees</p>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border glow-border max-w-lg">
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="payment-token" className="text-foreground">Token</Label>
            <select
              id="payment-token"
              value={token}
              onChange={(e) => setToken(e.target.value as "USDC" | "EURC")}
              className="w-full bg-input text-foreground border border-border rounded-lg p-2"
            >
              <option>USDC</option>
              <option>EURC</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="recipient" className="text-foreground">Recipient Address</Label>
              {recipient && !isValidAddress && (
                <span className="text-xs text-destructive">Invalid address</span>
              )}
            </div>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={`bg-input text-foreground border-border ${recipient && !isValidAddress ? 'border-destructive' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="amount" className="text-foreground">Amount</Label>
              <span className="text-xs text-muted-foreground">Balance: {tokenBalance}</span>
            </div>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-input text-foreground border-border flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const maxAmount = Math.max(0, parseFloat(tokenBalance) - PROTOCOL.PAYMENT_FEE / 1e6)
                  setAmount(maxAmount.toFixed(2))
                }}
                className="border-border text-accent hover:bg-muted bg-transparent"
              >
                Max
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference" className="text-foreground">Reference / Description (Optional)</Label>
            <textarea
              id="reference"
              placeholder="Invoice #1234, Service payment, etc."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full bg-input text-foreground border border-border rounded-lg p-2 resize-none"
              rows={3}
            />
          </div>

          {/* Cost breakdown */}
          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="text-foreground">{amount || "0.00"} {token}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className="text-foreground">{paymentFee} {token}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-foreground font-semibold">Total</span>
              <span className="text-accent font-semibold">
                {amount ? (parseFloat(amount) + parseFloat(paymentFee)).toFixed(2) : paymentFee} {token}
              </span>
            </div>
          </div>
        </div>

        {!isConnected ? (
          <Button className="w-full" disabled>Connect Wallet</Button>
        ) : needsApproval ? (
          <Button className="w-full btn-gradient mb-4" onClick={handleApprove} disabled={isLoading}>
            {isApproving || isApprovingConfirm ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Approving...</>
            ) : (
              `Approve ${token}`
            )}
          </Button>
        ) : (
          <Button
            className="w-full btn-gradient mb-4"
            onClick={handleSendPayment}
            disabled={isLoading || !recipient || !amount || !isValidAddress || parseFloat(amount) <= 0}
          >
            {isSending || isSendingConfirm ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
            ) : (
              "Send Payment"
            )}
          </Button>
        )}

        {sendError && (
          <p className="text-xs text-destructive text-center mb-4">{sendError.message.slice(0, 100)}</p>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Payments are processed on Arc Testnet. Fee: {paymentFee} {token} per transaction.
        </p>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Payments</h3>
        {recentPayments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No recent payments</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Token</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">To</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Reference</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((row, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/50">
                    <td className="py-2 text-foreground">{row.date}</td>
                    <td className="py-2 text-accent font-semibold">{row.token}</td>
                    <td className="py-2 text-foreground">{row.amount}</td>
                    <td className="py-2 text-foreground text-xs">{row.to}</td>
                    <td className="py-2 text-muted-foreground">{row.ref}</td>
                    <td className="py-2 text-accent text-xs">
                      <a
                        href={`https://testnet.arcscan.app/tx/${row.tx}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {row.tx}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
