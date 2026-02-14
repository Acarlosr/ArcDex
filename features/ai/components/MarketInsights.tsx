'use client'

import { useState, useCallback, useEffect } from 'react'
import type { MarketAnalysis as MarketAnalysisType } from '@/features/ai/lib/types'

interface MarketInsightsProps {
  poolsData: unknown[]
}

const SENTIMENT_STYLE = {
  bullish: { emoji: '📈', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  neutral: { emoji: '➖', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  bearish: { emoji: '📉', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
}

export function MarketInsights({ poolsData }: MarketInsightsProps) {
  const [analysis, setAnalysis] = useState<MarketAnalysisType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!poolsData.length) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolsData }),
        signal: AbortSignal.timeout(30000),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? res.statusText)
      setAnalysis(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }, [poolsData])

  useEffect(() => {
    if (poolsData.length) refresh()
  }, [refresh, poolsData.length])

  if (loading && !analysis) {
    return (
      <div className="rounded-2xl bg-gray-900/80 border border-gray-800 p-6">
        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <div className="h-5 w-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <span>Analisando mercado...</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error && !analysis) {
    return (
      <div className="rounded-2xl bg-gray-900/80 border border-gray-800 p-6">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="rounded-2xl bg-gray-900/80 border border-gray-800 p-6 text-center text-gray-400 text-sm">
        Configure poolsData para ver a análise.
      </div>
    )
  }

  const sentiment = SENTIMENT_STYLE[analysis.marketSentiment]

  return (
    <div className="rounded-2xl bg-gray-900/80 border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Market Insights (IA)</h3>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span className="h-4 w-4 block border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            '🔄'
          )}
        </button>
      </div>

      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 ${sentiment.bg} ${sentiment.color}`}>
        <span>{sentiment.emoji}</span>
        <span className="font-medium capitalize">{analysis.marketSentiment}</span>
      </div>

      <p className="text-sm text-gray-400 mb-4">{analysis.summary}</p>

      {analysis.warnings.length > 0 && (
        <div className="mb-4 space-y-1">
          {analysis.warnings.map((w, i) => (
            <div key={i} className="text-amber-400/90 text-sm flex items-center gap-2">
              <span>⚠️</span> {w}
            </div>
          ))}
        </div>
      )}

      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Top oportunidades</h4>
      <div className="space-y-3">
        {analysis.opportunities.slice(0, 3).map((opp, i) => (
          <div
            key={i}
            className="p-3 rounded-xl bg-gray-800/80 border border-gray-700 hover:border-purple-500/30 transition-colors"
          >
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-200">{opp.pool}</span>
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Score {opp.score}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{opp.reason}</p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-cyan-400">APY {opp.apy}</span>
              {opp.risks.length > 0 && (
                <span className="text-amber-400/80">Riscos: {opp.risks.join(', ')}</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{opp.recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
