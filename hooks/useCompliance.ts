'use client'

import { useState, useCallback, useRef } from 'react'
import { useAccount } from 'wagmi'

export interface ComplianceResult {
  address: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'extreme'
  isBlocked: boolean
  details: string[]
  checkedAt: number
  cached?: boolean
}

const localCache = new Map<string, { result: ComplianceResult; expiresAt: number }>()
const LOCAL_CACHE_TTL = 3 * 60 * 1000 // 3 minutes

export function useCompliance() {
  const { address } = useAccount()
  const [result, setResult] = useState<ComplianceResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pendingRef = useRef(false)

  const checkCompliance = useCallback(async (targetAddress?: string): Promise<ComplianceResult> => {
    const addr = targetAddress || address
    if (!addr) throw new Error('No address to check')

    const normalized = addr.toLowerCase()

    // Check local cache first
    const cached = localCache.get(normalized)
    if (cached && cached.expiresAt > Date.now()) {
      setResult(cached.result)
      return cached.result
    }

    // Prevent duplicate concurrent requests
    if (pendingRef.current) {
      const cachedFallback = localCache.get(normalized)
      return cachedFallback?.result || { address: normalized, riskScore: 0, riskLevel: 'low', isBlocked: false, details: [], checkedAt: Date.now() }
    }

    pendingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr }),
      })

      if (!response.ok) {
        throw new Error(`Screening failed: ${response.status}`)
      }

      const data: ComplianceResult = await response.json()
      setResult(data)

      // Cache locally
      localCache.set(normalized, { result: data, expiresAt: Date.now() + LOCAL_CACHE_TTL })

      return data
    } catch (err: any) {
      const errMsg = err?.message || 'Compliance check failed'
      setError(errMsg)
      // Return safe default on error (don't block transactions if screening fails)
      const fallback: ComplianceResult = {
        address: normalized,
        riskScore: -1,
        riskLevel: 'low',
        isBlocked: false,
        details: ['Screening temporarily unavailable'],
        checkedAt: Date.now(),
      }
      setResult(fallback)
      return fallback
    } finally {
      setLoading(false)
      pendingRef.current = false
    }
  }, [address])

  // Pre-check before a transaction (returns true if allowed)
  const preTransactionCheck = useCallback(async (targetAddress?: string): Promise<boolean> => {
    try {
      const screening = await checkCompliance(targetAddress)
      return !screening.isBlocked
    } catch {
      // If screening fails, allow transaction (fail-open for UX on testnet)
      return true
    }
  }, [checkCompliance])

  const isVerified = result !== null && !result.isBlocked && result.riskScore >= 0
  const isBlocked = result !== null && result.isBlocked

  return {
    result,
    loading,
    error,
    checkCompliance,
    preTransactionCheck,
    isVerified,
    isBlocked,
  }
}
