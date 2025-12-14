# ArcDex Portfolio Roadmap

> Documentação das fases de implementação do Portfolio com integração Web3 real na Arc Testnet.

---

## Visão Geral

Este roadmap documenta as fases de evolução da página `/app/portfolio` de dados mock para integração Web3 completa, mantendo compatibilidade com testnet e evitando dependências externas pesadas.

---

## Fase 3 — Tokens Reais (Arc Testnet)

### Escopo
Integrar saldos ERC-20 reais usando Wagmi/Viem para USDC, EURC e USYC.

### Arquivos Permitidos
| Ação | Arquivo |
|------|---------|
| ✅ Modificar | `app/app/portfolio/page.tsx` |
| ✅ Criar | `components/portfolio/*` (se necessário) |
| ❌ NÃO alterar | `lib/wagmi.ts`, `web3-provider.tsx`, outras páginas |

### Implementação
- [x] Usar `useAccount` para obter `address` e `isConnected`
- [x] Usar `useTokenBalance` para USDC, EURC, USYC
- [x] Aba **Tokens**: mostrar símbolo, nome, balance formatado, "Value: —"
- [x] Card **Total Balance**: soma numérica dos tokens (sem USD)
- [x] Gráfico: manter como mock
- [x] Loading states com spinner
- [x] Empty state para wallet desconectada
- [x] Botão Refresh para refetch manual

### Critérios de Sucesso
- ✅ Página carrega sem travamentos
- ✅ Saldos correspondem à wallet conectada na Arc Testnet
- ✅ Sem polling agressivo (apenas refetch manual)
- ✅ Build passa sem erros

---

## Fase 4 — Transactions Reais (MVP)

### Escopo
Listar últimas transações do usuário usando a API do ArcScan (Etherscan-compatible).

### Arquivos Permitidos
| Ação | Arquivo |
|------|---------|
| ✅ Modificar | `app/app/portfolio/page.tsx` |
| ❌ NÃO alterar | Página History (por enquanto) |

### Implementação
- [x] Componente `TransactionsList` com fetch da API ArcScan
- [x] Endpoint: `https://testnet.arcscan.app/api?module=account&action=txlist`
- [x] Mostrar: hash, timestamp, status (Success/Failed), tipo (Sent/Received/Contract)
- [x] Link para ArcScan em cada transação
- [x] Filtros: All / Transfers / Contract
- [x] Paginação: 10 itens por página
- [x] Loading state com spinner
- [x] Error state com fallback para link do explorer
- [x] Empty state elegante

### Critérios de Sucesso
- ✅ Transações reais aparecem quando existem
- ✅ Links funcionam e abrem no ArcScan
- ✅ Sem RPC pesado (usa API REST)
- ✅ Build passa sem erros

---

## Fase 5 — Net Worth + Price (Testnet-Friendly)

### Escopo
Adicionar preços mock e calcular patrimônio líquido estimado.

### Arquivos Permitidos
| Ação | Arquivo |
|------|---------|
| ✅ Modificar | `app/app/portfolio/page.tsx` |

### Implementação
- [x] Preços mock fixos:
  - USDC: $1.00
  - EURC: $1.00
  - USYC: $1.02
- [x] Label "testnet estimate" no card Net Worth
- [x] Card Net Worth: valor total em USD formatado
- [x] 24h change: mostrar "—" (sem histórico de preços)
- [x] Cards de tokens: mostrar valor USD estimado
- [x] Aba Tokens: coluna Price e coluna Value
- [x] Função `formatUSD()` para formatação consistente
- [x] Função `getTokenPrice()` para lookup de preços

### Critérios de Sucesso
- ✅ Net Worth calculado corretamente (balance × price)
- ✅ Sem APIs externas de preços (evita travamentos)
- ✅ UI clara que são valores estimados
- ✅ Build passa sem erros

---

## Fase 6 — Portfolio Chart com Snapshots Locais

### Escopo
Substituir gráfico mock por evolução real do patrimônio usando localStorage.

### Arquivos Permitidos
| Ação | Arquivo |
|------|---------|
| ✅ Modificar | `app/app/portfolio/page.tsx` |

### Implementação
- [x] Interface `NetWorthSnapshot { timestamp, value }`
- [x] Key localStorage: `arcdex_portfolio_snapshots`
- [x] Funções utilitárias:
  - `loadSnapshots()` - carrega do localStorage
  - `saveSnapshot()` - salva novo ponto
  - `clearSnapshots()` - limpa histórico
  - `filterSnapshotsByPeriod()` - filtra por 24H/7D/30D
  - `snapshotsToChartData()` - converte para formato do gráfico
- [x] Deduplicação: mínimo 5 minutos entre snapshots com mesmo valor
- [x] Limite: máximo 200 snapshots (FIFO)
- [x] Auto-save: salva quando net worth muda (e > 0)
- [x] Botão Reset History
- [x] Contador de snapshots no header do gráfico
- [x] Empty state quando não há dados
- [x] Amostragem: máximo 10 pontos para legibilidade

### Labels do Gráfico por Período
| Período | Formato |
|---------|---------|
| 24H | HH:MM (hora) |
| 7D | Mon, Tue... (dia da semana) |
| 30D | Dec 14 (mês + dia) |

### Critérios de Sucesso
- ✅ Gráfico popula com dados reais ao longo do tempo
- ✅ Dados persistem entre sessões (localStorage)
- ✅ Reset funciona corretamente
- ✅ Sem backend, sem indexador, sem API externa
- ✅ Build passa sem erros

---

## Resumo de Dependências

```
Fase 3 (Tokens)      → Wagmi useAccount, useTokenBalance
Fase 4 (Transactions) → ArcScan REST API
Fase 5 (Prices)      → Mock prices (sem API)
Fase 6 (Chart)       → localStorage (sem backend)
```

---

## Próximas Fases (Futuro)

### Fase 7 — Staking & LP Positions
- Mostrar posições de staking ativas
- Mostrar LP tokens e pools participadas
- Rewards pendentes

### Fase 8 — Price Feeds Reais
- Integrar oracle ou API de preços (CoinGecko, etc)
- Calcular histórico de preços
- 24h change real

### Fase 9 — NFT Support
- Aba NFTs funcional
- Listar NFTs da wallet
- Metadata e imagens

---

*Última atualização: 2024-12-14*
