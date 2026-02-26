'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAIAutomationConfig } from '@/hooks/ai-automation/useAIAutomationConfig'
import { Lock, Unlock, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'

export function AIAutomationPanel() {
  const { config, isAuthorized, hoursRemaining, authorizeAI, revokeAuthorization } = useAIAutomationConfig()
  const [showAuthPanel, setShowAuthPanel] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(24)
  const [selectedRisk, setSelectedRisk] = useState<'low' | 'medium' | 'high'>('low')

  const handleAuthorize = () => {
    authorizeAI(
      '100.00',
      '1000.00',
      ['swap', 'stake', 'bridge', 'harvest'],
      selectedRisk,
      selectedDuration
    )
    setShowAuthPanel(false)
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isAuthorized ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <Lock className="w-5 h-5 text-muted-foreground" />
            )}
            <h3 className="font-semibold text-foreground">AI Automation</h3>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            isAuthorized
              ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {isAuthorized ? 'AUTHORIZED' : 'DISABLED'}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {isAuthorized
            ? `AI is authorized to suggest and execute optimized trades. ${hoursRemaining}h remaining.`
            : 'Enable AI to automatically analyze and suggest optimized trading actions.'}
        </p>

        {isAuthorized && (
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="bg-muted/50 rounded p-2">
              <p className="text-muted-foreground">Max Transaction</p>
              <p className="font-semibold text-foreground">${config.maxTransactionValue}</p>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <p className="text-muted-foreground">Daily Limit</p>
              <p className="font-semibold text-foreground">${config.maxDailyVolume}</p>
            </div>
            <div className="bg-muted/50 rounded p-2 col-span-2">
              <p className="text-muted-foreground">Risk Tolerance</p>
              <p className="font-semibold text-foreground capitalize">{config.riskTolerance}</p>
            </div>
          </div>
        )}

        {isAuthorized ? (
          <Button
            variant="outline"
            className="w-full text-red-400 border-red-400/30 hover:bg-red-500/10"
            onClick={revokeAuthorization}
          >
            <Unlock className="w-4 h-4 mr-2" />
            Revoke Authorization
          </Button>
        ) : (
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => setShowAuthPanel(!showAuthPanel)}
          >
            <Zap className="w-4 h-4 mr-2" />
            Authorize AI
          </Button>
        )}
      </div>

      {/* Authorization Panel */}
      {showAuthPanel && !isAuthorized && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Duration</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 24, 168].map((hours) => (
                <button
                  key={hours}
                  onClick={() => setSelectedDuration(hours)}
                  className={`p-2 rounded border text-xs font-semibold transition-colors ${
                    selectedDuration === hours
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-muted border-border text-muted-foreground hover:border-border/80'
                  }`}
                >
                  {hours === 1 ? '1h' : hours === 24 ? '24h' : '7d'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Risk Tolerance</p>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((risk) => (
                <button
                  key={risk}
                  onClick={() => setSelectedRisk(risk)}
                  className={`p-2 rounded border text-xs font-semibold capitalize transition-colors ${
                    selectedRisk === risk
                      ? `${risk === 'low' ? 'bg-green-600 border-green-500' : risk === 'medium' ? 'bg-yellow-600 border-yellow-500' : 'bg-red-600 border-red-500'} text-white`
                      : 'bg-muted border-border text-muted-foreground hover:border-border/80'
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-300">
              AI will only execute trades requiring your approval. You can revoke authorization anytime.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAuthPanel(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
              onClick={handleAuthorize}
            >
              Authorize
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
