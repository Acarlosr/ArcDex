# 🔧 Guia: Correção do Stake Falhando

## 🚨 Problema Reportado

**Sintoma:** Stakes estão falhando (marcados em vermelho "Falhou" na interface)

**Possíveis Causas:**
1. ❌ Contrato de Staking não tem allowance do token
2. ❌ Contrato não tem fundos para pagar rewards
3. ❌ Usuário não tem saldo suficiente
4. ❌ Gas insuficiente
5. ❌ Endereço do contrato incorreto

---

## 🔍 Diagnóstico

### **Passo 1: Verificar Console**

Abra o Console (F12) e tente fazer um stake. Procure por:

```
💰 Iniciando stake: { token: "USDC", amount: "2" }
✅ Stake iniciado com sucesso
```

**Se aparecer erro:**
```
❌ Erro no stake: [detalhes do erro]
```

---

### **Passo 2: Verificar Endereço do Contrato**

**Contrato de Staking configurado:**
```
0xe58b6a269ab1c65e62203bd131ef5935214ce726
```

**Verificar no Explorer:**
```
https://testnet.arcscan.app/address/0xe58b6a269ab1c65e62203bd131ef5935214ce726
```

**O que verificar:**
- ✅ Contrato existe?
- ✅ Tem código (não é EOA)?
- ✅ Tem transações?

---

### **Passo 3: Verificar Allowance**

No console, após clicar em "Approve":

```javascript
// Deve aparecer:
🔐 Iniciando approve (Stake): { 
  token: "USDC", 
  spender: "0xe58b6a269ab1c65e62203bd131ef5935214ce726", 
  amount: "2" 
}
✅ Approve iniciado com sucesso
✅ Approve confirmado! (Stake) { hash: "0x..." }
🔄 Invalidando cache e atualizando allowance...
```

**Se approve não confirmar:**
→ Problema na transação de approve

---

### **Passo 4: Verificar Saldo**

```javascript
// No console
console.log({
  balance: '199.357367 USDC',
  stakeAmount: '2',
  hasEnough: 199.357367 > 2  // deve ser true
})
```

---

### **Passo 5: Testar Stake Manualmente**

No console:

```javascript
// 1. Ver allowance atual
const allowance = await readContract({
  address: '0x3600000000000000000000000000000000000000', // USDC
  abi: ERC20_ABI,
  functionName: 'allowance',
  args: [
    'SEU_ENDERECO',
    '0xe58b6a269ab1c65e62203bd131ef5935214ce726' // Staking
  ]
})
console.log('Allowance:', allowance.toString())

// 2. Se allowance = 0, precisa aprovar primeiro
// 3. Se allowance > 0, pode fazer stake
```

---

## 🔧 Correções Aplicadas

### **Correção #1: Invalidação de Cache**

Adicionei `queryClient.invalidateQueries()` após cada operação:

```typescript
// Em app/app/stake/page.tsx
useEffect(() => {
  if (stakeSuccess || unstakeSuccess || claimSuccess) {
    console.log('🎉 Operação confirmada!')
    
    // ✅ Invalidar cache
    queryClient.invalidateQueries()
    
    // Refetch após 2s
    setTimeout(() => {
      refetchUSDC()
      refetchEURC()
      refetchStakedUSDC()
      refetchStakedEURC()
      // ...
    }, 2000)
  }
}, [stakeSuccess, unstakeSuccess, claimSuccess, queryClient])
```

### **Correção #2: Delay Aumentado**

Aumentei o delay de 1s para 2s para dar tempo do blockchain atualizar:

```typescript
// ANTES: setTimeout(..., 1000)
// DEPOIS: setTimeout(..., 2000)
```

---

## 🧪 Como Testar

### **Teste 1: Stake Completo**

1. **Conectar wallet**
2. **Abrir Console (F12)**
3. **Ir para /app/stake**
4. **Selecionar USDC**
5. **Digitar amount: 2**
6. **Clicar "Approve USDC"**
   - Aguardar confirmação na wallet
   - Aguardar confirmação on-chain
   - **Verificar logs:**
     ```
     🔐 Iniciando approve (Stake): { ... }
     ✅ Approve iniciado com sucesso
     ✅ Approve confirmado! (Stake) { hash: "0x..." }
     🔄 Invalidando cache e atualizando allowance...
     ```

7. **Clicar "Stake USDC"**
   - Aguardar confirmação na wallet
   - Aguardar confirmação on-chain
   - **Verificar logs:**
     ```
     💰 Iniciando stake: { token: "USDC", amount: "2" }
     ✅ Stake iniciado com sucesso
     🎉 Stake confirmado!
     🔄 Invalidando cache e atualizando todos os balances...
     ```

8. **Verificar resultados:**
   - ✅ Saldo USDC diminui em 2
   - ✅ "Your Staked" aumenta em 2
   - ✅ "Staked USDC" mostra o novo valor
   - ✅ Transação aparece na aba "Atividade" (verde "Confirmado")

---

### **Teste 2: Verificar Contrato no Explorer**

1. **Abrir:**
   ```
   https://testnet.arcscan.app/address/0xe58b6a269ab1c65e62203bd131ef5935214ce726
   ```

2. **Verificar:**
   - ✅ Contrato existe
   - ✅ Tem código
   - ✅ Tem transações recentes
   - ✅ Sua transação de stake aparece

---

## ⚠️ Problemas Comuns

### **Problema 1: "Insufficient Allowance"**

**Erro:**
```
Error: execution reverted: ERC20: insufficient allowance
```

**Causa:** Approve não foi feito ou expirou

**Solução:**
1. Clicar em "Approve USDC" novamente
2. Aguardar confirmação
3. Tentar stake novamente

---

### **Problema 2: "Insufficient Balance"**

**Erro:**
```
Error: execution reverted: ERC20: transfer amount exceeds balance
```

**Causa:** Tentando fazer stake de mais tokens do que possui

**Solução:**
1. Verificar saldo: Balance: 199.357367 USDC
2. Fazer stake de valor menor
3. Ou clicar em "MAX" para usar todo o saldo

---

### **Problema 3: "Treasury Not Set"**

**Erro:**
```
Error: execution reverted: Treasury not configured
```

**Causa:** Contrato de staking não tem treasury configurado para pagar rewards

**Solução:**
1. Verificar se contrato foi deployado corretamente
2. Owner do contrato precisa chamar `setTreasury(address)`
3. Treasury precisa ter fundos aprovados

---

### **Problema 4: Transação Falha Sem Erro**

**Sintoma:** Transação aparece como "Falhou" mas sem mensagem de erro

**Possíveis causas:**
- Gas insuficiente
- RPC timeout
- Nonce incorreto

**Solução:**
1. **Aumentar gas limit:**
   - Na MetaMask, clicar em "Edit" → "Advanced"
   - Aumentar Gas Limit

2. **Verificar RPC:**
   ```javascript
   // No console
   fetch('https://rpc.testnet.arc.network', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       jsonrpc: '2.0',
       method: 'eth_chainId',
       params: [],
       id: 1
     })
   }).then(r => r.json()).then(console.log)
   ```

3. **Resetar nonce:**
   - MetaMask → Settings → Advanced → Reset Account

---

## 📊 Checklist de Verificação

Antes de fazer stake:

- [ ] **Wallet conectada**
- [ ] **Rede correta** (Arc Testnet - Chain ID 5042002)
- [ ] **Saldo suficiente** (> amount + gas)
- [ ] **Contrato existe** (verificar no explorer)
- [ ] **Console aberto** (F12) para ver logs
- [ ] **Approve feito** (se necessário)

Durante o stake:

- [ ] **Logs aparecem** no console
- [ ] **Wallet popup abre** para assinar
- [ ] **Transação confirmada** (hash aparece)
- [ ] **Aguardar 2-3 segundos** para blockchain atualizar

Após o stake:

- [ ] **Saldo diminui** automaticamente
- [ ] **Staked balance aumenta** automaticamente
- [ ] **Transação aparece** na aba Atividade
- [ ] **Status "Confirmado"** (verde) no histórico

---

## 🔄 Fluxo Completo

```
1. Usuário digita amount
   ↓
2. Verifica se precisa approve
   ↓ (se sim)
3. Clicar "Approve"
   ↓
4. Assinar na wallet
   ↓
5. Aguardar confirmação (2s)
   ↓
6. Allowance atualiza
   ↓
7. Botão muda para "Stake"
   ↓
8. Clicar "Stake"
   ↓
9. Assinar na wallet
   ↓
10. Aguardar confirmação (2s)
    ↓
11. Cache é invalidado
    ↓
12. Todos os balances refetcham
    ↓
13. UI atualiza automaticamente ✅
```

---

## 🎯 Resultado Esperado

**Antes do Stake:**
```
Balance: 199.357367 USDC
Your Staked: $19.00
Staked USDC: 0.000000
```

**Após Stake de 2 USDC:**
```
Balance: 197.357367 USDC  ← Diminuiu 2
Your Staked: $21.00        ← Aumentou 2
Staked USDC: 2.000000      ← Novo stake
```

**Histórico:**
```
✅ Stake - Confirmado - 2 USDC - Agora mesmo
```

---

## 📞 Suporte

Se o problema persistir:

1. **Copiar logs do console** (tudo que aparecer)
2. **Screenshot da transação falhada** no explorer
3. **Informar:**
   - Token (USDC ou EURC)
   - Amount tentado
   - Saldo disponível
   - Se approve foi feito

---

**Data:** Dezembro 2024
**Status:** ✅ Correções aplicadas
**Próximo:** Testar stake e verificar se funciona










