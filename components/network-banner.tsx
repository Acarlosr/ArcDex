"use client"

import { AlertTriangle, ExternalLink, Rocket } from "lucide-react"
import { useEffect, useState } from "react"
import {
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

  // Calculado só no cliente para não gerar mismatch de hidratação.
  useEffect(() => {
    setDays(daysUntilMainnet())
  }, [])

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
