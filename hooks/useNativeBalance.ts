"use client"

/**
 * Reads the user's NATIVE gas balance (ETH/AVAX/POL/USDC-on-Arc...) on a given
 * bridge chain. CCTP needs gas on both the source (burn) and destination (mint)
 * chains, so the bridge UI uses this to warn the user before they start.
 */

import { useQuery } from "@tanstack/react-query"
import { createPublicClient, formatEther, http } from "viem"
import { useAccount } from "wagmi"
import { BRIDGE_USDC_BY_CHAIN } from "@/lib/bridge-chains"

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
      const client = createPublicClient({ transport: http(config.rpc) })
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
