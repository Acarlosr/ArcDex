'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, createStorage, cookieStorage } from 'wagmi'
import { fallback, http } from 'viem'
import { injected, walletConnect } from 'wagmi/connectors'
import { useState, useEffect, type ReactNode } from 'react'
import { CHAIN_CONFIG, IS_MAINNET, RPC_URLS } from '@/lib/contracts'

// Lower retry count so a rate-limited (429) RPC doesn't hammer with retries
const RPC_OPTS = { timeout: 20000, retryCount: 1, retryDelay: 1500 }

// RPCs vêm da rede ativa (lib/network.ts): primário + fallbacks de provedores.
const ARC_RPC_URLS = RPC_URLS.filter(Boolean)

// WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '62a5e53db0163b7e29bc8b76c22d04cc'

// Chain ativa: Arc Mainnet ou Arc Testnet, conforme NEXT_PUBLIC_ARC_NETWORK
const arcChain = {
    id: CHAIN_CONFIG.id,
    name: CHAIN_CONFIG.name,
    nativeCurrency: CHAIN_CONFIG.nativeCurrency,
    rpcUrls: CHAIN_CONFIG.rpcUrls,
    blockExplorers: CHAIN_CONFIG.blockExplorers,
    // Multicall3: agrupa as leituras num único eth_call em vez de uma chamada
    // RPC por hook. Reduz bastante o risco de 429 nos endpoints públicos da Arc.
    contracts: CHAIN_CONFIG.contracts,
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
                    description: IS_MAINNET ? 'DeFi on Arc' : 'DeFi on Arc Testnet',
                    // A url tem que bater com a origem real da página, senão o
                    // WalletConnect avisa em dev e algumas carteiras recusam a
                    // sessão por mismatch de domínio.
                    url: window.location.origin,
                    icons: ['https://www.arc-dex.xyz/icon.png'],
                },
                showQrModal: true,
            }) as any
        )
    }

    return createConfig({
        chains: [arcChain],
        connectors,
        // Persist the last connection so a page refresh restores the wallet
        storage: createStorage({
            storage: typeof window !== 'undefined' ? window.localStorage : cookieStorage,
            key: 'arcdex.wagmi',
        }),
        transports: {
            [arcChain.id]: fallback(
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
