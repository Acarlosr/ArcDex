"use client"

import { useState } from "react"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function StakePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState("USDC")
  const [stakeAmount, setStakeAmount] = useState("")

  const aprData = {
    USDC: { base: 8, boost: 2 },
    EURC: { base: 6, boost: 2 },
  }

  const currentAPR = aprData[selectedToken as keyof typeof aprData]

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stake & Earn</h1>
          <p className="text-muted-foreground mt-1">Stake your USDC or EURC to earn annual yield on Arc Testnet.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Staked" value="$125,400" subtitle="Across all tokens" />
        <StatCard title="Average APR" value="7.2%" subtitle="Base APR + Boost" />
        <StatCard title="Your Staked" value="$0.00" subtitle="Connect wallet to view" />
        <StatCard title="Rewards" value="$0.00" subtitle="Claimable rewards" />
      </div>

      {/* Staking Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stake Card */}
        <div className="bg-card rounded-2xl p-8 border border-border glow-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">Stake Tokens</h2>

          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="token-select" className="text-foreground">Token</Label>
              <select
                id="token-select"
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="w-full bg-input text-foreground border border-border rounded-xl p-4 text-lg"
              >
                <option>USDC</option>
                <option>EURC</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stake-amount" className="text-foreground">Amount</Label>
              <div className="flex gap-3">
                <Input
                  id="stake-amount"
                  type="number"
                  placeholder="0.00"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="bg-input text-foreground border-border flex-1 h-14 text-xl rounded-xl"
                />
                <Button variant="outline" className="border-border text-accent hover:bg-muted bg-transparent h-14 px-6">
                  Max
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-muted rounded-xl p-4 space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base APR</span>
              <span className="text-accent font-semibold">{currentAPR.base}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Boost APR</span>
              <span className="text-accent font-semibold">+{currentAPR.boost}%</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-3">
              <span className="text-muted-foreground">Total APR</span>
              <span className="text-accent font-bold">{currentAPR.base + currentAPR.boost}%</span>
            </div>
          </div>

          <div className="bg-input rounded-xl p-4 mb-6">
            <p className="text-xs text-muted-foreground mb-1">Estimated Earnings Per Year</p>
            <p className="text-2xl font-bold text-accent">
              {stakeAmount
                ? ((Number.parseFloat(stakeAmount) * (currentAPR.base + currentAPR.boost)) / 100).toFixed(2)
                : "0.00"}{" "}
              {selectedToken}
            </p>
          </div>

          <Button className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl">
            Stake {selectedToken}
          </Button>
        </div>

        {/* Your Position */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Your Position</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Staked USDC</span>
                <span className="text-foreground font-medium">0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Staked EURC</span>
                <span className="text-foreground font-medium">0.00</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Total Value</span>
                <span className="text-foreground font-bold">$0.00</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Pending Rewards</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">USDC Rewards</span>
                <span className="text-accent font-semibold">0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">EURC Rewards</span>
                <span className="text-accent font-semibold">0.00</span>
              </div>
            </div>
            <Button className="w-full mt-4 btn-gradient">Claim All Rewards</Button>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Unstake</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Withdraw your staked tokens. There is no lock period on Arc Testnet.
            </p>
            <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
              Unstake Tokens
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
