# Chainlink CCIP deployment runbook

This runbook deploys message-only settlement infrastructure. It does **not** bridge tokens.

## Verified network configuration

| Network | Router | Chain selector |
| --- | --- | --- |
| Ethereum Sepolia | `0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59` | `16015286601757825753` |
| Arc Testnet | `0xdE4E7FED43FAC37EB21aA0643d9852f75332eab8` | `3034092155422581607` |

Source: official [Chainlink CCIP Directory](https://docs.chain.link/ccip/directory/testnet/chain/arc-testnet).

## Safe deployment order

1. Set `CCIP_OWNER` to a testnet multisig.
2. Deploy `DeployArcDexCCIPReceiver` on Arc Testnet. It starts paused.
3. Record the receiver address as `ARC_CCIP_RECEIVER`.
4. Deploy `DeployArcDexCCIPSender` on Ethereum Sepolia.
5. Record the sender address as `ETHEREUM_CCIP_SENDER`.
6. Run `ConfigureArcDexCCIPReceiver` on Arc Testnet to authorize the sender and unpause.
7. Verify both contracts in their explorers and publish the addresses.
8. Send a low-risk test message and track its ID in the [CCIP Explorer](https://ccip.chain.link/).

Example commands from `contracts/arcdex-contracts`:

```bash
forge script script/DeployCCIP.s.sol:DeployArcDexCCIPReceiver \
  --rpc-url arc_testnet --broadcast

forge script script/DeployCCIP.s.sol:DeployArcDexCCIPSender \
  --rpc-url ethereum_sepolia --broadcast

forge script script/DeployCCIP.s.sol:ConfigureArcDexCCIPReceiver \
  --rpc-url arc_testnet --broadcast
```

Before deployment, run:

```bash
forge test --match-path test/ArcDexCCIP.t.sol
```

Do not deploy with placeholder addresses. Do not unpause the receiver before checking the sender bytecode and ownership. Production use requires independent audit, rate limits, monitoring and an incident-response runbook.
