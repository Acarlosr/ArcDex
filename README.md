# 🚀 ArcDex — DeFi Protocol on Arc Network (Testnet)

> ArcDex is a decentralized finance (DeFi) application built on the **Arc Network Testnet**, providing token swaps, liquidity pools, staking, payments, and an advanced Portfolio Dashboard.

The project is designed as a testnet showcase dApp, with a strong focus on **UX clarity**, **performance**, and **developer-friendly architecture**.

![Arc Testnet](https://img.shields.io/badge/Network-Arc%20Testnet-00D4FF)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Vulnerabilities](https://img.shields.io/badge/vulnerabilities-0-green)
![License](https://img.shields.io/badge/License-MIT-green)

🌐 **Live Demo:** [https://arc-dex.vercel.app](https://arc-dex.vercel.app)

📦 **Repository:** [https://github.com/Acarlosr/ArcDex](https://github.com/Acarlosr/ArcDex)

---

## 📋 TL;DR

**ArcDex** is a full-featured DeFi protocol on Arc Network Testnet featuring:

- 🔁 **Token Swaps** — USDC ↔ EURC with on-chain AMM
- 🌊 **Liquidity Pools** — Add/remove liquidity, earn fees
- 🥩 **Staking** — Stake tokens and claim rewards
- 💸 **P2P Payments** — Send stablecoins with minimal fees
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
- **Stablecoin-first design** — Optimized for USDC, EURC, and yield-bearing tokens like USYC

### **Developer Experience**
- **EVM-compatible** — Use familiar tools (Foundry, Hardhat, Wagmi)
- **Fast finality** — Sub-second transaction confirmation
- **Low fees** — Cost-effective for high-frequency DeFi operations
- **Testnet available** — Full-featured testnet for development and testing

### **Real-World Asset Focus**
- **USYC integration** — Tokenized money market funds on-chain
- **RWA primitives** — Infrastructure for asset tokenization
- **Regulatory clarity** — Built with compliance in mind

### **Why ArcDex on Arc?**
ArcDex leverages Arc's stablecoin-native architecture to provide:
- **Seamless swaps** between stablecoins without gas token conversions
- **Efficient staking** with USDC/EURC directly
- **Low-cost payments** optimized for stablecoin transfers
- **Future RWA support** via USYC and other tokenized assets

---

## ✨ Key Features

### 🔁 Token Swaps
- ERC-20 token swaps on Arc Testnet
- On-chain reserve & pricing logic
- Web3 integration using wagmi + viem

### 🌊 Liquidity Pools
- Add and remove liquidity
- View LP positions
- Active pools: **USDC / EURC**
- USYC pools prepared (pending deploy)

### 🥩 Staking
- Stake & unstake tokens
- Claim staking rewards
- Direct integration with ArcDexStaking contract
- Clear UX with loading and feedback states

### 💸 Payments (P2P)
- Payments UI implemented
- ArcDexPayments contract deployed
- Full Web3 integration planned for future phase

---

## 📊 Portfolio Dashboard (Core Highlight)

The Portfolio section was developed in well-defined phases, focusing on realism and testnet transparency.

### Phase 1 – UI Foundation
- Complete layout and navigation
- Tabs: Tokens | NFTs | Transactions

### Phase 2 – Stats & Charts
- Total Balance, Staked Value, LP Positions, Rewards
- Portfolio evolution chart (24H / 7D / 30D)

### Phase 3 – Real Token Balances
- On-chain ERC-20 balance reading via wagmi
- Supported tokens: **USDC**, **EURC**, **USYC**
- Wallet connection & loading states

### Phase 4 – Transactions
- Recent wallet transaction history
- Integration with ArcScan Explorer API
- Automatic classification: Swaps, Staking, Liquidity actions, Transfers
- Direct links to the explorer
- Graceful empty & error states

### Phase 5 – Net Worth & Prices
- Estimated USD net worth
- Off-chain token price integration
- Per-asset valuation
- Portfolio chart based on estimated total value
- Clear "Estimated (testnet)" labeling
- No backend, no indexer → fast performance

---

## 🧾 Transaction History

Dedicated History page with explorer links for:
- Wallet address
- Swap contract
- Staking contract
- LP token
- Payments contract

Designed for transparency and testnet debugging.

---

## 📚 Documentation

Integrated Docs page inside the dApp, prepared for onboarding content:
- How it works
- Network configuration
- Faucet & testnet resources

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

## 📦 Smart Contracts (Arc Testnet)

| Contract | Address | Status |
|----------|---------|--------|
| ArcDexSwap | `0x50bb26da53555585c606280435469bfb15cac4cf` | ✅ Deployed |
| ArcDexLP | `0x823f387a392bdc1ef57bc30cc005be7e6d067f13` | ✅ Deployed |
| ArcDexStaking | `0x5d1ddbafd6a11131154a635563699230f0b9229b` | ✅ Deployed |
| ArcDexPayments | `0x515683c9399445df4a38915c2130cc498aba4319` | ✅ Deployed |
| USYC Pools | — | ⏳ Pending deploy |

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

### Wallet Setup (Arc Testnet)

| Field | Value |
|-------|-------|
| Network Name | Arc Testnet |
| RPC URL | https://rpc.testnet.arc.network |
| Chain ID | 5042002 |
| Currency Symbol | USDC |
| Explorer | https://testnet.arcscan.app |

### Getting Testnet Tokens

1. Visit [Circle Faucet](https://faucet.circle.com/)
2. Select **Arc Testnet**
3. Request USDC and/or EURC

---

## 🚧 Roadmap (High Level)

- [ ] Complete Payments Web3 integration
- [ ] Faucet & onboarding UX improvements
- [ ] UX polish and notifications
- [ ] Optional custom indexer (future)

---

## 🏆 Conclusion

ArcDex is a modular, production-minded DeFi application built for the Arc Network Testnet, suitable as a **builder showcase**, **creator portfolio**, and **foundation for future mainnet expansion**.

---

## 📄 License

MIT License
