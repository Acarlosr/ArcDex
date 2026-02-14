'use client'

import { useState, useRef, useEffect } from 'react'
import { useAIChat } from './hooks/useAIChat'
import { QuickActions } from './components/QuickActions'

export function AIWidget() {
  const [open, setOpen] = useState(false)
  const { messages, loading, sendMessage, clearMessages } = useAIChat()
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const handleSend = async () => {
    const input = inputRef.current
    if (!input?.value.trim() || loading) return
    const text = input.value
    input.value = ''
    await sendMessage(text)
  }

  const handleQuick = (prompt: string) => sendMessage(prompt)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 bg-gradient-to-br from-purple-600 to-cyan-600 text-white hover:scale-110 hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        aria-label={open ? 'Fechar chat' : 'Abrir assistente IA'}
      >
        <span className="text-2xl">🤖</span>
        {!open && messages.length === 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-cyan-400 rounded-full animate-pulse" />
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] flex flex-col rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                AI
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-100">ARCDex AI</p>
                <p className="text-xs text-gray-400">Groq · Llama 3.3 70B</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearMessages()}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                  title="Limpar"
                >
                  🗑️
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 text-center">
                  Olá! Sou o assistente DeFi. Escolha uma ação rápida ou digite sua pergunta.
                </p>
                <QuickActions onActionClick={handleQuick} disabled={loading} />
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.timestamp}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-700'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-gray-800 border border-gray-700 flex items-center gap-2">
                  <span className="h-3 w-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-gray-400">Pensando...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-gray-700 p-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Pergunte sobre DeFi, swap, staking..."
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
