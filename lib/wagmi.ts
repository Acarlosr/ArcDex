import { http } from 'wagmi'
import { CHAIN_CONFIG, IS_MAINNET, RPC_URLS } from './contracts'

// Reown Project ID (from WalletConnect Cloud / Reown)
export const REOWN_PROJECT_ID = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '62a5e53db0163b7e29bc8b76c22d04cc'

// Chain ativa (Arc Mainnet ou Arc Testnet, conforme lib/network.ts)
export const arcChain = {
    id: CHAIN_CONFIG.id,
    name: CHAIN_CONFIG.name,
    nativeCurrency: CHAIN_CONFIG.nativeCurrency,
    rpcUrls: CHAIN_CONFIG.rpcUrls,
    blockExplorers: CHAIN_CONFIG.blockExplorers,
    testnet: CHAIN_CONFIG.testnet,
} as const

// Metadata for AppKit modal
export const APPKIT_METADATA = {
    name: 'ARCDex V2',
    description: IS_MAINNET
        ? 'DeFi Trading Platform on Arc — Swap, Pools, Bridge & Payments'
        : 'DeFi Trading Platform on Arc Testnet — Swap, Pools, Bridge & Payments',
    url: 'https://www.arc-dex.xyz',
    icons: ['https://www.arc-dex.xyz/icon.png'],
}

// Transport configuration
export const wagmiTransports = {
    [arcChain.id]: http(RPC_URLS[0]),
}

// Mobile detection utility
export function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
}

// Check if running inside wallet browser (MetaMask, Rabby, etc.)
export function isWalletBrowser(): boolean {
    if (typeof window === 'undefined') return false
    return !!(window as any).ethereum
}

// Deep link URLs for mobile wallets (fallback)
export const WALLET_DEEP_LINKS = {
    metamask: 'https://metamask.app.link/dapp/www.arc-dex.xyz/app',
    trustwallet: 'https://link.trustwallet.com/open_url?coin_id=60&url=https://www.arc-dex.xyz/app',
}

// Export for backwards compatibility
export { arcChain as chain }
export { arcChain as arcTestnet }
