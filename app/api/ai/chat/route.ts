import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json()

    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured' },
        { status: 500 }
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
Always mention risks when talking about investing, bridge, stake, pools, or payments.

dApp context (use when relevant):
- Active features: USDC/EURC swaps, pools, staking, payments (single/exact/batch), CCTP v2 bridge, AML/CFT compliance.
- Current route: ${routeContext || 'not provided'}.
- Connected wallet: ${userWalletContext || 'not provided'}.
- UI-reported capabilities: ${featureContext || 'not provided'}.`
      : `You are ArcBot, a DeFi assistant for Arc Network.
Always respond in English.

SHORT ANSWER ONLY:
- Reply in at most 4 lines (brief summary). Max 2 emojis.
- Mention risk only if essential in the summary.

dApp context:
- Active features: USDC/EURC swaps, pools, staking, payments (single/exact/batch), CCTP v2 bridge, AML/CFT compliance.
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

    // Chamar Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: wantsFullAnswer ? 800 : 200,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API Error:', error)
      throw new Error('Failed to call Groq API')
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    return NextResponse.json({ content })
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
