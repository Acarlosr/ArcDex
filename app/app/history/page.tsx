"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useAccount } from "wagmi"
import { ARCDEX } from "@/lib/contracts"

// Correct Arc Testnet Explorer URL
const EXPLORER_URL = "https://testnet.arcscan.app"

export default function HistoryPage() {
  const [filterToken, setFilterToken] = useState("all")

  const { address, isConnected } = useAccount()

  const addressExplorerUrl = address ? `${EXPLORER_URL}/address/${address}` : EXPLORER_URL

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
          <p className="text-muted-foreground mt-1">View your transactions on Arc Network.</p>
        </div>
        <Button
          variant="outline"
          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
          onClick={() => window.open(addressExplorerUrl, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </Button>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border">
        {/* Filter Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted border-border mb-6">
            <TabsTrigger value="all" onClick={() => setFilterToken("all")}>
              All
            </TabsTrigger>
            <TabsTrigger value="USDC" onClick={() => setFilterToken("USDC")}>
              USDC
            </TabsTrigger>
            <TabsTrigger value="EURC" onClick={() => setFilterToken("EURC")}>
              EURC
            </TabsTrigger>
            <TabsTrigger value="Stake" onClick={() => setFilterToken("Stake")}>
              Stake
            </TabsTrigger>
          </TabsList>

          {/* Connected State */}
          {isConnected ? (
            <div className="space-y-6">
              {/* Info Box */}
              <div className="card-professional border-primary/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                    📋
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      View Your Transactions
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Para ver o histórico completo de suas transações no Arc Testnet,
                      acesse o ArcScan Explorer. Lá você encontrará todas as interações
                      com os contratos ArcDex, incluindo swaps, stakes e pagamentos.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => window.open(addressExplorerUrl, '_blank')}
                        className="btn-gradient"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver Meu Histórico
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(`${EXPLORER_URL}/address/${ARCDEX.Swap}`, '_blank')}
                        className="border-border text-foreground hover:bg-muted"
                      >
                        Swap Contract
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(`${EXPLORER_URL}/address/${ARCDEX.Staking}`, '_blank')}
                        className="border-border text-foreground hover:bg-muted"
                      >
                        Staking Contract
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Address */}
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-2">Sua Carteira</p>
                <div className="flex items-center gap-2">
                  <code className="text-foreground font-mono text-sm bg-input px-3 py-2 rounded-lg flex-1 overflow-hidden text-ellipsis">
                    {address}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(address || '')}
                    className="border-border text-muted-foreground hover:text-foreground"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* Contract Addresses Reference */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Swap Contract</p>
                  <a
                    href={`${EXPLORER_URL}/address/${ARCDEX.Swap}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 font-mono hover:underline"
                  >
                    {ARCDEX.Swap}
                  </a>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Staking Contract</p>
                  <a
                    href={`${EXPLORER_URL}/address/${ARCDEX.Staking}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 font-mono hover:underline"
                  >
                    {ARCDEX.Staking}
                  </a>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">LP Token</p>
                  <a
                    href={`${EXPLORER_URL}/address/${ARCDEX.LP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 font-mono hover:underline"
                  >
                    {ARCDEX.LP}
                  </a>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Payments Contract</p>
                  <a
                    href={`${EXPLORER_URL}/address/${ARCDEX.Payments}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 font-mono hover:underline"
                  >
                    {ARCDEX.Payments}
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Not Connected State */
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-3xl">
                🔗
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Connect Wallet</h3>
              <p className="text-muted-foreground">
                Conecte sua carteira para ver seu histórico de transações.
              </p>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  )
}
