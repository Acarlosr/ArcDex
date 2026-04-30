# ArcDex Documentation

> **ArcDex** is a decentralized exchange (DEX) built on **Arc Testnet**, featuring stablecoin swaps, liquidity pools, staking, and P2P payments.

---

## 🌐 Overview

ArcDex is a DeFi platform designed to provide essential financial services on the Arc Network:

| Feature | Description |
|---------|-------------|
| **Swap** | Exchange stablecoins (USDC ↔ EURC) with minimal fees |
| **Pools** | Provide liquidity and earn trading fees |
| **Stake** | Stake stablecoins to earn APR yield |
| **Payments** | Send P2P payments with memo support |

**Live Demo:** [https://arc-dex.vercel.app](https://arc-dex.vercel.app)

---

## 🔗 Network Configuration

| Parameter | Value |
|-----------|-------|
| Network | Arc Testnet |
| Chain ID | `5042002` |
| RPC URL | `https://rpc.testnet.arc.network` |
| Explorer | [https://testnet.arcscan.app](https://testnet.arcscan.app) |

---

## 💰 Supported Tokens

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | `0x3600000000000000000000000000000000000000` | 6 |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | 6 |
| USYC | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` | 6 |

---

## 📜 Smart Contracts

### Deployed Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| **ArcDexSwap** | `0x50bb26da53555585c606280435469bfb15cac4cf` | AMM for USDC/EURC swaps |
| **ArcDexLP** | `0x823f387a392bdc1ef57bc30cc005be7e6d067f13` | LP tokens for liquidity providers |
| **ArcDexStaking** | `0x5d1ddbafd6a11131154a635563699230f0b9229b` | Yield vault for staking |
| **ArcDexPayments** | `0x515683c9399445df4a38915c2130cc498aba4319` | P2P payment system |

---

## ⚡ Features

### 1. Swap (AMM)

Exchange stablecoins using an automated market maker:

- **Pair:** USDC ↔ EURC
- **Fee:** 0.3% per swap
- **Slippage:** Configurable (default 0.5%)

```
User → approve(USDC, SwapContract) → swap(USDC, amount) → receive EURC
```

### 2. Liquidity Pools

Provide liquidity to earn a share of trading fees:

- **Pool:** USDC/EURC (50/50 ratio)
- **LP Tokens:** Minted proportionally to deposit
- **Earnings:** Share of 0.3% fee on all swaps

```
User → approve(USDC + EURC) → addLiquidity(amountA, amountB) → receive LP tokens
```

### 3. Staking

Stake stablecoins to earn yield:

| Token | Base APR | Boost APR | Total |
|-------|----------|-----------|-------|
| USDC | 8% | 2% | 10% |
| EURC | 6% | 2% | 8% |

```
User → approve(token) → stake(token, amount) → earn rewards over time
```

### 4. Payments

Send P2P stablecoin payments with optional memo:

- **Fee:** 0.05 USDC per payment
- **Memo:** Optional message (max 256 chars)
- **Tokens:** USDC or EURC

```
User → approve(token) → sendPayment(recipient, amount, memo)
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend                               │
│                    (Next.js + Wagmi)                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     Arc Testnet (RPC)                        │
└──────────────────────────────────────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   ArcDex    │      │   ArcDex    │      │   ArcDex    │
│    Swap     │      │   Staking   │      │  Payments   │
└─────────────┘      └─────────────┘      └─────────────┘
       │
       ▼
┌─────────────┐
│  ArcDex LP  │
│   (ERC-20)  │
└─────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Web3:** Wagmi v2 + Viem
- **Components:** shadcn/ui

### Smart Contracts
- **Language:** Solidity ^0.8.24
- **Framework:** Foundry
- **Libraries:** OpenZeppelin

---

## 📖 User Flows

### Connect Wallet
1. Click "Connect" in navbar
2. Select MetaMask (or injected wallet)
3. Approve connection in wallet
4. Network auto-switches to Arc Testnet

### Perform a Swap
1. Go to `/app/swap`
2. Select tokens (USDC → EURC or vice versa)
3. Enter amount
4. Click "Approve" (first time only)
5. Click "Swap"
6. Confirm transaction in wallet

### Add Liquidity
1. Go to `/app/pools`
2. Enter USDC and EURC amounts
3. Click "Approve USDC" then "Approve EURC"
4. Click "Add Liquidity"
5. Receive LP tokens

### Stake Tokens
1. Go to `/app/stake`
2. Select token (USDC or EURC)
3. Enter amount
4. Click "Approve" then "Stake"
5. View your position and pending rewards

---

## 🔐 Security Considerations

- **ReentrancyGuard:** All state-changing functions protected
- **SafeERC20:** Safe token transfers
- **Ownable:** Admin functions restricted
- **No-lock Unstaking:** Testnet allows instant unstake

---

## 📂 Project Structure

```
ArcDex/
├── app/                    # Next.js App Router
│   ├── app/               # Main app pages
│   │   ├── swap/          # Swap interface
│   │   ├── pools/         # Liquidity pools
│   │   ├── stake/         # Staking vault
│   │   ├── payments/      # P2P payments
│   │   └── history/       # Transaction history
│   └── layout.tsx         # Root layout
├── components/            # React components
├── hooks/                 # Custom hooks (use-contracts.ts)
├── lib/                   # Utilities
│   ├── contracts.ts       # Contract addresses & config
│   ├── wagmi.ts          # Wagmi configuration
│   └── abi/              # Contract ABIs
└── contracts/            # Solidity smart contracts
    └── arcdex-contracts/
        ├── src/          # Contract source files
        ├── script/       # Deployment scripts
        └── test/         # Contract tests
```

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables
4. Deploy automatically on push

### Contracts (Foundry)
```bash
cd contracts/arcdex-contracts
forge script script/Deploy.s.sol --rpc-url arc_testnet --broadcast
```

---

## 📞 Support

- **Explorer:** [testnet.arcscan.app](https://testnet.arcscan.app)
- **Faucet:** Accessible via navbar droplet icon

---

## 📄 License

MIT License
