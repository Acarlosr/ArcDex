"use client"

import { useEffect, useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CCTP, CHAINLINK_CCIP } from "@/lib/contracts"
import {
  ARC_TESTNET_CHAIN_ID,
  type BridgeStep,
  useBridgeKit,
} from "@/hooks/useBridgeKit"

const SOURCE_CHAINS = [
  { id: 11_155_111, name: "Ethereum Sepolia", shortName: "Sepolia", logo: "🔷", cctpDomain: 0 },
  { id: 84_532, name: "Base Sepolia", shortName: "Base", logo: "🔵", cctpDomain: 6 },
] as const

const ARC_CHAIN = {
  id: ARC_TESTNET_CHAIN_ID,
  name: "Arc Testnet",
  logo: "⚡",
  cctpDomain: CCTP.domain,
} as const

type SourceChain = (typeof SOURCE_CHAINS)[number]
type BridgeDirection = "toArc" | "fromArc"

const STEP_LABELS: Record<BridgeStep, string> = {
  idle: "",
  approving: "Aprovando USDC...",
  burning: "Queimando USDC na origem...",
  attesting: "Aguardando atestação da Circle...",
  minting: "Emitindo USDC na rede de destino...",
  success: "Bridge concluído",
  error: "Bridge interrompido",
}

const STEP_ORDER: BridgeStep[] = ["approving", "burning", "attesting", "minting", "success"]
const VALID_USDC_AMOUNT = /^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/

function StepProgress({ current }: { current: BridgeStep }) {
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
              {STEP_LABELS[item]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function BridgePage() {
  const { isConnected } = useAccount()
  const [sourceChain, setSourceChain] = useState<SourceChain>(SOURCE_CHAINS[0])
  const [direction, setDirection] = useState<BridgeDirection>("toArc")
  const [amount, setAmount] = useState("")

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
  const bridgeParams = {
    fromChainId: fromChain.id,
    toChainId: toChain.id,
    amount,
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

  const handleSourceChange = (chain: SourceChain) => {
    setSourceChain(chain)
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
          Bridge USDC
        </h1>
        <p className="mt-1 text-muted-foreground">
          Movimente USDC entre a Arc Testnet, Ethereum Sepolia e Base Sepolia.
        </p>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/8 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="text-sm">
          <p className="font-medium text-foreground">Circle Bridge Kit (App Kits) · CCTP v2</p>
          <p className="mt-0.5 text-muted-foreground">
            O USDC é queimado na origem e emitido nativamente no destino. O ArcDex não custodia seus fundos.
          </p>
        </div>
      </div>

      <div className="card-glass rounded-2xl p-6 glow-border">
        {step === "success" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-500/25 bg-green-500/10 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
            <div>
              <p className="font-semibold text-green-500">Bridge concluído com sucesso</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {amount} USDC foi processado para {toChain.name}.
              </p>
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-green-400 hover:underline"
                >
                  Ver transação no explorer <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-3 w-3" /> Novo bridge
              </button>
            </div>
          </div>
        )}

        {step === "error" && error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/10 p-4">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">O bridge foi interrompido</p>
              <p className="mt-1 text-xs text-destructive/80">{error}</p>
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Conferir última transação <ExternalLink className="h-3 w-3" />
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
                    <RefreshCw className="h-3 w-3" /> Continuar fluxo
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Reiniciar
                </button>
              </div>
            </div>
          </div>
        )}

        {(step === "idle" || step === "error") && (
          <>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex-1 rounded-xl border border-border bg-muted p-4">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">De</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{fromChain.logo}</span>
                  <div>
                    <p className="font-bold text-foreground">{fromChain.name}</p>
                    <p className="text-xs text-muted-foreground">CCTP Domain {fromChain.cctpDomain}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDirectionToggle}
                aria-label={`Inverter direção: ${toChain.name} para ${fromChain.name}`}
                title="Inverter origem e destino"
                className="group flex shrink-0 flex-col items-center gap-1 rounded-xl border border-primary/25 bg-primary/8 px-3 py-2 transition-all hover:border-primary/50 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ArrowRightLeft className="h-5 w-5 text-primary transition-transform group-hover:rotate-180" />
                <span className="text-[10px] font-medium text-muted-foreground">CCTP v2</span>
              </button>

              <div className="flex-1 rounded-xl border border-primary/25 bg-primary/8 p-4">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Para</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{toChain.logo}</span>
                  <div>
                    <p className="font-bold text-foreground">{toChain.name}</p>
                    <p className="text-xs text-muted-foreground">CCTP Domain {toChain.cctpDomain}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                {isToArc ? "Rede de origem" : "Rede de destino"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SOURCE_CHAINS.map((chain) => (
                  <button
                    key={chain.id}
                    type="button"
                    onClick={() => handleSourceChange(chain)}
                    className={`rounded-xl border p-3 text-center transition-all ${
                      sourceChain.id === chain.id
                        ? "border-primary/40 bg-primary/10"
                        : "border-border bg-muted hover:border-primary/20"
                    }`}
                  >
                    <div className="mb-1 text-xl">{chain.logo}</div>
                    <div className="text-xs font-semibold text-foreground">{chain.shortName}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="bridge-amount" className="mb-2 block text-sm font-medium text-muted-foreground">
                Quantidade de USDC
              </label>
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
              </div>
              {amount.length > 0 && !isValidAmount && (
                <p className="mt-2 flex items-center gap-1 text-xs text-amber-500">
                  <AlertCircle className="h-3.5 w-3.5" /> Use um valor maior que zero, com até 6 casas decimais.
                </p>
              )}
            </div>

            <div className="mb-6 space-y-2.5 rounded-xl border border-border bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de gas estimada</span>
                <span className="font-medium text-foreground">
                  {isEstimating
                    ? <Loader2 className="inline h-3.5 w-3.5 animate-spin" />
                    : estimatedFee ?? "Informe um valor"
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tempo</span>
                <span className="font-medium text-foreground">Varia conforme a atestação</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Segurança</span>
                <span className="flex items-center gap-1.5 font-medium text-green-500">
                  <ShieldCheck className="h-3.5 w-3.5" /> USDC nativo via CCTP
                </span>
              </div>
            </div>
          </>
        )}

        {step !== "idle" && step !== "success" && step !== "error" && (
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/8 p-5">
            <p className="mb-1 font-semibold text-foreground">Bridge em andamento</p>
            <p className="mb-3 text-xs text-muted-foreground">
              {amount} USDC · {fromChain.name} → {toChain.name}
            </p>
            <StepProgress current={step} />
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Ver última transação <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {!isConnected ? (
          <div className="rounded-xl border border-border bg-muted p-4 text-center text-sm text-muted-foreground">
            Conecte sua carteira pelo menu superior para usar o bridge.
          </div>
        ) : step === "idle" || step === "error" ? (
          <Button
            type="button"
            onClick={() => void bridge(bridgeParams)}
            disabled={!isValidAmount || isBridging}
            className="btn-arc-primary h-12 w-full text-base font-semibold"
          >
            {isBridging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Bridge {amount || "0"} USDC
            {!isBridging ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
          </Button>
        ) : step === "success" ? null : (
          <Button disabled className="h-12 w-full text-base font-semibold" variant="outline">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {STEP_LABELS[step]}
          </Button>
        )}
      </div>

      <div className="card-professional mt-8 rounded-2xl p-6">
        <h3 className="mb-4 font-semibold text-foreground">Como o fluxo funciona</h3>
        <div className="space-y-4">
          {[
            { step: "1", title: "Aprovação e queima", description: "Você aprova o USDC e confirma a queima na rede de origem." },
            { step: "2", title: "Atestação Circle", description: "A Circle valida a mensagem CCTP correspondente à queima." },
            { step: "3", title: "Emissão no destino", description: "A mesma quantidade, descontadas eventuais taxas aplicáveis, é emitida na rede de destino." },
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
            Documentação oficial <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/8 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Globe className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Chainlink CCIP na Arc Testnet</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              A lane Ethereum Sepolia ↔ Arc está disponível para mensageria cross-chain. O ArcDex já possui uma
              implementação segura de sender e receiver, ainda não implantada nas redes públicas.
            </p>
            <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-2">
              <div className="rounded-lg border border-border/70 bg-background/35 px-3 py-2">
                <span className="block text-muted-foreground">Arc chain selector</span>
                <strong className="break-all font-mono text-foreground">
                  {CHAINLINK_CCIP.arcTestnet.chainSelector}
                </strong>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/35 px-3 py-2">
                <span className="block text-muted-foreground">Arc CCIP Router</span>
                <strong className="break-all font-mono text-foreground">
                  {CHAINLINK_CCIP.arcTestnet.router}
                </strong>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-amber-500">
                Transferência de tokens via CCIP ainda indisponível nesta lane; o bridge de USDC usa CCTP.
              </span>
              <a
                href="https://docs.chain.link/ccip/directory/testnet/chain/arc-testnet"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                Ver diretório CCIP <ExternalLink className="h-3 w-3" />
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
            <p className="text-sm font-semibold text-foreground">Preparado para interoperabilidade de ativos tokenizados</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              O bridge atual é exclusivo para USDC via CCTP. Uma futura integração com ativos como wDREX dependerá de emissão autorizada, registro do token na lane CCIP, controles de compliance e auditoria independente.
            </p>
            <p className="mt-2 text-[11px] font-medium text-amber-500">
              O protótipo CCIP do ArcDex ainda não foi implantado. Não existe integração oficial com DREX ou Banco Central.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
