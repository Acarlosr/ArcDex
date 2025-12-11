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
    <main className="min-h-screen bg-gradient-to-b from-[#0A304F] via-[#114B6E] to-[#D1D5DB] text-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Swap</h2>
          <Button
            variant="outline"
            className="border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/10 text-xs px-3 py-1 rounded-lg bg-transparent"
            asChild
          >
            <a href="https://faucet.circle.com" target="_blank" rel="noreferrer">
              Open Faucet
            </a>
          </Button>
        </div>

        {/* Swap Card - Centered */}
        <div className="bg-card rounded-xl p-6 border border-border glow-border">
          {/* From */}
          <div className="space-y-2 mb-4">
            <label className="text-sm text-muted-foreground">From</label>
            <div className="flex gap-2">
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                className="bg-input text-foreground border border-border rounded-lg p-2 w-24"
              >
                <option>USDC</option>
                <option>EURC</option>
              </select>
              <Input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                className="flex-1 bg-input text-foreground border-border"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center mb-4">
            <Button
              onClick={handleSwap}
              variant="outline"
              className="border-border text-accent hover:bg-muted rounded-full p-2 w-10 h-10 bg-transparent"
            >
              ⇅
            </Button>
          </div>

          {/* To */}
          <div className="space-y-2 mb-6">
            <label className="text-sm text-muted-foreground">To</label>
            <div className="flex gap-2">
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
                className="bg-input text-foreground border border-border rounded-lg p-2 w-24"
              >
                <option>USDC</option>
                <option>EURC</option>
              </select>
              <Input
                type="text"
                placeholder="0.00"
                value={toAmount}
                readOnly
                className="flex-1 bg-input text-foreground border-border"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm mb-6 pb-6 border-b border-border">
            <div className="flex justify-between text-muted-foreground">
              <span>Price</span>
              <span className="text-foreground">1 USDC ≈ 0.92 EURC</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Slippage</span>
              <Badge className="bg-accent text-background">0.5%</Badge>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Network Fee</span>
              <span className="text-foreground">~0.05 USDC</span>
            </div>
          </div>

          <Button className="w-full btn-gradient">Swap</Button>
        </div>
      </div>
    </main>
  )
}
