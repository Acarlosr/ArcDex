"use client"

/**
 * Guard de rede da Arc.
 *
 * O wagmi config do ArcDex declara uma única chain. Sem este guard, a carteira
 * conectava continuando na Ethereum/Polygon/onde estivesse: `isConnected` virava
 * true, mas todo `useReadContract` falhava com ChainMismatchError, os saldos
 * ficavam em 0.00 e a UI parecia travada em "conectando" sem nenhum erro visível.
 *
 * Também expõe o saldo NATIVO (gas). Na Arc o USDC é ao mesmo tempo o gas token
 * nativo (18 casas) e o ERC-20 (6 casas) — o MESMO saldo. Por isso o saldo
 * nativo aqui serve EXCLUSIVAMENTE para checar gas; nunca deve ser somado ao
 * saldo ERC-20 exibido na UI, sob pena de contar o mesmo dinheiro duas vezes.
 * Ver: arc.io/blog/building-with-usdc-on-arc-one-token-two-interfaces
 */

import { useCallback } from "react"
import { useAccount, useBalance, useSwitchChain } from "wagmi"
import { ARCSCAN_URL, CHAIN_CONFIG, RPC_URLS } from "@/lib/contracts"

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

function getInjected(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined
  return (window as unknown as { ethereum?: EthereumProvider }).ethereum
}

export function useArcNetwork() {
  const { chainId, isConnected } = useAccount()
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain()

  const isWrongNetwork = isConnected && chainId !== undefined && chainId !== CHAIN_CONFIG.id

  /** Troca para a Arc; se a rede não existir na carteira, cadastra e troca. */
  const switchToArc = useCallback(async () => {
    try {
      await switchChainAsync({ chainId: CHAIN_CONFIG.id })
      return true
    } catch {
      const eth = getInjected()
      if (!eth) return false
      try {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${CHAIN_CONFIG.id.toString(16)}`,
              chainName: CHAIN_CONFIG.name,
              // USDC com 18 casas — é assim que a Arc expõe o gas token nativo.
              nativeCurrency: CHAIN_CONFIG.nativeCurrency,
              rpcUrls: RPC_URLS,
              blockExplorerUrls: [ARCSCAN_URL],
            },
          ],
        })
        return true
      } catch {
        return false
      }
    }
  }, [switchChainAsync])

  return { isWrongNetwork, switchToArc, isSwitching, chainId }
}

/**
 * Saldo nativo (gas) na Arc. USE APENAS PARA CHECAGEM DE GAS.
 *
 * `hasNoGas` fica true quando a carteira está conectada na Arc e o saldo nativo
 * é zero — situação em que qualquer transação reverte antes de executar, mesmo
 * com o saldo ERC-20 aparecendo cheio na tela.
 */
export function useArcGasBalance() {
  const { address, isConnected, chainId } = useAccount()
  const onArc = isConnected && chainId === CHAIN_CONFIG.id

  const { data, isLoading } = useBalance({
    address,
    chainId: CHAIN_CONFIG.id,
    query: { enabled: Boolean(address && onArc), refetchInterval: 30_000 },
  })

  const raw = data?.value ?? 0n
  return {
    raw,
    /** Saldo nativo formatado (18 casas na Arc). */
    formatted: data?.formatted ?? "0",
    isLoading,
    hasNoGas: onArc && !isLoading && data !== undefined && raw === 0n,
  }
}
