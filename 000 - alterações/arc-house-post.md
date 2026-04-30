# How I Built Native Stablecoin DeFi Infrastructure on Arc Testnet

*A technical walkthrough of ARCDex — swap, liquidity, payments and yield built around USDC, EURC and USYC on Arc Network*

---

## Why I built this on Arc

Most DeFi protocols treat stablecoins as one asset type among many. Arc is different — it's designed from the ground up as infrastructure for stablecoin finance. When I read Arc's thesis, I saw an opportunity to build something that wasn't just *on* Arc, but *for* Arc's use case.

The result is ARCDex: a DeFi protocol with four modules — swap, liquidity pools, payments, and staking — built specifically around Arc's stablecoin ecosystem.

This post is a technical breakdown of what I built, what I learned, and where Arc's infrastructure surprised me.

---

## What's deployed

ARCDex has four smart contracts live on Arc testnet, verifiable on ArcScan:

| Contract | Role |
|---|---|
| ARCDex Core | Swap router and liquidity pools |
| FX Escrow | Multi-currency settlement (USDC/EURC pairs) |
| CCTP Token Messenger | Circle's cross-chain transfer protocol |
| Staking Module | Yield distribution for LP providers |

The front-end is open source on GitHub (MIT license) and the live app is at arc-dex.xyz.

---

## The three technical decisions that mattered most

### 1. Supporting USYC as a first-class asset

Most testnet DEXes on Arc only handle USDC or skip EURC entirely. I made the decision early to support USYC — Arc's yield-bearing stablecoin — as a native swap and pool asset.

This required treating USYC differently from USDC/EURC in the swap logic. USYC has an underlying yield accrual mechanism, which means exchange rate calculations need to account for the rebasing behavior. I built a wrapper layer in the Core contract that handles this conversion at swap time, so users see a clean USDC-to-USYC price without needing to understand the mechanics underneath.

Why does this matter for Arc? USYC is central to Arc's yield-generating stablecoin vision. Having it as a swappable, poolable asset on a testnet DEX creates a real demonstration of what stablecoin composability looks like in practice.

### 2. FX Escrow for USDC/EURC settlement

Cross-border stablecoin transfers are one of Arc's primary use cases. To support this, I integrated FX Escrow contracts that handle USDC/EURC pair settlement at the protocol level.

The escrow contract acts as a trusted intermediary that holds one asset until the counterpart asset is confirmed received. This eliminates the front-running risk that exists in naive swap implementations for cross-currency stablecoin pairs. The settlement window is configurable — currently set to 30 seconds on testnet — which is fast enough for UX but long enough to catch failed transactions.

What I found during testing: EURC liquidity on testnet is thin, which creates realistic spread conditions for the FX pair. This actually makes for a better test environment than artificial deep liquidity would.

### 3. Payments module as a first-class feature

Most DEXes treat payments as a separate product. In ARCDex, the Payments module is a core tab — equal to Swap in terms of UX priority.

This was a deliberate positioning choice. Arc's documentation and community discussions consistently return to payments, bridge, send and monetization as the network's real use cases. A protocol that makes stablecoin payments a first-class feature is more aligned with Arc's thesis than one that buries it.

Technically, the payments module is a thin wrapper over direct ERC-20 transfers, with a UI layer that handles address validation, memo fields, and transaction confirmation feedback. The simplicity is intentional — payments should feel like sending a message, not executing a trade.

---

## What I learned about building on Arc testnet

**Testnet faucet behavior is inconsistent.** USDC and EURC faucet availability varies, which means users sometimes need to retry. I added a clear error state in the UI that explains this rather than showing a generic failure.

**ArcScan is useful but has gaps.** Contract verification works, but there are some edge cases in token transfer display that made debugging harder than expected. I ended up adding detailed transaction logging in the app itself as a workaround.

**The CCTP integration documentation is sparse.** Circle's CCTP is well-documented for Ethereum, but Arc-specific integration required reading the contract source directly. If there's a request here to the Arc team: more examples for CCTP on Arc would save significant time for builders.

**Gas estimation occasionally fails on complex calls.** For multi-step operations like add-liquidity-and-stake, gas estimation sometimes reverts unexpectedly. I hardcoded conservative gas limits as a fallback, which works but isn't ideal. I'd welcome feedback from the Arc team on whether there's a better pattern here.

---

## What I would build differently

**Audit-ready from day one.** I treated security as something to add later, which is backwards. The "not audited" flag in the contract page should have been a build constraint, not an afterthought. Next version will have a security checklist that gates deployment.

**Better USYC exchange rate feeds.** The current implementation polls a price feed on-demand. An oracle-based approach would be more reliable, especially under load. This is on the roadmap.

**More aggressive pool depth testing.** I tested swap functionality but underinvested in stress-testing pool behavior under extreme slippage conditions. The FX pair in particular needs more edge-case coverage.

---

## Feedback for Arc

A few observations from building on the network that I hope are useful:

1. **CCTP documentation for Arc specifically** would reduce friction significantly for builders integrating cross-chain USDC flows.

2. **A testnet status page** would help — knowing whether a failed transaction is a network issue or a contract bug is currently hard to distinguish.

3. **USYC integration guides** are missing. The asset is central to Arc's thesis but builders have no reference implementation for how to handle its rebasing mechanics. A canonical example would unlock a lot of use cases.

4. **Longer testnet faucet drip windows** would help — current limits make testing multi-step flows (swap → pool → stake) tedious without multiple faucet hits.

---

## What's next for ARCDex

- Formal security audit before any mainnet consideration
- Oracle-based USYC rate feeds
- CCTP bridge UI — deposit USDC from Ethereum → Arc in-app
- Liquidity mining incentives for testnet participants
- Stress test report for USDC/EURC FX pair under simulated load

---

ARCDex is open source. Source code, contracts, and docs are all public. Feedback, bug reports and pull requests are welcome.

**GitHub:** github.com/Acarlosr/ArcDex  
**Live app:** arc-dex.xyz  
**Contracts:** arc-dex.xyz/app/contracts

---

*Built during Arc testnet. No real funds. All rates are testnet-only and variable.*
