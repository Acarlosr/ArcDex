# One balance, two interfaces: the MAX button bug we shipped on Arc Testnet

We build ArcDex, a swap and payments app on Arc Testnet. Last week every swap that used our MAX button reverted, and the cause turned out to be something that only bites you on Arc. Posting it here because the fix is three lines and the failure mode is invisible until you hit it.

## What we saw

User clicks MAX. The field fills with their full USDC balance. They sign. The transaction reverts before it executes. Balance still shows the same number, so from the outside it looks like the app is broken.

## Why it happens

On Arc, USDC is the native gas token and an ERC-20 contract at the same time. Two interfaces, one balance:

- Native: 18 decimals, read with `getBalance`, pays for gas
- ERC-20: 6 decimals, `0x3600000000000000000000000000000000000000`, what your app logic uses
- `1e18` native equals `1e6` ERC-20 — a precompile keeps them in sync

Our MAX button did what a MAX button does on every other EVM chain: read `balanceOf` and put all of it in the input. On Ethereum that is fine, because gas comes out of a separate ETH balance. On Arc there is no separate balance. Spending 100% of the ERC-20 interface leaves zero for gas, so the transaction cannot pay for itself.

The docs say this plainly. We read past it because the code looked correct by habit.

## The fix

Reserve a slice of USDC whenever the token being spent is USDC:

```ts
const GAS_RESERVE_USDC = 0.5

const handleMaxClick = () => {
  const balance = parseFloat(fromBalance) || 0
  const max = fromToken === 'USDC'
    ? Math.max(0, balance - GAS_RESERVE_USDC)
    : balance
  setFromAmount(max.toFixed(6))
}
```

Same change anywhere a user can spend "everything" — we had it in payments too, where we were already subtracting our protocol fee but not gas.

We also added a check that blocks the action button when the native balance is zero, with a link to the faucet. A user can see a full USDC balance in our UI and still be unable to sign anything, and before this they got no explanation.

## Two more places this shows up

**Displaying both interfaces.** The Circle write-up warns that many SDKs assume native and ERC-20 are different assets and will show the same USDC twice. We were safe by accident — our portfolio only reads the ERC-20 side. We wrote the rule into the code so nobody adds a "gas balance" card later and doubles the number: ERC-20 for anything the user sees, native for gas checks only, never summed.

**Transfer logs.** Arc implements EIP-7708, so every native USDC movement emits a `Transfer` log from a system address in 18 decimals, separate from the ERC-20 contract's 6-decimal logs. Our history page reads `txlist` from the explorer, so it is unaffected. If you index with `eth_getLogs` or `tokentx`, you will get both families and need to filter, or your history will show duplicates at the wrong magnitude.

## Checklist

If you have a swap, payment, or transfer flow on Arc, worth grepping for:

- Any MAX / "use all" control that spends 100% of a USDC balance
- Gas preflight before the action, not just a balance check
- Balance displays that could add native and ERC-20 together
- Log indexing that assumes one Transfer event per movement

None of this is exotic. It is the same code that works everywhere else, which is exactly why it slips through review.

Docs we used:

- Building with USDC on Arc: one token, two interfaces — arc.io/blog
- EVM differences — docs.arc.io/arc/references/evm-differences

ArcDex runs on Arc Testnet, chain ID 5042002. We screen connected wallets against a compliance provider and block flagged addresses, so the app is not open to every wallet.

Happy to go deeper on any of this if it is useful. We also hit an unrelated RPC issue inside a Circle SDK while wiring up crosschain transfers — separate post if there is interest.
