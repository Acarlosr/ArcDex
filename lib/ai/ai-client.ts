/**
 * Universal AI Client - Supports OpenRouter, Groq, Ollama, HuggingFace
 */

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIResponse {
  content: string
  model: string
  provider: string
  tokensUsed?: number
}

type Provider = 'openrouter' | 'groq' | 'ollama' | 'huggingface'

class UniversalAIClient {
  private provider: Provider
  private apiKey?: string
  private model: string
  private baseUrl?: string

  constructor(provider: Provider = 'openrouter') {
    this.provider = provider

    switch (provider) {
      case 'openrouter':
        this.apiKey = process.env.OPENROUTER_API_KEY
        this.model = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct'
        this.baseUrl = 'https://openrouter.ai/api/v1'
        break

      case 'groq':
        this.apiKey = process.env.GROQ_API_KEY
        this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
        this.baseUrl = 'https://api.groq.com/openai/v1'
        break

      case 'ollama':
        this.model = process.env.OLLAMA_MODEL || 'llama3.2'
        this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1'
        break

      case 'huggingface':
        this.apiKey = process.env.HUGGINGFACE_API_KEY
        this.model = process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-2-70B-Instruct'
        this.baseUrl = 'https://api-inference.huggingface.co/models'
        break
    }
  }

  async chat(messages: Message[]): Promise<AIResponse> {
    if (!this.baseUrl) {
      throw new Error(`AI Client not configured for ${this.provider}`)
    }

    if (this.provider !== 'ollama' && !this.apiKey) {
      throw new Error(`${this.provider.toUpperCase()}_API_KEY not configured`)
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error(`${this.provider} API error:`, error)
        throw new Error(`${this.provider} API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        content: data.choices?.[0]?.message?.content || '',
        model: this.model,
        provider: this.provider,
        tokensUsed: data.usage?.total_tokens,
      }
    } catch (error) {
      console.error(`AI Client error (${this.provider}):`, error)
      throw error
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    switch (this.provider) {
      case 'openrouter':
        headers['Authorization'] = `Bearer ${this.apiKey}`
        headers['HTTP-Referer'] = 'https://arcdex.io'
        headers['X-Title'] = 'ArcDex DeFi'
        break

      case 'groq':
        headers['Authorization'] = `Bearer ${this.apiKey}`
        break

      case 'huggingface':
        headers['Authorization'] = `Bearer ${this.apiKey}`
        break

      case 'ollama':
        // No auth needed for local Ollama
        break
    }

    return headers
  }

  getProvider(): string {
    return this.provider
  }

  getModel(): string {
    return this.model
  }
}

const provider = (process.env.NEXT_PUBLIC_AI_PROVIDER as Provider) || 'openrouter'
export const aiClient = new UniversalAIClient(provider)

export type { Message, AIResponse, Provider }
export { UniversalAIClient }
