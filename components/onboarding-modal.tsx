"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Wallet, Globe, Droplet, Zap, ChevronRight, ChevronLeft, ExternalLink } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { ARCSCAN_URL, CHAIN_CONFIG, FAUCET_URL, RPC_URLS } from "@/lib/contracts"

interface OnboardingModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
    const { t } = useI18n()
    const [currentStep, setCurrentStep] = useState(0)
    const steps = [
        {
            id: 1,
            title: t("onboarding.connectTitle"),
            description: t("onboarding.connectDesc"),
            icon: Wallet,
            details: [
                t("onboarding.connectDetail1"),
                t("onboarding.connectDetail2"),
                t("onboarding.connectDetail3")
            ]
        },
        {
            id: 2,
            title: t("onboarding.arcTitle"),
            description: t("onboarding.arcDesc"),
            icon: Globe,
            gasNotice: true,
            details: [
                `Network: ${CHAIN_CONFIG.name}`,
                `Chain ID: ${CHAIN_CONFIG.id}`,
                `RPC: ${RPC_URLS[0]}`,
                `Explorer: ${ARCSCAN_URL}`,
                // A doc da Arc avisa que carteiras sem suporte a gas token
                // customizado exibem o saldo errado se as casas decimais não
                // forem configuradas. Melhor o usuário ver isso aqui.
                `Gas token: ${CHAIN_CONFIG.nativeCurrency.symbol} (${CHAIN_CONFIG.nativeCurrency.decimals} decimals)`
            ],
            action: {
                label: t("onboarding.addNetwork"),
                onClick: async () => {
                    if (typeof window !== "undefined" && (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum) {
                        try {
                            await (window as unknown as { ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum.request({
                                method: "wallet_addEthereumChain",
                                params: [{
                                    // chainId precisa ser hex — derivado da rede ativa
                                    chainId: `0x${CHAIN_CONFIG.id.toString(16)}`,
                                    chainName: CHAIN_CONFIG.name,
                                    nativeCurrency: CHAIN_CONFIG.nativeCurrency,
                                    rpcUrls: RPC_URLS,
                                    blockExplorerUrls: [ARCSCAN_URL]
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
            title: t("onboarding.faucetTitle"),
            description: t("onboarding.faucetDesc"),
            icon: Droplet,
            gasNotice: true,
            details: [
                t("onboarding.faucetDetail1"),
                t("onboarding.faucetDetail2"),
                t("onboarding.faucetDetail3"),
                t("onboarding.faucetDetail4"),
                t("onboarding.faucetDetail5")
            ],
            link: FAUCET_URL
                ? { label: t("onboarding.openFaucet"), url: FAUCET_URL }
                : { label: t("onboarding.openBridge"), url: "/app/bridge" }
        },
        {
            id: 4,
            title: t("onboarding.startTitle"),
            description: t("onboarding.startDesc"),
            icon: Zap,
            gasNotice: true,
            details: [
                t("onboarding.startDetail1"),
                t("onboarding.startDetail2"),
                t("onboarding.startDetail3"),
                t("onboarding.startDetail4")
            ]
        }
    ]

    const step = steps[currentStep]
    const Icon = step.icon
    const isLastStep = currentStep === steps.length - 1
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
                        <span className="text-cyan-400">🚀</span> {t("onboarding.title")}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {t("onboarding.title")}
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Indicator */}
                <div className="flex gap-2 mb-4">
                    {steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1 flex-1 rounded-full transition-colors ${idx <= currentStep ? "bg-cyan-400" : "bg-muted"
                                }`}
                        />
                    ))}
                </div>

                {/* Step Content */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{t("onboarding.step")} {step.id} {t("onboarding.of")} {steps.length}</p>
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

                    {/* Na Arc o gas é pago em USDC — o MESMO saldo que o usuário
                        vai negociar. O tutorial não dizia isso em lugar nenhum. */}
                    {step.gasNotice && (
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                            <p className="text-xs text-amber-700 dark:text-amber-200">
                                <strong>{t("onboarding.gasTitle")}</strong> {t("onboarding.gasNotice")}
                            </p>
                        </div>
                    )}

                    {/* Action Button */}
                    {step.action && (
                        <Button
                            onClick={step.action.onClick}
                            variant="outline"
                            className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
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
                            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors"
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
                        {t("common.back")}
                    </Button>
                    <Button
                        onClick={handleNext}
                        className="flex-1 btn-gradient"
                    >
                        {isLastStep ? t("common.getStarted") : t("common.next")}
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
                    {t("common.skipTutorial")}
                </button>
            </DialogContent>
        </Dialog>
    )
}
