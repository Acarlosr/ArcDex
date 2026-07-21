'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, createStorage, cookieStorage } from 'wagmi'
import { fallback, http } from 'viem'
import { injected, walletConnect } from 'wagmi/connectors'
import { useState, useEffect, type ReactNode } from 'react'
import { CHAIN_CONFIG } from '@/lib/contracts'

// Lower retry count so a rate-limited (429) RPC doesn't hammer with retries
const RPC_OPTS = { timeout: 20000, retryCount: 1, retryDelay: 1500 }
const ARC_RPC_URLS = [
  CHAIN_CONFIG.rpcUrls.default.http[0],
  'https://rpc.blockdaemon.testnet.arc.network',
  'https://rpc.drpc.testnet.arc.network',
  'https://rpc.quicknode.testnet.arc.network',
].filter(Boolean) as string[]

// WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '62a5e53db0163b7e29bc8b76c22d04cc'

// Define Arc Testnet chain
const arcTestnet = {
    id: CHAIN_CONFIG.id,
    name: CHAIN_CONFIG.name,
    nativeCurrency: CHAIN_CONFIG.nativeCurrency,
    rpcUrls: CHAIN_CONFIG.rpcUrls,
    blockExplorers: CHAIN_CONFIG.blockExplorers,
    testnet: CHAIN_CONFIG.testnet,
} as const

// Create wagmi config - only injected connector for SSR safety
function createWagmiConfig() {
    const connectors = [
        injected({
            shimDisconnect: true,
        }),
    ]

    // Only add WalletConnect on client side to avoid indexedDB error
    if (typeof window !== 'undefined') {
        connectors.push(
            walletConnect({
                projectId,
                metadata: {
                    name: 'ARCDex V2',
                    description: 'DeFi on Arc Network',
                    url: 'https://www.arc-dex.xyz',
                    icons: ['https://www.arc-dex.xyz/icon.png'],
                },
                showQrModal: true,
            }) as any
        )
    }

    return createConfig({
        chains: [arcTestnet],
        connectors,
        // Persist the last connection so a page refresh restores the wallet
        storage: createStorage({
            storage: typeof window !== 'undefined' ? window.localStorage : cookieStorage,
            key: 'arcdex.wagmi',
        }),
        transports: {
            [arcTestnet.id]: fallback(
                ARC_RPC_URLS.map((url) => http(url, RPC_OPTS)),
                { rank: false }
            ),
        },
        // Poll new blocks every 12s instead of the ~4s default to cut RPC 429s
        pollingInterval: 12_000,
        ssr: true,
    })
}

export const wagmiConfig = createWagmiConfig()

export function Web3Provider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false)
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30 * 1000,
                refetchOnWindowFocus: false,
                refetchOnReconnect: true,
                retry: 1,
                retryDelay: 1000,
            },
        },
    }))

    useEffect(() => {
        setMounted(true)
    }, [])

    // Prevent hydration mismatch
    if (!mounted) {
        return null
    }

    return (
        <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}
