export const ARCDEX_SWAP_ABI = [
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
        name: "lpToken",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "address" }],
    },
    {
        name: "reserveUSDC",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint256" }],
    },
    {
        name: "reserveEURC",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint256" }],
    },
    {
        name: "getReserves",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [
            { name: "_reserveUSDC", type: "uint256" },
            { name: "_reserveEURC", type: "uint256" },
        ],
    },
    {
        name: "getPrice",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "price", type: "uint256" }],
    },
    {
        name: "getAmountOut",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "tokenIn", type: "address" },
            { name: "amountIn", type: "uint256" },
        ],
        outputs: [{ name: "amountOut", type: "uint256" }],
    },
    {
        name: "MINIMUM_LIQUIDITY",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint256" }],
    },
    // Write functions
    {
        name: "swap",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "tokenIn", type: "address" },
            { name: "amountIn", type: "uint256" },
            { name: "minAmountOut", type: "uint256" },
        ],
        outputs: [{ name: "amountOut", type: "uint256" }],
    },
    {
        name: "addLiquidity",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "amountUSDC", type: "uint256" },
            { name: "amountEURC", type: "uint256" },
        ],
        outputs: [{ name: "lpTokens", type: "uint256" }],
    },
    {
        name: "removeLiquidity",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "lpTokenAmount", type: "uint256" }],
        outputs: [
            { name: "amountUSDC", type: "uint256" },
            { name: "amountEURC", type: "uint256" },
        ],
    },
    // Events
    {
        name: "Swap",
        type: "event",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "tokenIn", type: "address", indexed: true },
            { name: "tokenOut", type: "address", indexed: true },
            { name: "amountIn", type: "uint256", indexed: false },
            { name: "amountOut", type: "uint256", indexed: false },
        ],
    },
    {
        name: "LiquidityAdded",
        type: "event",
        inputs: [
            { name: "provider", type: "address", indexed: true },
            { name: "amountUSDC", type: "uint256", indexed: false },
            { name: "amountEURC", type: "uint256", indexed: false },
            { name: "lpTokensMinted", type: "uint256", indexed: false },
        ],
    },
    {
        name: "LiquidityRemoved",
        type: "event",
        inputs: [
            { name: "provider", type: "address", indexed: true },
            { name: "amountUSDC", type: "uint256", indexed: false },
            { name: "amountEURC", type: "uint256", indexed: false },
            { name: "lpTokensBurned", type: "uint256", indexed: false },
        ],
    },
] as const
