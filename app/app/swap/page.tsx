"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function SwapPage() {
  const [fromToken, setFromToken] = useState("USDC")
  const [toToken, setToToken] = useState("EURC")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")

  const handleSwap = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount("")
    setToAmount("")
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    if (value) {
      setToAmount((Number.parseFloat(value) * 0.92).toFixed(2))
    } else {
      setToAmount("")
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Swap Tokens</h1>
          <p className="text-muted-foreground mt-1">Exchange tokens instantly on Arc Network</p>
        </div>
        <Button
          variant="outline"
          className="border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/10 rounded-lg bg-transparent"
          asChild
        >
          <a href="https://faucet.circle.com" target="_blank" rel="noreferrer">
            Get Test Tokens
          </a>
        </Button>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Swap Card - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl p-8 border border-border glow-border">
            {/* From */}
            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium text-muted-foreground">From</label>
              <div className="flex gap-4">
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="bg-input text-foreground border border-border rounded-xl p-4 w-32 text-lg font-medium"
                >
                  <option>USDC</option>
                  <option>EURC</option>
                </select>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="flex-1 bg-input text-foreground border-border h-14 text-xl font-medium rounded-xl"
                />
              </div>
              <p className="text-xs text-muted-foreground">Balance: 0.00 {fromToken}</p>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center my-6">
              <Button
                onClick={handleSwap}
                variant="outline"
                className="border-border text-accent hover:bg-muted rounded-full p-3 w-12 h-12 bg-card"
              >
                ⇅
              </Button>
            </div>

            {/* To */}
            <div className="space-y-3 mb-8">
              <label className="text-sm font-medium text-muted-foreground">To</label>
              <div className="flex gap-4">
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="bg-input text-foreground border border-border rounded-xl p-4 w-32 text-lg font-medium"
                >
                  <option>USDC</option>
                  <option>EURC</option>
                </select>
                <Input
                  type="text"
                  placeholder="0.00"
                  value={toAmount}
                  readOnly
                  className="flex-1 bg-input text-foreground border-border h-14 text-xl font-medium rounded-xl"
                />
              </div>
              <p className="text-xs text-muted-foreground">Balance: 0.00 {toToken}</p>
            </div>

            <Button className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl">
              Swap
            </Button>
          </div>
        </div>

        {/* Sidebar - Stats Panel */}
        <div className="space-y-6">
          {/* Price Info */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Swap Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="text-foreground font-medium">1 USDC ≈ 0.92 EURC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slippage</span>
                <Badge className="bg-accent text-background">0.5%</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="text-foreground font-medium">~0.05 USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Route</span>
                <span className="text-foreground font-medium">Direct</span>
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Network</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Arc Testnet</p>
                <p className="text-sm text-muted-foreground">Chain ID: 5042002</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
