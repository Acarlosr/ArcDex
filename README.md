# ArcDex V2

> A decentralized exchange (DEX) built on Arc Testnet featuring swap, staking, liquidity pools, and payments.

![Arc Testnet](https://img.shields.io/badge/Network-Arc%20Testnet-00D4FF)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **🔄 Swap** - Trade USDC ↔ EURC with low fees (0.3%)
- **💰 Staking** - Earn yield on your stablecoins (up to 10% APR)
- **🌊 Liquidity Pools** - Provide liquidity and earn LP tokens
- **💸 Payments** - Send P2P payments with optional memo

## Arc Testnet

| Property | Value |
|----------|-------|
| Chain ID | `5042002` |
| RPC URL | `https://rpc.testnet.arc.network` |
| Explorer | [arcscan.app](https://testnet.arcscan.app) |
| Currency | USDC (native) |

### Getting Testnet Tokens

1. Visit [Circle Faucet](https://faucet.circle.com/)
2. Select **Arc Testnet**
3. Request USDC and/or EURC

## Quick Start

### Prerequisites

- Node.js 18+
- MetaMask or compatible wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/arcdex.git
cd arcdex

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Wallet Setup

Add Arc Testnet to MetaMask:

| Field | Value |
|-------|-------|
| Network Name | Arc Testnet |
| RPC URL | https://rpc.testnet.arc.network |
| Chain ID | 5042002 |
| Currency Symbol | USDC |
| Explorer | https://testnet.arcscan.app |

## Deployed Contracts

| Contract | Address |
|----------|---------|
| Swap | `0x50bb26da53555585c606280435469bfb15cac4cf` |
| Staking | `0x5d1ddbafd6a11131154a635563699230f0b9229b` |
| Payments | `0x515683c9399445df4a38915c2130cc498aba4319` |
| LP Token | `0x823f387a392bdc1ef57bc30cc005be7e6d067f13` |

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/arcdex)

1. Click the button above or import from GitHub
2. Add environment variables from `.env.example`
3. Deploy!

## Tech Stack

- **Framework**: Next.js 16
- **Web3**: wagmi 3.x, viem 2.x
- **UI**: Radix UI, Tailwind CSS
- **State**: TanStack Query

## License

MIT
