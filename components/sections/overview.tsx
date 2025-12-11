import { StatCard } from "@/components/stat-card"
import { TokenPill } from "@/components/token-pill"

export function OverviewSection() {
  const tokens = [
    { symbol: "USDC", address: "0x3600000000000000000000000000000000000000", decimals: 6 },
    { symbol: "EURC", address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a", decimals: 6 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Welcome to ARCDex V2</h1>
        <p className="text-lg text-muted-foreground">DeFi dApp on Arc Network Testnet</p>
      </div>

      {/* Network Info Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Network" value="Arc Testnet" />
        <StatCard title="Status" value="Building Arc Testnet" />
        <StatCard title="Supported Tokens" value="2" subtitle="USDC, EURC" />
      </div>

      {/* Official Tokens */}
      <div className="bg-card rounded-xl p-6 border border-border glow-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Official Tokens</h2>
        <div className="flex flex-wrap gap-3">
          {tokens.map((token) => (
            <TokenPill key={token.symbol} symbol={token.symbol} address={token.address} />
          ))}
        </div>
      </div>
    </div>
  )
}
