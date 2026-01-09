'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { useState, useEffect, type ReactNode } from 'react'
import { CHAIN_CONFIG } from '@/lib/contracts'

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
        transports: {
            [arcTestnet.id]: http(CHAIN_CONFIG.rpcUrls.default.http[0], {
                timeout: 20000, // Increased for recording/performance scenarios
                retryCount: 3,
                retryDelay: 1000,
            }),
        },
        ssr: true,
    })
}

export const wagmiConfig = createWagmiConfig()

export function Web3Provider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false)
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 1000, // Reduced for faster updates
                refetchOnWindowFocus: true, // Enable refetch on focus
                refetchOnReconnect: true, // Enable refetch on reconnect
                retry: 3, // Increased retries for resilience
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
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
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}
