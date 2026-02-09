"use client"

import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Button } from "@/components/ui/button"

interface PriceChartProps {
  title?: string
  subtitle?: string
  currentValue?: string
  valueLabel?: string
  showTimeframes?: boolean
  height?: number
  color?: string
  type?: "swap" | "apy" | "tvl"
}

type Timeframe = "1H" | "1D" | "1W" | "1M"

// Generate mock data based on timeframe
function generateMockData(timeframe: Timeframe, type: string) {
  const now = new Date()
  const data: { time: string; value: number; fullTime: string }[] = []
  
  let points: number
  let interval: number // in minutes
  let baseValue: number
  let volatility: number
  
  switch (type) {
    case "swap":
      baseValue = 1.0 // Exchange rate around 1:1
      volatility = 0.02
      break
    case "apy":
      baseValue = 12.5 // APY around 12.5%
      volatility = 0.5
      break
    case "tvl":
      baseValue = 250000 // TVL around $250K
      volatility = 5000
      break
    default:
      baseValue = 1.0
      volatility = 0.02
  }
  
  switch (timeframe) {
    case "1H":
      points = 12
      interval = 5
      break
    case "1D":
      points = 24
      interval = 60
      break
    case "1W":
      points = 7
      interval = 60 * 24
      break
    case "1M":
      points = 30
      interval = 60 * 24
      break
    default:
      points = 12
      interval = 5
  }
  
  // Generate trending up data with some randomness
  let currentValue = baseValue - (volatility * 0.5)
  const trend = volatility / points
  
  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * interval * 60 * 1000)
    const random = (Math.random() - 0.4) * volatility * 0.5
    currentValue = currentValue + trend + random
    
    // Ensure value stays positive
    currentValue = Math.max(currentValue, baseValue * 0.9)
    
    let timeLabel: string
    let fullTimeLabel: string
    
    if (timeframe === "1H" || timeframe === "1D") {
      timeLabel = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      fullTimeLabel = time.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } else {
      timeLabel = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      fullTimeLabel = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    
    data.push({
      time: timeLabel,
      value: Number(currentValue.toFixed(type === "tvl" ? 0 : 4)),
      fullTime: fullTimeLabel,
    })
  }
  
  return data
}

function formatValue(value: number, type: string): string {
  switch (type) {
    case "swap":
      return value.toFixed(4)
    case "apy":
      return `${value.toFixed(2)}%`
    case "tvl":
      return `$${value.toLocaleString()}`
    default:
      return value.toString()
  }
}

export function PriceChart({
  title = "Price Chart",
  subtitle,
  currentValue,
  valueLabel,
  showTimeframes = true,
  height = 200,
  color,
  type = "swap"
}: PriceChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1D")
  
  const data = useMemo(() => generateMockData(timeframe, type), [timeframe, type])
  
  const latestValue = data[data.length - 1]?.value ?? 0
  const firstValue = data[0]?.value ?? 0
  const change = ((latestValue - firstValue) / firstValue) * 100
  const isPositive = change >= 0
  
  const chartColor = color || (isPositive ? "#22c55e" : "#ef4444")
  
  const displayValue = currentValue || formatValue(latestValue, type)
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs text-muted-foreground">{payload[0].payload.fullTime}</p>
          <p className="text-sm font-semibold text-foreground">
            {formatValue(payload[0].value, type)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {showTimeframes && (
          <div className="flex gap-1">
            {(["1H", "1D", "1W", "1M"] as Timeframe[]).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className={`h-7 px-2.5 text-xs ${
                  timeframe === tf 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tf}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {/* Value Display */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-2xl font-bold text-foreground">{displayValue}</span>
        <span className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? "+" : ""}{change.toFixed(2)}%
        </span>
        {valueLabel && <span className="text-xs text-muted-foreground">{valueLabel}</span>}
      </div>
      
      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              dy={10}
            />
            <YAxis 
              hide
              domain={['dataMin - 0.001', 'dataMax + 0.001']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#gradient-${type})`}
              dot={false}
              activeDot={{ r: 4, fill: chartColor, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Compact version for sidebars
export function MiniChart({ 
  data, 
  color = "#22c55e",
  height = 60 
}: { 
  data?: { value: number }[]
  color?: string
  height?: number
}) {
  const mockData = useMemo(() => {
    if (data) return data
    return Array.from({ length: 20 }, (_, i) => ({
      value: 1 + Math.sin(i * 0.5) * 0.02 + (i * 0.002)
    }))
  }, [data])

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
