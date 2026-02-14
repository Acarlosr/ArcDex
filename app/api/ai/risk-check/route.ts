import { NextRequest, NextResponse } from 'next/server'
import { aiClient } from '@/features/ai/lib/ai-client'
import { SYSTEM_PROMPT, createRiskCheckPrompt } from '@/features/ai/lib/prompts'
import { aiCache, generateCacheKey } from '@/features/ai/lib/cache'
import type { RiskAnalysis } from '@/features/ai/lib/types'

export const runtime = 'edge'

const CACHE_TTL = 120

function parseJSON<T>(raw: string): T {
  let text = raw.trim()
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) text = codeBlock[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}') + 1
  if (start < 0 || end <= start) throw new Error('JSON não encontrado')
  text = text.slice(start, end)
  return JSON.parse(text) as T
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tokenAddress, tokenSymbol, amount, liquidityUSD } = body as {
      tokenAddress: string
      tokenSymbol: string
      amount: string
      liquidityUSD?: string
    }

    if (!tokenAddress || !tokenSymbol) {
      return NextResponse.json({ error: 'tokenAddress e tokenSymbol são obrigatórios' }, { status: 400 })
    }

    const key = generateCacheKey('risk', tokenSymbol, amount, liquidityUSD ?? '')
    const cached = aiCache.get<RiskAnalysis>(key)
    if (cached) return NextResponse.json(cached)

    const prompt = createRiskCheckPrompt(tokenAddress, tokenSymbol, amount ?? '0', liquidityUSD)
    const content = await aiClient.chat([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ])

    const analysis = parseJSON<RiskAnalysis>(content)
    if (typeof analysis.riskScore !== 'number') analysis.riskScore = 5
    if (!analysis.riskLevel) analysis.riskLevel = 'medium'
    if (!Array.isArray(analysis.risks)) analysis.risks = []
    if (!Array.isArray(analysis.warnings)) analysis.warnings = []
    if (!analysis.recommendation) analysis.recommendation = 'proceed_with_caution'
    if (analysis.estimatedSlippage == null) analysis.estimatedSlippage = 'N/A'
    if (analysis.safeAmount == null) analysis.safeAmount = amount ?? ''

    aiCache.set(key, analysis, CACHE_TTL)
    return NextResponse.json(analysis)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro na análise de risco'
    console.error('[AI Risk Check]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
