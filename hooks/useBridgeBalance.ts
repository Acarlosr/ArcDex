"use client"

/**
 * Reads the user's native USDC balance on a given bridge chain
 * (Ethereum Sepolia, Base Sepolia or Arc Testnet).
 *
 * The wagmi config only registers Arc Testnet, so for the source chains we
 * talk to a standalone viem public client per chain instead of useReadContract.
 */

import { useQuery } from "@tanstack/react-query"
import { createPublicClient, fallback, formatUnits, http } from "viem"
import { useAccount } from "wagmi"
import { BRIDGE_USDC_BY_CHAIN } from "@/lib/bridge-chains"

/**
 * Transport com fallback entre os RPCs da chain.
 *
 * Antes cada leitura usava UM endpoint só: quando o provedor caía ou passava a
 * exigir plano pago (foi o que aconteceu com a Sepolia na dRPC), o saldo
 * simplesmente não carregava e o bridge ficava bloqueado sem explicação.
 */
function rpcTransport(rpcs: string[]) {
  const opts = { timeout: 20_000, retryCount: 1, retryDelay: 800 }
  return rpcs.length > 1
    ? fallback(rpcs.map((url) => http(url, opts)), { rank: false })
    : http(rpcs[0], opts)
}

const ERC20_BALANCE_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const


export interface BridgeBalance {
  /** Formatted, human-readable balance, e.g. "12.5" */
  formatted: string
  /** Raw balance as bigint (6 decimals) */
  raw: bigint
  isLoading: boolean
  refetch: () => void
}

export function useBridgeBalance(chainId: number): BridgeBalance {
  const { address } = useAccount()
  const config = BRIDGE_USDC_BY_CHAIN[chainId]

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["bridge-usdc-balance", chainId, address],
    enabled: Boolean(address && config),
    refetchInterval: 15_000,
    queryFn: async () => {
      if (!address || !config) return 0n
      const client = createPublicClient({ transport: rpcTransport(config.rpcs) })
      return (await client.readContract({
        address: config.usdc,
        abi: ERC20_BALANCE_ABI,
        functionName: "balanceOf",
        args: [address],
      })) as bigint
    },
  })

  const raw = (data ?? 0n) as bigint
  return {
    raw,
    formatted: formatUnits(raw, 6),
    isLoading,
    refetch,
  }
}
