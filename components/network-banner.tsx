"use client"

import { AlertTriangle, ExternalLink, Loader2, Rocket } from "lucide-react"
import { useEffect, useState } from "react"
import { useArcNetwork, useArcGasBalance } from "@/hooks/useArcNetwork"
import {
  FAUCET_URL,
  IS_MAINNET,
  MAINNET_LAUNCH_LABEL,
  MAINNET_PENDING,
  NETWORK_LABEL,
  daysUntilMainnet,
} from "@/lib/contracts"
import { MAINNET_ANNOUNCEMENT_LINKS } from "@/lib/network"
import { useI18n } from "@/lib/i18n"

/**
 * Faixa de status da rede exibida no topo do app.
 *
 *  - Mainnet ativa            → faixa verde discreta
 *  - Mainnet pendente (pré 16/09) → faixa âmbar com contagem regressiva
 *  - Testnet forçada          → faixa âmbar de aviso
 */
export function NetworkBanner({ action }: { action?: React.ReactNode }) {
  const { t } = useI18n()
  const [days, setDays] = useState<number | null>(null)
  const { isWrongNetwork, switchToArc, isSwitching } = useArcNetwork()
  const { hasNoGas } = useArcGasBalance()

  // Calculado só no cliente para não gerar mismatch de hidratação.
  useEffect(() => {
    setDays(daysUntilMainnet())
  }, [])

  // Rede errada tem prioridade sobre qualquer outro aviso: nesse estado nada
  // no app funciona, e antes disto não havia nenhuma indicação na tela.
  if (isWrongNetwork) {
    return (
      <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <span className="text-sm font-medium text-red-700 dark:text-red-200">
            Sua carteira está em outra rede. Troque para {NETWORK_LABEL} para usar o ArcDex.
          </span>
        </div>
        <button
          type="button"
          onClick={switchToArc}
          disabled={isSwitching}
          className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isSwitching ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Trocando…
            </span>
          ) : (
            `Trocar para ${NETWORK_LABEL}`
          )}
        </button>
      </div>
    )
  }

  // Na Arc o gas é pago em USDC — o mesmo saldo do ERC-20. Dá para ter "saldo"
  // na tela e mesmo assim não conseguir assinar nada.
  if (hasNoGas) {
    return (
      <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-200">
            Sem USDC para gas. Na Arc o gas é pago em USDC — sem saldo nativo nenhuma transação passa.
          </span>
        </div>
        {FAUCET_URL && (
          <a
            href={FAUCET_URL}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600"
          >
            Abrir faucet <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    )
  }

  if (IS_MAINNET) {
    return (
      <div className="mb-6 rounded-lg border border-green-500/40 bg-green-500/10 p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
            MAINNET
          </span>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            {t("network.mainnetLive")}
          </span>
        </div>
        {action}
      </div>
    )
  }

  const countdown =
    days !== null && days > 0
      ? t("network.countdown").replace("{days}", String(days))
      : null

  return (
    <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2">
        {MAINNET_PENDING ? (
          <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
        ) : (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="rounded bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
            {NETWORK_LABEL}
          </span>
          <span className="text-sm font-medium text-amber-700 dark:text-amber-200">
            {MAINNET_PENDING
              ? t("network.mainnetSoon").replace("{date}", MAINNET_LAUNCH_LABEL)
              : t("network.testnetNotice")}
          </span>
          {countdown && (
            <span className="text-xs font-semibold text-amber-700/80 dark:text-amber-300/80">
              {countdown}
            </span>
          )}
          {MAINNET_PENDING && (
            <a
              href={MAINNET_ANNOUNCEMENT_LINKS.blog}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 underline underline-offset-2 dark:text-amber-300"
            >
              {t("network.readAnnouncement")}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}
