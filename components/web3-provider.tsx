'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { useState, type ReactNode } from 'react'
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

// Create wagmi config - optimized for faster connection
export const wagmiConfig = createConfig({
    chains: [arcTestnet],
    connectors: [
        // Injected first for faster MetaMask detection
        injected({
            shimDisconnect: true,
        }),
        // WalletConnect for mobile
        walletConnect({
            projectId,
            metadata: {
                name: 'ARCDex V2',
                description: 'DeFi on Arc Network',
                url: 'https://www.arc-dex.xyz',
                icons: ['https://www.arc-dex.xyz/icon.png'],
            },
            showQrModal: true,
        }),
    ],
    transports: {
        [arcTestnet.id]: http(CHAIN_CONFIG.rpcUrls.default.http[0], {
            timeout: 10000, // 10 second timeout
        }),
    },
    ssr: true,
})

export function Web3Provider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
                retry: 2,
            },
        },
    }))

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}
