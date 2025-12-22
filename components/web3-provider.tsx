'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http, createStorage } from 'wagmi'
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

// Metadata for WalletConnect
const metadata = {
    name: 'ARCDex V2',
    description: 'DeFi Trading Platform on Arc Network Testnet',
    url: 'https://www.arc-dex.xyz',
    icons: ['https://www.arc-dex.xyz/icon.png'],
}

// Create wagmi config
export const wagmiConfig = createConfig({
    chains: [arcTestnet],
    connectors: [
        injected({
            shimDisconnect: true,
        }),
        walletConnect({
            projectId,
            metadata,
            showQrModal: true, // Native QR modal
            qrModalOptions: {
                themeMode: 'dark',
            },
        }),
    ],
    storage: createStorage({
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    }),
    transports: {
        [arcTestnet.id]: http(CHAIN_CONFIG.rpcUrls.default.http[0]),
    },
    ssr: true,
})

export function Web3Provider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
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
