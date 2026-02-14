import { NextRequest, NextResponse } from 'next/server'
import { aiClient } from '@/features/ai/lib/ai-client'
import { SYSTEM_PROMPT, createMarketAnalysisPrompt } from '@/features/ai/lib/prompts'
import { aiCache, generateCacheKey } from '@/features/ai/lib/cache'
import type { MarketAnalysis } from '@/features/ai/lib/types'


const CACHE_TTL = 300

function parseJSON<T>(raw: string): T {
  let text = raw.trim()
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) text = codeBlock[1].trim()
  const start = Math.min(
    text.indexOf('{') >= 0 ? text.indexOf('{') : text.length,
    text.indexOf('[') >= 0 ? text.indexOf('[') : text.length
  )
  const end = Math.max(
    text.lastIndexOf('}') >= 0 ? text.lastIndexOf('}') + 1 : 0,
    text.lastIndexOf(']') >= 0 ? text.lastIndexOf(']') + 1 : 0
  )
  if (start >= end) throw new Error('JSON não encontrado na resposta')
  text = text.slice(start, end)
  return JSON.parse(text) as T
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { poolsData } = body as { poolsData: unknown[] }

    if (!poolsData || !Array.isArray(poolsData)) {
      return NextResponse.json({ error: 'poolsData[] é obrigatório' }, { status: 400 })
    }

    const key = generateCacheKey('analyze', JSON.stringify(poolsData).slice(0, 500))
    const cached = aiCache.get<MarketAnalysis>(key)
    if (cached) return NextResponse.json(cached)

    const prompt = createMarketAnalysisPrompt(poolsData)
    const content = await aiClient.chat([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ])

    const analysis = parseJSON<MarketAnalysis>(content)
    if (!analysis.opportunities || !Array.isArray(analysis.opportunities)) {
      analysis.opportunities = []
    }
    if (!analysis.warnings || !Array.isArray(analysis.warnings)) {
      analysis.warnings = []
    }
    if (!analysis.marketSentiment) {
      analysis.marketSentiment = 'neutral'
    }
    if (!analysis.summary) {
      analysis.summary = 'Análise concluída.'
    }

    aiCache.set(key, analysis, CACHE_TTL)
    return NextResponse.json(analysis)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao analisar'
    console.error('[AI Analyze]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
