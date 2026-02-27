import { NextRequest, NextResponse } from 'next/server'
import { aiClient } from '@/lib/ai/ai-client'

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      )
    }

    // Detect if user asked for full explanation
    const lastUserMsg = (messages?.slice(-1)[0]?.content || '').toLowerCase().trim()
    const wantsFullAnswer =
      /^(yes|more|details|full|expand|explain more|complete|tell me more)$/.test(lastUserMsg) ||
      lastUserMsg.includes('more details') ||
      lastUserMsg.includes('full explanation') ||
      lastUserMsg.includes('full answer')

    const routeContext = typeof context?.route === 'string' ? context.route : ''
    const featureContext = Array.isArray(context?.features) ? context.features.join(', ') : ''
    const userWalletContext = typeof context?.wallet === 'string' ? context.wallet : ''

    const systemPrompt = wantsFullAnswer
      ? `You are ArcBot, a DeFi assistant for Arc Network.
Always respond in English.
The user requested MORE DETAILS: provide a complete, clear explanation.
Use bullets when helpful. Max 2 emojis.
Always mention risks when talking about investing, stake, pools, or payments.

dApp context (use when relevant):
- Active features: USDC/EURC swaps, pools, staking, payments (single/exact/batch), AML/CFT compliance.
- Current route: ${routeContext || 'not provided'}.
- Connected wallet: ${userWalletContext || 'not provided'}.
- UI-reported capabilities: ${featureContext || 'not provided'}.`
      : `You are ArcBot, a DeFi assistant for Arc Network.
Always respond in English.

SHORT ANSWER ONLY:
- Reply in at most 4 lines (brief summary). Max 2 emojis.
- Mention risk only if essential in the summary.

dApp context:
- Active features: USDC/EURC swaps, pools, staking, payments (single/exact/batch), AML/CFT compliance.
- Current route: ${routeContext || 'not provided'}.
- Connected wallet: ${userWalletContext || 'not provided'}.
- UI-reported capabilities: ${featureContext || 'not provided'}.

AT THE END OF EVERY SHORT ANSWER, add EXACTLY this line:
📌 Want the full explanation? Reply **yes** or **more**.

If the user already said "yes" or "more", ignore the short-answer rule and provide the full version.`

    const messagesWithSystem = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ]

    // Use Universal AI Client (OpenRouter by default, with fallbacks)
    const aiResponse = await aiClient.chat(messagesWithSystem)

    return NextResponse.json({
      content: aiResponse.content,
      provider: aiResponse.provider,
      model: aiResponse.model,
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      {
        error: 'Error processing message',
        message: 'Sorry, something went wrong. Try again.',
      },
      { status: 500 }
    )
  }
}
