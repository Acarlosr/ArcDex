'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig } from 'wagmi'
import { useState, useEffect, type ReactNode } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arcTestnet, REOWN_PROJECT_ID, APPKIT_METADATA, wagmiTransports } from '@/lib/wagmi'

// Define the Arc Testnet as an AppKit network
const arcNetwork = {
    id: arcTestnet.id,
    name: arcTestnet.name,
    nativeCurrency: arcTestnet.nativeCurrency,
    rpcUrls: {
        default: arcTestnet.rpcUrls.default,
    },
    blockExplorers: arcTestnet.blockExplorers,
    testnet: true,
}

// Create Wagmi adapter for AppKit
const wagmiAdapter = new WagmiAdapter({
    projectId: REOWN_PROJECT_ID,
    networks: [arcNetwork as any],
    transports: wagmiTransports as any,
})

// Create AppKit instance (only on client)
let appKitInitialized = false

function initializeAppKit() {
    if (appKitInitialized || typeof window === 'undefined') return

    createAppKit({
        adapters: [wagmiAdapter],
        projectId: REOWN_PROJECT_ID,
        networks: [arcNetwork as any],
        defaultNetwork: arcNetwork as any,
        metadata: APPKIT_METADATA,
        features: {
            analytics: false,
            email: false,
            socials: [],
        },
        themeMode: 'dark',
        themeVariables: {
            '--w3m-color-mix': '#0ea5e9',
            '--w3m-color-mix-strength': 20,
            '--w3m-accent': '#22d3ee',
            '--w3m-border-radius-master': '2px',
        },
    })

    appKitInitialized = true
}

// Export wagmi config from adapter
export const wagmiConfig = wagmiAdapter.wagmiConfig

export function Web3Provider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
            },
        },
    }))

    // Initialize AppKit on client side
    useEffect(() => {
        initializeAppKit()
    }, [])

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}
