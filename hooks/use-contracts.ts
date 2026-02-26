'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { ARCDEX, TOKENS, parseTokenAmount, formatTokenAmount } from '@/lib/contracts'
import { ERC20_ABI, ARCDEX_SWAP_ABI, ARCDEX_STAKING_ABI, ARCDEX_PAYMENTS_ABI } from '@/lib/abi'
import { useState, useEffect } from 'react'
import { sepolia } from 'viem/chains'
import { createPublicClient, http } from 'viem'

// ============================================================================
// TOKEN HOOKS
// ============================================================================

export function useTokenBalance(token: 'USDC' | 'EURC' | 'USYC') {
    const { address } = useAccount()
    const tokenAddress = TOKENS[token]

    const { data, isLoading, refetch } = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    })

    return {
        balance: data as bigint | undefined,
        formatted: data ? formatTokenAmount(data as bigint) : '0.00',
        isLoading,
        refetch,
    }
}

export function useTokenAllowance(token: 'USDC' | 'EURC', spender: string) {
    const { address } = useAccount()
    const tokenAddress = TOKENS[token]

    const { data, isLoading, refetch } = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address && spender ? [address, spender as `0x${string}`] : undefined,
        query: {
            enabled: !!address && !!spender,
        },
    })

    return {
        allowance: data as bigint | undefined,
        isLoading,
        refetch,
    }
}

export function useApprove() {
    const { writeContract, writeContractAsync, data: hash, isPending, error, reset } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const approve = async (token: 'USDC' | 'EURC', spender: string, amount: string) => {
        const tokenAddress = TOKENS[token]
        const parsedAmount = parseTokenAmount(amount)

        // Use writeContractAsync so caller can await + catch errors
        return writeContractAsync({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [spender as `0x${string}`, parsedAmount],
        })
    }

    return {
        approve,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
        reset,
    }
}

// ============================================================================
// SWAP HOOKS
// ============================================================================

export function useSwapReserves() {
    const { data, isLoading, refetch } = useReadContract({
        address: ARCDEX.Swap as `0x${string}`,
        abi: ARCDEX_SWAP_ABI,
        functionName: 'getReserves',
    })

    const reserves = data as [bigint, bigint] | undefined

    return {
        reserveUSDC: reserves?.[0],
        reserveEURC: reserves?.[1],
        formattedUSDC: reserves?.[0] ? formatTokenAmount(reserves[0]) : '0.00',
        formattedEURC: reserves?.[1] ? formatTokenAmount(reserves[1]) : '0.00',
        isLoading,
        refetch,
    }
}

export function useGetAmountOut(tokenIn: 'USDC' | 'EURC', amountIn: string) {
    const tokenAddress = TOKENS[tokenIn]
    const parsedAmount = amountIn ? parseTokenAmount(amountIn) : BigInt(0)

    const { data, isLoading } = useReadContract({
        address: ARCDEX.Swap as `0x${string}`,
        abi: ARCDEX_SWAP_ABI,
        functionName: 'getAmountOut',
        args: [tokenAddress as `0x${string}`, parsedAmount],
        query: {
            enabled: parsedAmount > BigInt(0),
        },
    })

    return {
        amountOut: data as bigint | undefined,
        formatted: data ? formatTokenAmount(data as bigint) : '0.00',
        isLoading,
    }
}

export function useSwap() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const swap = async (tokenIn: 'USDC' | 'EURC', amountIn: string, minAmountOut: string) => {
        const tokenAddress = TOKENS[tokenIn]
        const parsedAmountIn = parseTokenAmount(amountIn)
        const parsedMinOut = parseTokenAmount(minAmountOut)

        writeContract({
            address: ARCDEX.Swap as `0x${string}`,
            abi: ARCDEX_SWAP_ABI,
            functionName: 'swap',
            args: [tokenAddress as `0x${string}`, parsedAmountIn, parsedMinOut],
        })
    }

    return {
        swap,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    }
}

export function useAddLiquidity() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const addLiquidity = async (amountUSDC: string, amountEURC: string) => {
        const parsedUSDC = parseTokenAmount(amountUSDC)
        const parsedEURC = parseTokenAmount(amountEURC)

        writeContract({
            address: ARCDEX.Swap as `0x${string}`,
            abi: ARCDEX_SWAP_ABI,
            functionName: 'addLiquidity',
            args: [parsedUSDC, parsedEURC],
        })
    }

    return {
        addLiquidity,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    }
}

export function useRemoveLiquidity() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const removeLiquidity = async (lpTokenAmount: string) => {
        const parsedAmount = parseTokenAmount(lpTokenAmount)

        writeContract({
            address: ARCDEX.Swap as `0x${string}`,
            abi: ARCDEX_SWAP_ABI,
            functionName: 'removeLiquidity',
            args: [parsedAmount],
        })
    }

    return {
        removeLiquidity,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    }
}

// ============================================================================
// STAKING HOOKS
// ============================================================================

export function useStakedBalance(token: 'USDC' | 'EURC') {
    const { address } = useAccount()
    const tokenAddress = TOKENS[token]

    const { data, isLoading, refetch } = useReadContract({
        address: ARCDEX.Staking as `0x${string}`,
        abi: ARCDEX_STAKING_ABI,
        functionName: 'getStakedBalance',
        args: address ? [address, tokenAddress as `0x${string}`] : undefined,
        query: {
            enabled: !!address,
        },
    })

    return {
        balance: data as bigint | undefined,
        formatted: data ? formatTokenAmount(data as bigint) : '0.00',
        isLoading,
        refetch,
    }
}

export function usePendingRewards(token: 'USDC' | 'EURC') {
    const { address } = useAccount()
    const tokenAddress = TOKENS[token]

    const { data, isLoading, refetch } = useReadContract({
        address: ARCDEX.Staking as `0x${string}`,
        abi: ARCDEX_STAKING_ABI,
        functionName: 'getPendingRewards',
        args: address ? [address, tokenAddress as `0x${string}`] : undefined,
        query: {
            enabled: !!address,
        },
    })

    return {
        rewards: data as bigint | undefined,
        formatted: data ? formatTokenAmount(data as bigint) : '0.00',
        isLoading,
        refetch,
    }
}

export function useAPR(token: 'USDC' | 'EURC') {
    const tokenAddress = TOKENS[token]

    const { data, isLoading } = useReadContract({
        address: ARCDEX.Staking as `0x${string}`,
        abi: ARCDEX_STAKING_ABI,
        functionName: 'getAPR',
        args: [tokenAddress as `0x${string}`],
    })

    const aprData = data as [bigint, bigint, bigint] | undefined

    return {
        baseAPR: aprData ? Number(aprData[0]) / 100 : 0,
        boostAPR: aprData ? Number(aprData[1]) / 100 : 0,
        totalAPR: aprData ? Number(aprData[2]) / 100 : 0,
        isLoading,
    }
}

export function useTotalStaked(token: 'USDC' | 'EURC') {
    const tokenAddress = TOKENS[token]

    const { data, isLoading, refetch } = useReadContract({
        address: ARCDEX.Staking as `0x${string}`,
        abi: ARCDEX_STAKING_ABI,
        functionName: 'totalStaked',
        args: [tokenAddress as `0x${string}`],
    })

    return {
        total: data as bigint | undefined,
        formatted: data ? formatTokenAmount(data as bigint) : '0.00',
        isLoading,
        refetch,
    }
}

export function useStake() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const stake = async (token: 'USDC' | 'EURC', amount: string) => {
        const tokenAddress = TOKENS[token]
        const parsedAmount = parseTokenAmount(amount)

        writeContract({
            address: ARCDEX.Staking as `0x${string}`,
            abi: ARCDEX_STAKING_ABI,
            functionName: 'stake',
            args: [tokenAddress as `0x${string}`, parsedAmount],
        })
    }

    return {
        stake,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    }
}

export function useUnstake() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const unstake = async (token: 'USDC' | 'EURC', amount: string) => {
        const tokenAddress = TOKENS[token]
        const parsedAmount = parseTokenAmount(amount)

        writeContract({
            address: ARCDEX.Staking as `0x${string}`,
            abi: ARCDEX_STAKING_ABI,
            functionName: 'unstake',
            args: [tokenAddress as `0x${string}`, parsedAmount],
        })
    }

    return {
        unstake,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    }
}

export function useClaimRewards() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const claimRewards = async (token: 'USDC' | 'EURC') => {
        const tokenAddress = TOKENS[token]

        writeContract({
            address: ARCDEX.Staking as `0x${string}`,
            abi: ARCDEX_STAKING_ABI,
            functionName: 'claimRewards',
            args: [tokenAddress as `0x${string}`],
        })
    }

    const claimAllRewards = async () => {
        writeContract({
            address: ARCDEX.Staking as `0x${string}`,
            abi: ARCDEX_STAKING_ABI,
            functionName: 'claimAllRewards',
            args: [],
        })
    }

    return {
        claimRewards,
        claimAllRewards,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    }
}

// ============================================================================
// PAYMENTS HOOKS
// ============================================================================

export function usePaymentFee() {
    const { data, isLoading } = useReadContract({
        address: ARCDEX.Payments as `0x${string}`,
        abi: ARCDEX_PAYMENTS_ABI,
        functionName: 'paymentFee',
    })

    return {
        fee: data as bigint | undefined,
        formatted: data ? formatTokenAmount(data as bigint) : '0.05',
        isLoading,
    }
}

export function useSendPayment() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const sendPayment = async (
        token: 'USDC' | 'EURC',
        recipient: string,
        amount: string,
        memo: string = ''
    ) => {
        const tokenAddress = TOKENS[token]
        const parsedAmount = parseTokenAmount(amount)

        writeContract({
            address: ARCDEX.Payments as `0x${string}`,
            abi: ARCDEX_PAYMENTS_ABI,
            functionName: 'sendPayment',
            args: [tokenAddress as `0x${string}`, recipient as `0x${string}`, parsedAmount, memo],
        })
    }

    const sendExactPayment = async (
        token: 'USDC' | 'EURC',
        recipient: string,
        amount: string,
        memo: string = ''
    ) => {
        const tokenAddress = TOKENS[token]
        const parsedAmount = parseTokenAmount(amount)

        writeContract({
            address: ARCDEX.Payments as `0x${string}`,
            abi: ARCDEX_PAYMENTS_ABI,
            functionName: 'sendExactPayment',
            args: [tokenAddress as `0x${string}`, recipient as `0x${string}`, parsedAmount, memo],
        })
    }

    return {
        sendPayment,
        sendExactPayment,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    }
}

export function useBatchPayment() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const batchPayment = async (
        token: 'USDC' | 'EURC',
        recipients: string[],
        amounts: string[]
    ) => {
        const tokenAddress = TOKENS[token]
        const parsedAmounts = amounts.map(a => parseTokenAmount(a))

        writeContract({
            address: ARCDEX.Payments as `0x${string}`,
            abi: ARCDEX_PAYMENTS_ABI,
            functionName: 'batchPayment',
            args: [
                tokenAddress as `0x${string}`,
                recipients.map(r => r as `0x${string}`),
                parsedAmounts,
            ],
        })
    }

    return {
        batchPayment,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    }
}

export function usePaymentStats() {
    const { address } = useAccount()

    const { data: totalPayments, isLoading: totalLoading } = useReadContract({
        address: ARCDEX.Payments as `0x${string}`,
        abi: ARCDEX_PAYMENTS_ABI,
        functionName: 'totalPayments',
    })

    const { data: userCount, isLoading: userLoading } = useReadContract({
        address: ARCDEX.Payments as `0x${string}`,
        abi: ARCDEX_PAYMENTS_ABI,
        functionName: 'userPaymentCount',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    return {
        totalPayments: totalPayments as bigint | undefined,
        userPaymentCount: userCount as bigint | undefined,
        isLoading: totalLoading || userLoading,
    }
}

// ============================================================================
// LP TOKEN HOOKS
// ============================================================================

export function useLPBalance() {
    const { address } = useAccount()

    const { data, isLoading, refetch } = useReadContract({
        address: ARCDEX.LP as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    })

    return {
        balance: data as bigint | undefined,
        formatted: data ? formatTokenAmount(data as bigint) : '0.00',
        isLoading,
        refetch,
    }
}

export function useLPTotalSupply() {
    const { data, isLoading, refetch } = useReadContract({
        address: ARCDEX.LP as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
    })

    return {
        totalSupply: data as bigint | undefined,
        formatted: data ? formatTokenAmount(data as bigint) : '0.00',
        isLoading,
        refetch,
    }
}

// ============================================================================
// BRIDGE HOOKS - Cross-chain balance checking
// ============================================================================

// Hook to fetch USDC balance on both Sepolia and Arc
export function useBridgeBalances() {
    const { address } = useAccount()
    const publicClient = usePublicClient()
    const [sepoliaBalance, setSepoliaBalance] = useState<bigint | null>(null)
    const [arcBalance, setArcBalance] = useState<bigint | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!address) {
            setSepoliaBalance(null)
            setArcBalance(null)
            setIsLoading(false)
            return
        }

        const fetchBalances = async () => {
            setIsLoading(true)
            try {
                // Fetch Sepolia balance
                const sepoliaClient = createPublicClient({
                    chain: sepolia,
                    transport: http(),
                })
                const sepBal = await sepoliaClient.readContract({
                    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: 'balanceOf',
                    args: [address as `0x${string}`],
                }) as bigint
                setSepoliaBalance(sepBal)

                // Fetch Arc balance (use publicClient from wagmi which is Arc)
                if (publicClient) {
                    const arcBal = await publicClient.readContract({
                        address: TOKENS.USDC as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: 'balanceOf',
                        args: [address as `0x${string}`],
                    }) as bigint
                    setArcBalance(arcBal)
                }
            } catch (error) {
                console.error('Failed to fetch bridge balances:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBalances()
    }, [address, publicClient])

    return {
        sepoliaBalance: sepoliaBalance ? formatTokenAmount(sepoliaBalance) : '0.00',
        arcBalance: arcBalance ? formatTokenAmount(arcBalance) : '0.00',
        sepoliaBalanceRaw: sepoliaBalance,
        arcBalanceRaw: arcBalance,
        isLoading,
    }
}
