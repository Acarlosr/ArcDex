"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PaymentsPage() {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A304F] via-[#114B6E] to-[#D1D5DB] text-slate-50">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Send Payments</h1>
          <p className="text-muted-foreground">Send stablecoins to other addresses on Arc Network.</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border glow-border max-w-md">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token" className="text-foreground">
                Token
              </Label>
              <select
                id="token"
                defaultValue="USDC"
                className="w-full bg-input text-foreground border border-border rounded-lg p-2"
              >
                <option>USDC</option>
                <option>EURC</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-foreground">
                Recipient Address
              </Label>
              <Input
                id="recipient"
                type="text"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="bg-input text-foreground border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground">
                Amount
              </Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-input text-foreground border-border"
                />
                <Button variant="outline" className="border-border text-accent hover:bg-muted bg-transparent">
                  Max
                </Button>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="text-foreground">~0.05 USDC</span>
              </div>
            </div>

            <Button className="w-full btn-gradient">Send Payment</Button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Recipient</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    date: "Dec 5, 2024",
                    recipient: "0xabcd...1234",
                    amount: "100 USDC",
                    status: "Completed",
                    tx: "0x1234...abcd",
                  },
                  {
                    date: "Dec 3, 2024",
                    recipient: "0xefgh...5678",
                    amount: "50 EURC",
                    status: "Completed",
                    tx: "0x5678...efgh",
                  },
                  {
                    date: "Nov 30, 2024",
                    recipient: "0xijkl...9abc",
                    amount: "250 USDC",
                    status: "Completed",
                    tx: "0x9abc...ijkl",
                  },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/50">
                    <td className="py-2 text-foreground">{row.date}</td>
                    <td className="py-2 text-foreground text-xs">{row.recipient}</td>
                    <td className="py-2 text-foreground">{row.amount}</td>
                    <td className="py-2">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">{row.status}</span>
                    </td>
                    <td className="py-2 text-accent text-xs">{row.tx}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
