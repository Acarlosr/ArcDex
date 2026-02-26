import { NextRequest, NextResponse } from 'next/server'
import { aiClient } from '@/lib/ai/ai-client'

export const runtime = 'nodejs'

interface AutomationProposal {
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

async function generateProposal(
  walletAddress: string,
  analysisContext: {
    usdcBalance: string
    eurcBalance: string
    stakingAPY: number
    bridgeOpportunity: boolean
    volatility: number
  }
): Promise<AutomationProposal[]> {
  try {
    const systemPrompt = `You are an AI advisor for DeFi trading on Arc Network. Analyze user wallet and market conditions to propose optimized trading actions. Return ONLY a valid JSON array of proposals.`

    const userPrompt = `Wallet: ${walletAddress}
    USDC: ${analysisContext.usdcBalance}, EURC: ${analysisContext.eurcBalance}
    Staking APY: ${analysisContext.stakingAPY}%, Volatility: ${analysisContext.volatility}/10
    Suggest 1-3 safe optimization actions. JSON array format with: action, description, reason, riskScore (1-10), estimatedBenefit, estimatedGasSpend, confidence (0-1).`

    const aiResponse = await aiClient.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])

    const content = aiResponse.content
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []

    const proposals = JSON.parse(jsonMatch[0]) as AutomationProposal[]
    return proposals.slice(0, 3)
  } catch (error) {
    console.error('Failed to generate proposals:', error)
    return []
  }
}

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, analysisContext } = await req.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    const proposals = await generateProposal(walletAddress, analysisContext || {})

    return NextResponse.json({
      success: true,
      proposals,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('AI automation API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate proposals' },
      { status: 500 }
    )
  }
}
