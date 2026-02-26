"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowDown, ExternalLink, CheckCircle2, XCircle, Shield, Zap, Clock } from "lucide-react"
import { useAccount } from "wagmi"
import { useBridge, type BridgeDirection, type TransferSpeed } from "@/hooks/useBridge"
import { useTokenBalance, useBridgeBalances } from "@/hooks/use-contracts"
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

type BridgeHistoryItem = {
  id: string
  direction: BridgeDirection
  amount: string
  speed: TransferSpeed
  status: "success" | "failed"
  burnTxHash: string | null
  claimTxHash: string | null
  error: string | null
  timestamp: number
}

const BRIDGE_HISTORY_KEY = "arcdex_bridge_history_v1"

export default function BridgePage() {
  const [direction, setDirection] = useState<BridgeDirection>("to-arc")
  const [amount, setAmount] = useState("")
  const [speed, setSpeed] = useState<TransferSpeed>("STANDARD")
  const [bridgeHistory, setBridgeHistory] = useState<BridgeHistoryItem[]>([])
  const [elapsedSecs, setElapsedSecs] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { isConnected } = useAccount()
  const { state, bridgeToArc, bridgeFromArc, reset, isLoading, isComplete, isError } = useBridge()
  const { sepoliaBalance, arcBalance, isLoading: isLoadingBalances } = useBridgeBalances()

  useEffect(() => {
    if (state.step === "waiting-attestation") {
      setElapsedSecs(0)
      timerRef.current = setInterval(() => setElapsedSecs(s => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [state.step])
  const { formatted: usdcBalance } = useTokenBalance("USDC")

  // Determine which balance to show based on direction
  const sourceBalance = direction === "to-arc" ? sepoliaBalance : arcBalance
  const destBalance = direction === "to-arc" ? arcBalance : sepoliaBalance

  const sourceChain = direction === "to-arc" ? CHAINS.sepolia : CHAINS.arc
  const destChain = direction === "to-arc" ? CHAINS.arc : CHAINS.sepolia

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(BRIDGE_HISTORY_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as BridgeHistoryItem[]
      if (Array.isArray(parsed)) {
        setBridgeHistory(parsed.slice(0, 8))
      }
    } catch {
      // Ignore malformed local cache
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(BRIDGE_HISTORY_KEY, JSON.stringify(bridgeHistory.slice(0, 8)))
  }, [bridgeHistory])

  const addBridgeHistory = (
    status: "success" | "failed",
    payload: {
      amount: string
      direction: BridgeDirection
      speed: TransferSpeed
      burnTxHash: string | null
      claimTxHash: string | null
      error: string | null
    }
  ) => {
    const item: BridgeHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      status,
      timestamp: Date.now(),
      ...payload,
    }
    setBridgeHistory((prev) => [item, ...prev].slice(0, 8))
  }

  const handleBridge = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    const requestAmount = amount
    const requestDirection = direction
    const requestSpeed = speed
    try {
      if (direction === "to-arc") {
        const result = await bridgeToArc(amount, speed)
        addBridgeHistory("success", {
          amount: requestAmount,
          direction: requestDirection,
          speed: requestSpeed,
          burnTxHash: result.burnHash ?? null,
          claimTxHash: "claimHash" in result ? (result.claimHash as string) : null,
          error: null,
        })
      } else {
        const result = await bridgeFromArc(amount, speed)
        addBridgeHistory("success", {
          amount: requestAmount,
          direction: requestDirection,
          speed: requestSpeed,
          burnTxHash: result.burnHash ?? null,
          claimTxHash: null,
          error: null,
        })
      }
    } catch {
      addBridgeHistory("failed", {
        amount: requestAmount,
        direction: requestDirection,
        speed: requestSpeed,
        burnTxHash: state.burnTxHash,
        claimTxHash: state.claimTxHash,
        error: state.error ?? "Bridge failed",
      })
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
            <p className="text-xs text-muted-foreground mt-2">
              Balance: {isConnected ? (isLoadingBalances ? "loading..." : sourceBalance) : "---"} USDC
            </p>
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
            <div className="bg-input border border-border rounded-xl p-4 mb-2">
              <p className="text-2xl font-bold text-foreground">
                {amount && parseFloat(amount) > 0 ? `~${amount}` : "0.00"} <span className="text-muted-foreground text-lg">USDC</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Balance: {isConnected ? (isLoadingBalances ? "loading..." : destBalance) : "---"} USDC
            </p>
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
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">
                      Circle is verifying your transaction. This can take {speed === "FAST" ? "1-2 minutes" : "13-20 minutes"}.
                    </p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-xs text-yellow-400 font-mono tabular-nums">
                        {Math.floor(elapsedSecs / 60).toString().padStart(2, "0")}:{(elapsedSecs % 60).toString().padStart(2, "0")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">elapsed</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/70">
                      Your burn TX is confirmed on-chain. Do not close this page.
                    </p>
                  </div>
                )}

                {state.error && (
                  <div className="mt-1">
                    <p className="text-xs text-red-400/80">{state.error}</p>
                    {state.burnTxHash && state.error.includes("timeout") && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Your burn TX was successful. The attestation may still arrive — you can retry claiming later.
                      </p>
                    )}
                  </div>
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

        {/* Bridge History */}
        <div className="mt-6 bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Bridge History</h3>
            {bridgeHistory.length > 0 && (
              <button
                onClick={() => setBridgeHistory([])}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {bridgeHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground">No bridge transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {bridgeHistory.map((item) => {
                const from = item.direction === "to-arc" ? "Sepolia" : "Arc"
                const to = item.direction === "to-arc" ? "Arc" : "Sepolia"
                const isSuccess = item.status === "success"
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-muted/30 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-foreground font-medium">
                        {item.amount} USDC · {from} {"->"} {to}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isSuccess
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {isSuccess ? "Success" : "Failed"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(item.timestamp).toLocaleString()} · {item.speed}
                    </p>
                    {item.error && !isSuccess && (
                      <p className="text-[11px] text-red-400/80 mt-1">{item.error}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-3">
                      {item.burnTxHash && (
                        <a
                          href={`${item.direction === "to-arc" ? CHAINS.sepolia.explorer : CHAINS.arc.explorer}/tx/${item.burnTxHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-cyan-400 hover:underline inline-flex items-center gap-1"
                        >
                          Burn TX <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {item.claimTxHash && (
                        <a
                          href={`${item.direction === "to-arc" ? CHAINS.arc.explorer : CHAINS.sepolia.explorer}/tx/${item.claimTxHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-cyan-400 hover:underline inline-flex items-center gap-1"
                        >
                          Claim TX <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
