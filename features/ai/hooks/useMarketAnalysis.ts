'use client'

import { useState, useCallback, useEffect } from 'react'
import type { MarketAnalysis } from '@/features/ai/lib/types'

const REFRESH_MS = 5 * 60 * 1000 // 5 min

interface UseMarketAnalysisReturn {
  analysis: MarketAnalysis | null
  loading: boolean
  error: string | null
  lastUpdate: number | null
  refresh: () => Promise<void>
}

export function useMarketAnalysis(
  poolsData: unknown[] | undefined,
  autoRefresh = true
): UseMarketAnalysisReturn {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number | null>(null)

  const refresh = useCallback(async () => {
    if (!poolsData?.length) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolsData }),
        signal: AbortSignal.timeout(30000),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`)
      setAnalysis(data as MarketAnalysis)
      setLastUpdate(Date.now())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao analisar mercado')
    } finally {
      setLoading(false)
    }
  }, [poolsData])

  useEffect(() => {
    if (!poolsData?.length || !autoRefresh) return
    refresh()
    const t = setInterval(refresh, REFRESH_MS)
    return () => clearInterval(t)
  }, [refresh, poolsData?.length, autoRefresh])

  return { analysis, loading, error, lastUpdate, refresh }
}
