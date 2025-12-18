import { http, createConfig, createStorage } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { CHAIN_CONFIG } from './contracts'

// WalletConnect Project ID
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '62a5e53db0163b7e29bc8b76c22d04cc'

// Define Arc Testnet chain
export const arcTestnet = {
    id: CHAIN_CONFIG.id,
    name: CHAIN_CONFIG.name,
    nativeCurrency: CHAIN_CONFIG.nativeCurrency,
    rpcUrls: CHAIN_CONFIG.rpcUrls,
    blockExplorers: CHAIN_CONFIG.blockExplorers,
    testnet: CHAIN_CONFIG.testnet,
} as const

// Create wagmi config with both injected (desktop) and WalletConnect (mobile) connectors
export const wagmiConfig = createConfig({
    chains: [arcTestnet],
    connectors: [
        injected({
            shimDisconnect: true,
        }),
        walletConnect({
            projectId: WALLETCONNECT_PROJECT_ID,
            metadata: {
                name: 'ARCDex',
                description: 'DeFi Trading on Arc Network Testnet',
                url: typeof window !== 'undefined' ? window.location.origin : 'https://arcdex.vercel.app',
                icons: ['https://arcdex.vercel.app/icon.png'],
            },
            showQrModal: true,
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

// Export chain and project ID for use in components
export { arcTestnet as chain }
export { WALLETCONNECT_PROJECT_ID }
