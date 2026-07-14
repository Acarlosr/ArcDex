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
    <main className="min-h-screen bg-background arc-gradient-bg text-foreground">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Stake & Earn</h1>
          <p className="text-muted-foreground">Stake your USDC or EURC to earn annual yield on Arc Testnet.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard title="Total Staked" value="$125,400" subtitle="Across all tokens" />
          <StatCard title="Average APR" value="7.2%" subtitle="Base APR + Boost" />
        </div>

        {/* Open Stake Panel Button */}
        <Button onClick={() => setIsModalOpen(true)} className="btn-gradient w-full md:w-auto">
          Open Stake Panel
        </Button>

        {/* Stake Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">Stake & Earn</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="stake" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted border-border">
                <TabsTrigger value="stake">Stake</TabsTrigger>
                <TabsTrigger value="unstake">Unstake</TabsTrigger>
                <TabsTrigger value="claim">Claim</TabsTrigger>
              </TabsList>

              {/* Stake Tab */}
              <TabsContent value="stake" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token-select" className="text-foreground">
                    Token
                  </Label>
                  <select
                    id="token-select"
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full bg-input text-foreground border border-border rounded-lg p-2"
                  >
                    <option>USDC</option>
                    <option>EURC</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stake-amount" className="text-foreground">
                    Amount
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="stake-amount"
                      type="number"
                      placeholder="0.00"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="bg-input text-foreground border-border flex-1"
                    />
                    <Button variant="outline" className="border-border text-accent hover:bg-muted bg-transparent">
                      Max
                    </Button>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base APR</span>
                    <span className="text-accent font-semibold">{currentAPR.base}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Boost APR</span>
                    <span className="text-accent font-semibold">+{currentAPR.boost}%</span>
                  </div>
                </div>

                <div className="bg-input rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-2">Estimated Earnings Per Year</p>
                  <p className="text-2xl font-bold text-accent">
                    {stakeAmount
                      ? ((Number.parseFloat(stakeAmount) * (currentAPR.base + currentAPR.boost)) / 100).toFixed(2)
                      : "0.00"}{" "}
                    {selectedToken}
                  </p>
                </div>

                <Button className="w-full btn-gradient">Stake</Button>
              </TabsContent>

              {/* Unstake Tab */}
              <TabsContent value="unstake" className="space-y-4">
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <p className="text-xs text-muted-foreground">Staked Balance</p>
                  <p className="text-2xl font-bold text-foreground mt-1">5,250.00 {selectedToken}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unstake-amount" className="text-foreground">
                    Amount to Unstake
                  </Label>
                  <Input
                    id="unstake-amount"
                    type="number"
                    placeholder="0.00"
                    className="bg-input text-foreground border-border"
                  />
                </div>

                <Button variant="outline" className="w-full border-border text-accent bg-transparent">
                  Unstake All
                </Button>

                <Button className="w-full btn-gradient">Unstake</Button>
              </TabsContent>

              {/* Claim Tab */}
              <TabsContent value="claim" className="space-y-4">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">USDC Rewards</span>
                    <span className="text-foreground font-semibold">125.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">EURC Rewards</span>
                    <span className="text-foreground font-semibold">89.30</span>
                  </div>
                </div>

                <Button className="w-full btn-gradient">Claim Rewards</Button>
              </TabsContent>
            </Tabs>

            <p className="text-xs text-muted-foreground text-center pt-2">
              APR and Boost APR are defined by the protocol and may change over time.
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
