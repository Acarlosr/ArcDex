import { http, createConfig, createStorage } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { CHAIN_CONFIG } from './contracts'

// Define Arc Testnet chain
export const arcTestnet = {
    id: CHAIN_CONFIG.id,
    name: CHAIN_CONFIG.name,
    nativeCurrency: CHAIN_CONFIG.nativeCurrency,
    rpcUrls: CHAIN_CONFIG.rpcUrls,
    blockExplorers: CHAIN_CONFIG.blockExplorers,
    testnet: CHAIN_CONFIG.testnet,
} as const

// Create wagmi config
export const wagmiConfig = createConfig({
    chains: [arcTestnet],
    connectors: [
        injected(),
    ],
    storage: createStorage({
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    }),
    transports: {
        [arcTestnet.id]: http(CHAIN_CONFIG.rpcUrls.default.http[0]),
    },
    ssr: true,
})

// Export chain for easy access
export { arcTestnet as chain }
