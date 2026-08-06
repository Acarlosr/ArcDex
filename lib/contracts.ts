// ============================================================================
// ArcDex — Endereços e constantes de protocolo
// ============================================================================
//
// Os valores abaixo derivam da rede ativa (ver lib/network.ts). Trocar entre
// Arc Mainnet e Arc Testnet é feito por variável de ambiente, sem mexer aqui.
// ============================================================================

import {
  ACTIVE_NETWORK,
  ARC_MAINNET,
  ARC_TESTNET,
  IS_MAINNET,
  IS_TESTNET,
  MAINNET_CONFIGURED,
  MAINNET_LAUNCH_DATE,
  MAINNET_LAUNCH_LABEL,
  MAINNET_PENDING,
  daysUntilMainnet,
  isMainnetLive,
} from "./network";

export {
  ACTIVE_NETWORK,
  ARC_MAINNET,
  ARC_TESTNET,
  IS_MAINNET,
  IS_TESTNET,
  MAINNET_CONFIGURED,
  MAINNET_LAUNCH_DATE,
  MAINNET_LAUNCH_LABEL,
  MAINNET_PENDING,
  daysUntilMainnet,
  isMainnetLive,
};

// ============================================================================
// CHAIN
// ============================================================================

export const CHAIN_CONFIG = {
  id: ACTIVE_NETWORK.id,
  name: ACTIVE_NETWORK.name,
  nativeCurrency: ACTIVE_NETWORK.nativeCurrency,
  rpcUrls: ACTIVE_NETWORK.rpcUrls,
  blockExplorers: ACTIVE_NETWORK.blockExplorers,
  testnet: ACTIVE_NETWORK.testnet,
} as const;

/** Nome curto exibido no badge da navbar. */
export const NETWORK_LABEL = ACTIVE_NETWORK.shortLabel;

/** Lista completa de RPCs (primário + fallbacks) da rede ativa. */
export const RPC_URLS: string[] = [...ACTIVE_NETWORK.rpcUrls.public.http];

// Explorer
export const ARCSCAN_URL = ACTIVE_NETWORK.explorerUrl;
export const ARCSCAN_API = ACTIVE_NETWORK.explorerApi;

/** Faucet só existe em testnet — null em mainnet. */
export const FAUCET_URL: string | null = ACTIVE_NETWORK.faucetUrl;

// ============================================================================
// STABLECOINS
// ============================================================================

export const TOKENS = {
  USDC: ACTIVE_NETWORK.tokens.USDC,
  EURC: ACTIVE_NETWORK.tokens.EURC,
  QCAD: ACTIVE_NETWORK.tokens.QCAD,
} as const;

export type TokenSymbol = keyof typeof TOKENS;

export const TOKEN_INFO: Record<
  string,
  { symbol: string; name: string; decimals: number; icon: string; flag: string; color: string }
> = {
  [TOKENS.USDC]: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    icon: "/tokens/usdc.svg",
    flag: "🇺🇸",
    color: "#2775CA",
  },
  [TOKENS.EURC]: {
    symbol: "EURC",
    name: "Euro Coin",
    decimals: 6,
    icon: "/tokens/eurc.svg",
    flag: "🇪🇺",
    color: "#003399",
  },
  [TOKENS.QCAD]: {
    symbol: "QCAD",
    name: "Canadian Dollar",
    decimals: 6,
    icon: "/tokens/qcad.svg",
    flag: "🇨🇦",
    color: "#FF0000",
  },
};

// ============================================================================
// CCTP - Cross-Chain Transfer Protocol
// ============================================================================

export const CCTP = {
  domain: ACTIVE_NETWORK.cctpDomain,
  ...ACTIVE_NETWORK.cctp,
} as const;

// ============================================================================
// CHAINLINK CCIP
// ============================================================================
// A lane de CCIP para a Arc só está publicada em testnet. Em mainnet os
// valores ficam vazios até a Chainlink listar a rede no diretório oficial.

export const CHAINLINK_CCIP = {
  arc: IS_TESTNET
    ? {
        router: "0xdE4E7FED43FAC37EB21aA0643d9852f75332eab8",
        chainSelector: "3034092155422581607",
        rmnProxy: "0xD610B8f58689de7755947C05342A2DFaC30ebD57",
        tokenAdminRegistry: "0xd3e461C55676B10634a5F81b747c324B85686Dd1",
        registryModuleOwner: "0x524B83ae8208490151339c626fd0E35b964483e3",
        linkToken: "0x3F1f176e347235858DD6Db905DDBA09Eaf25478a",
      }
    : {
        router: "",
        chainSelector: "",
        rmnProxy: "",
        tokenAdminRegistry: "",
        registryModuleOwner: "",
        linkToken: "",
      },
  counterparty: IS_TESTNET
    ? {
        name: "Ethereum Sepolia",
        router: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
        chainSelector: "16015286601757825753",
      }
    : {
        name: "Ethereum",
        router: "",
        chainSelector: "",
      },
  /** A lane permite mensageria; o diretório oficial lista zero tokens na Arc. */
  tokenTransfersEnabled: false,
  available: IS_TESTNET,
} as const;

// Alias legado
export const CCIP_ARC = CHAINLINK_CCIP.arc;

// ============================================================================
// GATEWAY - Saldos de USDC abstraídos entre chains
// ============================================================================

export const GATEWAY = {
  domain: ACTIVE_NETWORK.cctpDomain,
  ...ACTIVE_NETWORK.gateway,
} as const;

// ============================================================================
// PAGAMENTOS E LIQUIDAÇÃO
// ============================================================================

export const PAYMENTS = {
  ...ACTIVE_NETWORK.payments,
} as const;

// ============================================================================
// CONTRATOS DO ARCDEX
// ============================================================================

export const ARCDEX = {
  LP: ACTIVE_NETWORK.arcdex.LP,
  Swap: ACTIVE_NETWORK.arcdex.Swap,
  Payments: ACTIVE_NETWORK.arcdex.Payments,
} as const;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/** Um contrato só está utilizável se tiver endereço real na rede ativa. */
export function isDeployed(address: string | undefined): boolean {
  return !!address && address.toLowerCase() !== ZERO_ADDRESS;
}

/** Contratos do ArcDex prontos para uso na rede ativa. */
export const CONTRACTS_READY =
  isDeployed(ARCDEX.Swap) && isDeployed(ARCDEX.LP) && isDeployed(ARCDEX.Payments);

// ============================================================================
// POOLS
// ============================================================================

export type PoolPair = "USDC_EURC";

export const POOLS: Record<
  PoolPair,
  {
    name: string;
    token0: keyof typeof TOKENS;
    token1: keyof typeof TOKENS;
    lpToken: string;
    swapContract: string;
    enabled: boolean;
    icon: string;
  }
> = {
  USDC_EURC: {
    name: "USDC / EURC",
    token0: "USDC",
    token1: "EURC",
    lpToken: ARCDEX.LP,
    swapContract: ARCDEX.Swap,
    enabled: isDeployed(ARCDEX.Swap),
    icon: "💱",
  },
};

// ============================================================================
// CONSTANTES DE PROTOCOLO
// ============================================================================

export const PROTOCOL = {
  /** Taxa de swap: 0,3% (30 basis points). É a única receita do protocolo. */
  SWAP_FEE_BPS: 30,

  /** Taxa de pagamento: 0,05 token (formato de 6 casas). */
  PAYMENT_FEE: 50000,

  BPS_DENOMINATOR: 10000,
} as const;

// ============================================================================
// HELPERS
// ============================================================================

export function getTokenAddress(symbol: TokenSymbol): string {
  return TOKENS[symbol];
}

export function getTokenInfo(address: string) {
  return TOKEN_INFO[address as keyof typeof TOKEN_INFO];
}

export function formatTokenAmount(amount: bigint, decimals: number = 6): string {
  const divisor = BigInt(10 ** decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;
  const paddedFraction = fractionalPart.toString().padStart(decimals, "0");
  return `${integerPart}.${paddedFraction}`;
}

export function parseTokenAmount(amount: string, decimals: number = 6): bigint {
  const [integer, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(integer + paddedFraction);
}

/** URL de uma transação/endereço no explorer da rede ativa. */
export function explorerTx(hash: string): string {
  return `${ARCSCAN_URL}/tx/${hash}`;
}

export function explorerAddress(address: string): string {
  return `${ARCSCAN_URL}/address/${address}`;
}
