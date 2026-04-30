"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const mockTransactions = [
  { date: "Dec 6, 2024", type: "STAKE", tokens: "USDC", amount: "500.00", tx: "0x1a1a...1a1a" },
  { date: "Dec 5, 2024", type: "SWAP", tokens: "USDC → EURC", amount: "250.00", tx: "0x2b2b...2b2b" },
  { date: "Dec 4, 2024", type: "ADD_LIQUIDITY", tokens: "USDC/EURC", amount: "1000.00", tx: "0x3c3c...3c3c" },
  { date: "Dec 3, 2024", type: "REMOVE_LIQUIDITY", tokens: "USDC/EURC", amount: "500.00", tx: "0x4d4d...4d4d" },
  { date: "Dec 2, 2024", type: "PAYMENT", tokens: "USDC", amount: "250.00", tx: "0x5e5e...5e5e" },
  { date: "Dec 1, 2024", type: "STAKE", tokens: "EURC", amount: "350.00", tx: "0x6f6f...6f6f" },
]

function TxHistoryTable({ transactions }: { transactions: typeof mockTransactions }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Type</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Token(s)</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Amount</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Tx Hash</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => (
            <tr key={i} className="border-b border-border hover:bg-muted/50">
              <td className="py-2 text-foreground">{tx.date}</td>
              <td className="py-2 text-accent font-semibold">{tx.type.replace(/_/g, " ")}</td>
              <td className="py-2 text-foreground">{tx.tokens}</td>
              <td className="py-2 text-foreground">{tx.amount}</td>
              <td className="py-2 text-accent text-xs">{tx.tx}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function HistorySection() {
  const [activeTab, setActiveTab] = useState("all")

  const getFilteredTransactions = () => {
    if (activeTab === "all") return mockTransactions
    return mockTransactions.filter((tx) => tx.type === activeTab.toUpperCase())
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Transaction History</h2>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border glow-border">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 bg-muted border-border mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="swap">Swap</TabsTrigger>
            <TabsTrigger value="add_liquidity">Pools</TabsTrigger>
            <TabsTrigger value="payment">Payments</TabsTrigger>
            <TabsTrigger value="remove_liquidity">Remove LP</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <TxHistoryTable transactions={getFilteredTransactions()} />
          </TabsContent>

          <TabsContent value="stake">
            <TxHistoryTable transactions={getFilteredTransactions()} />
          </TabsContent>

          <TabsContent value="swap">
            <TxHistoryTable transactions={getFilteredTransactions()} />
          </TabsContent>

          <TabsContent value="add_liquidity">
            <TxHistoryTable transactions={getFilteredTransactions()} />
          </TabsContent>

          <TabsContent value="payment">
            <TxHistoryTable transactions={getFilteredTransactions()} />
          </TabsContent>

          <TabsContent value="remove_liquidity">
            <TxHistoryTable transactions={getFilteredTransactions()} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
