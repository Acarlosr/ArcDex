/**
 * Prompts para o assistente DeFi na Arc Network.
 * Todos em português brasileiro.
 */

export const SYSTEM_PROMPT = `Você é um assistente especializado em DeFi na Arc Network.
Responda sempre em português brasileiro.
Seja direto, educativo e sempre mencione riscos quando relevante.`

/**
 * Cria prompt para análise de mercado das pools.
 * Retorna instrução para JSON: opportunities, warnings, marketSentiment, summary.
 */
export function createMarketAnalysisPrompt(poolsData: unknown[]): string {
  const dataStr = JSON.stringify(poolsData, null, 2)
  return `Analise os dados das pools DeFi abaixo e retorne APENAS um JSON válido, sem markdown ou texto extra.

Dados das pools:
${dataStr}

Estrutura do JSON a retornar:
{
  "opportunities": [
    {
      "pool": "identificador da pool",
      "score": 0-100,
      "apy": "ex: 8.5%",
      "reason": "motivo da oportunidade",
      "risks": ["risco1", "risco2"],
      "recommendation": "recomendação curta"
    }
  ],
  "warnings": ["alerta1", "alerta2"],
  "marketSentiment": "bullish" | "neutral" | "bearish",
  "summary": "resumo em 2-3 frases"
}`
}

/**
 * Cria prompt para verificação de risco de uma operação.
 * Retorna instrução para JSON: riskScore, riskLevel, risks, warnings, recommendation, estimatedSlippage, safeAmount.
 */
export function createRiskCheckPrompt(
  tokenAddress: string,
  tokenSymbol: string,
  amount: string,
  liquidityUSD?: string
): string {
  const liquidity = liquidityUSD != null ? `Liquidez estimada (USD): ${liquidityUSD}` : 'Liquidez não fornecida.'
  return `Analise o risco da seguinte operação e retorne APENAS um JSON válido, sem markdown ou texto extra.

Operação:
- Token: ${tokenSymbol} (${tokenAddress})
- Quantidade: ${amount}
- ${liquidity}

Estrutura do JSON a retornar:
{
  "riskScore": 1-10,
  "riskLevel": "low" | "medium" | "high" | "extreme",
  "risks": ["risco1", "risco2"],
  "warnings": ["aviso1", "aviso2"],
  "recommendation": "safe" | "proceed_with_caution" | "not_recommended" | "dangerous",
  "estimatedSlippage": "ex: <0.1% ou 1-2%",
  "safeAmount": "sugestão de valor mais seguro se aplicável, senão a mesma quantidade"
}`
}
