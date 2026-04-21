export const ARCDEX_STAKING_ABI = [
    // Read functions
    {
        name: "usdc",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "address" }],
    },
    {
        name: "eurc",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "address" }],
    },
    {
        name: "treasury",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "address" }],
    },
    {
        name: "totalStaked",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "token", type: "address" }],
        outputs: [{ type: "uint256" }],
    },
    {
        name: "baseAPR",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "token", type: "address" }],
        outputs: [{ type: "uint256" }],
    },
    {
        name: "boostAPR",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "token", type: "address" }],
        outputs: [{ type: "uint256" }],
    },
    {
        name: "stakes",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "user", type: "address" },
            { name: "token", type: "address" },
        ],
        outputs: [
            { name: "amount", type: "uint256" },
            { name: "lastClaimTime", type: "uint256" },
            { name: "pendingRewards", type: "uint256" },
        ],
    },
    {
        name: "getStakedBalance",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "user", type: "address" },
            { name: "token", type: "address" },
        ],
        outputs: [{ type: "uint256" }],
    },
    {
        name: "getPendingRewards",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "user", type: "address" },
            { name: "token", type: "address" },
        ],
        outputs: [{ type: "uint256" }],
    },
    {
        name: "getAPR",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "token", type: "address" }],
        outputs: [
            { name: "base", type: "uint256" },
            { name: "boost", type: "uint256" },
            { name: "total", type: "uint256" },
        ],
    },
    // Write functions
    {
        name: "stake",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "token", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [],
    },
    {
        name: "unstake",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "token", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [],
    },
    {
        name: "claimRewards",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "token", type: "address" }],
        outputs: [],
    },
    {
        name: "claimAllRewards",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [],
        outputs: [],
    },
    // Events
    {
        name: "Staked",
        type: "event",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "token", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
        ],
    },
    {
        name: "Unstaked",
        type: "event",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "token", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
        ],
    },
    {
        name: "RewardsClaimed",
        type: "event",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "token", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
        ],
    },
] as const
