# Auditoria ArcDex — 20/08/2026

Escopo: (1) o post do Discord/Arc House muda algo no projeto? (2) bug "conectando" infinito. (3) conformidade com a Arc Testnet.

Base documental: [EVM differences](https://docs.arc.io/arc/references/evm-differences), [One token, two interfaces](https://www.arc.io/blog/building-with-usdc-on-arc-one-token-two-interfaces), [Connect to Arc](https://docs.arc.io/arc/references/connect-to-arc), definição oficial `arcTestnet` embarcada no viem 2.43.3 (`node_modules/viem/chains/definitions/arcTestnet.ts`).

---

## Resposta curta

**Sim, o post muda o projeto — e num ponto que hoje quebra swaps de verdade.**

Na Arc o USDC é *ao mesmo tempo* o gas token nativo (18 casas) e um ERC-20 (6 casas, `0x3600…0000`) — **o mesmo saldo**, não dois. O ArcDex trata os dois como mundos separados. Consequência concreta: o botão **MAX** do swap preenche 100% do saldo USDC, e aí **não sobra gas** — a transação falha sempre. Em Ethereum isso funcionaria (gas é ETH); na Arc, não.

O bug de conexão **não** vem do post. Vem de uma lacuna própria: o dapp **não tem nenhum guard de rede**.

---

## 1. Bug: "Conectando…" que nunca conecta

### Causa raiz — o app não valida nem troca de rede

Busca em todo o repositório:

```
useSwitchChain  → 0 ocorrências
useChainId      → 0 ocorrências
switchChain     → 0 ocorrências
wallet_switchEthereumChain → 0 ocorrências
```

O único `wallet_addEthereumChain` está no `components/onboarding-modal.tsx`, num passo de tutorial que o usuário pode nunca abrir.

O que acontece na prática:

1. `components/web3-provider.tsx` cria `createConfig({ chains: [arcChain] })` — **uma única chain**.
2. `components/navbar.tsx:87` chama `connectAsync({ connector: wcConnector })` — **sem `chainId`**.
3. A carteira conecta, mas continua na Ethereum/Polygon/onde estava.
4. wagmi marca `isConnected = true`, porém todo `useReadContract` cai em `ChainMismatchError` / retorna `undefined`.
5. Saldos ficam em `0.00`, botões desabilitados, nenhum erro visível → **a UI parece travada em "conectando"**.

Além disso, o spinner do botão (`navbar.tsx:266`) usa:

```tsx
{isConnecting || isPending || isManualConnecting ? <Loader2 …/> : …}
```

`isConnecting` e `isPending` **não têm timeout próprio** — só `isManualConnecting` tem (30 s, linha 60). Se o `connectAsync` nunca resolve (usuário fecha o QR no X, carteira travada, provider injetado duplicado), `isPending` fica `true` para sempre. E `isReconnecting` (reconexão automática com `reconnectOnMount={true}` + `localStorage` persistido, linhas 57-59 e 99) **não é tratado em lugar nenhum** — estado corrompido em `arcdex.wagmi` ou nas chaves `wc@2:*` deixa o app pendurado sem saída.

### Correção (3 partes)

**a) Passar `chainId` no connect** — `components/navbar.tsx`:

```diff
-        await connectAsync({ connector: wcConnector })
+        await connectAsync({ connector: wcConnector, chainId: CHAIN_CONFIG.id })
```

```diff
-        await connectAsync({ connector: injectedConnector })
+        await connectAsync({ connector: injectedConnector, chainId: CHAIN_CONFIG.id })
```

**b) Guard de rede + auto-switch** — novo `hooks/useArcNetwork.ts`:

```ts
"use client"
import { useAccount, useSwitchChain } from "wagmi"
import { useCallback } from "react"
import { CHAIN_CONFIG, RPC_URLS, ARCSCAN_URL } from "@/lib/contracts"

export function useArcNetwork() {
  const { chainId, isConnected } = useAccount()
  const { switchChainAsync, isPending } = useSwitchChain()
  const isWrongNetwork = isConnected && chainId !== CHAIN_CONFIG.id

  const switchToArc = useCallback(async () => {
    try {
      await switchChainAsync({ chainId: CHAIN_CONFIG.id })
    } catch {
      // Rede ainda não cadastrada na carteira → adiciona
      const eth = (window as any).ethereum
      if (!eth) return
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: `0x${CHAIN_CONFIG.id.toString(16)}`,
          chainName: CHAIN_CONFIG.name,
          nativeCurrency: CHAIN_CONFIG.nativeCurrency, // USDC, 18 casas
          rpcUrls: RPC_URLS,
          blockExplorerUrls: [ARCSCAN_URL],
        }],
      })
    }
  }, [switchChainAsync])

  return { isWrongNetwork, switchToArc, isSwitching: isPending }
}
```

Renderizar um banner "Trocar para Arc Testnet" no `network-banner.tsx` sempre que `isWrongNetwork`, e desabilitar swap/pools/payments enquanto estiver.

**c) Escape hatch** — botão "Resetar conexão" no diálogo da navbar:

```ts
const hardReset = () => {
  disconnect(); resetConnect()
  Object.keys(localStorage)
    .filter(k => k.startsWith("wc@2") || k.startsWith("arcdex.wagmi") || k === "walletconnect")
    .forEach(k => localStorage.removeItem(k))
  location.reload()
}
```

E incluir `isReconnecting` na condição do spinner, com o mesmo timeout de 30 s.

---

## 2. O que o post "One token, two interfaces" muda no ArcDex

### 2.1 🔴 MAX no swap ignora o gas — **falha garantida**

`app/app/swap/page.tsx:280`

```ts
const handleMaxClick = () => {
  setFromAmount(fromBalance.replace(',', ''))   // 100% do saldo
}
```

Na Arc, `balanceOf(0x3600…)` (6 casas) e `getBalance()` (18 casas) são **a mesma bolsa**. Gastar 100% via ERC-20 zera o gas → a tx reverte antes de executar.

Correção — reservar uma folga de gas quando o token de saída é USDC:

```ts
const GAS_RESERVE_USDC = 0.5 // ~folga em USDC (6 casas)

const handleMaxClick = () => {
  const bal = parseFloat(fromBalance.replace(',', '')) || 0
  const max = swapFromToken === 'USDC' ? Math.max(0, bal - GAS_RESERVE_USDC) : bal
  setFromAmount(max.toFixed(6))
}
```

Mesmo ajuste em `app/app/payments/page.tsx:304` — hoje ele só subtrai a taxa do protocolo (`feeNum`), não o gas.

### 2.2 🟠 Nenhuma checagem de gas na Arc

`hooks/useNativeBalance.ts` existe e está correto (usa `formatEther`, 18 casas ✅), mas é usado **apenas na página de bridge, para as outras chains** (`app/app/bridge/page.tsx:113-114`). Swap, pools e payments nunca perguntam se o usuário tem gas. Na Arc isso importa mais que em qualquer EVM, porque o usuário pode ter "100 USDC" na tela e mesmo assim não conseguir assinar nada.

Adicionar `useNativeBalance(CHAIN_CONFIG.id)` e bloquear o botão de ação com link para o [faucet da Circle](https://faucet.circle.com) quando `isEmpty`.

### 2.3 🟠 Risco de saldo duplicado no portfólio

O post alerta explicitamente: *"Many SDKs assume native tokens differ from ERC-20 tokens, potentially displaying duplicate USDC balances in UIs."*

Hoje o portfólio (`app/app/portfolio/page.tsx:577`) lê só o ERC-20 — está seguro. Mas se em algum momento for adicionado um card "saldo nativo / gas", ele vai somar o mesmo dinheiro duas vezes. Regra a fixar no código, com comentário:

- **ERC-20 (6 casas)** → tudo que é saldo, transferência, UI.
- **Nativo (18 casas)** → exclusivamente gas.
- Nunca somar os dois. `1e18 nativo = 1e6 ERC-20`.

### 2.4 🟡 Histórico pode duplicar por causa do EIP-7708

Arc emite um log `Transfer` de **todo** movimento nativo de USDC, vindo de um system address, em **18 casas** — separado dos logs de 6 casas do contrato ERC-20.

`components/transaction-history-card.tsx:62` usa `txlist` do ArcScan (transações, não logs) → **não é afetado hoje**. Mas qualquer migração para `eth_getLogs` / `tokentx` vai trazer as duas famílias de eventos e mostrar valores com magnitude errada. Deixar isso documentado antes de mexer.

### 2.5 ✅ Já está certo

| Item | Status |
|---|---|
| `nativeCurrency: { USDC, 18 }` (`lib/network.ts:101`) | ✅ bate com a doc |
| `TOKENS.USDC = 0x3600…0000`, `decimals: 6` | ✅ interface ERC-20 correta |
| `confirmations: 1` nos `useWaitForTransactionReceipt` | ✅ finalidade na Arc é determinística e instantânea |
| Screening de compliance (`/api/compliance`) | ✅ alinhado — na Arc transferências nativas revertem para endereços em blocklist |
| Chain ID `5042002` | ✅ confere com a doc e com o viem |

### 2.6 Itens do "EVM differences" sem impacto

`PREVRANDAO → 0`, `BLOBHASH/BLOBBASEFEE`, tx tipo-3 rejeitada, EIP-4788 vazio, EIP-4895 vazio: os contratos do ArcDex (swap AMM, LP, payments) não usam nada disso. Sem ação.

---

## 3. Outros erros encontrados na auditoria

### 3.1 🔴 Segredo em texto plano

`.env.local:42` contém uma `OPENROUTER_API_KEY` real. O arquivo **está** no `.gitignore` (bom, e confirmei que não está versionado), mas ele vive numa pasta sincronizada. **Recomendo rotacionar a chave no painel do OpenRouter** e mover a variável para os secrets da Vercel — ela é server-side, não precisa estar num arquivo local.

### 3.2 🔴 Crash se a mainnet for configurada pela metade

`lib/network.ts:211` — `requestedNetwork` vira `"mainnet"` para **qualquer** valor que não seja literalmente `"testnet"`, e o `.env.local:54` já tem `NEXT_PUBLIC_ARC_NETWORK=mainnet`.

Hoje o fallback salva (`MAINNET_CONFIGURED === false` → cai na testnet). Mas no dia 16/09, se você preencher só `CHAIN_ID` + `RPC_URL` e ainda não os endereços de token, `TOKENS.USDC/EURC/QCAD` viram todos `0x0000…0000`. Aí:

```ts
// lib/contracts.ts:79-102 — três chaves idênticas colapsam em uma
TOKEN_INFO[TOKENS.USDC] = {…}  // 0x000…0
TOKEN_INFO[TOKENS.EURC] = {…}  // 0x000…0  ← sobrescreve
TOKEN_INFO[TOKENS.QCAD] = {…}  // 0x000…0  ← sobrescreve
```

E `hooks/use-contracts.ts:14`:

```ts
const decimals = TOKEN_INFO[tokenAddress].decimals
// TypeError: Cannot read properties of undefined
```

→ tela branca. Correção mínima:

```ts
const decimals = TOKEN_INFO[tokenAddress]?.decimals ?? 6
```

E endurecer `MAINNET_CONFIGURED` para exigir também os endereços de token:

```ts
export const MAINNET_CONFIGURED =
  ARC_MAINNET.id > 0 && mainnetRpc.length > 0 &&
  ARC_MAINNET.tokens.USDC !== ZERO
```

### 3.3 🟠 `.env.local` com valores mortos e errados

```
NEXT_PUBLIC_CHAIN_ID=5042034                        ← errado (é 5042002)
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.arc.network  ← domínio diferente do lib/network.ts
NEXT_PUBLIC_FX_ESCROW=0x1f91886C…                    ← diverge de lib/network.ts:138 (0xd68256f4…)
```

Verifiquei: **nenhuma dessas três variáveis é lida por qualquer arquivo do projeto** (`grep` em `app/ components/ lib/ hooks/`). São restos da arquitetura antiga, anteriores ao `lib/network.ts`. São inofensivas hoje, mas garantem confusão na próxima vez que alguém for debugar. Apagar ou corrigir.

Já `NEXT_PUBLIC_FX_ESCROW` divergente **precisa ser reconciliado** — um dos dois endereços está desatualizado e vale conferir qual está de fato deployado.

### 3.4 🟠 Divergência de domínio nos RPCs — verificar

| Fonte | Domínio |
|---|---|
| `lib/network.ts:103-110` | `rpc.testnet.arc.io`, `rpc.blockdaemon.…`, `rpc.drpc.…`, `rpc.quicknode.…` |
| Doc oficial "Connect to Arc" | `…arc.io` (mesmo conjunto) |
| **viem 2.43.3, chain `arcTestnet`** | `rpc.testnet.arc.network`, `rpc.quicknode.testnet.arc.network`, `rpc.blockdaemon.testnet.arc.network` |
| `.env.local` | `rpc.testnet.arc.network` |

Ambos os domínios **resolvem por DNS** (testei) — a Circle parece manter os dois durante o rebrand `arc.network → arc.io`. Não consegui fazer a chamada JSON-RPC de dentro do sandbox (egress bloqueado), então **não posso afirmar qual responde**. Teste você, em 5 segundos:

```bash
for u in https://rpc.testnet.arc.io https://rpc.testnet.arc.network; do
  echo "== $u"
  curl -s -m 10 -X POST -H 'content-type: application/json' \
    -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' $u
  echo
done
```

Deve retornar `"result":"0x4cef52"` (= 5042002). Sugestão robusta: importar a chain do viem e **acrescentar** os mirrors `.io` como fallback, em vez de manter uma lista escrita à mão:

```ts
import { arcTestnet } from "viem/chains"

rpcUrls: {
  default: { http: ["https://rpc.testnet.arc.io"] },
  public: { http: [
    "https://rpc.testnet.arc.io",
    ...arcTestnet.rpcUrls.default.http,   // mirrors .network
    "https://rpc.blockdaemon.testnet.arc.io",
    "https://rpc.drpc.testnet.arc.io",
  ]},
},
```

Bônus: a definição do viem traz `multicall3` em `0xcA11bde05977b3631167028862bE2a173976CA11` — o `lib/network.ts` escrito à mão **não tem**, então o wagmi faz N chamadas RPC separadas em vez de 1 batch. Adicionar reduz bem o risco de 429.

### 3.5 🟡 Approval "ilimitada" voltou

`app/app/swap/page.tsx` (`handleApprove`):

```ts
await approve(swapFromToken, ARCDEX.Swap, '999999999')
// comentário: "Approve large amount (standard DeFi pattern)"
```

O commit `88ce6bf fix: approve exact amount instead of unlimited allowance` fez exatamente o contrário. Regressão. Aprovar `fromAmount` é mais seguro e o `useTokenAllowance` já existe para checar.

### 3.6 🟡 Casas decimais do LP token

`useLPBalance` / `useLPTotalSupply` (`hooks/use-contracts.ts:391, 406`) formatam com `formatTokenAmount(data)` — default **6 casas**. Tokens LP em contratos padrão ERC-20 costumam ter **18**. Se o `ARCDEX_LP` foi deployado com 18, os números de pool na UI estão 10¹² vezes maiores. Conferir `decimals()` do contrato `0x823f387a…` no ArcScan.

### 3.7 🟡 `lib/wagmi.ts` é código morto

Nenhum arquivo importa `lib/wagmi.ts`. Ele define uma **segunda** `arcChain`, um `APPKIT_METADATA` e um Project ID — tudo duplicado do `web3-provider.tsx`. Apagar antes que alguém edite o arquivo errado ao debugar conexão (é armadilha clássica).

### 3.8 🟡 Metadata diz "Mainnet" rodando testnet

`app/layout.tsx:16-17`:

```
title: "ARCDex — DeFi on Arc Mainnet"
description: "… Public Mainnet live September 16, 2026."
```

Com `MAINNET_PENDING === true` o app roda **testnet**, mas o título e o SEO afirmam mainnet. Tornar o título condicional a `IS_MAINNET`.

---

## Ordem sugerida

| # | Item | Sev | Onde |
|---|---|---|---|
| 1 | `chainId` no connect + guard/auto-switch de rede + reset | 🔴 | `navbar.tsx`, novo `hooks/useArcNetwork.ts` |
| 2 | MAX reservando gas (swap e payments) | 🔴 | `swap/page.tsx:280`, `payments/page.tsx:304` |
| 3 | Rotacionar `OPENROUTER_API_KEY` | 🔴 | `.env.local` |
| 4 | `TOKEN_INFO[...]?.decimals ?? 6` + `MAINNET_CONFIGURED` mais estrito | 🔴 | `use-contracts.ts:14`, `network.ts:208` |
| 5 | Confirmar RPC `.io` vs `.network` + adicionar multicall3 | 🟠 | `lib/network.ts` |
| 6 | Checagem de gas nativo antes de swap/payment | 🟠 | páginas de ação |
| 7 | Reconciliar `FX_ESCROW`, limpar `.env.local` | 🟠 | `.env.local` |
| 8 | Approval exata; decimals do LP; apagar `lib/wagmi.ts`; título condicional | 🟡 | vários |

---

## Fontes

- [EVM differences — Arc Docs](https://docs.arc.io/arc/references/evm-differences)
- [Building with USDC on Arc: one token, two interfaces](https://www.arc.io/blog/building-with-usdc-on-arc-one-token-two-interfaces)
- [Connect to Arc — Arc Docs](https://docs.arc.io/arc/references/connect-to-arc)
- [Arc Testnet — ChainList (5042002)](https://chainlist.org/chain/5042002)
- `viem@2.43.3` → `chains/definitions/arcTestnet.ts` (local)
