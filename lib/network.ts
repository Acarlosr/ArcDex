// ============================================================================
// ArcDex — Configuração de rede (Arc Mainnet / Arc Testnet)
// ============================================================================
//
// A Arc Public Mainnet entra no ar em 16 de setembro de 2026. Até lá, a Circle
// NÃO publicou chain ID, RPC, explorer nem endereços de contrato de mainnet
// (a doc oficial diz literalmente "Mainnet addresses are not yet available").
//
// Por isso este arquivo funciona assim:
//
//   1. Todos os valores de mainnet vêm de variáveis de ambiente
//      (NEXT_PUBLIC_ARC_MAINNET_*). Veja .env.example.
//   2. Enquanto essas variáveis não estiverem preenchidas, MAINNET_CONFIGURED
//      é false e o app cai automaticamente na testnet, exibindo o aviso de
//      contagem regressiva para o lançamento.
//   3. No dia 16/09, basta preencher o .env com os valores oficiais — nenhuma
//      alteração de código é necessária.
//
// Para forçar uma rede específica: NEXT_PUBLIC_ARC_NETWORK=mainnet|testnet
// ============================================================================

export type ArcNetworkKey = "mainnet" | "testnet";

/** Data oficial do lançamento da Arc Public Mainnet (16/09/2026, UTC). */
export const MAINNET_LAUNCH_DATE = new Date("2026-09-16T00:00:00Z");

export const MAINNET_LAUNCH_LABEL = "16 de setembro de 2026";

/** Links oficiais do anúncio, usados na UI. */
export const MAINNET_ANNOUNCEMENT_LINKS = {
  blog: "https://www.arc.io/blog/arc-mainnet-goes-live-on-september-16-2026",
  pressroom:
    "https://www.arc.io/pressroom/circle-announces-founding-validator-cohort-and-major-integrations-for-arc-ahead-of-september-16-mainnet-launch",
  community:
    "https://community.arc.io/home/blogs/arc-public-mainnet-launches-september-16-2026-2026-08-06",
  docs: "https://docs.arc.io",
} as const;

// ----------------------------------------------------------------------------
// Variáveis de ambiente (acesso literal — exigido pelo inlining do Next.js)
// ----------------------------------------------------------------------------

const ENV = {
  network: process.env.NEXT_PUBLIC_ARC_NETWORK,

  mainnetChainId: process.env.NEXT_PUBLIC_ARC_MAINNET_CHAIN_ID,
  mainnetRpc: process.env.NEXT_PUBLIC_ARC_MAINNET_RPC_URL,
  mainnetRpcFallbacks: process.env.NEXT_PUBLIC_ARC_MAINNET_RPC_FALLBACKS,
  mainnetExplorer: process.env.NEXT_PUBLIC_ARC_MAINNET_EXPLORER_URL,

  mainnetUsdc: process.env.NEXT_PUBLIC_ARC_MAINNET_USDC,
  mainnetEurc: process.env.NEXT_PUBLIC_ARC_MAINNET_EURC,
  mainnetUsyc: process.env.NEXT_PUBLIC_ARC_MAINNET_USYC,

  mainnetCctpDomain: process.env.NEXT_PUBLIC_ARC_MAINNET_CCTP_DOMAIN,
  mainnetTokenMessenger: process.env.NEXT_PUBLIC_ARC_MAINNET_CCTP_TOKEN_MESSENGER,
  mainnetMessageTransmitter: process.env.NEXT_PUBLIC_ARC_MAINNET_CCTP_MESSAGE_TRANSMITTER,
  mainnetTokenMinter: process.env.NEXT_PUBLIC_ARC_MAINNET_CCTP_TOKEN_MINTER,
  mainnetMessageV2: process.env.NEXT_PUBLIC_ARC_MAINNET_CCTP_MESSAGE_V2,

  mainnetGatewayWallet: process.env.NEXT_PUBLIC_ARC_MAINNET_GATEWAY_WALLET,
  mainnetGatewayMinter: process.env.NEXT_PUBLIC_ARC_MAINNET_GATEWAY_MINTER,

  mainnetFxEscrow: process.env.NEXT_PUBLIC_ARC_MAINNET_FX_ESCROW,

  mainnetArcdexLp: process.env.NEXT_PUBLIC_ARC_MAINNET_ARCDEX_LP,
  mainnetArcdexSwap: process.env.NEXT_PUBLIC_ARC_MAINNET_ARCDEX_SWAP,
  mainnetArcdexPayments: process.env.NEXT_PUBLIC_ARC_MAINNET_ARCDEX_PAYMENTS,

  // Overrides legados de testnet (mantidos para compatibilidade)
  testnetArcdexLp: process.env.NEXT_PUBLIC_ARCDEX_LP,
  testnetArcdexSwap: process.env.NEXT_PUBLIC_ARCDEX_SWAP,
  testnetArcdexPayments: process.env.NEXT_PUBLIC_ARCDEX_PAYMENTS,
} as const;

const ZERO = "0x0000000000000000000000000000000000000000" as const;

/** Endereço vindo do ambiente ou address(0) quando ainda não publicado. */
function addr(value: string | undefined): `0x${string}` {
  const trimmed = value?.trim();
  if (!trimmed || !/^0x[0-9a-fA-F]{40}$/.test(trimmed)) return ZERO;
  return trimmed as `0x${string}`;
}

function list(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

// ----------------------------------------------------------------------------
// Arc Testnet — valores oficiais (docs.arc.io)
// ----------------------------------------------------------------------------

export const ARC_TESTNET = {
  key: "testnet" as ArcNetworkKey,
  id: 5042002,
  name: "Arc Testnet",
  shortLabel: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.io"] },
    public: {
      http: [
        "https://rpc.testnet.arc.io",
        "https://rpc.blockdaemon.testnet.arc.io",
        "https://rpc.drpc.testnet.arc.io",
        "https://rpc.quicknode.testnet.arc.io",
      ],
    },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
  explorerUrl: "https://testnet.arcscan.app",
  explorerApi: "https://testnet.arcscan.app/api",
  faucetUrl: "https://faucet.circle.com",
  cctpDomain: 26,
  tokens: {
    USDC: "0x3600000000000000000000000000000000000000" as `0x${string}`,
    EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as `0x${string}`,
    USYC: "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C" as `0x${string}`,
    QCAD: "0x4A08A0843F7f7dEe35014b8D58B25eaFD85b3B28" as `0x${string}`,
  },
  cctp: {
    TokenMessengerV2: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA" as `0x${string}`,
    MessageTransmitterV2: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275" as `0x${string}`,
    TokenMinterV2: "0xb43db544E2c27092c107639Ad201b3dEfAbcF192" as `0x${string}`,
    MessageV2: "0xbaC0179bB358A8936169a63408C8481D582390C4" as `0x${string}`,
  },
  gateway: {
    GatewayWallet: "0x0077777d7EBA4688BDeF3E311b846F25870A19B9" as `0x${string}`,
    GatewayMinter: "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B" as `0x${string}`,
  },
  payments: {
    FxEscrow: "0xd68256f4D69C6BbEcB873D8588AE0Dc6B8E22E10" as `0x${string}`,
    Permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3" as `0x${string}`,
  },
  arcdex: {
    LP: addr(ENV.testnetArcdexLp ?? "0x823f387a392bdc1ef57bc30cc005be7e6d067f13"),
    Swap: addr(ENV.testnetArcdexSwap ?? "0x50bb26da53555585c606280435469bfb15cac4cf"),
    Payments: addr(ENV.testnetArcdexPayments ?? "0x515683c9399445df4a38915c2130cc498aba4319"),
  },
} as const;

// ----------------------------------------------------------------------------
// Arc Mainnet — a preencher via .env quando a Circle publicar (16/09/2026)
// ----------------------------------------------------------------------------

const mainnetChainId = Number(ENV.mainnetChainId ?? 0) || 0;
const mainnetRpc = ENV.mainnetRpc?.trim() ?? "";
const mainnetRpcFallbacks = list(ENV.mainnetRpcFallbacks);
const mainnetExplorer = ENV.mainnetExplorer?.trim() || "https://arcscan.app";

export const ARC_MAINNET = {
  key: "mainnet" as ArcNetworkKey,
  id: mainnetChainId,
  name: "Arc",
  shortLabel: "Arc Mainnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: mainnetRpc ? [mainnetRpc] : [] },
    public: { http: [mainnetRpc, ...mainnetRpcFallbacks].filter(Boolean) },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: mainnetExplorer },
  },
  testnet: false,
  explorerUrl: mainnetExplorer,
  explorerApi: `${mainnetExplorer}/api`,
  faucetUrl: null,
  cctpDomain: Number(ENV.mainnetCctpDomain ?? 26) || 26,
  tokens: {
    USDC: addr(ENV.mainnetUsdc),
    EURC: addr(ENV.mainnetEurc),
    USYC: addr(ENV.mainnetUsyc),
    QCAD: ZERO,
  },
  cctp: {
    TokenMessengerV2: addr(ENV.mainnetTokenMessenger),
    MessageTransmitterV2: addr(ENV.mainnetMessageTransmitter),
    TokenMinterV2: addr(ENV.mainnetTokenMinter),
    MessageV2: addr(ENV.mainnetMessageV2),
  },
  gateway: {
    GatewayWallet: addr(ENV.mainnetGatewayWallet),
    GatewayMinter: addr(ENV.mainnetGatewayMinter),
  },
  payments: {
    FxEscrow: addr(ENV.mainnetFxEscrow),
    // Permit2 é determinístico (CREATE2) e tem o mesmo endereço em toda EVM.
    Permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3" as `0x${string}`,
  },
  arcdex: {
    LP: addr(ENV.mainnetArcdexLp),
    Swap: addr(ENV.mainnetArcdexSwap),
    Payments: addr(ENV.mainnetArcdexPayments),
  },
} as const;

// ----------------------------------------------------------------------------
// Seleção da rede ativa
// ----------------------------------------------------------------------------

/** true quando chain ID + RPC de mainnet já foram informados no .env. */
export const MAINNET_CONFIGURED = ARC_MAINNET.id > 0 && mainnetRpc.length > 0;

const requestedNetwork: ArcNetworkKey =
  ENV.network?.trim().toLowerCase() === "testnet" ? "testnet" : "mainnet";

/**
 * Mainnet foi pedida mas ainda não há dados oficiais publicados.
 * A UI usa isso para exibir o aviso de "lançamento em 16/09/2026".
 */
export const MAINNET_PENDING = requestedNetwork === "mainnet" && !MAINNET_CONFIGURED;

export const ACTIVE_NETWORK =
  requestedNetwork === "mainnet" && MAINNET_CONFIGURED ? ARC_MAINNET : ARC_TESTNET;

export const IS_MAINNET = ACTIVE_NETWORK.key === "mainnet";
export const IS_TESTNET = !IS_MAINNET;

/** Dias restantes até o lançamento (0 depois de 16/09/2026). */
export function daysUntilMainnet(from: Date = new Date()): number {
  const diff = MAINNET_LAUNCH_DATE.getTime() - from.getTime();
  return diff <= 0 ? 0 : Math.ceil(diff / 86_400_000);
}

export function isMainnetLive(from: Date = new Date()): boolean {
  return from.getTime() >= MAINNET_LAUNCH_DATE.getTime();
}

if (typeof window === "undefined" && MAINNET_PENDING) {
  // Aviso apenas em build/servidor — evita ruído no console do usuário.
  console.warn(
    "[ArcDex] Arc Mainnet ainda não configurada (NEXT_PUBLIC_ARC_MAINNET_CHAIN_ID / _RPC_URL ausentes). " +
      "Usando Arc Testnet até 16/09/2026.",
  );
}
