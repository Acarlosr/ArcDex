"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { useAccount } from "wagmi"
import { Smartphone, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function MobileWalletHint() {
  const isMobile = useIsMobile()
  const { isConnected } = useAccount()

  // Only show on mobile when wallet is not connected
  if (!isMobile || isConnected) {
    return null
  }

  return (
    <Alert className="mb-6 border-primary/30 bg-primary/10">
      <Smartphone className="h-4 w-4 text-primary" />
      <AlertDescription className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Mobile detected:</span>{" "}
        For the best experience, open this dApp in your{" "}
        <span className="text-primary font-medium">MetaMask</span> or{" "}
        <span className="text-primary font-medium">Trust Wallet</span> browser.
        <a 
          href="https://metamask.app.link/dapp/www.arc-dex.xyz"
          className="inline-flex items-center gap-1 ml-2 text-primary hover:text-primary/80 underline"
        >
          Open in MetaMask <ExternalLink className="h-3 w-3" />
        </a>
      </AlertDescription>
    </Alert>
  )
}

