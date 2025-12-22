"use client"

import { useEffect, useState } from "react"
import { Smartphone, ExternalLink, X } from "lucide-react"

export function MobileWalletHint() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase()

        const isMobile = /iphone|ipad|ipod|android/.test(ua)

        // Wallet in-app browsers (aproximação)
        const isWalletBrowser =
            ua.includes("metamask") ||
            ua.includes("trust") ||
            ua.includes("rabby") ||
            ua.includes("okx") ||
            ua.includes("coinbase")

        if (isMobile && !isWalletBrowser) setShow(true)
    }, [])

    if (!show) return null

    return (
        <div className="mb-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-100 relative">
            <button
                onClick={() => setShow(false)}
                className="absolute right-3 top-3 text-cyan-200/70 hover:text-cyan-100"
                aria-label="Close"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
                <Smartphone className="h-5 w-5 text-cyan-400 mt-0.5" />
                <div className="space-y-2">
                    <p className="font-semibold text-cyan-200">Mobile wallet connection</p>

                    <p className="text-cyan-100/90">
                        For best experience on mobile, connect using{" "}
                        <span className="font-medium text-cyan-300">WalletConnect</span> or open this dApp
                        inside your wallet browser (MetaMask, Rabby, Trust Wallet).
                    </p>

                    <div className="flex flex-wrap gap-3 pt-1 items-center">
                        <a
                            href="https://metamask.app.link/dapp/arc-dex.xyz/app"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 underline"
                        >
                            Open in MetaMask <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="text-cyan-400/60">or</span>
                        <span className="text-cyan-200">use WalletConnect</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
