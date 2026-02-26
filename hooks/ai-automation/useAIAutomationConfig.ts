'use client'

import { useAccount } from 'wagmi'
import { useEffect, useState, useCallback } from 'react'

export interface AIAutomationConfig {
  enabled: boolean
  maxTransactionValue: string
  maxDailyVolume: string
  allowedActions: ('swap' | 'stake' | 'bridge' | 'harvest')[]
  requireApprovalFor: {
    swap: boolean
    stake: boolean
    bridge: boolean
    harvest: boolean
  }
  riskTolerance: 'low' | 'medium' | 'high'
  authorizedAt: number
  expiresAt: number
}

const DEFAULT_CONFIG: AIAutomationConfig = {
  enabled: false,
  maxTransactionValue: '100.00',
  maxDailyVolume: '1000.00',
  allowedActions: [],
  requireApprovalFor: {
    swap: true,
    stake: true,
    bridge: true,
    harvest: true,
  },
  riskTolerance: 'low',
  authorizedAt: 0,
  expiresAt: 0,
}

const STORAGE_KEY_PREFIX = 'arcdex_ai_automation_'

export function useAIAutomationConfig() {
  const { address } = useAccount()
  const [config, setConfig] = useState<AIAutomationConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!address) {
      setConfig(DEFAULT_CONFIG)
      setIsLoading(false)
      return
    }

    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${address}`
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved) as AIAutomationConfig
        if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
          parsed.enabled = false
        }
        setConfig(parsed)
      } else {
        setConfig(DEFAULT_CONFIG)
      }
    } catch (error) {
      console.error('Failed to load AI automation config:', error)
      setConfig(DEFAULT_CONFIG)
    } finally {
      setIsLoading(false)
    }
  }, [address])

  const saveConfig = useCallback(
    (newConfig: AIAutomationConfig) => {
      if (!address) return
      try {
        const storageKey = `${STORAGE_KEY_PREFIX}${address}`
        localStorage.setItem(storageKey, JSON.stringify(newConfig))
        setConfig(newConfig)
      } catch (error) {
        console.error('Failed to save AI automation config:', error)
      }
    },
    [address]
  )

  const authorizeAI = useCallback(
    (
      maxTx: string = '100.00',
      maxDaily: string = '1000.00',
      actions: ('swap' | 'stake' | 'bridge' | 'harvest')[] = ['swap'],
      riskLevel: 'low' | 'medium' | 'high' = 'low',
      durationHours: number = 24
    ) => {
      const now = Date.now()
      const expiresAt = now + durationHours * 60 * 60 * 1000

      const newConfig: AIAutomationConfig = {
        enabled: true,
        maxTransactionValue: maxTx,
        maxDailyVolume: maxDaily,
        allowedActions: actions,
        requireApprovalFor: {
          swap: true,
          stake: true,
          bridge: true,
          harvest: true,
        },
        riskTolerance: riskLevel,
        authorizedAt: now,
        expiresAt,
      }

      saveConfig(newConfig)
      return newConfig
    },
    [saveConfig]
  )

  const revokeAuthorization = useCallback(() => {
    saveConfig(DEFAULT_CONFIG)
  }, [saveConfig])

  const updateConfig = useCallback(
    (updates: Partial<AIAutomationConfig>) => {
      setConfig((prev) => {
        const updated = { ...prev, ...updates }
        saveConfig(updated)
        return updated
      })
    },
    [saveConfig]
  )

  const isAuthorized = config.enabled && config.expiresAt > Date.now()
  const hoursRemaining = config.expiresAt > 0 ? Math.ceil((config.expiresAt - Date.now()) / (60 * 60 * 1000)) : 0

  return {
    config,
    isAuthorized,
    hoursRemaining,
    isLoading,
    authorizeAI,
    revokeAuthorization,
    updateConfig,
  }
}
