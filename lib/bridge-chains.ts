/**
 * Canonical registry of CCTP v2 source chains supported by the ArcDex bridge.
 *
 * Only chains present in the Circle Bridge Kit `BridgeChain` enum can be bridged
 * (they have native USDC + CCTP contracts). This list is the TESTNET set that can
 * route to Arc Testnet (CCTP domain 26). Data mirrors
 * `@circle-fin/bridge-kit/chains.d.ts` exactly (chainId, domain, usdcAddress, rpc).
 *
 * NOTE: BNB Chain / BSC is NOT included because Circle CCTP does not support it.
 * Solana IS CCTP-supported but is non-EVM and needs a separate wallet adapter, so
 * it is intentionally excluded from this EVM dropdown.
 */

import type { BridgeChain } from "@circle-fin/bridge-kit"
import { RPC_URLS } from "./contracts"

export interface BridgeChainInfo {
  /** EVM chain id */
  id: number
  /** Circle Bridge Kit enum string */
  bridgeChain: `${BridgeChain}`
  name: string
  shortName: string
  logo: string
  /** CCTP v2 domain */
  cctpDomain: number
  /** Native USDC (6 decimals) on this chain */
  usdc: `0x${string}`
  /** Public RPC used only for reading balances */
  rpc: string
  /**
   * RPCs adicionais de fallback (o `rpc` acima é sempre o primeiro da lista
   * efetiva). Opcional — quando ausente, só o `rpc` é usado.
   *
   * Existe porque o Circle Bridge Kit embute UM RPC por chain dentro do próprio
   * pacote e, para a Ethereum Sepolia, esse RPC é `https://sepolia.drpc.org` —
   * que passou a responder HTTP 400 ("chain is not available on free plan").
   * Os endpoints daqui são injetados no Bridge Kit via `getPublicClient`
   * (ver hooks/useBridgeKit.ts) e usados também nas leituras de saldo.
   */
  fallbackRpcs?: string[]
}

// Destino do bridge.
//
// TODO (16/09/2026): quando a Arc Public Mainnet entrar no ar, o Circle Bridge Kit
// vai expor um novo identificador de chain (algo como "Arc") e uma lista de chains
// de origem em mainnet. Trocar `id`, `bridgeChain` e `BRIDGE_SOURCE_CHAINS` pelos
// valores de mainnet — o `rpc` já acompanha a rede ativa automaticamente.
export const ARC_CHAIN_INFO: BridgeChainInfo = {
  id: 5_042_002,
  bridgeChain: "Arc_Testnet",
  name: "Arc Testnet",
  shortName: "Arc",
  logo: "⚡",
  cctpDomain: 26,
  usdc: "0x3600000000000000000000000000000000000000",
  rpc: RPC_URLS[0],
  fallbackRpcs: RPC_URLS.slice(1),
}

// Source chains (all CCTP testnets that route to Arc)
export const BRIDGE_SOURCE_CHAINS: BridgeChainInfo[] = [
  { id: 11_155_111, bridgeChain: "Ethereum_Sepolia",   name: "Ethereum Sepolia", shortName: "Ethereum",  logo: "🔷", cctpDomain: 0,  usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", rpc: "https://ethereum-sepolia-rpc.publicnode.com", fallbackRpcs: ["https://sepolia.gateway.tenderly.co", "https://rpc.sepolia.org", "https://1rpc.io/sepolia"] },
  { id: 84_532,     bridgeChain: "Base_Sepolia",        name: "Base Sepolia",     shortName: "Base",      logo: "🔵", cctpDomain: 6,  usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", rpc: "https://sepolia.base.org", fallbackRpcs: ["https://base-sepolia-rpc.publicnode.com"] },
  { id: 421_614,    bridgeChain: "Arbitrum_Sepolia",    name: "Arbitrum Sepolia", shortName: "Arbitrum",  logo: "🔺", cctpDomain: 3,  usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", rpc: "https://sepolia-rollup.arbitrum.io/rpc", fallbackRpcs: ["https://arbitrum-sepolia-rpc.publicnode.com"] },
  { id: 11_155_420, bridgeChain: "Optimism_Sepolia",    name: "OP Sepolia",       shortName: "Optimism",  logo: "🔴", cctpDomain: 2,  usdc: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7", rpc: "https://sepolia.optimism.io", fallbackRpcs: ["https://optimism-sepolia-rpc.publicnode.com"] },
  { id: 80_002,     bridgeChain: "Polygon_Amoy_Testnet",name: "Polygon Amoy",     shortName: "Polygon",   logo: "🟣", cctpDomain: 7,  usdc: "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582", rpc: "https://rpc-amoy.polygon.technology", fallbackRpcs: ["https://polygon-amoy-bor-rpc.publicnode.com"] },
  { id: 43_113,     bridgeChain: "Avalanche_Fuji",      name: "Avalanche Fuji",   shortName: "Avalanche", logo: "🔻", cctpDomain: 1,  usdc: "0x5425890298aed601595a70ab815c96711a31bc65", rpc: "https://api.avax-test.network/ext/bc/C/rpc", fallbackRpcs: ["https://avalanche-fuji-c-chain-rpc.publicnode.com"] },
  { id: 1_301,      bridgeChain: "Unichain_Sepolia",    name: "Unichain Sepolia", shortName: "Unichain",  logo: "🦄", cctpDomain: 10, usdc: "0x31d0220469e10c4E71834a79b1f276d740d3768F", rpc: "https://sepolia.unichain.org" },
  { id: 59_141,     bridgeChain: "Linea_Sepolia",       name: "Linea Sepolia",    shortName: "Linea",     logo: "⬛", cctpDomain: 11, usdc: "0xfece4462d57bd51a6a552365a011b95f0e16d9b7", rpc: "https://rpc.sepolia.linea.build" },
  { id: 10_143,     bridgeChain: "Monad_Testnet",       name: "Monad Testnet",    shortName: "Monad",     logo: "🟪", cctpDomain: 15, usdc: "0x534b2f3A21130d7a60830c2Df862319e593943A3", rpc: "https://testnet-rpc.monad.xyz" },
  { id: 14_601,     bridgeChain: "Sonic_Testnet",       name: "Sonic Testnet",    shortName: "Sonic",     logo: "🎵", cctpDomain: 13, usdc: "0x0BA304580ee7c9a980CF72e55f5Ed2E9fd30Bc51", rpc: "https://rpc.testnet.soniclabs.com" },
  { id: 998,        bridgeChain: "HyperEVM_Testnet",    name: "HyperEVM Testnet", shortName: "HyperEVM",  logo: "🟢", cctpDomain: 19, usdc: "0x2B3370eE501B4a559b57D449569354196457D8Ab", rpc: "https://rpc.hyperliquid-testnet.xyz/evm" },
  { id: 763_373,    bridgeChain: "Ink_Testnet",         name: "Ink Sepolia",      shortName: "Ink",       logo: "🖋️", cctpDomain: 21, usdc: "0xFabab97dCE620294D2B0b0e46C68964e326300Ac", rpc: "https://rpc-gel-sepolia.inkonchain.com" },
  // O RPC padrão desta chain também era da dRPC — mesmo risco de gate no plano
  // gratuito que derrubou a Ethereum Sepolia. Alchemy público vira o primário.
  { id: 4_801,      bridgeChain: "World_Chain_Sepolia", name: "World Chain Sepolia", shortName: "World", logo: "🌐", cctpDomain: 14, usdc: "0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88", rpc: "https://worldchain-sepolia.g.alchemy.com/public", fallbackRpcs: ["https://worldchain-sepolia.drpc.org"] },
  { id: 1_328,      bridgeChain: "Sei_Testnet",         name: "Sei Testnet",      shortName: "Sei",       logo: "🔶", cctpDomain: 16, usdc: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED", rpc: "https://evm-rpc-testnet.sei-apis.com" },
  { id: 98_867,     bridgeChain: "Plume_Testnet",       name: "Plume Testnet",    shortName: "Plume",     logo: "🪶", cctpDomain: 22, usdc: "0xcB5f30e335672893c7eb944B374c196392C19D18", rpc: "https://testnet-rpc.plume.org" },
  { id: 812_242,    bridgeChain: "Codex_Testnet",       name: "Codex Testnet",    shortName: "Codex",     logo: "📦", cctpDomain: 12, usdc: "0x6d7f141b6819C2c9CC2f818e6ad549E7Ca090F8f", rpc: "https://rpc.codex-stg.xyz" },
  { id: 51,         bridgeChain: "XDC_Apothem",         name: "XDC Apothem",      shortName: "XDC",       logo: "⚫", cctpDomain: 18, usdc: "0xb5AB69F7bBada22B28e79C8FFAECe55eF1c771D4", rpc: "https://erpc.apothem.network" },
]

export const ALL_BRIDGE_CHAINS: BridgeChainInfo[] = [ARC_CHAIN_INFO, ...BRIDGE_SOURCE_CHAINS]

/**
 * Native gas token + faucet per chain. CCTP requires the user to pay gas on BOTH
 * the source (burn) and destination (mint) chains, so we use this to warn before
 * a bridge and link the right faucet. On Arc the native gas token is USDC.
 */
export interface GasInfo {
  symbol: string
  faucet: string
}

export const GAS_INFO_BY_CHAIN: Record<number, GasInfo> = {
  5_042_002:  { symbol: "USDC", faucet: "https://faucet.circle.com" },
  11_155_111: { symbol: "ETH",  faucet: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia" },
  84_532:     { symbol: "ETH",  faucet: "https://www.alchemy.com/faucets/base-sepolia" },
  421_614:    { symbol: "ETH",  faucet: "https://www.alchemy.com/faucets/arbitrum-sepolia" },
  11_155_420: { symbol: "ETH",  faucet: "https://www.alchemy.com/faucets/optimism-sepolia" },
  80_002:     { symbol: "POL",  faucet: "https://faucet.polygon.technology" },
  43_113:     { symbol: "AVAX", faucet: "https://core.app/tools/testnet-faucet" },
  1_301:      { symbol: "ETH",  faucet: "https://www.alchemy.com/faucets/unichain-sepolia" },
  59_141:     { symbol: "ETH",  faucet: "https://www.alchemy.com/faucets/linea-sepolia" },
  10_143:     { symbol: "MON",  faucet: "https://faucet.monad.xyz" },
  14_601:     { symbol: "S",    faucet: "https://testnet.soniclabs.com/account" },
  998:        { symbol: "HYPE", faucet: "https://app.hyperliquid-testnet.xyz/drip" },
  763_373:    { symbol: "ETH",  faucet: "https://inkonchain.com/faucet" },
  4_801:      { symbol: "ETH",  faucet: "https://www.alchemy.com/faucets/world-chain-sepolia" },
  1_328:      { symbol: "SEI",  faucet: "https://docs.sei.io/learn/faucet" },
  98_867:     { symbol: "PLUME",faucet: "https://faucet.plume.org" },
  812_242:    { symbol: "ETH",  faucet: "https://faucet.circle.com" },
  51:         { symbol: "XDC",  faucet: "https://faucet.apothem.network" },
}

export function getGasInfo(chainId: number): GasInfo {
  return GAS_INFO_BY_CHAIN[chainId] ?? { symbol: "gas", faucet: "" }
}

/** chainId -> Circle BridgeChain enum string */
export const CHAIN_ID_TO_BRIDGE_CHAIN: Record<number, `${BridgeChain}`> = Object.fromEntries(
  ALL_BRIDGE_CHAINS.map((c) => [c.id, c.bridgeChain]),
)

/** Lista efetiva de RPCs de uma chain: primário + fallbacks, sem duplicatas. */
export function getChainRpcs(chain: BridgeChainInfo): string[] {
  return Array.from(new Set([chain.rpc, ...(chain.fallbackRpcs ?? [])].filter(Boolean)))
}

/** chainId -> RPCs. Usado para sobrescrever os RPCs internos do Bridge Kit. */
export const BRIDGE_RPCS_BY_CHAIN: Record<number, string[]> = Object.fromEntries(
  ALL_BRIDGE_CHAINS.map((c) => [c.id, getChainRpcs(c)]),
)

/** chainId -> { usdc, rpc, rpcs } for balance reads */
export const BRIDGE_USDC_BY_CHAIN: Record<
  number,
  { usdc: `0x${string}`; rpc: string; rpcs: string[] }
> = Object.fromEntries(
  ALL_BRIDGE_CHAINS.map((c) => [c.id, { usdc: c.usdc, rpc: c.rpc, rpcs: getChainRpcs(c) }]),
)
