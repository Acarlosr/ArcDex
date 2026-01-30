interface TokenPillProps {
  symbol: string
  address: string
}

export function TokenPill({ symbol, address }: TokenPillProps) {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <div className="inline-flex items-center gap-2 bg-muted px-3 py-2 rounded-full border border-border text-sm">
      <span className="font-semibold text-accent">{symbol}</span>
      <span className="text-xs text-muted-foreground">{shortAddress}</span>
    </div>
  )
}
