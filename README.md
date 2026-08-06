# 🚀 ArcDex — DeFi Protocol on Arc Network

> ArcDex is a decentralized finance (DeFi) application built on **Arc Network**, providing token swaps, liquidity pools, a CCTP v2 bridge, stablecoin payments, and an advanced Portfolio Dashboard.

> **Arc Public Mainnet goes live on September 16, 2026.** ArcDex is configured for mainnet by default and falls back to Arc Testnet until the official mainnet chain ID, RPC and contract addresses are published by Circle. See [Network configuration](#-network-configuration).

![Arc Network](https://img.shields.io/badge/Network-Arc-00D4FF)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![License](https://img.shields.io/badge/License-MIT-green)

🌐 **Live Demo:** [https://arc-dex.vercel.app](https://arc-dex.vercel.app)

📦 **Repository:** [https://github.com/Acarlosr/ArcDex](https://github.com/Acarlosr/ArcDex)

---

## 📋 TL;DR

**ArcDex** is a full-featured DeFi protocol on Arc Network featuring:

- 🔁 **Token Swaps** — USDC ↔ EURC with on-chain AMM
- 🌊 **Liquidity Pools** — Add/remove liquidity, earn fees
- 💸 **P2P Payments** — Send stablecoins with minimal fees
- 🌐 **USDC Bridge** — Move USDC in and out of Arc through Circle CCTP v2 (native burn-and-mint, no wrapped assets)
- 🔗 **CCIP Messaging Prototype** — Secure Ethereum Sepolia → Arc settlement messages using Chainlink CCIP v1.6
- 📊 **Portfolio Dashboard** — Real-time balances, transaction history, and charts

**Built with:** Next.js 16, React 19, Wagmi v3, Foundry (Solidity)

**Quick Start:**
```bash
git clone https://github.com/Acarlosr/ArcDex.git
cd ArcDex
npm install
npm run dev
```

---

## 🌟 Why Arc Network?

Arc Network is a Layer 1 blockchain optimized for **stablecoin-native DeFi** and **real-world asset (RWA) tokenization**. Here's why builders choose Arc:

### **Native Stablecoin Infrastructure**
- **USDC as native gas** — No ETH/volatile gas tokens required
- **Built-in CCTP support** — Cross-chain transfers via Circle's Cross-Chain Transfer Protocol
- **Stablecoin-first design** — Optimized for USDC and EURC flows on Arc

### **Developer Experience**
- **EVM-compatible** — Use familiar tools (Foundry, Hardhat, Wagmi)
- **Fast finality** — Sub-second transaction confirmation
- **Low fees** — Cost-effective for high-frequency DeFi operations
- **Testnet available** — Full-featured testnet for development and testing

### **Stablecoin App Focus**
- **Stablecoin primitives** — Infrastructure for USDC and EURC workflows
- **Regulatory clarity** — Built with compliance in mind

### **Why ArcDex on Arc?**
ArcDex leverages Arc's stablecoin-native architecture to provide:
- **Seamless swaps** between stablecoins without gas token conversions
- **Low-cost payments** optimized for stablecoin transfers
- **Focused token support** aligned with the contracts currently integrated in ArcDex

---

## ✨ Key Features

### 🔁 Token Swaps
- ERC-20 token swaps on Arc
- On-chain reserve & pricing logic
- Web3 integration using wagmi + viem

### 🌊 Liquidity Pools
- Add and remove liquidity
- View LP positions
- Active pools: **USDC / EURC**

### 💸 Payments (P2P)
- Payments UI implemented
- ArcDexPayments contract deployed
- Full Web3 integration planned for future phase

### 🌐 USDC Bridge
- Browser-wallet flow powered by Circle Bridge Kit and the Viem adapter
- Supported routes: any CCTP v2 chain → Arc
- Native USDC burn-and-mint flow through CCTP v2
- Per-step progress, explorer links, fee estimation, and explicit error recovery
- The current bridge supports USDC only; EURC and tokenized assets are not presented as bridgeable

### Interoperability roadmap

ArcDex now includes tested Chainlink CCIP sender/receiver contracts for message-only settlement between Ethereum Sepolia and Arc Testnet. Deployment is pending, and the official Arc lane currently lists no transferable CCIP tokens. Assets related to the DREX ecosystem are not integrated in the current release; any future wDREX flow still requires an authorized issuer, token registration, compliance controls and an independent security audit.

---

## 📊 Portfolio Dashboard (Core Highlight)

The Portfolio section was developed in well-defined phases, focusing on realism and testnet transparency.

### Phase 1 – UI Foundation
- Complete layout and navigation
- Tabs: Tokens | NFTs | Transactions

### Phase 2 – Stats & Charts
- Total Balance, LP Positions, Trading Fees
- Portfolio evolution chart (24H / 7D / 30D)

### Phase 3 – Real Token Balances
- On-chain ERC-20 balance reading via wagmi
- Supported tokens: **USDC**, **EURC**
- Wallet connection & loading states

### Phase 4 – Transactions
- Recent wallet transaction history
- Integration with ArcScan Explorer API
- Automatic classification: Swaps, Bridge, Liquidity actions, Transfers
- Direct links to the explorer
- Graceful empty & error states

### Phase 5 – Net Worth & Prices
- Estimated USD net worth
- Off-chain token price integration
- Per-asset valuation
- Portfolio chart based on estimated total value
- Clear "Estimated" labeling on off-chain-priced values
- No backend, no indexer → fast performance

---

## 🧾 Transaction History

Dedicated History page with explorer links for:
- Wallet address
- Swap contract
- LP token
- Payments contract

Designed for transparency and on-chain auditability.

---

## 📚 Documentation

Integrated Docs page inside the dApp, prepared for onboarding content:
- How it works
- Network configuration
- Bridging USDC into Arc

---

## 🔐 Security & Quality

- ✅ Next.js 16.0.10
- ✅ `npm audit` → **0 vulnerabilities**
- ✅ No exposed private keys
- ✅ Clean separation between UI, hooks, and contracts
- ✅ Stable deployment on Vercel

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS 4 |
| Web3 | Wagmi v3, Viem v2 |
| UI | shadcn/ui, Radix |
| Charts | Recharts |
| Smart Contracts | Solidity ^0.8.24 |
| Tooling | Foundry (Forge, Cast) |
| Explorer | ArcScan |

---

## 📦 Smart Contracts

### Arc Testnet (chain ID 5042002)

| Contract | Address | Status |
|----------|---------|--------|
| ArcDexSwap | `0x50bb26da53555585c606280435469bfb15cac4cf` | ✅ Deployed |
| ArcDexLP | `0x823f387a392bdc1ef57bc30cc005be7e6d067f13` | ✅ Deployed |
| ArcDexPayments | `0x515683c9399445df4a38915c2130cc498aba4319` | ✅ Deployed |

### Arc Mainnet

Pending redeployment after September 16, 2026. Addresses are read from
`NEXT_PUBLIC_ARC_MAINNET_ARCDEX_*` — see `.env.example`.

---

## 🧪 Smart Contract Development (Foundry)

ArcDex smart contracts are developed and tested using **Foundry**, a fast and modular Ethereum development toolkit written in Rust.

Foundry includes:
- **Forge**: Ethereum testing framework
- **Cast**: CLI tool for interacting with EVM contracts
- **Anvil**: Local Ethereum node
- **Chisel**: Solidity REPL

📖 Documentation: [https://book.getfoundry.sh/](https://book.getfoundry.sh/)

### Usage

```bash
# Build
forge build

# Test
forge test

# Format
forge fmt

# Gas Snapshots
forge snapshot

# Local Node
anvil

# Deploy
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url <your_rpc_url> \
  --private-key <your_private_key>

# Cast
cast <subcommand>
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or compatible wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/Acarlosr/ArcDex.git
cd ArcDex

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Network configuration

Network selection lives in [`lib/network.ts`](lib/network.ts) and is driven entirely by
environment variables — no code changes are needed to switch networks.

```bash
NEXT_PUBLIC_ARC_NETWORK=mainnet   # "mainnet" (default) or "testnet"
```

**Mainnet values are not yet public.** Circle's docs still state that
*"Mainnet addresses are not yet available."* Until they are, leave the
`NEXT_PUBLIC_ARC_MAINNET_*` variables empty: the app detects that mainnet is
unconfigured, automatically falls back to Arc Testnet, and displays a launch
countdown banner.

### On launch day (September 16, 2026)

Fill these in `.env.local` and redeploy — nothing else changes:

```bash
NEXT_PUBLIC_ARC_MAINNET_CHAIN_ID=
NEXT_PUBLIC_ARC_MAINNET_RPC_URL=
NEXT_PUBLIC_ARC_MAINNET_RPC_FALLBACKS=
NEXT_PUBLIC_ARC_MAINNET_EXPLORER_URL=
NEXT_PUBLIC_ARC_MAINNET_USDC=
NEXT_PUBLIC_ARC_MAINNET_EURC=
NEXT_PUBLIC_ARC_MAINNET_CCTP_TOKEN_MESSENGER=
# ... see .env.example for the full list
NEXT_PUBLIC_ARC_MAINNET_ARCDEX_SWAP=
NEXT_PUBLIC_ARC_MAINNET_ARCDEX_LP=
NEXT_PUBLIC_ARC_MAINNET_ARCDEX_PAYMENTS=
```

Remaining manual step: `lib/bridge-chains.ts` still lists CCTP **testnet** source
chains. Swap them for the mainnet set once Circle Bridge Kit ships the mainnet
`BridgeChain` identifiers.

### Wallet Setup (Arc Testnet)

| Field | Value |
|-------|-------|
| Network Name | Arc Testnet |
| RPC URL | https://rpc.testnet.arc.io |
| Chain ID | 5042002 |
| Currency Symbol | USDC |
| Explorer | https://testnet.arcscan.app |

### Getting Testnet Tokens

1. Visit [Circle Faucet](https://faucet.circle.com/)
2. Select **Arc Testnet**
3. Request USDC and/or EURC

---

## 🚧 Roadmap (High Level)

- [ ] Fill in Arc Mainnet config on September 16, 2026
- [ ] Redeploy ArcDex contracts to Arc Mainnet
- [ ] Switch bridge source chains from CCTP testnet to mainnet
- [ ] External security audit before handling material volume
- [ ] Complete Payments Web3 integration
- [ ] UX polish and notifications

---

## 🏆 Conclusion

ArcDex is a modular, production-minded DeFi application built for Arc Network, ready for the Public Mainnet launch on September 16, 2026.

> ⚠️ The ArcDex contracts have not been externally audited. Verify every address on ArcScan before interacting with real funds.

---

## 📄 License

MIT License
