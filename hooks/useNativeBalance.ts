"use client"

/**
 * Reads the user's NATIVE gas balance (ETH/AVAX/POL/USDC-on-Arc...) on a given
 * bridge chain. CCTP needs gas on both the source (burn) and destination (mint)
 * chains, so the bridge UI uses this to warn the user before they start.
 */

import { useQuery } from "@tanstack/react-query"
import { createPublicClient, fallback, formatEther, http } from "viem"
import { useAccount } from "wagmi"
import { BRIDGE_USDC_BY_CHAIN } from "@/lib/bridge-chains"

/** Mesmo motivo do useBridgeBalance: um RPC único deixava o saldo sem carregar. */
function rpcTransport(rpcs: string[]) {
  const opts = { timeout: 20_000, retryCount: 1, retryDelay: 800 }
  return rpcs.length > 1
    ? fallback(rpcs.map((url) => http(url, opts)), { rank: false })
    : http(rpcs[0], opts)
}

export interface NativeBalance {
  /** Native balance as a number (18 decimals) */
  value: number
  raw: bigint
  isLoading: boolean
  /** true once we have data and it is effectively zero */
  isEmpty: boolean
}

export function useNativeBalance(chainId: number): NativeBalance {
  const { address } = useAccount()
  const config = BRIDGE_USDC_BY_CHAIN[chainId]

  const { data, isLoading } = useQuery({
    queryKey: ["native-balance", chainId, address],
    enabled: Boolean(address && config),
    refetchInterval: 30_000,
    queryFn: async () => {
      if (!address || !config) return 0n
      const client = createPublicClient({ transport: rpcTransport(config.rpcs) })
      return await client.getBalance({ address })
    },
  })

  const raw = (data ?? 0n) as bigint
  const value = Number(formatEther(raw))
  return {
    raw,
    value,
    isLoading,
    isEmpty: !isLoading && data !== undefined && raw === 0n,
  }
}
