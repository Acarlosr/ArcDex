'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Zap, TrendingUp } from 'lucide-react'
import type { AutomationProposal } from '@/hooks/ai-automation/useAIProposals'

interface AIAutomationApprovalModalProps {
  proposal: AutomationProposal
  isOpen: boolean
  onApprove: (proposal: AutomationProposal) => Promise<void>
  onReject: () => void
  isExecuting?: boolean
}

const actionEmoji = {
  swap: '🔄',
  stake: '🥩',
  bridge: '🌉',
  harvest: '🌾',
}

const getRiskColor = (score: number) => {
  if (score <= 3) return 'text-green-400 bg-green-500/10'
  if (score <= 6) return 'text-yellow-400 bg-yellow-500/10'
  return 'text-red-400 bg-red-500/10'
}

export function AIAutomationApprovalModal({
  proposal,
  isOpen,
  onApprove,
  onReject,
  isExecuting = false,
}: AIAutomationApprovalModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await onApprove(proposal)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl animate-in slide-in-from-bottom-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{actionEmoji[proposal.action]}</span>
            <div>
              <h2 className="text-xl font-bold text-foreground capitalize">{proposal.action} Opportunity</h2>
              <p className="text-sm text-muted-foreground">AI-Identified Optimization</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Description */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <p className="text-foreground font-semibold mb-1">{proposal.description}</p>
            <p className="text-sm text-muted-foreground">{proposal.reason}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Risk Score */}
            <div className={`rounded-lg p-3 border border-border ${getRiskColor(proposal.riskScore)}`}>
              <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
              <p className="text-lg font-bold">{proposal.riskScore}/10</p>
            </div>

            {/* Confidence */}
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Confidence</p>
              <p className="text-lg font-bold text-cyan-400">{Math.round(proposal.confidence * 100)}%</p>
            </div>

            {/* Estimated Benefit */}
            <div className="bg-muted/50 rounded-lg p-3 border border-border col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <p className="text-xs text-muted-foreground">Estimated Benefit</p>
              </div>
              <p className="text-lg font-bold text-green-400">{proposal.estimatedBenefit}</p>
            </div>

            {/* Gas Spend */}
            <div className="bg-muted/50 rounded-lg p-3 border border-border col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Estimated Gas Spend</p>
              <p className="text-lg font-bold">{proposal.estimatedGasSpend}</p>
            </div>
          </div>

          {/* Warning */}
          {proposal.riskScore > 6 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">
                This action carries moderate to high risk. Review carefully before approving.
              </p>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex gap-2">
            <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-300">
              You are about to authorize the AI to execute this transaction. Review all details before confirming.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-muted/30 p-4 border-t border-border flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onReject}
            disabled={isProcessing || isExecuting}
          >
            Reject
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            onClick={handleApprove}
            disabled={isProcessing || isExecuting}
          >
            {isProcessing || isExecuting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Executing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve & Execute
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
