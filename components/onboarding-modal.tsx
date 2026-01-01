"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Wallet, Globe, Droplet, Zap, ChevronRight, ChevronLeft, ExternalLink } from "lucide-react"

interface OnboardingModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const STEPS = [
    {
        id: 1,
        title: "Connect Your Wallet",
        description: "Use WalletConnect for mobile or browser extension for desktop.",
        icon: Wallet,
        details: [
            "📱 Mobile: Use WalletConnect with MetaMask, Trust Wallet, etc.",
            "💻 Desktop: Use MetaMask browser extension",
            "🔐 Supported: Any EVM-compatible wallet"
        ]
    },
    {
        id: 2,
        title: "Add Arc Testnet",
        description: "Configure your wallet for Arc Network Testnet.",
        icon: Globe,
        details: [
            "Network: Arc Testnet",
            "Chain ID: 5042002",
            "RPC: https://rpc.testnet.arc.network",
            "Explorer: https://explorer.testnet.arc.network"
        ],
        action: {
            label: "Add Network",
            onClick: async () => {
                if (typeof window !== "undefined" && (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum) {
                    try {
                        await (window as unknown as { ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [{
                                chainId: "0x4CEF72",
                                chainName: "Arc Testnet",
                                nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
                                rpcUrls: ["https://rpc.testnet.arc.network"],
                                blockExplorerUrls: ["https://explorer.testnet.arc.network"]
                            }]
                        })
                    } catch (error) {
                        console.error("Failed to add network:", error)
                    }
                }
            }
        }
    },
    {
        id: 3,
        title: "Get Testnet USDC",
        description: "Claim free USDC from the Circle Faucet to start testing.",
        icon: Droplet,
        details: [
            "1. Go to Circle Faucet",
            "2. Connect your wallet",
            "3. Select 'Arc' network",
            "4. Claim testnet USDC"
        ],
        link: {
            label: "Open Circle Faucet",
            url: "https://faucet.circle.com"
        }
    },
    {
        id: 4,
        title: "Start Testing!",
        description: "Try our DeFi features on Arc Testnet.",
        icon: Zap,
        details: [
            "⚡ Swap: Exchange USDC ↔ EURC",
            "📈 Stake: Earn testnet yield on stablecoins",
            "💧 Pools: Provide liquidity and earn fees",
            "💸 Payments: Send stablecoins instantly"
        ]
    }
]

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
    const [currentStep, setCurrentStep] = useState(0)

    const step = STEPS[currentStep]
    const Icon = step.icon
    const isLastStep = currentStep === STEPS.length - 1
    const isFirstStep = currentStep === 0

    const handleNext = () => {
        if (isLastStep) {
            onOpenChange(false)
            setCurrentStep(0)
        } else {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <span className="text-primary">🚀</span> How to Test ARCDex
                    </DialogTitle>
                </DialogHeader>

                {/* Progress Indicator */}
                <div className="flex gap-2 mb-4">
                    {STEPS.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1 flex-1 rounded-full transition-colors ${idx <= currentStep ? "bg-primary" : "bg-muted"
                                }`}
                        />
                    ))}
                </div>

                {/* Step Content */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Step {step.id} of {STEPS.length}</p>
                            <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                        </div>
                        {currentStep > 0 && (
                            <CheckCircle2 className="ml-auto w-5 h-5 text-green-400" />
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground">{step.description}</p>

                    {/* Details */}
                    <div className="bg-muted rounded-lg p-3 space-y-2">
                        {step.details.map((detail, idx) => (
                            <p key={idx} className="text-xs text-foreground font-mono">{detail}</p>
                        ))}
                    </div>

                    {/* Action Button */}
                    {step.action && (
                        <Button
                            onClick={step.action.onClick}
                            variant="outline"
                            className="w-full border-primary/30 text-primary hover:bg-primary/10"
                        >
                            {step.action.label}
                        </Button>
                    )}

                    {/* External Link */}
                    {step.link && (
                        <a
                            href={step.link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                        >
                            {step.link.label}
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex gap-3 mt-4">
                    <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={isFirstStep}
                        className="flex-1 border-border"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        className="flex-1 btn-gradient"
                    >
                        {isLastStep ? "Get Started" : "Next"}
                        {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
                    </Button>
                </div>

                {/* Skip Link */}
                <button
                    onClick={() => {
                        onOpenChange(false)
                        setCurrentStep(0)
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
                >
                    Skip tutorial
                </button>
            </DialogContent>
        </Dialog>
    )
}
