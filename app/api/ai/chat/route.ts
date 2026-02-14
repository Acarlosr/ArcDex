import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

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

    const systemPrompt = wantsFullAnswer
      ? `You are ArcBot, DeFi assistant on Arc Network. The user asked for MORE DETAILS. Give the COMPLETE, detailed explanation (use bullet points and lists if needed). Always in English. Max 2 emojis. Always mention risks when talking about investments.`
      : `You are ArcBot, DeFi assistant on Arc Network.

SHORT ANSWER ONLY:
- Reply in AT MOST 4 lines (brief summary). Always in English. Max 2 emojis.
- Mention risk only if essential in the summary.

AT THE END OF EVERY SHORT ANSWER, add EXACTLY this line (do not change it):
📌 Want the full explanation? Reply **yes** or **more**.

If the user already said "yes" or "more", ignore this short-answer rule and give the full version.`

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
