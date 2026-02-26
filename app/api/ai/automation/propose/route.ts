import { NextRequest, NextResponse } from 'next/server'

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
    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      console.error('GROQ_API_KEY not configured')
      return []
    }

    const systemPrompt = `You are an AI advisor for DeFi trading on Arc Network. Analyze user wallet and market conditions to propose optimized trading actions. Return ONLY a valid JSON array of proposals.`

    const userPrompt = `Wallet: ${walletAddress}
    USDC: ${analysisContext.usdcBalance}, EURC: ${analysisContext.eurcBalance}
    Staking APY: ${analysisContext.stakingAPY}%, Volatility: ${analysisContext.volatility}/10
    Suggest 1-3 safe optimization actions. JSON array format with: action, description, reason, riskScore (1-10), estimatedBenefit, estimatedGasSpend, confidence (0-1).`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      console.error('Groq API error:', response.status)
      return []
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
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
