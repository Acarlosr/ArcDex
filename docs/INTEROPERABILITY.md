# ArcDex Interoperability Architecture

## Current production boundary

The current ArcDex bridge transfers **USDC only** through Circle CCTP v2 using the Circle Bridge Kit and its Viem adapter.

Enabled routes:

- Ethereum Sepolia to Arc Testnet
- Base Sepolia to Arc Testnet

The frontend never asks users to transfer EURC, wDREX, or an arbitrary ERC-20 through this flow. ArcDex does not custody bridge funds and does not deploy a custom contract in the standard CCTP path.

## Why CCIP is a separate track

Circle CCTP solves native USDC burn-and-mint transfers. Chainlink CCIP is the candidate messaging and token-interoperability layer for future institutional assets and programmable settlement.

These integrations must remain separate in code and product language:

| Capability | Current protocol | Status |
| --- | --- | --- |
| USDC bridge | Circle CCTP v2 | Enabled on supported testnet routes |
| Cross-chain application messages | Chainlink CCIP v1.6 | Contracts implemented and tested; deployment pending |
| wDREX or DREX-related assets | Authorized issuer plus CCIP/token infrastructure | Not integrated |
| DvP/PvP settlement | Escrow, compliance and cross-chain messaging | Research roadmap |

## Confirmed Chainlink CCIP infrastructure

The official Chainlink CCIP directory currently confirms an Ethereum Sepolia ↔ Arc Testnet lane using CCIP v1.6:

- Arc Testnet Router: `0xdE4E7FED43FAC37EB21aA0643d9852f75332eab8`
- Arc Testnet chain selector: `3034092155422581607`
- Ethereum Sepolia Router: `0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59`
- Ethereum Sepolia chain selector: `16015286601757825753`
- Arc token transfers through CCIP: **not enabled** (`Tokens (0)` in the official directory)

The repository contains a message-only sender and receiver under `contracts/arcdex-contracts/src/ccip`. They use the official `CCIPReceiver`, typed and versioned payloads, router/source/sender validation, replay protection, pause controls, a strict state machine, two-step ownership and no arbitrary calls.

These contracts are not deployed yet. The public USDC bridge remains Circle CCTP v2.

## Gates before production deployment

A receiver contract must not be deployed until all of the following are confirmed:

1. The sender and receiver addresses are deterministically recorded and independently reviewed.
2. Ownership is assigned to a multisig with a documented emergency process.
3. The remote sender is controlled by the authorized integration.
4. The asset issuer defines the mint, burn, lock, unlock, freeze, recovery, and compliance model.
5. The receiver validates both `sourceChainSelector` and the decoded remote sender.
6. Replay protection, pause controls, rate limits, and operational monitoring are implemented.
7. Monitoring covers CCIP message IDs, failures, manual execution and configuration changes.
8. The complete flow receives independent security review before handling real value.

## Receiver security policy

The implemented receiver follows these constraints:

- inherit the official `CCIPReceiver` implementation;
- accept calls only through the configured CCIP router;
- maintain an allowlist per source chain and remote sender;
- reject duplicate message IDs at the application layer;
- use typed payloads with a version field, action enum, recipient, amount, and asset identifier;
- never execute arbitrary target addresses or calldata received cross-chain;
- apply checks-effects-interactions and reentrancy protection;
- cap transfers by transaction and rolling time window;
- expose pause and recovery functions only to multisig-controlled roles;
- emit events for every configuration and settlement state change.

## Public communication boundary

Approved wording:

> ArcDex is being developed as a multi-chain DEX prepared for the next generation of tokenized assets, including potential interoperability flows related to the DREX ecosystem.

Approved short marketing copy:

> ArcDex é uma DEX multi-chain preparada para a interoperabilidade do Real Digital (DREX) e para a próxima geração de ativos tokenizados, combinando liquidez na Arc com infraestrutura cross-chain segura.

Do not claim that ArcDex integrates DREX, wDREX, Banco Central do Brasil, Banco Inter, or Microsoft unless a formal and technically verifiable integration exists. Describe the Chainlink work as an implemented and tested CCIP prototype until the contracts are deployed and their addresses are published.
