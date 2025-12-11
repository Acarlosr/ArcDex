"use client"

import { useState } from "react"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export default function PoolsPage() {
  const [liquidityPercentage, setLiquidityPercentage] = useState(50)
  const [usdcAmount, setUsdcAmount] = useState("")
  const [eurcAmount, setEurcAmount] = useState("")

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Liquidity Pools</h1>
          <p className="text-muted-foreground mt-1">Provide liquidity to pools and earn trading fees.</p>
        </div>
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="TVL" value="$2.5M" subtitle="Total Value Locked" />
        <StatCard title="My Liquidity" value="$0.00" subtitle="Your pool share" />
        <StatCard title="APR" value="12.4%" subtitle="Annual percentage rate" />
        <StatCard title="Volume (24h)" value="$125K" subtitle="Trading volume" />
      </div>

      {/* Main Pool Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Liquidity Card */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl p-8 border border-border glow-border">
            <h2 className="text-xl font-semibold text-foreground mb-2">USDC / EURC Pool</h2>
            <p className="text-sm text-muted-foreground mb-6">Add liquidity to earn 0.3% on every trade</p>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="usdc-add" className="text-foreground">USDC Amount</Label>
                <Input
                  id="usdc-add"
                  type="number"
                  placeholder="0.00"
                  value={usdcAmount}
                  onChange={(e) => {
                    setUsdcAmount(e.target.value)
                    setEurcAmount(e.target.value ? (Number(e.target.value) * 0.92).toFixed(2) : "")
                  }}
                  className="bg-input text-foreground border-border h-14 text-xl rounded-xl"
                />
                <p className="text-xs text-muted-foreground">Balance: 0.00 USDC</p>
              </div>

              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  +
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="eurc-add" className="text-foreground">EURC Amount</Label>
                <Input
                  id="eurc-add"
                  type="number"
                  placeholder="0.00"
                  value={eurcAmount}
                  onChange={(e) => setEurcAmount(e.target.value)}
                  className="bg-input text-foreground border-border h-14 text-xl rounded-xl"
                />
                <p className="text-xs text-muted-foreground">Balance: 0.00 EURC</p>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-muted-foreground">You will receive</p>
                <p className="text-2xl font-bold text-accent mt-1">
                  {usdcAmount ? (Number(usdcAmount) * 1.5).toFixed(2) : "0.00"} LP Shares
                </p>
              </div>

              <Button className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl">
                Add Liquidity
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Your Position */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Your Position</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">LP Shares</span>
                <span className="text-foreground font-medium">0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pool Share</span>
                <span className="text-foreground font-medium">0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">USDC Deposited</span>
                <span className="text-foreground font-medium">0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">EURC Deposited</span>
                <span className="text-foreground font-medium">0.00</span>
              </div>
            </div>
          </div>

          {/* Remove Liquidity */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Remove Liquidity</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Percentage: {liquidityPercentage}%</Label>
                <Slider
                  value={[liquidityPercentage]}
                  onValueChange={(value) => setLiquidityPercentage(value[0])}
                  max={100}
                  step={25}
                  className="w-full mt-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-input rounded-xl p-4">
                <div>
                  <p className="text-xs text-muted-foreground">USDC</p>
                  <p className="text-lg font-bold text-accent">0.00</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">EURC</p>
                  <p className="text-lg font-bold text-accent">0.00</p>
                </div>
              </div>

              <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                Remove Liquidity
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pool Activity Table */}
      <div className="bg-card rounded-2xl p-6 border border-border mt-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Pool Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-muted-foreground font-medium">Date</th>
                <th className="text-left py-3 text-muted-foreground font-medium">Action</th>
                <th className="text-left py-3 text-muted-foreground font-medium">Pair</th>
                <th className="text-left py-3 text-muted-foreground font-medium">Amounts</th>
                <th className="text-left py-3 text-muted-foreground font-medium">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "Dec 5, 2024", action: "Add", pair: "USDC/EURC", amounts: "500 USDC, 460 EURC", tx: "0x1234...abcd" },
                { date: "Dec 3, 2024", action: "Remove", pair: "USDC/EURC", amounts: "250 USDC, 230 EURC", tx: "0x5678...efgh" },
                { date: "Nov 30, 2024", action: "Add", pair: "USDC/EURC", amounts: "1000 USDC, 920 EURC", tx: "0x9abc...ijkl" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 text-foreground">{row.date}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${row.action === 'Add' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {row.action}
                    </span>
                  </td>
                  <td className="py-3 text-foreground">{row.pair}</td>
                  <td className="py-3 text-foreground">{row.amounts}</td>
                  <td className="py-3 text-accent text-xs font-mono">{row.tx}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
