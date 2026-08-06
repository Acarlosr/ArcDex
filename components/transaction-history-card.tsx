"use client"

/**
 * Reusable "recent transactions" card, backed by the ArcScan explorer API.
 * Filters the connected wallet's transactions down to the ones sent to a given
 * contract address (e.g. a pool's swap contract) and renders them with status,
 * method name, timestamp and a link to ArcScan.
 */

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import { ARCSCAN_API, ARCSCAN_URL } from "@/lib/contracts"
import { useI18n } from "@/lib/i18n"

interface ExplorerTx {
  hash: string
  timeStamp: string
  isError: string
  txreceipt_status: string
  functionName: string
  to: string
}

export interface TxMethodLabel {
  [rawMethodName: string]: string
}

export interface TransactionHistoryCardProps {
  /** Wallet address to fetch history for */
  address?: `0x${string}` | string
  /** Contract address to filter transactions "to" (case-insensitive) */
  contractAddress: string
  /** Card title, e.g. "Recent Transactions" */
  title: string
  /** Maps a raw function name (e.g. "addLiquidity") to a display label */
  methodLabels?: TxMethodLabel
  /** Bump this value to force a refetch (e.g. after a tx confirms) */
  refreshKey?: number | string
  /** Max rows to show */
  limit?: number
}

export function TransactionHistoryCard({
  address,
  contractAddress,
  title,
  methodLabels = {},
  refreshKey,
  limit = 8,
}: TransactionHistoryCardProps) {
  const { t } = useI18n()
  const [txs, setTxs] = useState<ExplorerTx[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTxs = useCallback(async () => {
    if (!address) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${ARCSCAN_API}?module=account&action=txlist&address=${address}&sort=desc&page=1&offset=50`,
        { signal: AbortSignal.timeout(10000) }
      )
      if (!response.ok) throw new Error("API error")
      const data = await response.json()
      if (data.status === "1" && Array.isArray(data.result)) {
        const filtered = (data.result as ExplorerTx[])
          .filter((tx) => tx.to?.toLowerCase() === contractAddress.toLowerCase())
          .slice(0, limit)
        setTxs(filtered)
      } else {
        setTxs([])
      }
    } catch (err) {
      console.error("Failed to fetch transaction history:", err)
      setError(t("common.error"))
    } finally {
      setLoading(false)
    }
  }, [address, contractAddress, limit, t])

  useEffect(() => {
    fetchTxs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTxs, refreshKey])

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchTxs}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {!address ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("history.connectHistory")}</p>
      ) : loading && txs.length === 0 ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex animate-pulse items-center justify-between rounded-lg bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
              <div className="h-3 w-14 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-6 text-center">
          <p className="mb-2 text-sm text-red-400">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchTxs}>
            <RefreshCw className="mr-1 h-3 w-3" /> {t("common.retry")}
          </Button>
        </div>
      ) : txs.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("history.noHistory")}</p>
      ) : (
        <div className="space-y-2">
          {txs.map((tx) => {
            const isSuccess = tx.txreceipt_status === "1" && tx.isError === "0"
            const date = new Date(parseInt(tx.timeStamp, 10) * 1000)
            const rawMethod = tx.functionName?.split("(")[0] || "unknown"
            const methodLabel = methodLabels[rawMethod] ?? rawMethod

            return (
              <a
                key={tx.hash}
                href={`${ARCSCAN_URL}/tx/${tx.hash}`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/60"
              >
                <div className="flex items-center gap-3">
                  {isSuccess ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-red-400" />
                  )}
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      {methodLabel}
                      <span className={`rounded px-1.5 py-0.5 text-xs ${isSuccess ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {isSuccess ? t("common.success") : t("common.failed")}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-accent" />
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
