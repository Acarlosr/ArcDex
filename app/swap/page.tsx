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
    <main className="min-h-screen bg-background text-foreground">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Swap</h1>
          <p className="text-muted-foreground">Instantly swap between USDC and EURC tokens.</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border glow-border max-w-md">
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
