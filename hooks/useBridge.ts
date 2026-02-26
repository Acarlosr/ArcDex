'use client'

import { useState, useCallback } from 'react'
import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { parseUnits, pad } from 'viem'

// CCTP v2 Domain IDs
export const CCTP_DOMAINS = {
  ETHEREUM: 0,
  AVALANCHE: 1,
  OPTIMISM: 2,
  ARBITRUM: 3,
  BASE: 6,
  POLYGON: 7,
  SEPOLIA: 0, // Sepolia uses domain 0 on testnet
  ARC_TESTNET: 26,
} as const

// CCTP v2 Testnet contract addresses (Sepolia as source)
const SEPOLIA_CCTP = {
  // Official CCTP v2 TokenMessenger on Ethereum Sepolia
  TokenMessengerV2: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA' as const,
  USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as const,
}

// Arc Testnet CCTP (destination)
const ARC_CCTP = {
  TokenMessengerV2: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA' as const,
  MessageTransmitterV2: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275' as const,
  USDC: '0x3600000000000000000000000000000000000000' as const,
}

// Circle Attestation API
const CIRCLE_API_BASE = 'https://iris-api-sandbox.circle.com'

// Finality thresholds for CCTP v2
const FINALITY = {
  FAST: 1000,
  STANDARD: 2000,
} as const

// TokenMessengerV2 ABI (depositForBurn)
const TOKEN_MESSENGER_V2_ABI = [
  {
    name: 'depositForBurn',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'mintRecipient', type: 'bytes32' },
      { name: 'burnToken', type: 'address' },
      { name: 'destinationCaller', type: 'bytes32' },
      { name: 'maxFee', type: 'uint256' },
      { name: 'minFinalityThreshold', type: 'uint32' },
    ],
    outputs: [],
  },
  {
    name: 'getMinFeeAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'destinationDomain', type: 'uint32' }],
    outputs: [{ name: 'minFee', type: 'uint256' }],
  },
] as const

// MessageTransmitterV2 ABI (receiveMessage)
const MESSAGE_TRANSMITTER_V2_ABI = [
  {
    name: 'receiveMessage',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'message', type: 'bytes' },
      { name: 'attestation', type: 'bytes' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
] as const

// ERC20 approve ABI
const ERC20_APPROVE_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export type BridgeDirection = 'to-arc' | 'from-arc'
export type TransferSpeed = 'FAST' | 'STANDARD'

export interface BridgeState {
  step: 'idle' | 'approving' | 'burning' | 'waiting-attestation' | 'claiming' | 'complete' | 'error'
  burnTxHash: string | null
  claimTxHash: string | null
  attestation: string | null
  message: string | null
  error: string | null
  progress: number
}

export function useBridge() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const [state, setState] = useState<BridgeState>({
    step: 'idle',
    burnTxHash: null,
    claimTxHash: null,
    attestation: null,
    message: null,
    error: null,
    progress: 0,
  })

  const reset = useCallback(() => {
    setState({
      step: 'idle',
      burnTxHash: null,
      claimTxHash: null,
      attestation: null,
      message: null,
      error: null,
      progress: 0,
    })
  }, [])

  // Convert address to bytes32 for CCTP
  const addressToBytes32 = (addr: string): `0x${string}` => {
    return pad(addr as `0x${string}`, { size: 32 })
  }

  // Poll Circle attestation API (CCTP v2 workflow)
  const pollAttestation = async (
    sourceDomain: number,
    txHash: string,
    maxAttempts = 60,
    interval = 5000
  ): Promise<{ message: string; attestation: string }> => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const resp = await fetch(
          `${CIRCLE_API_BASE}/v2/messages/${sourceDomain}?transactionHash=${txHash}`
        )
        if (resp.ok) {
          const data = await resp.json()
          if (data.messages && data.messages.length > 0) {
            const msg = data.messages[0]
            if (msg.status === 'complete' && msg.attestation) {
              return { message: msg.message, attestation: msg.attestation }
            }
          }
        }
      } catch {
        // Retry on network errors
      }
      await new Promise(r => setTimeout(r, interval))
    }
    throw new Error('Attestation timeout - please try again later')
  }

  // Bridge USDC from Sepolia to Arc Testnet
  const bridgeToArc = async (
    amount: string,
    speed: TransferSpeed = 'STANDARD'
  ) => {
    if (!address) throw new Error('Wallet not connected')
    if (!publicClient) throw new Error('Public client not ready')

    const parsedAmount = parseUnits(amount, 6)
    const mintRecipient = addressToBytes32(address)
    const zeroCaller = '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`

    try {
      // Pre-flight: verify destination domain is supported on source TokenMessengerV2.
      // If this call reverts, the route is not enabled and depositForBurn would fail anyway.
      let standardMinFee = BigInt(0)
      try {
        standardMinFee = await publicClient.readContract({
          address: SEPOLIA_CCTP.TokenMessengerV2,
          abi: TOKEN_MESSENGER_V2_ABI,
          functionName: 'getMinFeeAmount',
          args: [CCTP_DOMAINS.ARC_TESTNET],
        })
      } catch {
        // Some TokenMessenger deployments may not expose getMinFeeAmount reliably.
        // In this case, fallback to zero for standard transfers and let depositForBurn validate.
        standardMinFee = BigInt(0)
      }

      // Step 1: Approve USDC on Sepolia for TokenMessengerV2
      setState(prev => ({ ...prev, step: 'approving', progress: 10, error: null }))

      await writeContractAsync({
        address: SEPOLIA_CCTP.USDC,
        abi: ERC20_APPROVE_ABI,
        functionName: 'approve',
        args: [SEPOLIA_CCTP.TokenMessengerV2, parsedAmount],
      })

      setState(prev => ({ ...prev, progress: 25 }))

      // Step 2: Call depositForBurn on Sepolia
      setState(prev => ({ ...prev, step: 'burning', progress: 30 }))

      const maxFee = speed === 'FAST' ? parseUnits('5', 6) : standardMinFee
      const threshold = speed === 'FAST' ? FINALITY.FAST : FINALITY.STANDARD

      const burnHash = await writeContractAsync({
        address: SEPOLIA_CCTP.TokenMessengerV2,
        abi: TOKEN_MESSENGER_V2_ABI,
        functionName: 'depositForBurn',
        args: [
          parsedAmount,
          CCTP_DOMAINS.ARC_TESTNET,
          mintRecipient,
          SEPOLIA_CCTP.USDC,
          zeroCaller,
          maxFee,
          threshold,
        ],
      })

      setState(prev => ({ ...prev, burnTxHash: burnHash, progress: 50 }))

      // Step 3: Poll for attestation
      setState(prev => ({ ...prev, step: 'waiting-attestation', progress: 55 }))

      const { message, attestation } = await pollAttestation(
        CCTP_DOMAINS.SEPOLIA,
        burnHash,
        120,
        3000
      )

      setState(prev => ({
        ...prev,
        attestation,
        message,
        progress: 80,
        step: 'claiming',
      }))

      // Step 4: Claim on Arc Testnet (receiveMessage)
      const claimHash = await writeContractAsync({
        address: ARC_CCTP.MessageTransmitterV2,
        abi: MESSAGE_TRANSMITTER_V2_ABI,
        functionName: 'receiveMessage',
        args: [message as `0x${string}`, attestation as `0x${string}`],
      })

      setState(prev => ({
        ...prev,
        claimTxHash: claimHash,
        step: 'complete',
        progress: 100,
      }))

      return { burnHash, claimHash }
    } catch (error: any) {
      const errMsg = error?.shortMessage || error?.message || 'Bridge failed'
      setState(prev => ({ ...prev, step: 'error', error: errMsg }))
      throw error
    }
  }

  // Bridge USDC from Arc Testnet back to Sepolia
  const bridgeFromArc = async (
    amount: string,
    speed: TransferSpeed = 'STANDARD'
  ) => {
    if (!address) throw new Error('Wallet not connected')
    if (!publicClient) throw new Error('Public client not ready')

    const parsedAmount = parseUnits(amount, 6)
    const mintRecipient = addressToBytes32(address)
    const zeroCaller = '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`

    try {
      let standardMinFee = BigInt(0)
      try {
        standardMinFee = await publicClient.readContract({
          address: ARC_CCTP.TokenMessengerV2,
          abi: TOKEN_MESSENGER_V2_ABI,
          functionName: 'getMinFeeAmount',
          args: [CCTP_DOMAINS.SEPOLIA],
        })
      } catch {
        // Fallback when min-fee introspection is unavailable on this deployment.
        standardMinFee = BigInt(0)
      }

      setState(prev => ({ ...prev, step: 'approving', progress: 10, error: null }))

      await writeContractAsync({
        address: ARC_CCTP.USDC,
        abi: ERC20_APPROVE_ABI,
        functionName: 'approve',
        args: [ARC_CCTP.TokenMessengerV2, parsedAmount],
      })

      setState(prev => ({ ...prev, step: 'burning', progress: 30 }))

      const maxFee = speed === 'FAST' ? parseUnits('5', 6) : standardMinFee
      const threshold = speed === 'FAST' ? FINALITY.FAST : FINALITY.STANDARD

      const burnHash = await writeContractAsync({
        address: ARC_CCTP.TokenMessengerV2,
        abi: TOKEN_MESSENGER_V2_ABI,
        functionName: 'depositForBurn',
        args: [
          parsedAmount,
          CCTP_DOMAINS.SEPOLIA,
          mintRecipient,
          ARC_CCTP.USDC,
          zeroCaller,
          maxFee,
          threshold,
        ],
      })

      setState(prev => ({ ...prev, burnTxHash: burnHash, step: 'waiting-attestation', progress: 55 }))

      const { message, attestation } = await pollAttestation(
        CCTP_DOMAINS.ARC_TESTNET,
        burnHash,
        120,
        3000
      )

      setState(prev => ({ ...prev, attestation, message, step: 'complete', progress: 100 }))

      // On Sepolia side, user would need to claim manually or use a forwarder
      // For testnet, we mark as complete after attestation
      return { burnHash, attestation, message }
    } catch (error: any) {
      const errMsg = error?.shortMessage || error?.message || 'Bridge failed'
      setState(prev => ({ ...prev, step: 'error', error: errMsg }))
      throw error
    }
  }

  return {
    state,
    bridgeToArc,
    bridgeFromArc,
    reset,
    isIdle: state.step === 'idle',
    isLoading: !['idle', 'complete', 'error'].includes(state.step),
    isComplete: state.step === 'complete',
    isError: state.step === 'error',
  }
}
