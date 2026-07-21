"use client"

import { useEffect, useRef, useState } from "react"
import { useAccount } from "wagmi"
import {
  AlertCircle,
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  ExternalLink,
  Globe,
  Info,
  Landmark,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { CCTP, CHAINLINK_CCIP } from "@/lib/contracts"
import {
  ARC_TESTNET_CHAIN_ID,
  type BridgeStep,
  useBridgeKit,
} from "@/hooks/useBridgeKit"
import { useBridgeBalance } from "@/hooks/useBridgeBalance"
import { BRIDGE_SOURCE_CHAINS, ARC_CHAIN_INFO, getGasInfo, type BridgeChainInfo } from "@/lib/bridge-chains"
import { useNativeBalance } from "@/hooks/useNativeBalance"

const SOURCE_CHAINS = BRIDGE_SOURCE_CHAINS
const ARC_CHAIN = ARC_CHAIN_INFO

type SourceChain = BridgeChainInfo
type BridgeDirection = "toArc" | "fromArc"

const STEP_ORDER: BridgeStep[] = ["approving", "burning", "attesting", "minting", "success"]
const VALID_USDC_AMOUNT = /^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/

function StepProgress({ current, labels }: { current: BridgeStep; labels: Record<BridgeStep, string> }) {
  if (current === "idle" || current === "error") return null

  return (
    <div className="mt-4 space-y-2">
      {STEP_ORDER.filter((item) => item !== "success").map((item, index) => {
        const currentIndex = STEP_ORDER.indexOf(current)
        const isDone = currentIndex > index
        const isActive = currentIndex === index

        return (
          <div key={item} className="flex items-center gap-3">
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              isDone
                ? "bg-green-500"
                : isActive
                  ? "bg-primary animate-pulse"
                  : "border border-border bg-muted"
            }`}>
              {isDone ? (
                <CheckCircle2 className="h-3 w-3 text-white" />
              ) : isActive ? (
                <Loader2 className="h-3 w-3 animate-spin text-white" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
              )}
            </div>
            <span className={`text-xs ${
              isDone
                ? "text-green-500"
                : isActive
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
            }`}>
              {labels[item]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function BridgePage() {
  const { t } = useI18n()
  const { isConnected } = useAccount()
  const [sourceChain, setSourceChain] = useState<SourceChain>(SOURCE_CHAINS[0])
  const [direction, setDirection] = useState<BridgeDirection>("toArc")
  const [amount, setAmount] = useState("")
  const [chainMenuOpen, setChainMenuOpen] = useState(false)
  const chainMenuRef = useRef<HTMLDivElement>(null)

  const {
    step,
    explorerUrl,
    result,
    error,
    estimatedFee,
    isEstimating,
    isBridging,
    bridge,
    retry,
    estimate,
    reset,
  } = useBridgeKit()

  const isValidAmount = VALID_USDC_AMOUNT.test(amount) && Number(amount) > 0
  const isToArc = direction === "toArc"
  const fromChain = isToArc ? sourceChain : ARC_CHAIN
  const toChain = isToArc ? ARC_CHAIN : sourceChain
  const { formatted: fromBalance, isLoading: balanceLoading } = useBridgeBalance(fromChain.id)
  // CCTP needs gas on both ends: burn on source, mint on destination
  const fromGas = useNativeBalance(fromChain.id)
  const toGas = useNativeBalance(toChain.id)
  const fromGasInfo = getGasInfo(fromChain.id)
  const toGasInfo = getGasInfo(toChain.id)
  const missingSourceGas = fromGas.isEmpty
  const missingDestGas = toGas.isEmpty
  const bridgeParams = {
    fromChainId: fromChain.id,
    toChainId: toChain.id,
    amount,
  }
  const stepLabels: Record<BridgeStep, string> = {
    idle: "",
    approving: t("bridge.step.approving"),
    burning: t("bridge.step.burning"),
    attesting: t("bridge.step.attesting"),
    minting: t("bridge.step.minting"),
    success: t("bridge.step.success"),
    error: t("bridge.step.error"),
  }

  useEffect(() => {
    if (!isConnected || !isValidAmount) return

    const timer = window.setTimeout(() => {
      void estimate(bridgeParams)
    }, 700)

    return () => window.clearTimeout(timer)
  }, [amount, direction, estimate, isConnected, isValidAmount, sourceChain.id])

  const handleAmountChange = (value: string) => {
    const normalized = value.replace(",", ".")
    if (normalized === "" || /^\d*(?:\.\d{0,6})?$/.test(normalized)) {
      setAmount(normalized)
      reset()
    }
  }

  useEffect(() => {
    if (!chainMenuOpen) return
    const onClickOutside = (event: MouseEvent) => {
      if (chainMenuRef.current && !chainMenuRef.current.contains(event.target as Node)) {
        setChainMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [chainMenuOpen])

  const handleSourceChange = (chain: SourceChain) => {
    setSourceChain(chain)
    setChainMenuOpen(false)
    reset()
  }

  const handleDirectionToggle = () => {
    setDirection((current) => current === "toArc" ? "fromArc" : "toArc")
    reset()
  }

  const handleReset = () => {
    reset()
    setAmount("")
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
          <Globe className="h-8 w-8 text-primary" />
          {t("bridge.title")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("bridge.subtitle")}
        </p>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/8 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="text-sm">
          <p className="font-medium text-foreground">{t("bridge.infoTitle")}</p>
          <p className="mt-0.5 text-muted-foreground">
            {t("bridge.infoText")}
          </p>
        </div>
      </div>

      <div className="card-glass rounded-2xl p-6 glow-border">
        {step === "success" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-500/25 bg-green-500/10 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
            <div>
              <p className="font-semibold text-green-500">{t("bridge.successTitle")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("bridge.successText", { amount, chain: toChain.name })}
              </p>
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-green-400 hover:underline"
                >
                  {t("bridge.viewExplorer")} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {step === "success" && (
          <Button
            type="button"
            onClick={handleReset}
            variant="outline"
            className="mb-6 h-11 w-full text-sm font-semibold"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> {t("bridge.newBridge")}
          </Button>
        )}

        {step === "error" && error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/10 p-4">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">{t("bridge.errorTitle")}</p>
              <p className="mt-1 text-xs text-destructive/80">{error}</p>
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {t("bridge.checkLastTx")} <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <div className="mt-3 flex gap-3">
                {result?.state === "error" && (
                  <button
                    type="button"
                    onClick={() => void retry()}
                    disabled={isBridging}
                    className="flex items-center gap-1 text-xs font-semibold text-primary disabled:opacity-50"
                  >
                    <RefreshCw className="h-3 w-3" /> {t("bridge.continueFlow")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("bridge.restart")}
                </button>
              </div>
            </div>
          </div>
        )}

        {(step === "idle" || step === "error") && (
          <>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex-1 rounded-xl border border-border bg-muted p-4">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("bridge.from")}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{fromChain.logo}</span>
                  <div>
                    <p className="font-bold text-foreground">{fromChain.name}</p>
                    <p className="text-xs text-muted-foreground">{t("bridge.cctpDomain", { domain: fromChain.cctpDomain })}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDirectionToggle}
                aria-label={t("bridge.invertAria", { from: toChain.name, to: fromChain.name })}
                title={t("bridge.invertTitle")}
                className="group flex shrink-0 flex-col items-center gap-1 rounded-xl border border-primary/25 bg-primary/8 px-3 py-2 transition-all hover:border-primary/50 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ArrowRightLeft className="h-5 w-5 text-primary transition-transform group-hover:rotate-180" />
                <span className="text-[10px] font-medium text-muted-foreground">CCTP v2</span>
              </button>

              <div className="flex-1 rounded-xl border border-primary/25 bg-primary/8 p-4">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("bridge.to")}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{toChain.logo}</span>
                  <div>
                    <p className="font-bold text-foreground">{toChain.name}</p>
                    <p className="text-xs text-muted-foreground">{t("bridge.cctpDomain", { domain: toChain.cctpDomain })}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                {isToArc ? t("bridge.originNetwork") : t("bridge.destinationNetwork")}
              </label>
              <div className="relative" ref={chainMenuRef}>
                <button
                  type="button"
                  onClick={() => setChainMenuOpen((open) => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={chainMenuOpen}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-muted px-4 py-3 text-left transition-colors hover:border-primary/30"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-xl">{sourceChain.logo}</span>
                    <span className="font-semibold text-foreground">{sourceChain.name}</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${chainMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {chainMenuOpen && (
                  <div
                    role="listbox"
                    className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-xl"
                  >
                    {SOURCE_CHAINS.map((chain) => (
                      <button
                        key={chain.id}
                        type="button"
                        role="option"
                        aria-selected={sourceChain.id === chain.id}
                        onClick={() => handleSourceChange(chain)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          sourceChain.id === chain.id ? "bg-primary/15" : "hover:bg-muted"
                        }`}
                      >
                        <span className="text-xl">{chain.logo}</span>
                        <span className="flex-1 text-sm font-medium text-foreground">{chain.name}</span>
                        <span className="text-[10px] text-muted-foreground">CCTP {chain.cctpDomain}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="bridge-amount" className="block text-sm font-medium text-muted-foreground">
                  {t("bridge.amountLabel")}
                </label>
                {isConnected && (
                  <span className="text-xs text-muted-foreground">
                    Balance:{" "}
                    {balanceLoading ? (
                      <Loader2 className="inline h-3 w-3 animate-spin" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAmountChange(fromBalance)}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                        title="Usar saldo máximo"
                      >
                        {Number(fromBalance).toLocaleString("en-US", { maximumFractionDigits: 6 })} USDC
                      </button>
                    )}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <div className="flex w-28 items-center rounded-xl border border-border bg-muted px-4 py-3 font-semibold text-foreground">
                  USDC
                </div>
                <input
                  id="bridge-amount"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.00"
                  value={amount}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  aria-invalid={amount.length > 0 && !isValidAmount}
                  className="input-arc flex-1 rounded-xl border border-border bg-muted px-4 py-3 text-lg font-medium text-foreground"
                />
                <button
                  type="button"
                  onClick={() => handleAmountChange(fromBalance)}
                  disabled={!isConnected || balanceLoading || Number(fromBalance) <= 0}
                  className="rounded-xl border border-border bg-muted px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
                >
                  MAX
                </button>
              </div>
              {amount.length > 0 && !isValidAmount && (
                <p className="mt-2 flex items-center gap-1 text-xs text-amber-500">
                  <AlertCircle className="h-3.5 w-3.5" /> {t("bridge.amountError")}
                </p>
              )}
            </div>

            <div className="mb-6 space-y-2.5 rounded-xl border border-border bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("bridge.estimatedGas")}</span>
                <span className="font-medium text-foreground">
                  {isEstimating
                    ? <Loader2 className="inline h-3.5 w-3.5 animate-spin" />
                    : estimatedFee ?? t("bridge.enterAmount")
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("bridge.time")}</span>
                <span className="font-medium text-foreground">{t("bridge.timeValue")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("bridge.security")}</span>
                <span className="flex items-center gap-1.5 font-medium text-green-500">
                  <ShieldCheck className="h-3.5 w-3.5" /> {t("bridge.securityValue")}
                </span>
              </div>
            </div>
          </>
        )}

        {step !== "idle" && step !== "success" && step !== "error" && (
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/8 p-5">
            <p className="mb-1 font-semibold text-foreground">{t("bridge.inProgress")}</p>
            <p className="mb-3 text-xs text-muted-foreground">
              {amount} USDC · {fromChain.name} → {toChain.name}
            </p>
            <StepProgress current={step} labels={stepLabels} />
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {t("bridge.viewLastTx")} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {!isConnected ? (
          <div className="rounded-xl border border-border bg-muted p-4 text-center text-sm text-muted-foreground">
            {t("bridge.connectWallet")}
          </div>
        ) : step === "idle" || step === "error" ? (
          <>
            {(missingSourceGas || missingDestGas) && (
              <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold text-amber-500">
                  <AlertCircle className="h-4 w-4" /> Falta gás para completar o bridge
                </p>
                <p className="mt-1 text-muted-foreground">
                  O CCTP exige gás na origem (queima) e no destino (mint). Você não tem saldo nativo em:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {missingSourceGas && (
                    <a href={fromGasInfo.faucet} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500 hover:bg-amber-500/20">
                      Faucet {fromChain.name} ({fromGasInfo.symbol}) <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {missingDestGas && (
                    <a href={toGasInfo.faucet} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500 hover:bg-amber-500/20">
                      Faucet {toChain.name} ({toGasInfo.symbol}) <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
            <Button
              type="button"
              onClick={() => void bridge(bridgeParams)}
              disabled={!isValidAmount || isBridging || missingSourceGas || missingDestGas}
              className="btn-arc-primary h-12 w-full text-base font-semibold"
            >
              {isBridging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Bridge {amount || "0"} USDC
              {!isBridging ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
            </Button>
          </>
        ) : step === "success" ? null : (
          <Button disabled className="h-12 w-full text-base font-semibold" variant="outline">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {stepLabels[step]}
          </Button>
        )}
      </div>

      <div className="card-professional mt-8 rounded-2xl p-6">
        <h3 className="mb-4 font-semibold text-foreground">{t("bridge.howTitle")}</h3>
        <div className="space-y-4">
          {[
            { step: "1", title: t("bridge.howStep1Title"), description: t("bridge.howStep1Text") },
            { step: "2", title: t("bridge.howStep2Title"), description: t("bridge.howStep2Text") },
            { step: "3", title: t("bridge.howStep3Title"), description: t("bridge.howStep3Text") },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-xs font-bold text-primary">
                {item.step}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">
            Arc CCTP Domain: <strong className="text-foreground">{CCTP.domain}</strong>
          </span>
          <a
            href="https://docs.arc.io/app-kit/quickstarts/bridge-tokens-across-blockchains"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {t("bridge.officialDocs")} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/8 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Globe className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{t("bridge.ccipTitle")}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t("bridge.ccipText")}
            </p>
            <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-2">
              <div className="rounded-lg border border-border/70 bg-background/35 px-3 py-2">
                <span className="block text-muted-foreground">{t("bridge.arcSelector")}</span>
                <strong className="break-all font-mono text-foreground">
                  {CHAINLINK_CCIP.arcTestnet.chainSelector}
                </strong>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/35 px-3 py-2">
                <span className="block text-muted-foreground">{t("bridge.arcRouter")}</span>
                <strong className="break-all font-mono text-foreground">
                  {CHAINLINK_CCIP.arcTestnet.router}
                </strong>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-amber-500">
                {t("bridge.ccipWarning")}
              </span>
              <a
                href="https://docs.chain.link/ccip/directory/testnet/chain/arc-testnet"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                {t("bridge.viewCcipDirectory")} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-primary/30 bg-primary/4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Landmark className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{t("bridge.tokenizedTitle")}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t("bridge.tokenizedText")}
            </p>
            <p className="mt-2 text-[11px] font-medium text-amber-500">
              {t("bridge.tokenizedWarning")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
