# 🔧 Wallet Connection Troubleshooting Guide

## 🚨 Problema: Botão "Connecting..." fica rodando infinitamente

### 📋 Checklist de Diagnóstico

Execute os seguintes passos para diagnosticar o problema:

#### 1. **Abrir o Console do Navegador**

1. Pressione `F12` ou `Ctrl+Shift+I` (Windows/Linux) ou `Cmd+Option+I` (Mac)
2. Vá para a aba **Console**
3. Clique em "Connect Wallet"
4. Observe os logs

---

### 🔍 Logs Esperados

#### ✅ **Conexão Bem-Sucedida**

Você deve ver algo assim:

```
🔧 Creating Wagmi config...
📡 RPC URL: https://rpc.testnet.arc.network
🔗 Chain ID: 5042002
🔑 WalletConnect Project ID: ✓ Set
🌐 Adding WalletConnect connector (client-side)
🚀 Web3Provider mounted
✅ RPC Connection test: { jsonrpc: "2.0", id: 1, result: "0x4cbbd2" }
🔗 Chain ID from RPC: 5042002
📱 Device detection: { isMobile: false, hasInjectedProvider: true, userAgent: "..." }
✓ Ethereum provider detected: Proxy { ... }
🔌 Available connectors: [
  { id: "injected", name: "MetaMask", type: "injected" },
  { id: "walletConnect", name: "WalletConnect", type: "walletConnect" }
]
🦊 Browser wallet button clicked
✓ Injected connector found: MetaMask
🔄 Attempting to connect...
✅ Connection successful!
```

---

### ❌ Problemas Comuns e Soluções

#### **Problema 1: RPC Connection Failed**

**Log:**
```
❌ RPC Connection failed: TypeError: Failed to fetch
```

**Causa:** O RPC endpoint não está acessível

**Solução:**
1. Verificar se você tem conexão com a internet
2. Tentar acessar diretamente: https://rpc.testnet.arc.network
3. Verificar se não há firewall/proxy bloqueando
4. Tentar outro RPC:
   - `https://arc-testnet.rpc.caldera.xyz/http`
   - Entre em contato com Arc Network para RPC alternativo

**Como corrigir no código:**
```typescript
// Em lib/contracts.ts, linha 15
rpcUrls: {
  default: { http: ["https://arc-testnet.rpc.caldera.xyz/http"] },
  public: { http: ["https://arc-testnet.rpc.caldera.xyz/http"] },
},
```

---

#### **Problema 2: Chain ID Mismatch**

**Log:**
```
⚠️ Chain ID mismatch! { expected: 5042002, got: 12345 }
```

**Causa:** O Chain ID configurado não corresponde ao retornado pelo RPC

**Solução:**
1. Confirmar o Chain ID correto na [documentação da Arc Network](https://docs.arc.network)
2. Atualizar em `lib/contracts.ts`:

```typescript
export const CHAIN_CONFIG = {
  id: 5042002, // ← Verificar este valor
  name: "Arc Testnet",
  // ...
}
```

---

#### **Problema 3: WalletConnect Project ID Missing**

**Log:**
```
🔑 WalletConnect Project ID: ✗ Missing
```

**Causa:** Variável de ambiente não configurada

**Solução:**

1. **Obter Project ID:**
   - Acesse: https://cloud.walletconnect.com/
   - Crie uma conta (grátis)
   - Crie um novo projeto
   - Copie o Project ID

2. **Criar arquivo `.env.local`** na raiz do projeto:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=seu_project_id_aqui
   NEXT_PUBLIC_REOWN_PROJECT_ID=seu_project_id_aqui
   ```

3. **Reiniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

---

#### **Problema 4: No Injected Provider (MetaMask)**

**Log:**
```
📱 Device detection: { hasInjectedProvider: false }
⚠️ No injected provider detected
```

**Causa:** MetaMask não está instalado ou não foi detectado

**Solução:**

**Desktop:**
1. Instalar MetaMask: https://metamask.io/download/
2. Criar uma wallet ou importar
3. Atualizar a página (F5)

**Mobile:**
1. Instalar MetaMask app
2. Abrir o dApp dentro do **MetaMask Browser**:
   - Abrir MetaMask app
   - Menu → Browser
   - Digite: `localhost:3000` (dev) ou `www.arc-dex.xyz` (prod)

---

#### **Problema 5: WalletConnect Connector Not Found**

**Log:**
```
❌ WalletConnect connector not found!
Available connectors: [{ id: "injected", name: "MetaMask" }]
```

**Causa:** WalletConnect não foi inicializado (pode ser SSR issue)

**Solução:**

1. **Verificar se está em client-side:**
   - O WalletConnect só é adicionado no browser (`typeof window !== 'undefined'`)

2. **Aguardar o componente montar:**
   - O `Web3Provider` tem um delay para evitar hydration mismatch
   - Espere alguns segundos após a página carregar

3. **Forçar reload:**
   - Pressione `Ctrl+Shift+R` (hard reload)

---

#### **Problema 6: Connection Timeout**

**Log:**
```
🔄 Attempting to connect...
(nada acontece por 30+ segundos)
```

**Causa:** Timeout na conexão RPC ou WalletConnect

**Solução:**

1. **Aumentar timeout:**
   Em `components/web3-provider.tsx`:
   ```typescript
   transports: {
     [arcTestnet.id]: http(CHAIN_CONFIG.rpcUrls.default.http[0], {
       timeout: 60000, // Aumentar para 60s
       retryCount: 5,
       retryDelay: 2000,
     }),
   },
   ```

2. **Verificar se o RPC está online:**
   ```bash
   curl -X POST https://rpc.testnet.arc.network \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
   ```

   Resposta esperada:
   ```json
   {"jsonrpc":"2.0","id":1,"result":"0x4cbbd2"}
   ```

---

### 🧪 Modo Debug Avançado

Para ativar logs ainda mais detalhados:

1. **Abrir o Console**
2. **Executar:**
   ```javascript
   localStorage.setItem('debug', 'wagmi*')
   ```
3. **Recarregar a página**
4. **Conectar a wallet**

Você verá logs extremamente detalhados de cada passo da conexão.

Para desativar:
```javascript
localStorage.removeItem('debug')
```

---

### 📞 Suporte

Se nenhuma solução funcionou:

1. **Coletar informações:**
   - Screenshot do console
   - URL do site (localhost ou produção)
   - Browser e versão
   - Sistema operacional
   - Todos os logs do console

2. **Reportar issue:**
   - GitHub: https://github.com/Acarlosr/ArcDex/issues
   - Incluir todas as informações coletadas

---

### 🔄 Script de Reset Completo

Se tudo falhar, tente um reset completo:

```bash
# Parar o servidor
Ctrl+C

# Limpar cache do Next.js
rm -rf .next

# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpar cache do navegador
# Chrome: Ctrl+Shift+Delete → Clear cache

# Reiniciar
npm run dev
```

---

### ✅ Verificação Final

Depois de aplicar as correções:

- [ ] Console mostra "✅ RPC Connection test"
- [ ] Console mostra "🔑 WalletConnect Project ID: ✓ Set"
- [ ] Console mostra ambos os connectors: injected e walletConnect
- [ ] Botão "Connect Wallet" abre o modal
- [ ] Modal mostra as opções de conexão
- [ ] Conexão completa com sucesso
- [ ] Endereço da wallet é exibido

---

**Última atualização:** Dezembro 2024
**Versão do guia:** 1.0










