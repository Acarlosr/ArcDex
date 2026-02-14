'use client'

interface QuickAction {
  emoji: string
  title: string
  description: string
  prompt: string
}

const ACTIONS: QuickAction[] = [
  { emoji: '📊', title: 'Analisar Pools', description: 'Análise de liquidez e APY', prompt: 'Analise as pools do ARCDex e indique as melhores oportunidades de liquidez e APY.' },
  { emoji: '🛡️', title: 'Verificar Riscos', description: 'Risco de swap/stake', prompt: 'Quais os principais riscos ao fazer swap e staking no ARCDex? Como mitigar?' },
  { emoji: '📈', title: 'Otimizar Portfólio', description: 'Alocação e yield', prompt: 'Como otimizar meu portfólio no ARCDex entre swap, staking e liquidez?' },
  { emoji: '📉', title: 'Impermanent Loss', description: 'Entender IL', prompt: 'Explique o que é impermanent loss e como afeta quem fornece liquidez no ARCDex.' },
  { emoji: '⛽', title: 'Gas Fees', description: 'Custos na Arc', prompt: 'Como funcionam as taxas de gas na Arc Network e como economizar?' },
  { emoji: '💡', title: 'Estratégias', description: 'Melhores práticas', prompt: 'Quais estratégias DeFi você recomenda para quem usa o ARCDex na Arc Network?' },
]

interface QuickActionsProps {
  onActionClick: (prompt: string) => void
  disabled?: boolean
}

export function QuickActions({ onActionClick, disabled }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ACTIONS.map((a) => (
        <button
          key={a.title}
          type="button"
          onClick={() => onActionClick(a.prompt)}
          disabled={disabled}
          className="text-left p-3 rounded-xl bg-gray-800/80 border border-gray-700 hover:border-purple-500/50 hover:bg-gray-800 transition-all duration-200 disabled:opacity-50"
        >
          <span className="text-lg">{a.emoji}</span>
          <div className="font-medium text-sm text-gray-100 mt-1">{a.title}</div>
          <div className="text-xs text-gray-400">{a.description}</div>
        </button>
      ))}
    </div>
  )
}
