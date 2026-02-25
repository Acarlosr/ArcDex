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
      /^(sim|mais|detalhes|completo|expanda|explicar mais|quero mais|pode detalhar)$/.test(lastUserMsg) ||
      lastUserMsg.includes('mais detalhes') ||
      lastUserMsg.includes('explicação completa') ||
      lastUserMsg.includes('resposta completa')

    const routeContext = typeof context?.route === 'string' ? context.route : ''
    const featureContext = Array.isArray(context?.features) ? context.features.join(', ') : ''
    const userWalletContext = typeof context?.wallet === 'string' ? context.wallet : ''

    const systemPrompt = wantsFullAnswer
      ? `Você é o ArcBot, assistente DeFi da Arc Network.
Responda sempre em português do Brasil.
O usuário pediu MAIS DETALHES: forneça resposta completa, didática e objetiva.
Use listas quando ajudar. Máximo 2 emojis.
Sempre mencione riscos quando falar de investimento, bridge, stake, pools ou pagamentos.

Contexto do dApp (use quando relevante):
- Features ativas: swaps USDC/EURC, pools, stake, pagamentos (single/exact/batch), bridge CCTP v2, compliance AML/CFT.
- Rota atual do usuário: ${routeContext || 'não informada'}.
- Wallet conectada: ${userWalletContext || 'não informada'}.
- Recursos reportados pela UI: ${featureContext || 'não informado'}.`
      : `Você é o ArcBot, assistente DeFi da Arc Network.
Responda sempre em português do Brasil.

RESPOSTA CURTA OBRIGATÓRIA:
- Responda em no máximo 4 linhas (resumo curto). Máximo 2 emojis.
- Cite risco apenas se for essencial no resumo.

Contexto do dApp:
- Features ativas: swaps USDC/EURC, pools, stake, pagamentos (single/exact/batch), bridge CCTP v2, compliance AML/CFT.
- Rota atual do usuário: ${routeContext || 'não informada'}.
- Wallet conectada: ${userWalletContext || 'não informada'}.
- Recursos reportados pela UI: ${featureContext || 'não informado'}.

NO FINAL DE TODA RESPOSTA CURTA, adicione EXATAMENTE esta linha:
📌 Quer a explicação completa? Responda **sim** ou **mais**.

Se o usuário já disse "sim" ou "mais", ignore a regra curta e entregue a versão completa.`

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
        message: 'Desculpe, algo deu errado. Tente novamente.',
      },
      { status: 500 }
    )
  }
}
