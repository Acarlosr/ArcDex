/** AI Feature - exports públicos */

export { AIWidget } from './AIWidget'
export { MarketInsights } from './components/MarketInsights'
export { RiskAlert } from './components/RiskAlert'
export { QuickActions } from './components/QuickActions'
export { useAIChat } from './hooks/useAIChat'
export { useMarketAnalysis } from './hooks/useMarketAnalysis'
export { aiClient } from './lib/ai-client'
export { aiCache, generateCacheKey } from './lib/cache'
export type { Message, MarketAnalysis, MarketOpportunity, RiskAnalysis } from './lib/types'
