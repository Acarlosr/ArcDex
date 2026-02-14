/**
 * Cliente de IA - Groq API (Llama 3.3 70B)
 * Usa fetch e GROQ_API_KEY do .env.local
 */

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ProviderInfo {
  name: string
  model: string
  endpoint: string
}

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

class AIClient {
  private apiKey: string
  private model: string
  private endpoint: string

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY ?? ''
    this.model = process.env.GROQ_MODEL ?? GROQ_MODEL
    this.endpoint = process.env.GROQ_ENDPOINT ?? GROQ_ENDPOINT
  }

  /**
   * Envia mensagens para a API Groq e retorna o conteúdo da resposta.
   * Error handling completo.
   */
  async chat(messages: Message[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY não configurada no .env.local')
    }

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      let message = `Groq API error ${res.status}`
      try {
        const parsed = JSON.parse(errBody)
        message = parsed.error?.message ?? parsed.message ?? errBody.slice(0, 200)
      } catch {
        message = errBody.slice(0, 200) || message
      }
      throw new Error(message)
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = data.choices?.[0]?.message?.content
    if (content == null) {
      throw new Error('Resposta da API sem conteúdo')
    }
    return content
  }

  /**
   * Retorna informações do provider atual.
   */
  getProviderInfo(): ProviderInfo {
    return {
      name: 'Groq',
      model: this.model,
      endpoint: this.endpoint,
    }
  }
}

export const aiClient = new AIClient()
