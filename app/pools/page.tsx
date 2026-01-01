"use client"

import { useState } from "react"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

export default function PoolsPage() {
  const [liquidityPercentage, setLiquidityPercentage] = useState(50)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Liquidity Pools</h1>
          <p className="text-muted-foreground">Provide liquidity to pools and earn trading fees.</p>
        </div>

        {/* Pool Stats */}
        <div className="bg-card rounded-xl p-6 border border-border glow-border">
          <h3 className="text-xl font-semibold text-foreground mb-6">USDC / EURC Pool</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard title="TVL" value="$2.5M" />
            <StatCard title="My Liquidity" value="$15,250" />
            <StatCard title="APR" value="12.4%" />
          </div>

          {/* Add/Remove Tabs */}
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted border-border mb-6">
              <TabsTrigger value="add">Add Liquidity</TabsTrigger>
              <TabsTrigger value="remove">Remove Liquidity</TabsTrigger>
            </TabsList>

            {/* Add Liquidity */}
            <TabsContent value="add" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usdc-add" className="text-foreground">
                  USDC Amount
                </Label>
                <Input
                  id="usdc-add"
                  type="number"
                  placeholder="0.00"
                  className="bg-input text-foreground border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eurc-add" className="text-foreground">
                  EURC Amount
                </Label>
                <Input
                  id="eurc-add"
                  type="number"
                  placeholder="0.00"
                  className="bg-input text-foreground border-border"
                />
              </div>

              <div className="bg-muted rounded-lg p-4">
                <p className="text-xs text-muted-foreground">You will receive</p>
                <p className="text-2xl font-bold text-accent mt-1">150.25 LP Shares</p>
              </div>

              <Button className="w-full btn-gradient">Add Liquidity</Button>
            </TabsContent>

            {/* Remove Liquidity */}
            <TabsContent value="remove" className="space-y-4">
              <div className="bg-muted rounded-lg p-4 mb-4">
                <p className="text-xs text-muted-foreground">LP Balance</p>
                <p className="text-2xl font-bold text-foreground mt-1">425.75 LP Shares</p>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">Percentage: {liquidityPercentage}%</Label>
                <Slider
                  value={[liquidityPercentage]}
                  onValueChange={(value) => setLiquidityPercentage(value[0])}
                  max={100}
                  step={25}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 bg-input rounded-lg p-4">
                <div>
                  <p className="text-xs text-muted-foreground">You will receive (USDC)</p>
                  <p className="text-lg font-bold text-accent">{((200 * liquidityPercentage) / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">You will receive (EURC)</p>
                  <p className="text-lg font-bold text-accent">{((184 * liquidityPercentage) / 100).toFixed(2)}</p>
                </div>
              </div>

              <Button className="w-full btn-gradient">Remove Liquidity</Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Pool Activity Table */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Pool Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Action</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Pair</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Amounts</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    date: "Dec 5, 2024",
                    action: "Add",
                    pair: "USDC/EURC",
                    amounts: "500 USDC, 460 EURC",
                    tx: "0x1234...abcd",
                  },
                  {
                    date: "Dec 3, 2024",
                    action: "Remove",
                    pair: "USDC/EURC",
                    amounts: "250 USDC, 230 EURC",
                    tx: "0x5678...efgh",
                  },
                  {
                    date: "Nov 30, 2024",
                    action: "Add",
                    pair: "USDC/EURC",
                    amounts: "1000 USDC, 920 EURC",
                    tx: "0x9abc...ijkl",
                  },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/50">
                    <td className="py-2 text-foreground">{row.date}</td>
                    <td className="py-2 text-foreground">{row.action}</td>
                    <td className="py-2 text-foreground">{row.pair}</td>
                    <td className="py-2 text-foreground">{row.amounts}</td>
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
