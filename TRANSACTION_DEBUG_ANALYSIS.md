# 🔍 Análise: Transações Não Atualizam Saldos

## 🚨 Problema Reportado

**Sintomas:**
- ✅ Transações são executadas (swap, stake, pools)
- ❌ Histórico não aparece
- ❌ Saldos não atualizam após transação
- ❌ Problema ocorreu após mudanças recentes

---

## 🔎 Análise do Código

### ✅ **O que está CORRETO**

#### 1. **Hooks de Refetch Existem**
```typescript
// Em app/app/swap/page.tsx (linhas 238-254)
useEffect(() => {
  if (swapSuccess && swapHash) {
    console.log('🎉 Swap confirmado!', { hash: swapHash })
    const timer = setTimeout(() => {
      console.log('🔄 Atualizando balances...')
      refetchUSDC()
      refetchEURC()
      refetchAllowance()
      setFromAmount("")
      setRefreshKey((k) => k + 1)
    }, 1000)
    return () => clearTimeout(timer)
  }
}, [swapSuccess, swapHash, refetchUSDC, refetchEURC, refetchAllowance])
```

✅ **Lógica correta**: Refetch após sucesso com delay de 1s

---

#### 2. **Histórico Busca Transações**
```typescript
// Em app/app/swap/page.tsx (linhas 57-89)
const fetchSwaps = useCallback(async () => {
  const response = await fetch(
    `${ARCSCAN_API}?module=account&action=txlist&address=${address}&sort=desc`
  )
  // Filtra transações para o contrato Swap
  const swapTxs = data.result.filter((tx) =>
    tx.to?.toLowerCase() === ARCDEX.Swap.toLowerCase()
  )
}, [address])
```

✅ **Lógica correta**: Busca no ArcScan API

---

### ❌ **PROBLEMAS IDENTIFICADOS**

#### **Problema #1: QueryClient com `refetchOnWindowFocus: false`**

**Localização:** `components/web3-provider.tsx` (linhas 84-92)

```typescript
const [queryClient] = useState(() => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false, // ❌ PROBLEMA!
      retry: 2,
    },
  },
}))
```

**Impacto:**
- ❌ Queries não refetcham automaticamente
- ❌ `refetch()` pode não funcionar como esperado
- ❌ Cache pode estar travado

---

#### **Problema #2: Singleton Config Pode Causar Stale State**

**Localização:** `components/web3-provider.tsx` (linhas 73-80)

```typescript
let wagmiConfig: ReturnType<typeof createWagmiConfig> | null = null

export function getWagmiConfig() {
  if (!wagmiConfig) {
    wagmiConfig = createWagmiConfig()
  }
  return wagmiConfig
}
```

**Impacto:**
- ⚠️ Config é criado uma vez e reutilizado
- ⚠️ Se houver mudança na rede, não reconecta
- ⚠️ Pode causar cache stale

---

#### **Problema #3: RPC Timeout Muito Alto**

**Localização:** `components/web3-provider.tsx` (linhas 63-67)

```typescript
transports: {
  [arcTestnet.id]: http(CHAIN_CONFIG.rpcUrls.default.http[0], {
    timeout: 30000, // 30 segundos!
    retryCount: 3,
    retryDelay: 1000,
  }),
},
```

**Impacto:**
- ⚠️ Timeout muito alto pode travar a UI
- ⚠️ Se RPC estiver lento, queries demoram muito
- ⚠️ Usuário pode achar que não funcionou

---

#### **Problema #4: Histórico Depende de API Externa**

**Localização:** `app/app/swap/page.tsx` (linha 65)

```typescript
const response = await fetch(
  `${ARCSCAN_API}?module=account&action=txlist&address=${address}`,
  { signal: AbortSignal.timeout(10000) }
)
```

**Impacto:**
- ❌ Se ArcScan API estiver offline, histórico não aparece
- ❌ Transação pode ter sucesso mas não aparecer
- ❌ Delay entre tx confirmada e aparecer na API

---

## 🔧 SOLUÇÕES

### **Solução #1: Corrigir QueryClient** ⭐ PRIORITÁRIO

**Problema:** `refetchOnWindowFocus: false` impede refetch

**Solução:**
```typescript
// Em components/web3-provider.tsx
const [queryClient] = useState(() => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000, // Reduzir para 5s
      refetchOnWindowFocus: true, // ✅ HABILITAR
      refetchOnReconnect: true, // ✅ ADICIONAR
      retry: 2,
    },
  },
}))
```

---

### **Solução #2: Forçar Invalidação de Queries** ⭐ PRIORITÁRIO

**Problema:** Refetch pode não limpar cache

**Solução:**
```typescript
// Em app/app/swap/page.tsx
import { useQueryClient } from '@tanstack/react-query'

export default function SwapPage() {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    if (swapSuccess && swapHash) {
      const timer = setTimeout(() => {
        // ✅ Invalidar todas as queries
        queryClient.invalidateQueries()
        
        // ✅ Ou invalidar específicas
        queryClient.invalidateQueries({ queryKey: ['balance'] })
        queryClient.invalidateQueries({ queryKey: ['allowance'] })
        
        refetchUSDC()
        refetchEURC()
        refetchAllowance()
      }, 2000) // Aumentar delay para 2s
      return () => clearTimeout(timer)
    }
  }, [swapSuccess, swapHash, queryClient])
}
```

---

### **Solução #3: Reduzir RPC Timeout**

**Problema:** 30s é muito tempo

**Solução:**
```typescript
// Em components/web3-provider.tsx
transports: {
  [arcTestnet.id]: http(CHAIN_CONFIG.rpcUrls.default.http[0], {
    timeout: 10000, // ✅ Voltar para 10s
    retryCount: 2, // ✅ Reduzir retries
    retryDelay: 500, // ✅ Delay menor
  }),
},
```

---

### **Solução #4: Adicionar Polling para Histórico**

**Problema:** Histórico depende de API externa com delay

**Solução:**
```typescript
// Em app/app/swap/page.tsx
useEffect(() => {
  if (swapSuccess && swapHash) {
    // Refetch imediato
    fetchSwaps()
    
    // Poll a cada 3s por 30s
    let attempts = 0
    const maxAttempts = 10
    
    const interval = setInterval(() => {
      attempts++
      fetchSwaps()
      
      if (attempts >= maxAttempts) {
        clearInterval(interval)
      }
    }, 3000)
    
    return () => clearInterval(interval)
  }
}, [swapSuccess, swapHash, fetchSwaps])
```

---

### **Solução #5: Remover Singleton Config**

**Problema:** Config singleton pode causar stale state

**Solução:**
```typescript
// Em components/web3-provider.tsx
// ❌ REMOVER:
let wagmiConfig: ReturnType<typeof createWagmiConfig> | null = null

export function getWagmiConfig() {
  if (!wagmiConfig) {
    wagmiConfig = createWagmiConfig()
  }
  return wagmiConfig
}

// ✅ USAR DIRETAMENTE:
export function Web3Provider({ children }: { children: ReactNode }) {
  const [config] = useState(() => createWagmiConfig())
  
  return (
    <WagmiProvider config={config}>
      {/* ... */}
    </WagmiProvider>
  )
}
```

---

## 🧪 Como Testar

### **Teste 1: Verificar Logs**

1. Abrir Console (F12)
2. Fazer um swap
3. **Logs esperados:**
```
🔄 Iniciando swap: { ... }
✅ Swap iniciado com sucesso
🎉 Swap confirmado! { hash: "0x..." }
🔄 Atualizando balances...
```

4. **Se não aparecer "🔄 Atualizando balances...":**
   → useEffect não está disparando
   → Verificar se `swapSuccess` está true

---

### **Teste 2: Verificar Refetch Manual**

No console, após transação:

```javascript
// Ver estado do QueryClient
window.__REACT_QUERY_DEVTOOLS__ = true

// Forçar refetch
queryClient.invalidateQueries()
```

---

### **Teste 3: Verificar API do ArcScan**

```bash
curl "https://testnet.arcscan.app/api?module=account&action=txlist&address=SEU_ENDERECO&sort=desc"
```

**Se retornar erro:**
→ API está offline
→ Histórico não vai funcionar

---

## 📊 Checklist de Diagnóstico

Execute na ordem:

- [ ] **Console mostra logs de transação?**
  - Se NÃO → Problema na execução da transação
  - Se SIM → Continuar

- [ ] **Console mostra "🎉 Swap confirmado!"?**
  - Se NÃO → `swapSuccess` não está true
  - Se SIM → Continuar

- [ ] **Console mostra "🔄 Atualizando balances..."?**
  - Se NÃO → useEffect não dispara (PROBLEMA AQUI!)
  - Se SIM → Continuar

- [ ] **Saldo atualiza após alguns segundos?**
  - Se NÃO → Refetch não funciona (QueryClient issue)
  - Se SIM → Problema é só no histórico

- [ ] **Histórico aparece após 10-30 segundos?**
  - Se NÃO → API do ArcScan está offline
  - Se SIM → Tudo OK, só delay da API

---

## 🎯 Solução Rápida (Quick Fix)

Se você quer uma solução imediata:

```typescript
// Em app/app/swap/page.tsx
useEffect(() => {
  if (swapSuccess && swapHash) {
    console.log('🎉 Swap confirmado!', { hash: swapHash })
    
    // ✅ SOLUÇÃO RÁPIDA: Recarregar a página
    const timer = setTimeout(() => {
      window.location.reload()
    }, 2000)
    
    return () => clearTimeout(timer)
  }
}, [swapSuccess, swapHash])
```

**Pros:**
- ✅ Funciona 100%
- ✅ Garante que tudo atualiza

**Cons:**
- ❌ UX ruim (página pisca)
- ❌ Perde estado do formulário
- ❌ Não é elegante

---

## 📝 Resumo

**Causa Raiz Provável:**
1. `refetchOnWindowFocus: false` no QueryClient
2. Cache do TanStack Query não está sendo invalidado
3. Delay entre tx confirmada e API do ArcScan indexar

**Solução Recomendada:**
1. Habilitar `refetchOnWindowFocus: true`
2. Usar `queryClient.invalidateQueries()` após transação
3. Adicionar polling para histórico
4. Reduzir timeout do RPC

**Próximo Passo:**
Aplicar as correções na ordem de prioridade (⭐)

---

**Data:** Dezembro 2024
**Status:** 🔍 Análise completa, aguardando correção










