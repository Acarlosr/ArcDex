# 🚀 Guia de Deploy - ArcDex V2

## ✅ Correções Aplicadas

### 1. **Problema Mobile Resolvido** 🎯

Adicionei configurações avançadas no WalletConnect para resolver os problemas:

#### Antes ❌:
- QR Code não aparecia no mobile
- Wallet instalada não era detectada
- Redirecionamento falhava

#### Depois ✅:
- QR Modal configurado com z-index correto
- Deep links para MetaMask e Trust Wallet
- Explorer de wallets habilitado
- Tema escuro aplicado
- Wallets recomendadas configuradas

**Arquivo modificado**: `components/web3-provider.tsx`

```typescript
qrModalOptions: {
    themeMode: 'dark',
    themeVariables: {
        '--wcm-z-index': '9999'  // Garante que o modal apareça acima de tudo
    },
    enableExplorer: true,  // Mostra lista de wallets
    explorerRecommendedWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    ],
    mobileWallets: [
        {
            id: 'metamask',
            name: 'MetaMask',
            links: {
                native: 'metamask://',
                universal: 'https://metamask.app.link/dapp/www.arc-dex.xyz'
            }
        },
        {
            id: 'trust',
            name: 'Trust Wallet',
            links: {
                native: 'trust://',
                universal: 'https://link.trustwallet.com/open_url?coin_id=60&url=https://www.arc-dex.xyz'
            }
        }
    ]
}
```

### 2. **Logs de Debug Adicionados** 🔍

Todos os componentes agora têm logs detalhados:
- ✅ Swap: logs de approve e swap
- ✅ Stake: logs de stake, unstake e claim
- ✅ Pools: logs de add/remove liquidity
- ✅ Payments: logs de pagamentos

### 3. **Arquivo Payments Corrigido** 🔧

O arquivo `app/app/payments/page.tsx` estava incompleto e foi corrigido.

---

## 🚀 Como Fazer Deploy no Vercel

### Opção 1: Via GitHub (Recomendado)

#### Passo 1: Fazer Commit das Mudanças

Abra o **Git Bash** ou **CMD** no seu projeto e execute:

```bash
# Verificar mudanças
git status

# Adicionar todos os arquivos modificados
git add .

# Criar commit
git commit -m "fix: resolve mobile WalletConnect issues and add debug logs"

# Push para GitHub
git push origin main
```

#### Passo 2: Deploy Automático

O Vercel detectará automaticamente o push e iniciará o deploy! 🎉

Acompanhe em: https://vercel.com/acarlosrs-projects

---

### Opção 2: Via CLI do Vercel

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

### Opção 3: Via Vercel Dashboard (Manual)

1. Acesse: https://vercel.com/acarlosrs-projects
2. Vá no projeto **ArcDex**
3. Clique em **"Deployments"**
4. Clique em **"Redeploy"**
5. Selecione **"Use existing Build Cache: No"**
6. Clique em **"Redeploy"**

---

## 📱 Testando no Mobile

### Android

#### Teste 1: Browser Mobile
1. Abra o Chrome no Android
2. Acesse: https://www.arc-dex.xyz/
3. Clique em **"Connect Wallet"**
4. Escolha **"WalletConnect"**
5. O QR Code deve aparecer
6. Se tiver MetaMask instalado, deve mostrar opção de abrir no app

#### Teste 2: MetaMask Browser
1. Abra o app **MetaMask**
2. Vá em **"Browser"** (aba inferior)
3. Digite: `www.arc-dex.xyz`
4. A wallet deve conectar automaticamente via **"Browser Wallet"**

#### Teste 3: Deep Link
1. No browser mobile, clique em **"Open in MetaMask"**
2. O app deve abrir automaticamente
3. A página deve carregar dentro do MetaMask Browser

---

### iOS (iPhone/iPad)

#### Teste 1: Safari Mobile
1. Abra o Safari
2. Acesse: https://www.arc-dex.xyz/
3. Clique em **"Connect Wallet"**
4. Escolha **"WalletConnect"**
5. O QR Code deve aparecer
6. Clique em **"MetaMask"** na lista de wallets

#### Teste 2: MetaMask Browser
1. Abra o app **MetaMask**
2. Vá em **"Browser"** (aba inferior)
3. Digite: `www.arc-dex.xyz`
4. A wallet deve conectar automaticamente

---

## 🔍 Verificações Pós-Deploy

### 1. Console do Navegador
Após o deploy, teste e verifique os logs:

```javascript
// No console você deve ver:
🔐 Iniciando approve: { token: "USDC", spender: "0x...", amount: "10" }
✅ Approve iniciado com sucesso
✅ Approve confirmado! { hash: "0x..." }
🔄 Atualizando allowance...
```

### 2. WalletConnect QR Modal
- [ ] O QR Code aparece corretamente
- [ ] Lista de wallets é exibida
- [ ] Deep links funcionam no mobile
- [ ] MetaMask e Trust Wallet aparecem como recomendadas

### 3. Conexão Mobile
- [ ] Browser mobile: QR Code aparece
- [ ] App wallet: deep link abre o app
- [ ] Wallet browser: detecta wallet injetada
- [ ] Disconnect funciona corretamente

### 4. Transações
- [ ] Approve funciona
- [ ] Swap atualiza balances
- [ ] Histórico aparece após transação

---

## 🐛 Troubleshooting Mobile

### Problema: QR Code não aparece

**Causa**: Z-index do modal está abaixo de outros elementos

**Solução**: Já corrigimos com `'--wcm-z-index': '9999'`

**Teste**: Inspecione o elemento do modal e verifique o z-index

---

### Problema: Deep link não abre a wallet

**Causa**: URL do deep link incorreta ou app não instalado

**Solução**:
1. Verifique se a wallet está instalada
2. Em iOS, pode precisar confirmar o redirecionamento
3. Tente usar WalletConnect QR Code

**Fallback**: Copie o link do dApp e cole no browser da wallet

---

### Problema: Wallet instalada não é detectada no mobile browser

**Causa**: Wallets mobile não injetam `window.ethereum` no browser padrão

**Solução**: Use o browser integrado da wallet:
- **MetaMask**: Menu → Browser → www.arc-dex.xyz
- **Trust Wallet**: Browser → www.arc-dex.xyz

---

### Problema: Conexão funciona mas não assina transações

**Causa**: Rede errada selecionada na wallet

**Solução**:
1. Abra a wallet
2. Mude para **Arc Testnet**
3. Se não tiver, adicione manualmente:
   - **Network Name**: Arc Testnet
   - **RPC URL**: https://rpc-testnet.arc.network
   - **Chain ID**: 5042002
   - **Currency Symbol**: USDC
   - **Explorer**: https://testnet.arcscan.app

---

## 📊 Métricas de Sucesso

Após o deploy, monitore:

1. **Vercel Analytics**: https://vercel.com/acarlosrs-projects/arcdex/analytics
2. **Build Logs**: Verificar se não há erros
3. **Runtime Logs**: Verificar console do navegador
4. **Mobile Usage**: Testar em Android e iOS

---

## 🎯 Checklist Final

Antes de considerar o deploy completo:

- [ ] **Build passa sem erros**
- [ ] **Deploy completo no Vercel**
- [ ] **Site acessível**: https://www.arc-dex.xyz/
- [ ] **Desktop**: Conexão funciona (Chrome, Firefox, Edge)
- [ ] **Mobile Android**: WalletConnect + Browser wallet
- [ ] **Mobile iOS**: WalletConnect + Browser wallet  
- [ ] **Transações**: Swap funciona e atualiza balances
- [ ] **Logs**: Console mostra debug logs
- [ ] **Performance**: Lighthouse score > 90

---

## 🔄 Comandos Úteis

### Verificar Status do Git
```bash
git status
git log --oneline -5
```

### Reverter Mudanças (se necessário)
```bash
git reset --hard HEAD^  # Desfaz último commit
git push origin main --force  # CUIDADO: só use se necessário
```

### Limpar Cache do Vercel
```bash
vercel --prod --force
```

### Ver Logs do Vercel
```bash
vercel logs [deployment-url]
```

---

## 📞 Suporte

Se continuar com problemas após o deploy:

1. **Verifique os logs do build no Vercel**
2. **Teste no modo incógnito** (sem cache)
3. **Limpe o cache do Vercel** e faça redeploy
4. **Verifique as variáveis de ambiente** no Vercel:
   - `NEXT_PUBLIC_REOWN_PROJECT_ID`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

5. **Teste em diferentes dispositivos/navegadores**

---

## 🎉 Próximos Passos

Depois que o deploy estiver funcionando:

1. [ ] Configurar domínio customizado (se aplicável)
2. [ ] Habilitar HTTPS (já vem por padrão no Vercel)
3. [ ] Configurar Analytics e Monitoring
4. [ ] Adicionar notificações toast para melhor UX
5. [ ] Implementar testes E2E para mobile

---

**Última atualização**: Dezembro 2024  
**Versão**: 2.0  
**Deploy Target**: Vercel (https://www.arc-dex.xyz/)



