"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HistoryPage() {
  const [filterToken, setFilterToken] = useState("all")

  const transactions = [
    { type: "Stake", token: "USDC", amount: "1000", date: "Dec 5, 2024", status: "Completed" },
    { type: "Swap", token: "USDC → EURC", amount: "500", date: "Dec 4, 2024", status: "Completed" },
    { type: "Pool", token: "USDC/EURC", amount: "250", date: "Dec 3, 2024", status: "Completed" },
    { type: "Unstake", token: "USDC", amount: "500", date: "Dec 2, 2024", status: "Completed" },
    { type: "Payment", token: "USDC", amount: "100", date: "Dec 1, 2024", status: "Completed" },
  ]

  const filteredTransactions =
    filterToken === "all" ? transactions : transactions.filter((t) => t.token.includes(filterToken))

  return (
    <main className="min-h-screen bg-background arc-gradient-bg text-foreground">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Transaction History</h1>
          <p className="text-muted-foreground">View all your transactions on Arc Network.</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted border-border mb-6">
              <TabsTrigger value="all" onClick={() => setFilterToken("all")}>
                All
              </TabsTrigger>
              <TabsTrigger value="USDC" onClick={() => setFilterToken("USDC")}>
                USDC
              </TabsTrigger>
              <TabsTrigger value="EURC" onClick={() => setFilterToken("EURC")}>
                EURC
              </TabsTrigger>
              <TabsTrigger value="Stake" onClick={() => setFilterToken("Stake")}>
                Stake
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filterToken} className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Type</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Token/Pair</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Amount</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx, i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 text-foreground font-medium">{tx.type}</td>
                        <td className="py-3 text-foreground">{tx.token}</td>
                        <td className="py-3 text-accent font-semibold">{tx.amount}</td>
                        <td className="py-3 text-muted-foreground">{tx.date}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
