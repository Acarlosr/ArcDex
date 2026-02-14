/** Tipos do sistema de IA - DeFi Assistant */

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface MarketOpportunity {
  pool: string
  score: number
  apy: string
  reason: string
  risks: string[]
  recommendation: string
}

export interface MarketAnalysis {
  opportunities: MarketOpportunity[]
  warnings: string[]
  marketSentiment: 'bullish' | 'neutral' | 'bearish'
  summary: string
}

export interface RiskAnalysis {
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'extreme'
  risks: string[]
  warnings: string[]
  recommendation: 'safe' | 'proceed_with_caution' | 'not_recommended' | 'dangerous'
  estimatedSlippage: string
  safeAmount: string
}
