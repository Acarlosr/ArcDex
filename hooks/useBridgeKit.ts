"use client"

/**
 * Integração do ArcDex com o Circle Bridge Kit (CCTP v2).
 *
 * Escopo atual: USDC entre Ethereum Sepolia/Base Sepolia e Arc Testnet.
 * O provider vem do conector ativo do wagmi, evitando dependência direta de
 * window.ethereum e mantendo compatibilidade com carteiras injetadas e WalletConnect.
 */

import { useCallback, useState } from "react"
import { useAccount } from "wagmi"
import {
  createPublicClient,
  fallback,
  formatUnits,
  http,
  type Chain,
  type EIP1193Provider,
  type PublicClient,
} from "viem"
import type { BridgeKit, BridgeResult } from "@circle-fin/bridge-kit"
import { BRIDGE_RPCS_BY_CHAIN, CHAIN_ID_TO_BRIDGE_CHAIN as BRIDGE_MAP } from "@/lib/bridge-chains"

export const ARC_TESTNET_CHAIN_ID = 5_042_002

// All CCTP source/destination chains, derived from the canonical registry.
export const CHAIN_ID_TO_BRIDGE_CHAIN = BRIDGE_MAP

export type BridgeStep =
  | "idle"
  | "approving"
  | "burning"
  | "attesting"
  | "minting"
  | "success"
  | "error"

export interface BridgeParams {
  fromChainId: number
  toChainId: number
  amount: string
}

interface BridgeEventPayload {
  values?: {
    txHash?: string
    explorerUrl?: string
  }
}

export interface UseBridgeKitReturn {
  step: BridgeStep
  txHash: string | null
  explorerUrl: string | null
  result: BridgeResult | null
  error: string | null
  estimatedFee: string | null
  isEstimating: boolean
  isBridging: boolean
  bridge: (params: BridgeParams) => Promise<void>
  retry: () => Promise<void>
  estimate: (params: BridgeParams) => Promise<void>
  reset: () => void
}

const USDC_AMOUNT_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/

const RPC_OPTS = { timeout: 20_000, retryCount: 2, retryDelay: 800 }

/**
 * Clients reaproveitados entre chamadas — `getPublicClient` é invocado várias
 * vezes por operação e recriar o client a cada vez desperdiça conexões.
 */
const publicClientCache = new Map<number, PublicClient>()

/**
 * Substitui os RPCs internos do Circle Bridge Kit pelos nossos.
 *
 * O Bridge Kit traz UM endpoint fixo por chain dentro do próprio pacote
 * (`@circle-fin/bridge-kit/index.d.ts`). Para a Ethereum Sepolia esse endpoint
 * é `https://sepolia.drpc.org`, que passou a responder HTTP 400 —
 * `{"message":"chain is not available on free plan","code":35}` — e derrubava
 * todo bridge com origem na Sepolia logo na leitura de saldo.
 *
 * O adapter aceita `getPublicClient`, então injetamos aqui a lista de
 * lib/bridge-chains.ts, já com fallback entre múltiplos provedores. Se a chain
 * não estiver no nosso registro, caímos no RPC que a própria chain declara.
 */
function getPublicClientForChain({ chain }: { chain: Chain }): PublicClient {
  const cached = publicClientCache.get(chain.id)
  if (cached) return cached

  const urls = BRIDGE_RPCS_BY_CHAIN[chain.id]?.length
    ? BRIDGE_RPCS_BY_CHAIN[chain.id]
    : [...(chain.rpcUrls?.default?.http ?? [])]

  const transport = urls.length > 1
    ? fallback(urls.map((url) => http(url, RPC_OPTS)), { rank: false })
    : http(urls[0], RPC_OPTS)

  const client = createPublicClient({ chain, transport }) as PublicClient
  publicClientCache.set(chain.id, client)
  return client
}

function validateParams({ fromChainId, toChainId, amount }: BridgeParams) {
  if (!CHAIN_ID_TO_BRIDGE_CHAIN[fromChainId] || !CHAIN_ID_TO_BRIDGE_CHAIN[toChainId]) {
    throw new Error("Rota de bridge não suportada")
  }

  if (fromChainId === toChainId) {
    throw new Error("As redes de origem e destino devem ser diferentes")
  }

  if (!USDC_AMOUNT_PATTERN.test(amount) || Number(amount) <= 0) {
    throw new Error("Informe um valor de USDC válido, com até 6 casas decimais")
  }
}

function isEip1193Provider(provider: unknown): provider is EIP1193Provider {
  return Boolean(
    provider &&
    typeof provider === "object" &&
    "request" in provider &&
    typeof (provider as { request?: unknown }).request === "function"
  )
}

function readTransaction(payload: unknown) {
  const event = payload as BridgeEventPayload
  return {
    txHash: event.values?.txHash ?? null,
    explorerUrl: event.values?.explorerUrl ?? null,
  }
}

function formatGasFee(fee: string, token: string) {
  try {
    const value = Number(formatUnits(BigInt(fee), 18))
    if (!Number.isFinite(value)) return null
    return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 6 })} ${token}`
  } catch {
    return null
  }
}

export function useBridgeKit(): UseBridgeKitReturn {
  const { connector } = useAccount()

  const [step, setStep] = useState<BridgeStep>("idle")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null)
  const [result, setResult] = useState<BridgeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [isBridging, setIsBridging] = useState(false)

  const reset = useCallback(() => {
    setStep("idle")
    setTxHash(null)
    setExplorerUrl(null)
    setResult(null)
    setError(null)
    setEstimatedFee(null)
    setIsEstimating(false)
    setIsBridging(false)
  }, [])

  const buildAdapter = useCallback(async () => {
    if (!connector) throw new Error("Conecte sua carteira para continuar")

    const provider = await connector.getProvider()
    if (!isEip1193Provider(provider)) {
      throw new Error("A carteira conectada não expõe um provider EIP-1193 compatível")
    }

    const { createViemAdapterFromProvider } = await import("@circle-fin/adapter-viem-v2")
    // getPublicClient sobrescreve os RPCs internos do Bridge Kit — sem isto,
    // qualquer rota vinda da Ethereum Sepolia morre no sepolia.drpc.org (400).
    return createViemAdapterFromProvider({
      provider,
      getPublicClient: getPublicClientForChain,
    })
  }, [connector])

  const attachListeners = useCallback((kit: BridgeKit) => {
    const updateTransaction = (payload: unknown) => {
      const transaction = readTransaction(payload)
      if (transaction.txHash) setTxHash(transaction.txHash)
      if (transaction.explorerUrl) setExplorerUrl(transaction.explorerUrl)
    }

    kit.on("approve", (payload) => {
      setStep("approving")
      updateTransaction(payload)
    })
    kit.on("burn", (payload) => {
      setStep("burning")
      updateTransaction(payload)
    })
    kit.on("fetchAttestation", () => setStep("attesting"))
    kit.on("mint", (payload) => {
      setStep("minting")
      updateTransaction(payload)
    })
  }, [])

  const estimate = useCallback(async (params: BridgeParams) => {
    try {
      validateParams(params)
      setIsEstimating(true)
      setEstimatedFee(null)

      const { BridgeKit } = await import("@circle-fin/bridge-kit")
      const kit = new BridgeKit()
      const adapter = await buildAdapter()

      const estimateResult = await kit.estimate({
        from: { adapter, chain: CHAIN_ID_TO_BRIDGE_CHAIN[params.fromChainId] },
        to: { adapter, chain: CHAIN_ID_TO_BRIDGE_CHAIN[params.toChainId] },
        amount: params.amount,
        token: "USDC",
      })

      const fees = estimateResult.gasFees
        .map(({ fees: gas, token }) => gas?.fee ? formatGasFee(gas.fee, token) : null)
        .filter((fee): fee is string => Boolean(fee))

      setEstimatedFee(fees.length > 0 ? fees.join(" + ") : "Disponível na carteira")
    } catch (estimateError) {
      console.warn("[ArcDex Bridge] Falha ao estimar gas", estimateError)
      setEstimatedFee("Disponível na carteira")
    } finally {
      setIsEstimating(false)
    }
  }, [buildAdapter])

  const bridge = useCallback(async (params: BridgeParams) => {
    try {
      validateParams(params)
      setIsBridging(true)
      setError(null)
      setTxHash(null)
      setExplorerUrl(null)
      setResult(null)
      setStep("approving")

      const { BridgeKit } = await import("@circle-fin/bridge-kit")
      const kit = new BridgeKit()
      const adapter = await buildAdapter()
      attachListeners(kit)

      const bridgeResult = await kit.bridge({
        from: { adapter, chain: CHAIN_ID_TO_BRIDGE_CHAIN[params.fromChainId] },
        to: { adapter, chain: CHAIN_ID_TO_BRIDGE_CHAIN[params.toChainId] },
        amount: params.amount,
        token: "USDC",
      })

      setResult(bridgeResult)

      const lastTransaction = [...bridgeResult.steps]
        .reverse()
        .find((bridgeStep) => bridgeStep.txHash || bridgeStep.explorerUrl)

      if (lastTransaction?.txHash) setTxHash(lastTransaction.txHash)
      if (lastTransaction?.explorerUrl) setExplorerUrl(lastTransaction.explorerUrl)

      if (bridgeResult.state === "success") {
        setStep("success")
      } else if (bridgeResult.state === "error") {
        setStep("error")
        setError("O fluxo foi interrompido. Revise as etapas e tente continuar.")
      } else {
        setStep("attesting")
      }
    } catch (bridgeError) {
      const message = bridgeError instanceof Error
        ? bridgeError.message
        : "Não foi possível concluir o bridge"

      setStep("error")
      setError(message)
      console.error("[ArcDex Bridge]", bridgeError)
    } finally {
      setIsBridging(false)
    }
  }, [attachListeners, buildAdapter])

  const retry = useCallback(async () => {
    if (!result || result.state !== "error") return

    try {
      setIsBridging(true)
      setError(null)
      setStep("attesting")

      const { BridgeKit } = await import("@circle-fin/bridge-kit")
      const kit = new BridgeKit()
      const adapter = await buildAdapter()
      attachListeners(kit)

      const retryResult = await kit.retry(result, {
        from: adapter,
        to: adapter,
      })

      setResult(retryResult)

      const lastTransaction = [...retryResult.steps]
        .reverse()
        .find((bridgeStep) => bridgeStep.txHash || bridgeStep.explorerUrl)

      if (lastTransaction?.txHash) setTxHash(lastTransaction.txHash)
      if (lastTransaction?.explorerUrl) setExplorerUrl(lastTransaction.explorerUrl)

      if (retryResult.state === "success") {
        setStep("success")
      } else {
        setStep("error")
        setError("Não foi possível retomar automaticamente. Consulte as transações no explorer.")
      }
    } catch (retryError) {
      setStep("error")
      setError(retryError instanceof Error ? retryError.message : "Falha ao retomar o bridge")
    } finally {
      setIsBridging(false)
    }
  }, [attachListeners, buildAdapter, result])

  return {
    step,
    txHash,
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
  }
}
