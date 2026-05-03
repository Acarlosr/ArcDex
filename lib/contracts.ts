// ============================================================================
// ArcDex Contract Configuration - Arc Testnet (Chain ID: 5042034)
// ============================================================================

// Arc Testnet Chain Configuration
export const CHAIN_CONFIG = {
  id: 5042034,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18, // Native gas uses 18 decimals
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
    public: {
      http: [
        "https://rpc.testnet.arc.network",
        "https://rpc.blockdaemon.testnet.arc.network",
        "https://rpc.drpc.testnet.arc.network",
        "https://rpc.quicknode.testnet.arc.network",
      ],
    },
  },
  blockExplorers: {
    default: { name: "Arc Explorer", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
} as const;

// ArcScan Explorer URLs
export const ARCSCAN_URL = "https://testnet.arcscan.app" as const;
export const ARCSCAN_API = "https://testnet.arcscan.app/api" as const;

// ============================================================================
// STABLECOINS
// ============================================================================

export const TOKENS = {
  // USDC - Native EVM asset, also available as ERC-20 interface (6 decimals)
  USDC: "0x3600000000000000000000000000000000000000" as const,

  // EURC - Euro-denominated stablecoin by Circle (6 decimals)
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const,

  // USYC - Yield-bearing token, tokenized money market fund (6 decimals)
  USYC: "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C" as const,
} as const;

// Token metadata for UI display
export const TOKEN_INFO = {
  [TOKENS.USDC]: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    icon: "/tokens/usdc.svg",
  },
  [TOKENS.EURC]: {
    symbol: "EURC",
    name: "Euro Coin",
    decimals: 6,
    icon: "/tokens/eurc.svg",
  },
  [TOKENS.USYC]: {
    symbol: "USYC",
    name: "US Yield Coin",
    decimals: 6,
    icon: "/tokens/usyc.svg",
  },
} as const;

// ============================================================================
// USYC RELATED CONTRACTS
// ============================================================================

export const USYC_CONTRACTS = {
  // Manages allowlisted access and entitlement controls
  Entitlements: "0xcc205224862c7641930c87679e98999d23c26113" as const,

  // Contract to mint and redeem testnet USYC from testnet USDC
  Teller: "0x9fdF14c5B14173D74C08Af27AebFf39240dC105A" as const,
} as const;

// ============================================================================
// CCTP - Cross-Chain Transfer Protocol (Domain 26)
// ============================================================================

export const CCTP = {
  domain: 26,
  TokenMessengerV2: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA" as const,
  MessageTransmitterV2: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275" as const,
  TokenMinterV2: "0xb43db544E2c27092c107639Ad201b3dEfAbcF192" as const,
  MessageV2: "0xbaC0179bB358A8936169a63408C8481D582390C4" as const,
} as const;

// ============================================================================
// GATEWAY - Chain-abstracted USDC balances
// ============================================================================

export const GATEWAY = {
  domain: 26,
  GatewayWallet: "0x0077777d7EBA4688BDeF3E311b846F25870A19B9" as const,
  GatewayMinter: "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B" as const,
} as const;

// ============================================================================
// PAYMENTS & SETTLEMENT
// ============================================================================

export const PAYMENTS = {
  // StableFX escrow for stablecoin swaps
  FxEscrow: "0x1f91886C7028986aD885ffCee0e40b75C9cd5aC1" as const,

  // Permit2 for token allowance management
  Permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3" as const,
} as const;

// ============================================================================
// ARCDEX DEPLOYED CONTRACTS
// ============================================================================

export const ARCDEX = {
  // LP Token for liquidity providers
  LP: (process.env.NEXT_PUBLIC_ARCDEX_LP ?? "0x823f387a392bdc1ef57bc30cc005be7e6d067f13") as `0x${string}`,

  // AMM Swap contract (USDC/EURC)
  Swap: (process.env.NEXT_PUBLIC_ARCDEX_SWAP ?? "0x50bb26da53555585c606280435469bfb15cac4cf") as `0x${string}`,

  // Staking vault for yield
  Staking: (process.env.NEXT_PUBLIC_ARCDEX_STAKING ?? "0x5d1ddbafd6a11131154a635563699230f0b9229b") as `0x${string}`,

  // P2P Payments
  Payments: (process.env.NEXT_PUBLIC_ARCDEX_PAYMENTS ?? "0x515683c9399445df4a38915c2130cc498aba4319") as `0x${string}`,

  // USYC Pools (deploy and update addresses)
  LP_USYC: "" as const, // TODO: Update after deploy
  SwapUSYC: "" as const, // TODO: Update after deploy
} as const;

// ============================================================================
// POOL DEFINITIONS
// ============================================================================

export type PoolPair = "USDC_EURC" | "USYC_USDC" | "USYC_EURC";

export const POOLS: Record<PoolPair, {
  name: string;
  token0: keyof typeof TOKENS;
  token1: keyof typeof TOKENS;
  lpToken: string;
  swapContract: string;
  enabled: boolean;
  apr: number;
  icon: string;
}> = {
  USDC_EURC: {
    name: "USDC / EURC",
    token0: "USDC",
    token1: "EURC",
    lpToken: ARCDEX.LP,
    swapContract: ARCDEX.Swap,
    enabled: true,
    apr: 12.4,
    icon: "💱",
  },
  USYC_USDC: {
    name: "USYC / USDC",
    token0: "USYC",
    token1: "USDC",
    lpToken: ARCDEX.LP_USYC,
    swapContract: ARCDEX.SwapUSYC,
    enabled: false, // Enable after deployment
    apr: 8.5,
    icon: "📈",
  },
  USYC_EURC: {
    name: "USYC / EURC",
    token0: "USYC",
    token1: "EURC",
    lpToken: ARCDEX.LP_USYC,
    swapContract: ARCDEX.SwapUSYC,
    enabled: false, // Enable after deployment
    apr: 7.2,
    icon: "📊",
  },
};

// ============================================================================
// PROTOCOL CONSTANTS
// ============================================================================

export const PROTOCOL = {
  // Swap fee: 0.3% (30 basis points)
  SWAP_FEE_BPS: 30,

  // Payment fee: 0.05 tokens (in 6 decimal format)
  PAYMENT_FEE: 50000,

  // Staking APR in basis points
  USDC_BASE_APR_BPS: 800,  // 8%
  USDC_BOOST_APR_BPS: 200, // 2%
  EURC_BASE_APR_BPS: 600,  // 6%
  EURC_BOOST_APR_BPS: 200, // 2%

  // Basis points denominator
  BPS_DENOMINATOR: 10000,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTokenAddress(symbol: "USDC" | "EURC" | "USYC"): string {
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
