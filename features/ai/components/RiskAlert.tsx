'use client'

import { useState, useEffect } from 'react'
import type { RiskAnalysis } from '@/features/ai/lib/types'

interface RiskAlertProps {
  tokenAddress: string
  tokenSymbol: string
  amount: string
  liquidityUSD?: string
  onProceed?: () => void
  onCancel?: () => void
}

const LEVEL_STYLE: Record<RiskAnalysis['riskLevel'], string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/40',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  extreme: 'bg-red-500/20 text-red-400 border-red-500/40',
}

const RECOMMENDATION_LABEL: Record<RiskAnalysis['recommendation'], string> = {
  safe: 'Seguro',
  proceed_with_caution: 'Cautela',
  not_recommended: 'Não recomendado',
  dangerous: 'Perigoso',
}

export function RiskAlert({
  tokenAddress,
  tokenSymbol,
  amount,
  liquidityUSD,
  onProceed,
  onCancel,
}: RiskAlertProps) {
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!amount || parseFloat(amount) <= 0) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetch('/api/ai/risk-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenAddress,
        tokenSymbol,
        amount,
        liquidityUSD,
      }),
      signal: AbortSignal.timeout(20000),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.riskScore != null) setAnalysis(data as RiskAnalysis)
        else if (!cancelled && data.error) setError(data.error)
      })
      .catch((err) => !cancelled && setError(err?.message ?? 'Erro na análise'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [tokenAddress, tokenSymbol, amount, liquidityUSD])

  if (loading) {
    return (
      <div className="rounded-xl bg-gray-800/80 border border-gray-700 p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-2/3 mb-3" />
        <div className="h-3 bg-gray-700 rounded w-full mb-2" />
        <div className="h-3 bg-gray-700 rounded w-4/5" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
        Erro ao analisar risco: {error}
      </div>
    )
  }

  if (!analysis) return null

  const levelStyle = LEVEL_STYLE[analysis.riskLevel]
  const recLabel = RECOMMENDATION_LABEL[analysis.recommendation]

  return (
    <div className={`rounded-xl border p-4 ${levelStyle}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold">Risco: {analysis.riskLevel.toUpperCase()}</span>
        <span className="text-sm opacity-90">Score {analysis.riskScore}/10</span>
      </div>
      <div className="text-sm opacity-90 mb-2">
        Recomendação: <strong>{recLabel}</strong>
      </div>
      {analysis.estimatedSlippage && (
        <p className="text-xs opacity-80 mb-2">Slippage estimado: {analysis.estimatedSlippage}</p>
      )}
      {analysis.safeAmount && analysis.safeAmount !== amount && (
        <p className="text-xs opacity-80 mb-2">Valor mais seguro sugerido: {analysis.safeAmount}</p>
      )}
      {analysis.risks.length > 0 && (
        <ul className="text-xs list-disc list-inside mb-2 space-y-0.5">
          {analysis.risks.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
      {analysis.warnings.length > 0 && (
        <ul className="text-xs list-disc list-inside mb-3 text-amber-300">
          {analysis.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        {analysis.recommendation !== 'not_recommended' && analysis.recommendation !== 'dangerous' && onProceed && (
          <button
            type="button"
            onClick={onProceed}
            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
          >
            Prosseguir
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  )
}
