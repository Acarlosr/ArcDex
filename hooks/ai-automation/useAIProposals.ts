'use client'

import { useAccount } from 'wagmi'
import { useState, useCallback } from 'react'

export interface AutomationProposal {
  action: 'swap' | 'stake' | 'bridge' | 'harvest'
  description: string
  reason: string
  sourceToken?: string
  targetToken?: string
  amount?: string
  riskScore: number
  estimatedBenefit: string
  estimatedGasSpend: string
  confidence: number
}

export interface AnalysisContext {
  usdcBalance: string
  eurcBalance: string
  stakingAPY: number
  bridgeOpportunity: boolean
  volatility: number
}

export function useAIProposals() {
  const { address } = useAccount()
  const [proposals, setProposals] = useState<AutomationProposal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState(0)

  const generateProposals = useCallback(
    async (context: AnalysisContext) => {
      if (!address) {
        setError('Wallet not connected')
        return []
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/ai/automation/propose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            analysisContext: context,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate proposals')
        }

        const data = await response.json()
        setProposals(data.proposals || [])
        setLastAnalyzedAt(Date.now())
        return data.proposals || []
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setProposals([])
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [address]
  )

  const clearProposals = useCallback(() => {
    setProposals([])
  }, [])

  return {
    proposals,
    isLoading,
    error,
    lastAnalyzedAt,
    generateProposals,
    clearProposals,
  }
}
