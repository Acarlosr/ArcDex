"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowDown, ExternalLink, CheckCircle2, XCircle, Shield, Zap, Clock } from "lucide-react"
import { useAccount } from "wagmi"
import { useBridge, type BridgeDirection, type TransferSpeed } from "@/hooks/useBridge"
import { useTokenBalance } from "@/hooks/use-contracts"
import { MobileWalletHint } from "@/components/mobile-wallet-hint"
import { ARCSCAN_URL } from "@/lib/contracts"

const CHAINS = {
  sepolia: { name: "Ethereum Sepolia", icon: "🔷", explorer: "https://sepolia.etherscan.io" },
  arc: { name: "Arc Testnet", icon: "🟣", explorer: ARCSCAN_URL },
}

const STEP_LABELS: Record<string, string> = {
  idle: "Ready",
  approving: "Approving USDC...",
  burning: "Burning tokens on source chain...",
  "waiting-attestation": "Waiting for Circle attestation...",
  claiming: "Claiming on destination chain...",
  complete: "Bridge complete!",
  error: "Bridge failed",
}

export default function BridgePage() {
  const [direction, setDirection] = useState<BridgeDirection>("to-arc")
  const [amount, setAmount] = useState("")
  const [speed, setSpeed] = useState<TransferSpeed>("STANDARD")

  const { isConnected } = useAccount()
  const { state, bridgeToArc, bridgeFromArc, reset, isLoading, isComplete, isError } = useBridge()
  const { formatted: usdcBalance } = useTokenBalance("USDC")

  const sourceChain = direction === "to-arc" ? CHAINS.sepolia : CHAINS.arc
  const destChain = direction === "to-arc" ? CHAINS.arc : CHAINS.sepolia

  const handleBridge = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    try {
      if (direction === "to-arc") {
        await bridgeToArc(amount, speed)
      } else {
        await bridgeFromArc(amount, speed)
      }
    } catch {
      // Error handled in hook state
    }
  }

  const handleFlipDirection = () => {
    setDirection(prev => prev === "to-arc" ? "from-arc" : "to-arc")
    reset()
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bridge</h1>
          <p className="text-muted-foreground mt-1">Transfer USDC cross-chain using Circle CCTP v2.</p>
        </div>
        <span className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-medium">CCTP v2</span>
      </div>

      <MobileWalletHint />

      <div className="max-w-lg mx-auto">
        <div className="bg-card rounded-2xl p-8 border border-border glow-border">
          {/* Source Chain */}
          <div className="bg-muted rounded-xl p-4 mb-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">From</span>
              <span className="text-sm text-foreground font-medium flex items-center gap-1.5">
                {sourceChain.icon} {sourceChain.name}
              </span>
            </div>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-input text-foreground border-border text-2xl font-bold h-14"
                disabled={isLoading}
              />
              <div className="flex items-center gap-2 bg-input border border-border rounded-xl px-4 shrink-0">
                <span className="text-lg">💲</span>
                <span className="text-foreground font-bold">USDC</span>
              </div>
            </div>
            {direction === "from-arc" && (
              <p className="text-xs text-muted-foreground mt-2">
                Balance: {isConnected ? usdcBalance : "---"} USDC
              </p>
            )}
          </div>

          {/* Flip Button */}
          <div className="flex justify-center -my-3 relative z-10">
            <button
              onClick={handleFlipDirection}
              disabled={isLoading}
              className="w-10 h-10 bg-accent rounded-full flex items-center justify-center border-4 border-card hover:scale-110 transition-transform disabled:opacity-50"
            >
              <ArrowDown className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Destination Chain */}
          <div className="bg-muted rounded-xl p-4 mt-2 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">To</span>
              <span className="text-sm text-foreground font-medium flex items-center gap-1.5">
                {destChain.icon} {destChain.name}
              </span>
            </div>
            <div className="bg-input border border-border rounded-xl p-4">
              <p className="text-2xl font-bold text-foreground">
                {amount && parseFloat(amount) > 0 ? `~${amount}` : "0.00"} <span className="text-muted-foreground text-lg">USDC</span>
              </p>
            </div>
          </div>

          {/* Transfer Speed */}
          <div className="mb-6">
            <Label className="text-foreground mb-2 block text-sm">Transfer Speed</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSpeed("STANDARD")}
                disabled={isLoading}
                className={`p-3 rounded-xl border transition-all text-left ${
                  speed === "STANDARD"
                    ? "border-accent bg-accent/10"
                    : "border-border bg-muted/50 hover:border-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-foreground font-medium text-sm">Standard</span>
                </div>
                <p className="text-xs text-muted-foreground">~13-20 min, no extra fee</p>
              </button>
              <button
                onClick={() => setSpeed("FAST")}
                disabled={isLoading}
                className={`p-3 rounded-xl border transition-all text-left ${
                  speed === "FAST"
                    ? "border-accent bg-accent/10"
                    : "border-border bg-muted/50 hover:border-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-foreground font-medium text-sm">Fast</span>
                </div>
                <p className="text-xs text-muted-foreground">~1-2 min, up to 5 USDC fee</p>
              </button>
            </div>
          </div>

          {/* Progress / Status */}
          {state.step !== "idle" && (
            <div className="mb-6">
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isError ? "bg-red-500" : isComplete ? "bg-green-500" : "bg-accent"
                  }`}
                  style={{ width: `${state.progress}%` }}
                />
              </div>

              <div className={`rounded-xl p-4 border ${
                isComplete ? "bg-green-500/10 border-green-500/30" :
                isError ? "bg-red-500/10 border-red-500/30" :
                "bg-yellow-500/10 border-yellow-500/30"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {isComplete && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                  {isError && <XCircle className="w-5 h-5 text-red-400" />}
                  {isLoading && <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />}
                  <span className={`font-medium text-sm ${
                    isComplete ? "text-green-400" : isError ? "text-red-400" : "text-yellow-400"
                  }`}>
                    {STEP_LABELS[state.step]}
                  </span>
                </div>

                {state.step === "waiting-attestation" && (
                  <p className="text-xs text-muted-foreground">
                    Circle is verifying your transaction. This can take {speed === "FAST" ? "1-2 minutes" : "13-20 minutes"}.
                  </p>
                )}

                {state.error && (
                  <p className="text-xs text-red-400/80 mt-1">{state.error}</p>
                )}

                {/* Transaction links */}
                <div className="mt-2 space-y-1">
                  {state.burnTxHash && (
                    <a
                      href={`${sourceChain.explorer}/tx/${state.burnTxHash}`}
                      target="_blank" rel="noreferrer"
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Burn TX: {state.burnTxHash.slice(0, 10)}... <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {state.claimTxHash && (
                    <a
                      href={`${destChain.explorer}/tx/${state.claimTxHash}`}
                      target="_blank" rel="noreferrer"
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Claim TX: {state.claimTxHash.slice(0, 10)}... <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!isConnected ? (
            <Button className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl" disabled>
              Connect Wallet
            </Button>
          ) : isComplete ? (
            <Button className="w-full h-14 text-lg font-semibold rounded-xl bg-green-600 hover:bg-green-700" onClick={reset}>
              Bridge Again
            </Button>
          ) : isError ? (
            <Button className="w-full h-14 text-lg font-semibold rounded-xl" variant="outline" onClick={reset}>
              Try Again
            </Button>
          ) : (
            <Button
              className="w-full btn-gradient h-14 text-lg font-semibold rounded-xl"
              onClick={handleBridge}
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Bridging...</>
              ) : (
                `Bridge ${amount || "0"} USDC`
              )}
            </Button>
          )}

          {/* Info */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Protocol</span>
              <span className="text-foreground">Circle CCTP v2</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Arc Domain</span>
              <span className="text-foreground">26</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Speed</span>
              <span className="text-foreground">{speed === "FAST" ? "Fast (~1-2 min)" : "Standard (~13-20 min)"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Fee</span>
              <span className="text-foreground">{speed === "FAST" ? "Up to 5 USDC" : "Free"}</span>
            </div>
          </div>
        </div>

        {/* Reference link */}
        <div className="text-center mt-4">
          <a
            href="https://developers.circle.com/cctp/migration-from-v1-to-v2"
            target="_blank" rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1"
          >
            Powered by Circle CCTP v2 <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
