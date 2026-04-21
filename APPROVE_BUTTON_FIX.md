# 🔧 Correção: Botão Approve Aparece e Desaparece

## 🚨 Problema Reportado

**Sintoma:** Botão "Approve" aparece e desaparece muito rápido, não dando tempo de clicar

**Causa Raiz:** 
1. `allowance` estava sendo refetchado constantemente
2. Estado `needsApproval` recalculava toda vez que `allowance` mudava
3. Race conditions entre queries causavam oscilação do botão

---

## ✅ Correções Aplicadas

### **Correção #1: Estabilizar `needsApproval` com useMemo**

**Antes:**
```typescript
const needsApproval = stakeAmount && allowance !== undefined &&
  parseTokenAmount(stakeAmount) > allowance
```

**Problema:** Recalculava a cada render

**Depois:**
```typescript
const needsApproval = React.useMemo(() => {
  if (!stakeAmount) return false
  if (allowance === undefined || allowanceLoading) return false
  
  const amountBigInt = parseTokenAmount(stakeAmount)
  const needs = amountBigInt > allowance
  
  console.log('🔍 Verificando needsApproval:', {
    stakeAmount,
    allowance: allowance.toString(),
    needsApproval: needs
  })
  
  return needs
}, [stakeAmount, allowance, allowanceLoading])
```

**Benefícios:**
- ✅ Só recalcula quando dependências mudam
- ✅ Logs para debug
- ✅ Verifica se está carregando antes
- ✅ Mais estável

---

### **Correção #2: Adicionar Estados de Loading**

**Antes:**
```typescript
const { approve, isPending: approving, isSuccess: approveSuccess } = useApprove()
```

**Depois:**
```typescript
const { approve, isPending: approving, isConfirming: approvingConfirm, isSuccess: approveSuccess } = useApprove()
```

**Botão Approve Melhorado:**
```typescript
disabled={approving || approvingConfirm || !stakeAmount}

{approving ? (
  <><Loader2 /> Awaiting wallet signature...</>
) : approvingConfirm ? (
  <><Loader2 /> Confirming approval...</>
) : (
  `Approve ${selectedToken}`
)}
```

**Benefícios:**
- ✅ Mostra estado correto (wallet vs blockchain)
- ✅ Botão desabilitado durante todo o processo
- ✅ Feedback visual claro

---

### **Correção #3: Aumentar Delay Após Approve**

**Antes:**
```typescript
setTimeout(() => {
  refetchAllowance()
}, 2000) // 2 segundos
```

**Depois:**
```typescript
setTimeout(() => {
  console.log('⏳ Aguardando 3 segundos para blockchain atualizar...')
  queryClient.invalidateQueries()
  refetchAllowance()
}, 3000) // 3 segundos
```

**Benefícios:**
- ✅ Mais tempo para blockchain propagar
- ✅ Menos chance de ler estado antigo
- ✅ Logs informativos

---

### **Correção #4: Logs de Debug**

Adicionados logs em pontos críticos:

```typescript
// Ao verificar needsApproval
console.log('🔍 Verificando needsApproval:', { ... })

// Ao mudar token
console.log('🔄 Token mudou para:', selectedToken)

// Após approve confirmar
console.log('✅ Approve confirmado! (Stake)')
console.log('⏳ Aguardando 3 segundos...')
```

**Benefícios:**
- ✅ Fácil debug
- ✅ Ver exatamente o que está acontecendo
- ✅ Identificar race conditions

---

## 🧪 Como Testar Agora

### **Teste 1: Verificar Botão Approve Estável**

1. **Ir para `/app/stake`**
2. **Abrir Console (F12)**
3. **Selecionar USDC**
4. **Digitar amount: 2**
5. **Observar:**
   ```
   🔍 Verificando needsApproval: {
     stakeAmount: "2",
     allowance: "0",
     needsApproval: true
   }
   ```
6. **Botão deve mostrar: "Approve USDC"**
7. **Botão NÃO deve desaparecer** ✅

---

### **Teste 2: Processo Completo de Approve**

1. **Clicar "Approve USDC"**
2. **Observar mudanças no botão:**
   ```
   Estado 1: "Approve USDC"
   ↓ (clicar)
   Estado 2: "Awaiting wallet signature..." (com spinner)
   ↓ (aprovar na wallet)
   Estado 3: "Confirming approval..." (com spinner)
   ↓ (aguardar 3s)
   Estado 4: "Stake USDC"
   ```

3. **Logs esperados:**
   ```
   🔐 Iniciando approve (Stake): { ... }
   ✅ Approve iniciado com sucesso
   ✅ Approve confirmado! (Stake) { hash: "0x..." }
   ⏳ Aguardando 3 segundos para blockchain atualizar...
   🔄 Invalidando cache e atualizando allowance...
   🔍 Verificando needsApproval: {
     stakeAmount: "2",
     allowance: "2000000", // Agora tem allowance!
     needsApproval: false
   }
   ```

---

### **Teste 3: Verificar Se Botão Não Fica Piscando**

1. **Digitar amount: 2**
2. **Aguardar 5 segundos SEM fazer nada**
3. **Botão deve permanecer "Approve USDC"** (não piscar)
4. **Verificar logs:**
   ```
   🔍 Verificando needsApproval: { ... }
   // Deve aparecer POUCAS vezes, não constantemente
   ```

---

## 📊 Comparação Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Botão pisca?** | ❌ Sim, constantemente | ✅ Não, estável |
| **Dá tempo de clicar?** | ❌ Não | ✅ Sim |
| **Feedback visual** | ⚠️ Básico | ✅ Completo (2 estados) |
| **Logs de debug** | ❌ Poucos | ✅ Detalhados |
| **Delay após approve** | ⚠️ 2s | ✅ 3s |

---

## 🔍 Debug: Se Botão Ainda Piscar

Se o botão ainda piscar, verificar no console:

```javascript
// Procurar por este log:
🔍 Verificando needsApproval: { ... }

// Se aparecer MUITAS vezes seguidas:
// → allowance está mudando constantemente
// → Verificar se há algum refetch loop

// Quantas vezes aparece em 5 segundos?
// Esperado: 1-2 vezes
// Problema: 10+ vezes
```

---

## ⚠️ Possíveis Problemas Remanescentes

### **Problema 1: QueryClient Refetch Automático**

Se `refetchOnWindowFocus: true` estiver muito agressivo:

**Solução:**
```typescript
// Em components/web3-provider.tsx
staleTime: 30 * 1000, // Aumentar para 30s
```

---

### **Problema 2: useTokenAllowance Refetch Loop**

Se o hook está refetchando sozinho:

**Verificar:**
```typescript
// Em hooks/use-contracts.ts - linha ~34
query: {
  enabled: !!address && !!spender,
  // NÃO deve ter refetchInterval ou refetchOnMount: true
}
```

---

### **Problema 3: React Strict Mode**

Em desenvolvimento, React Strict Mode renderiza 2x:

**Normal:** Logs aparecem duplicados
**Solução:** Ignorar (só acontece em dev)

---

## 🎯 Fluxo Esperado Agora

```
1. Usuário digita amount
   ↓
2. needsApproval é calculado (1x com useMemo)
   ↓
3. Botão mostra "Approve USDC"
   ↓
4. Botão PERMANECE estável (não pisca) ✅
   ↓
5. Usuário clica "Approve USDC"
   ↓
6. Botão muda: "Awaiting wallet signature..."
   ↓
7. Usuário aprova na wallet
   ↓
8. Botão muda: "Confirming approval..."
   ↓
9. Aguarda 3 segundos
   ↓
10. Refetch allowance
    ↓
11. needsApproval = false
    ↓
12. Botão muda: "Stake USDC" ✅
```

---

## 📁 Arquivo Modificado

```
✏️ app/app/stake/page.tsx
   - useMemo para needsApproval
   - Logs de debug
   - isConfirming states
   - Delay aumentado para 3s
   - Feedback visual melhorado
```

---

## ✅ Resultado Esperado

Após estas correções:

✅ **Botão "Approve" permanece estável**
✅ **Usuário tem tempo de clicar**
✅ **Feedback visual claro em cada etapa**
✅ **Logs detalhados para debug**
✅ **Transição suave Approve → Stake**

---

**Teste agora e me avise se o botão está estável! 🚀**

Se ainda piscar, envie os logs do console que eu ajusto mais!

---

**Data:** Dezembro 2024
**Status:** ✅ Correção aplicada
**Próximo:** Testar e verificar se botão é estável










