'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'

export function ArcBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()
  const { address } = useAccount()

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', text: input }
    setMessages((prev) => [...prev, userMsg])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.text })),
            { role: 'user', content: currentInput },
          ],
          context: {
            route: pathname,
            wallet: address ?? '',
            features: [
              'swap-usdc-eurc',
              'pools',
              'stake',
              'payments-single',
              'payments-exact',
              'payments-batch',
              'bridge-cctp-v2',
              'compliance-aml-cft',
              'portfolio',
              'history',
            ],
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process message')
      }

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.content || data.message || "Sorry, I couldn't process your message.",
        },
      ])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: '❌ Desculpe, algo deu errado. Tente novamente.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 999999 }}>
      {/* Botão Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '4.5rem',
          height: '4.5rem',
          background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          boxShadow: '0 10px 40px rgba(147, 51, 234, 0.6)',
          transition: 'all 0.3s ease',
          zIndex: 999999,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 15px 50px rgba(147, 51, 234, 0.8)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 10px 40px rgba(147, 51, 234, 0.6)'
        }}
      >
        <span style={{ fontSize: '2.5rem' }}>🤖</span>

        {/* Indicador online */}
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '18px',
            height: '18px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            border: '3px solid #000',
          }}
        />
      </button>

      {/* Tooltip */}
      <div
        style={{
          position: 'fixed',
          bottom: '7rem',
          right: '2rem',
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.2s',
          zIndex: 999998,
        }}
      >
        ArcBot
      </div>

      {/* Modal do Chat */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '8rem',
            right: '2rem',
            width: '400px',
            height: '600px',
            backgroundColor: '#111827',
            borderRadius: '1rem',
            border: '1px solid #374151',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 999998,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid #374151',
              background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '2rem' }}>🤖</span>
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: 'white',
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                  }}
                >
                  ArcBot
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.75rem',
                  }}
                >
                  Assistente DeFi
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: '#9ca3af',
                  marginTop: '6rem',
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👋</div>
                <h4
                  style={{
                    color: 'white',
                    fontSize: '1.25rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  Olá! Eu sou o ArcBot
                </h4>
                <p style={{ fontSize: '0.875rem' }}>Como posso te ajudar hoje?</p>

                <div
                  style={{
                    marginTop: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <button
                    onClick={() => setInput('Quais são os melhores pools agora?')}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                    }}
                  >
                    📊 Analisar melhores pools
                  </button>
                  <button
                    onClick={() => setInput('Como identificar riscos em uma operação?')}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                    }}
                  >
                    ⚠️ Verificar riscos
                  </button>
                  <button
                    onClick={() => setInput('O que é impermanent loss?')}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                    }}
                  >
                    📚 Explicar impermanent loss
                  </button>
                  <button
                    onClick={() => setInput('Me explique a aba Bridge e como usar com segurança')}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                    }}
                  >
                    🌉 Explicar Bridge (CCTP v2)
                  </button>
                  <button
                    onClick={() => setInput('Como funciona o compliance AML/CFT no ArcDex?')}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                    }}
                  >
                    🛡️ Compliance AML/CFT
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    maxWidth: '80%',
                    padding: '0.75rem',
                    borderRadius: '1rem',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
                        : '#1f2937',
                    color: 'white',
                    border: msg.role === 'assistant' ? '1px solid #374151' : 'none',
                  }}
                >
                  {msg.text}
                </div>
              ))
            )}

            {loading && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#1f2937',
                  borderRadius: '1rem',
                  border: '1px solid #374151',
                  maxWidth: '80%',
                  alignSelf: 'flex-start',
                }}
              >
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      animation: 'arcbot-bounce 1s ease-in-out infinite',
                    }}
                  />
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      animation: 'arcbot-bounce 1s ease-in-out 0.15s infinite',
                    }}
                  />
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      animation: 'arcbot-bounce 1s ease-in-out 0.3s infinite',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: '1rem',
              borderTop: '1px solid #374151',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) sendMessage()
                }}
                placeholder="Digite sua pergunta..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.75rem',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.875rem',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background:
                    loading || !input.trim()
                      ? '#374151'
                      : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '1.25rem',
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes arcbot-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }`,
        }}
      />
    </div>
  )
}
