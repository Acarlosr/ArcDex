"use client"

import { useState, useEffect } from "react"
import { Smartphone, X } from "lucide-react"

export function MobileWalletHint() {
  const [isMobile, setIsMobile] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
    setIsMobile(mobile)
    
    // Check if already dismissed
    const wasDismissed = sessionStorage.getItem('mobileHintDismissed')
    if (wasDismissed) setDismissed(true)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('mobileHintDismissed', 'true')
  }

  if (!isMobile || dismissed) return null

  return (
    <div className="mb-4 bg-primary/10 border border-primary/30 rounded-lg p-3 flex items-start gap-3">
      <Smartphone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-foreground font-medium">Mobile Wallet Tip</p>
        <p className="text-xs text-muted-foreground mt-1">
          For the best experience, open this dApp in your wallet's built-in browser (MetaMask, Trust Wallet, etc.)
        </p>
      </div>
      <button 
        onClick={handleDismiss}
        className="p-1 hover:bg-muted rounded transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  )
}
