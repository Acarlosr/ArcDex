'use client'

import { useState, useCallback, useRef } from 'react'
import type { Message } from '@/features/ai/lib/types'

interface UseAIChatReturn {
  messages: Message[]
  loading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
}

export function useAIChat(): UseAIChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    const text = content.trim()
    if (!text || loading) return

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error ?? `Erro ${res.status}`)
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.content ?? 'Sem resposta.',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Erro ao conectar com a IA.'
      setError(msg)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${msg}`, timestamp: Date.now() },
      ])
    } finally {
      setLoading(false)
    }
  }, [messages, loading])

  const clearMessages = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setError(null)
  }, [])

  return { messages, loading, error, sendMessage, clearMessages }
}
