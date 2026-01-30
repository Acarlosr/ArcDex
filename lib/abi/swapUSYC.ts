export const ARCDEX_SWAP_USYC_ABI = [
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
        name: "usyc",
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
        name: "reserveUSYC_USDC",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint256" }],
    },
    {
        name: "reserveUSYC_EURC",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint256" }],
    },
    {
        name: "getReservesUSDC_USYC",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [
            { name: "_reserveUSDC", type: "uint256" },
            { name: "_reserveUSYC", type: "uint256" },
        ],
    },
    {
        name: "getReservesEURC_USYC",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [
            { name: "_reserveEURC", type: "uint256" },
            { name: "_reserveUSYC", type: "uint256" },
        ],
    },
    {
        name: "getPriceUSDC_USYC",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "price", type: "uint256" }],
    },
    {
        name: "getPriceEURC_USYC",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "price", type: "uint256" }],
    },
    {
        name: "getAmountOutUSDC_USYC",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "tokenIn", type: "address" },
            { name: "amountIn", type: "uint256" },
        ],
        outputs: [{ name: "amountOut", type: "uint256" }],
    },
    {
        name: "getAmountOutEURC_USYC",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "tokenIn", type: "address" },
            { name: "amountIn", type: "uint256" },
        ],
        outputs: [{ name: "amountOut", type: "uint256" }],
    },
    {
        name: "poolLPSupply",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "pool", type: "uint8" }],
        outputs: [{ type: "uint256" }],
    },
    {
        name: "userPoolLP",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "user", type: "address" },
            { name: "pool", type: "uint8" },
        ],
        outputs: [{ type: "uint256" }],
    },
    // Write functions - USDC/USYC
    {
        name: "swapUSDC_USYC",
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
        name: "addLiquidityUSDC",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "amountUSDC", type: "uint256" },
            { name: "amountUSYC", type: "uint256" },
        ],
        outputs: [{ name: "lpTokens", type: "uint256" }],
    },
    {
        name: "removeLiquidityUSDC",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "lpTokenAmount", type: "uint256" }],
        outputs: [
            { name: "amountUSDC", type: "uint256" },
            { name: "amountUSYC", type: "uint256" },
        ],
    },
    // Write functions - EURC/USYC
    {
        name: "swapEURC_USYC",
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
        name: "addLiquidityEURC",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "amountEURC", type: "uint256" },
            { name: "amountUSYC", type: "uint256" },
        ],
        outputs: [{ name: "lpTokens", type: "uint256" }],
    },
    {
        name: "removeLiquidityEURC",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "lpTokenAmount", type: "uint256" }],
        outputs: [
            { name: "amountEURC", type: "uint256" },
            { name: "amountUSYC", type: "uint256" },
        ],
    },
    // Events
    {
        name: "Swap",
        type: "event",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "pool", type: "uint8", indexed: true },
            { name: "tokenIn", type: "address", indexed: true },
            { name: "tokenOut", type: "address", indexed: false },
            { name: "amountIn", type: "uint256", indexed: false },
            { name: "amountOut", type: "uint256", indexed: false },
        ],
    },
    {
        name: "LiquidityAdded",
        type: "event",
        inputs: [
            { name: "provider", type: "address", indexed: true },
            { name: "pool", type: "uint8", indexed: true },
            { name: "amountToken", type: "uint256", indexed: false },
            { name: "amountUSYC", type: "uint256", indexed: false },
            { name: "lpTokensMinted", type: "uint256", indexed: false },
        ],
    },
    {
        name: "LiquidityRemoved",
        type: "event",
        inputs: [
            { name: "provider", type: "address", indexed: true },
            { name: "pool", type: "uint8", indexed: true },
            { name: "amountToken", type: "uint256", indexed: false },
            { name: "amountUSYC", type: "uint256", indexed: false },
            { name: "lpTokensBurned", type: "uint256", indexed: false },
        ],
    },
] as const
