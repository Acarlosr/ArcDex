"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Copy, Check, BookOpen, Zap, FileCode, DollarSign, Gift, Users, HelpCircle, BarChart3, History, AlertTriangle, Code2, Shield, Settings, ArrowRight, Info, TrendingUp, Droplets, Send, PieChart } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import {
    ARCDEX,
    ARCSCAN_URL,
    CHAIN_CONFIG,
    FAUCET_URL,
    IS_MAINNET,
    MAINNET_LAUNCH_LABEL,
    MAINNET_PENDING,
    NETWORK_LABEL,
    RPC_URLS,
    TOKENS,
} from "@/lib/contracts"

type Section = 
  | "introduction" 
  | "quick-start" 
  | "why-arcdex"
  | "features-swap" 
  | "features-pools" 
  | "features-payments"
  | "features-portfolio"
  | "features-history"
  | "contracts"
  | "tokens"
  | "network"
  | "api-reference"
  | "error-codes"
  | "troubleshooting"
  | "best-practices"
  | "faq"

export default function DocsPage() {
    const { language } = useI18n()
    const [activeSection, setActiveSection] = useState<Section>("introduction")

    if (language === "pt-BR") {
        return <PortugueseDocsPage />
    }

    if (language === "es") {
        return <SpanishDocsPage />
    }

    return (
        <div className="flex min-h-screen -mx-6 -mt-8">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border fixed h-full overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-foreground">Documentation</h2>
                        <p className="text-xs text-muted-foreground">Complete guide to ARCDex</p>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-6">
                        {/* Introduction */}
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Introduction
                            </p>
                            <NavItem
                                icon={<BookOpen className="w-4 h-4" />}
                                label="Introduction"
                                active={activeSection === "introduction"}
                                onClick={() => setActiveSection("introduction")}
                            />
                            <NavItem
                                icon={<Zap className="w-4 h-4" />}
                                label="Quick Start"
                                active={activeSection === "quick-start"}
                                onClick={() => setActiveSection("quick-start")}
                            />
                            <NavItem
                                icon={<Info className="w-4 h-4" />}
                                label="Why ArcDex"
                                active={activeSection === "why-arcdex"}
                                onClick={() => setActiveSection("why-arcdex")}
                            />
                        </div>

                        {/* Features */}
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Features
                            </p>
                            <NavItem
                                icon={<Zap className="w-4 h-4" />}
                                label="Swap Tokens"
                                active={activeSection === "features-swap"}
                                onClick={() => setActiveSection("features-swap")}
                            />
                            <NavItem
                                icon={<Droplets className="w-4 h-4" />}
                                label="Liquidity Pools"
                                active={activeSection === "features-pools"}
                                onClick={() => setActiveSection("features-pools")}
                            />
                            <NavItem
                                icon={<Send className="w-4 h-4" />}
                                label="Payments"
                                active={activeSection === "features-payments"}
                                onClick={() => setActiveSection("features-payments")}
                            />
                            <NavItem
                                icon={<PieChart className="w-4 h-4" />}
                                label="Portfolio"
                                active={activeSection === "features-portfolio"}
                                onClick={() => setActiveSection("features-portfolio")}
                            />
                            <NavItem
                                icon={<History className="w-4 h-4" />}
                                label="Transaction History"
                                active={activeSection === "features-history"}
                                onClick={() => setActiveSection("features-history")}
                            />
                        </div>

                        {/* Reference */}
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Reference
                            </p>
                            <NavItem
                                icon={<FileCode className="w-4 h-4" />}
                                label="Smart Contracts"
                                active={activeSection === "contracts"}
                                onClick={() => setActiveSection("contracts")}
                            />
                            <NavItem
                                icon={<DollarSign className="w-4 h-4" />}
                                label="Supported Tokens"
                                active={activeSection === "tokens"}
                                onClick={() => setActiveSection("tokens")}
                            />
                            <NavItem
                                icon={<Settings className="w-4 h-4" />}
                                label="Network Config"
                                active={activeSection === "network"}
                                onClick={() => setActiveSection("network")}
                            />
                            <NavItem
                                icon={<Code2 className="w-4 h-4" />}
                                label="API Reference"
                                active={activeSection === "api-reference"}
                                onClick={() => setActiveSection("api-reference")}
                            />
                        </div>

                        {/* Documentation */}
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Documentation
                            </p>
                            <NavItem
                                icon={<AlertTriangle className="w-4 h-4" />}
                                label="Error Codes"
                                active={activeSection === "error-codes"}
                                onClick={() => setActiveSection("error-codes")}
                            />
                            <NavItem
                                icon={<HelpCircle className="w-4 h-4" />}
                                label="Troubleshooting"
                                active={activeSection === "troubleshooting"}
                                onClick={() => setActiveSection("troubleshooting")}
                            />
                            <NavItem
                                icon={<Shield className="w-4 h-4" />}
                                label="Best Practices"
                                active={activeSection === "best-practices"}
                                onClick={() => setActiveSection("best-practices")}
                            />
                            <NavItem
                                icon={<HelpCircle className="w-4 h-4" />}
                                label="FAQ"
                                active={activeSection === "faq"}
                                onClick={() => setActiveSection("faq")}
                            />
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Content */}
            <main className="ml-64 flex-1 p-8 max-w-4xl">
                {activeSection === "introduction" && <IntroductionSection />}
                {activeSection === "quick-start" && <QuickStartSection />}
                {activeSection === "why-arcdex" && <WhyArcDexSection />}
                {activeSection === "features-swap" && <SwapSection />}
                {activeSection === "features-pools" && <PoolsSection />}
                {activeSection === "features-payments" && <PaymentsSection />}
                {activeSection === "features-portfolio" && <PortfolioSection />}
                {activeSection === "features-history" && <HistorySection />}
                {activeSection === "contracts" && <ContractsSection />}
                {activeSection === "tokens" && <TokensSection />}
                {activeSection === "network" && <NetworkSection />}
                {activeSection === "api-reference" && <APIReferenceSection />}
                {activeSection === "error-codes" && <ErrorCodesSection />}
                {activeSection === "troubleshooting" && <TroubleshootingSection />}
                {activeSection === "best-practices" && <BestPracticesSection />}
                {activeSection === "faq" && <FAQSection />}
            </main>
        </div>
    )
}

function PortugueseDocsPage() {
    const items = [
        { href: "#intro", label: "Introdução", icon: BookOpen },
        { href: "#quick-start", label: "Início rápido", icon: Zap },
        { href: "#features", label: "Recursos", icon: Info },
        { href: "#contracts", label: "Contratos", icon: FileCode },
        { href: "#security", label: "Boas práticas", icon: Shield },
        { href: "#faq", label: "FAQ", icon: HelpCircle },
    ]

    return (
        <div className="flex min-h-screen -mx-6 -mt-8">
            <aside className="w-64 bg-card border-r border-border fixed h-full overflow-y-auto">
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-foreground">Documentação</h2>
                        <p className="text-xs text-muted-foreground">Guia prático do ARCDex</p>
                    </div>
                    <nav className="space-y-1">
                        {items.map((item) => {
                            const Icon = item.icon
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{item.label}</span>
                                </a>
                            )
                        })}
                    </nav>
                </div>
            </aside>

            <main className="ml-64 flex-1 p-8 max-w-4xl space-y-8">
                <section id="intro" className="space-y-4">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground mb-4">Introdução</h1>
                        <p className="text-xl text-muted-foreground">
                            ARCDex é uma plataforma DeFi na Arc Network para swap, pools de liquidez, bridge e pagamentos em stablecoins.
                        </p>
                    </div>
                    <Card className="bg-card border-primary/30">
                        <CardContent className="p-6 space-y-3">
                            <h3 className="text-lg font-semibold text-foreground">O que você pode fazer</h3>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                                <li>Trocar USDC e EURC com liquidação rápida.</li>
                                <li>Trazer USDC de outras redes via bridge CCTP v2.</li>
                                <li>Fornecer liquidez em pools e acompanhar sua participação.</li>
                                <li>Enviar pagamentos on-chain com memo e taxa baixa.</li>
                                <li>Acompanhar saldos de USDC e EURC pelo app.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </section>

                <section id="quick-start" className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">Início rápido</h2>
                    <div className="grid gap-4">
                        {[
                            ["1", "Conecte a carteira", "Use WalletConnect no mobile ou uma extensão EVM no desktop."],
                            [  "2", `Adicione a ${NETWORK_LABEL}`, `Chain ID ${CHAIN_CONFIG.id}, RPC ${RPC_URLS[0]} e explorer ${ARCSCAN_URL}.`],
                            [  "3", IS_MAINNET ? "Traga USDC para a Arc" : "Pegue tokens de teste", IS_MAINNET ? "Use o bridge CCTP v2 para trazer USDC de outra rede, ou deposite direto na Arc." : "Use o Circle Faucet e selecione a rede Arc para solicitar USDC e EURC de testnet."],
                            ["4", "Teste o fluxo", "Comece por swap, depois bridge, pools, pagamentos e portfolio."],
                        ].map(([step, title, body]) => (
                            <Card key={step} className="bg-card border-border">
                                <CardContent className="p-5 flex gap-4">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">{step}</span>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{body}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section id="features" className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">Recursos</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            [Zap, "Swap", "Troca entre stablecoins com cotação e histórico."],
                            [Droplets, "Pools", "Adicionar ou remover liquidez e ver participação no pool."],
                                                        [Send, "Pagamentos", "Pagamento único ou em lote para endereços EVM."],
                            [PieChart, "Portfólio", "Saldos, valor estimado e histórico via ArcScan."],
                            [History, "Histórico", "Atalhos para explorer e contratos principais."],
                        ].map(([Icon, title, body]) => {
                            const FeatureIcon = Icon as typeof Zap
                            return (
                                <Card key={String(title)} className="bg-card border-border">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FeatureIcon className="w-4 h-4 text-primary" />
                                            <h3 className="font-semibold text-foreground">{String(title)}</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{String(body)}</p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </section>

                <section id="contracts" className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">Contratos e rede</h2>
                    <Card className="bg-card border-border">
                        <CardContent className="p-6 space-y-3">
                            <p className="text-muted-foreground">
                                Os contratos do ARCDex estão implantados na {NETWORK_LABEL}. Verifique endereços e transações no ArcScan antes de operar.
                            </p>
                            <div className="grid md:grid-cols-2 gap-3">
                                <Link href="/app/contracts" prefetch={false} className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
                                    Ver contratos no app <ArrowRight className="w-4 h-4" />
                                </Link>
                                <a href={ARCSCAN_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
                                    Abrir ArcScan <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section id="security" className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">Boas práticas</h2>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                        <p className="text-sm text-amber-700 dark:text-amber-200">
                            {IS_MAINNET ? "ARCDex opera com fundos reais na Arc Mainnet. Transações são irreversíveis e os contratos não passaram por auditoria externa." : "ARCDex está em testnet. Use apenas tokens de teste e nunca envie fundos reais para contratos de teste."}
                        </p>
                    </div>
                    <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                        <li>Confirme se sua carteira está na {NETWORK_LABEL} antes de assinar.</li>
                        <li>Use pequenas quantidades para testar cada fluxo.</li>
                        <li>Verifique transações no ArcScan após cada operação.</li>
                        <li>Não compartilhe seed phrase, chave privada ou códigos de autenticação.</li>
                    </ul>
                </section>

                <section id="faq" className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">FAQ</h2>
                    <Card className="bg-card border-border">
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <h3 className="font-semibold text-foreground">É dinheiro real?</h3>
                                <p className="text-sm text-muted-foreground mt-1">{IS_MAINNET ? "Sim. Na Arc Mainnet os valores são reais — confira sempre antes de assinar." : "Não. O app usa Arc Testnet e tokens de teste."}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Por que a carteira precisa aprovar tokens?</h3>
                                <p className="text-sm text-muted-foreground mt-1">Aprovação permite que o contrato use o token naquela operação, como swap, pool, bridge ou pagamento.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Onde vejo as transações?</h3>
                                <p className="text-sm text-muted-foreground mt-1">Use a aba Histórico ou abra o endereço da carteira no ArcScan.</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </main>
        </div>
    )
}

function SpanishDocsPage() {
    const items = [
        { href: "#intro", label: "Introducción", icon: BookOpen },
        { href: "#quick-start", label: "Inicio rápido", icon: Zap },
        { href: "#features", label: "Funciones", icon: Info },
        { href: "#contracts", label: "Contratos", icon: FileCode },
        { href: "#security", label: "Buenas prácticas", icon: Shield },
        { href: "#faq", label: "FAQ", icon: HelpCircle },
    ]

    return (
        <div className="flex min-h-screen -mx-6 -mt-8">
            <aside className="w-64 bg-card border-r border-border fixed h-full overflow-y-auto">
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-foreground">Documentación</h2>
                        <p className="text-xs text-muted-foreground">Guía práctica de ARCDex</p>
                    </div>
                    <nav className="space-y-1">
                        {items.map((item) => {
                            const Icon = item.icon
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{item.label}</span>
                                </a>
                            )
                        })}
                    </nav>
                </div>
            </aside>

            <main className="ml-64 flex-1 p-8 max-w-4xl space-y-8">
                <section id="intro" className="space-y-4">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground mb-4">Introducción</h1>
                        <p className="text-xl text-muted-foreground">
                            ARCDex es una plataforma DeFi en Arc Network para swaps, pools de liquidez, bridge y pagos en stablecoins.
                        </p>
                    </div>
                    <Card className="bg-card border-primary/30">
                        <CardContent className="p-6 space-y-3">
                            <h3 className="text-lg font-semibold text-foreground">Qué puedes hacer</h3>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                                <li>Intercambiar USDC y EURC con liquidación rápida.</li>
                                <li>Traer USDC desde otras redes mediante bridge CCTP v2.</li>
                                <li>Aportar liquidez en pools y seguir tu participación.</li>
                                <li>Enviar pagos on-chain con memo y baja comisión.</li>
                                <li>Seguir saldos de USDC y EURC desde la app.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </section>

                <section id="quick-start" className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">Inicio rápido</h2>
                    <div className="grid gap-4">
                        {[
                            ["1", "Conecta la wallet", "Usa WalletConnect en móvil o una extensión EVM en desktop."],
                            [  "2", `Agrega ${NETWORK_LABEL}`, `Chain ID ${CHAIN_CONFIG.id}, RPC ${RPC_URLS[0]} y explorer ${ARCSCAN_URL}.`],
                            [  "3", IS_MAINNET ? "Trae USDC a Arc" : "Obtén tokens de prueba", IS_MAINNET ? "Usa el bridge CCTP v2 para traer USDC desde otra red, o deposita directo en Arc." : "Usa Circle Faucet y selecciona la red Arc para solicitar USDC y EURC de testnet."],
                            ["4", "Prueba el flujo", "Empieza por swap y luego bridge, pools, pagos y portafolio."],
                        ].map(([step, title, body]) => (
                            <Card key={step} className="bg-card border-border">
                                <CardContent className="p-5 flex gap-4">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">{step}</span>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{body}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section id="features" className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">Funciones</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            [Zap, "Swap", "Intercambio entre stablecoins con cotización e historial."],
                            [Droplets, "Pools", "Agrega o retira liquidez y mira tu participación en el pool."],
                                                        [Send, "Pagos", "Pago individual o por lote para direcciones EVM."],
                            [PieChart, "Portafolio", "Saldos, valor estimado e historial vía ArcScan."],
                            [History, "Historial", "Atajos al explorer y a los contratos principales."],
                        ].map(([Icon, title, body]) => {
                            const FeatureIcon = Icon as typeof Zap
                            return (
                                <Card key={String(title)} className="bg-card border-border">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FeatureIcon className="w-4 h-4 text-primary" />
                                            <h3 className="font-semibold text-foreground">{String(title)}</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{String(body)}</p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </section>

                <section id="contracts" className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">Contratos y red</h2>
                    <Card className="bg-card border-border">
                        <CardContent className="p-6 space-y-3">
                            <p className="text-muted-foreground">
                                Los contratos de ARCDex están desplegados en {NETWORK_LABEL}. Verifica direcciones y transacciones en ArcScan antes de operar.
                            </p>
                            <div className="grid md:grid-cols-2 gap-3">
                                <Link href="/app/contracts" prefetch={false} className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
                                    Ver contratos en la app <ArrowRight className="w-4 h-4" />
                                </Link>
                                <a href={ARCSCAN_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
                                    Abrir ArcScan <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section id="security" className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">Buenas prácticas</h2>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                        <p className="text-sm text-amber-700 dark:text-amber-200">
                            {IS_MAINNET ? "ARCDex opera con fondos reales en Arc Mainnet. Las transacciones son irreversibles y los contratos no han sido auditados externamente." : "ARCDex está en testnet. Usa solo tokens de prueba y nunca envíes fondos reales a contratos de prueba."}
                        </p>
                    </div>
                    <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                        <li>Confirma que tu wallet esté en {NETWORK_LABEL} antes de firmar.</li>
                        <li>Usa cantidades pequeñas para probar cada flujo.</li>
                        <li>Verifica las transacciones en ArcScan después de cada operación.</li>
                        <li>No compartas seed phrase, clave privada ni códigos de autenticación.</li>
                    </ul>
                </section>

                <section id="faq" className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">FAQ</h2>
                    <Card className="bg-card border-border">
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <h3 className="font-semibold text-foreground">¿Es dinero real?</h3>
                                <p className="text-sm text-muted-foreground mt-1">{IS_MAINNET ? "Sí. En Arc Mainnet los valores son reales — revisa siempre antes de firmar." : "No. La app usa Arc Testnet y tokens de prueba."}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">¿Por qué la wallet necesita aprobar tokens?</h3>
                                <p className="text-sm text-muted-foreground mt-1">La aprobación permite que el contrato use el token en esa operación, como swap, pool, bridge o pago.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">¿Dónde veo las transacciones?</h3>
                                <p className="text-sm text-muted-foreground mt-1">Usa la pestaña Historial o abre la dirección de la wallet en ArcScan.</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </main>
        </div>
    )
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    )
}

// Content Sections
function IntroductionSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Introduction</h1>
                <p className="text-xl text-muted-foreground">
                    Welcome to ARCDex — a decentralized exchange built on Arc Network
                </p>
            </div>

            <Card className="bg-card border-primary/30">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">What is ARCDex?</h3>
                    <p className="text-muted-foreground mb-4">
                        ARCDex is a comprehensive DeFi platform built on Arc Network that enables:
                    </p>
                    <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                        <li><strong className="text-foreground">Token Swaps</strong> - Exchange USDC ↔ EURC with minimal slippage using AMM</li>
                        <li><strong className="text-foreground">Bridge</strong> - Move USDC in and out of Arc with Circle CCTP v2</li>
                        <li><strong className="text-foreground">Liquidity Pools</strong> - Provide liquidity and earn 0.3% trading fees</li>
                        <li><strong className="text-foreground">P2P Payments</strong> - Send stablecoins with on-chain memos</li>
                        <li><strong className="text-foreground">Portfolio Dashboard</strong> - Track balances, transactions, and portfolio value</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Key Features</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Fast Transactions</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Sub-second finality on Arc Network</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Low Fees</span>
                            </div>
                            <p className="text-sm text-muted-foreground">USDC as native gas token</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Secure</span>
                            </div>
                            <p className="text-sm text-muted-foreground">OpenZeppelin audited contracts</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Code2 className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Open Source</span>
                            </div>
                            <p className="text-sm text-muted-foreground">MIT licensed on GitHub</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-sm text-amber-700 dark:text-amber-200">
                    {IS_MAINNET ? (
                        <><strong>⚠️ Real funds:</strong> ARCDex runs on Arc Mainnet. Transactions are
                        irreversible and involve real value. The contracts have not been audited — use at your own risk.</>
                    ) : MAINNET_PENDING ? (
                        <><strong>⚠️ Pre-launch:</strong> Arc Public Mainnet goes live on {MAINNET_LAUNCH_LABEL}.
                        Until then ARCDex runs on Arc Testnet with test tokens that hold no real value.</>
                    ) : (
                        <><strong>⚠️ Testnet:</strong> ARCDex is running on Arc Testnet. Do not use real funds.
                        All tokens are testnet tokens with no real value.</>
                    )}
                </p>
            </div>
        </div>
    )
}

function QuickStartSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Quick Start</h1>
                <p className="text-xl text-muted-foreground">Get started with ARCDex in 5 simple steps</p>
            </div>

            <div className="space-y-4">
                <StepCard step={1} title="Install Wallet">
                    <p className="text-muted-foreground mb-3">
                        Install MetaMask or any Web3 wallet that supports EVM chains.
                    </p>
                    <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                        <p className="font-semibold text-foreground">Recommended Wallets:</p>
                        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                            <li>MetaMask (Desktop & Mobile)</li>
                            <li>WalletConnect compatible wallets</li>
                            <li>Rabby Wallet</li>
                        </ul>
                    </div>
                </StepCard>

                <StepCard step={2} title={`Add ${NETWORK_LABEL}`}>
                    <p className="text-muted-foreground mb-3">
                        Add {NETWORK_LABEL} to your wallet manually or let ARCDex add it automatically when you connect.
                    </p>
                    <div className="bg-muted p-3 rounded-lg text-sm">
                        <p className="font-semibold text-foreground mb-2">Network Details:</p>
                        <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                            <li>• Network Name: {CHAIN_CONFIG.name}</li>
                            <li>• Chain ID: {CHAIN_CONFIG.id}</li>
                            <li>• RPC URL: {RPC_URLS[0]}</li>
                            <li>• Currency Symbol: USDC</li>
                            <li>• Block Explorer: {ARCSCAN_URL}</li>
                        </ul>
                    </div>
                </StepCard>

                <StepCard step={3} title={IS_MAINNET ? "Fund Your Wallet" : "Get Testnet Tokens"}>
                    {IS_MAINNET ? (
                        <>
                            <p className="text-muted-foreground mb-3">
                                You need USDC on Arc for gas and trading. Bridge it in from another chain with
                                Circle CCTP v2, or deposit directly from an exchange that supports Arc.
                            </p>
                            <Link
                                href="/app/bridge"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                            >
                                Open Bridge <ArrowRight className="w-4 h-4" />
                            </Link>
                        </>
                    ) : (
                        <>
                            <p className="text-muted-foreground mb-3">
                                You need USDC for gas fees and trading. Get testnet tokens from the Circle Faucet:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href={FAUCET_URL ?? "https://faucet.circle.com"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                >
                                    Get Testnet USDC <ExternalLink className="w-4 h-4" />
                                </a>
                                <a
                                    href={FAUCET_URL ?? "https://faucet.circle.com"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium border border-border"
                                >
                                    Get Testnet EURC <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Select <strong>{CHAIN_CONFIG.name}</strong> as the network when requesting tokens.
                            </p>
                        </>
                    )}
                </StepCard>

                <StepCard step={4} title="Connect Wallet">
                    <p className="text-muted-foreground mb-3">
                        Click <strong className="text-primary">"Connect Wallet"</strong> in the top right corner and select your wallet.
                    </p>
                    <div className="bg-muted p-3 rounded-lg text-sm">
                        <p className="font-semibold text-foreground mb-2">Supported Connection Methods:</p>
                        <ul className="space-y-1 text-muted-foreground">
                            <li>• Browser Extension (MetaMask, Rabby, etc.)</li>
                            <li>• WalletConnect (Mobile wallets)</li>
                            <li>• Deep Links (Mobile wallet browsers)</li>
                        </ul>
                    </div>
                </StepCard>

                <StepCard step={5} title="Start Using ARCDex">
                    <p className="text-muted-foreground mb-3">
                        Once connected, you can access all features:
                    </p>
                    <div className="grid gap-2">
                        <Link href="/app/swap" className="flex items-center gap-2 text-primary hover:underline text-sm">
                            <ArrowRight className="w-4 h-4" /> Swap USDC for EURC
                        </Link>
                        <Link href="/app/bridge" className="flex items-center gap-2 text-primary hover:underline text-sm">
                            <ArrowRight className="w-4 h-4" /> Bridge USDC into Arc
                        </Link>
                        <Link href="/app/pools" className="flex items-center gap-2 text-primary hover:underline text-sm">
                            <ArrowRight className="w-4 h-4" /> Provide liquidity
                        </Link>
                        <Link href="/app/payments" className="flex items-center gap-2 text-primary hover:underline text-sm">
                            <ArrowRight className="w-4 h-4" /> Send payments
                        </Link>
                        <Link href="/app/portfolio" className="flex items-center gap-2 text-primary hover:underline text-sm">
                            <ArrowRight className="w-4 h-4" /> View portfolio
                        </Link>
                    </div>
                </StepCard>
            </div>
        </div>
    )
}

function WhyArcDexSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Why ArcDex?</h1>
                <p className="text-xl text-muted-foreground">Built on Arc Network for stablecoin-native DeFi</p>
            </div>

            <Card className="bg-card border-primary/30">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Arc Network Advantages</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-primary" />
                                USDC as Native Gas
                            </h4>
                            <p className="text-muted-foreground text-sm">
                                No need to convert to ETH or other volatile tokens. Pay gas fees directly with USDC, 
                                making transactions simpler and more predictable.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" />
                                Fast Finality
                            </h4>
                            <p className="text-muted-foreground text-sm">
                                Sub-second transaction confirmation means your swaps, bridges, and payments are 
                                confirmed almost instantly.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Low Fees
                            </h4>
                            <p className="text-muted-foreground text-sm">
                                Optimized for high-frequency DeFi operations with minimal gas costs, 
                                making small transactions economically viable.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Stablecoin-First Design
                            </h4>
                            <p className="text-muted-foreground text-sm">
                                Built specifically for stablecoins (USDC, EURC),
                                optimized for real-world financial applications.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">ArcDex Features</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="font-medium text-foreground">Complete DeFi Suite</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Swap, bridge, provide liquidity, and send payments all in one platform</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="font-medium text-foreground">Portfolio Tracking</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Real-time balance tracking and transaction history</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="font-medium text-foreground">Mobile Support</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Works seamlessly on desktop and mobile devices</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="font-medium text-foreground">Open Source</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Fully auditable codebase on GitHub</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function SwapSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Swap Tokens</h1>
                <p className="text-xl text-muted-foreground">Exchange stablecoins instantly with minimal slippage</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">How it Works</h3>
                    <p className="text-muted-foreground">
                        ARCDex uses an Automated Market Maker (AMM) model with a constant product formula (x * y = k) 
                        to enable instant token swaps. The exchange rate is determined by the ratio of tokens in the liquidity pool.
                    </p>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <p className="text-sm"><strong className="text-foreground">Trading Fee:</strong> 0.3% per swap (30 basis points)</p>
                        <p className="text-sm"><strong className="text-foreground">Slippage:</strong> Configurable (default 0.5%)</p>
                        <p className="text-sm"><strong className="text-foreground">Min Amount:</strong> 0.01 tokens</p>
                        <p className="text-sm"><strong className="text-foreground">Supported Pairs:</strong> USDC ↔ EURC</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Step-by-Step Guide</h3>
                    <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                        <li>
                            <strong className="text-foreground">Navigate to Swap:</strong> Go to the Swap page from the navigation menu
                        </li>
                        <li>
                            <strong className="text-foreground">Select Tokens:</strong> Choose the token you want to swap from (USDC or EURC) 
                            and the token you want to receive
                        </li>
                        <li>
                            <strong className="text-foreground">Enter Amount:</strong> Type the amount you want to swap. 
                            The output amount will be calculated automatically
                        </li>
                        <li>
                            <strong className="text-foreground">Approve Token (First Time):</strong> If this is your first swap with this token, 
                            you'll need to approve the contract to spend your tokens
                        </li>
                        <li>
                            <strong className="text-foreground">Review & Swap:</strong> Check the exchange rate, slippage, and fees, 
                            then click "Swap" and confirm the transaction in your wallet
                        </li>
                    </ol>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Understanding Slippage</h3>
                    <p className="text-muted-foreground text-sm">
                        Slippage is the difference between the expected price and the actual execution price. 
                        Higher slippage tolerance allows larger trades but may result in less favorable rates. 
                        For stablecoin pairs like USDC/EURC, slippage is typically very low.
                    </p>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-sm text-blue-200">
                            <strong>💡 Tip:</strong> For stablecoin swaps, 0.5% slippage is usually sufficient. 
                            Increase only if your transaction is failing.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function PoolsSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Liquidity Pools</h1>
                <p className="text-xl text-muted-foreground">Provide liquidity and earn trading fees</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">How it Works</h3>
                    <p className="text-muted-foreground">
                        When you provide liquidity, you deposit an equal value of both tokens (USDC and EURC) into the pool. 
                        In return, you receive LP (Liquidity Provider) tokens representing your share of the pool.
                    </p>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <p className="text-sm"><strong className="text-foreground">Trading Fee Share:</strong> Earn 0.3% of all swap fees proportional to your LP tokens</p>
                        <p className="text-sm"><strong className="text-foreground">LP Tokens:</strong> ERC-20 tokens representing your pool share</p>
                        <p className="text-sm"><strong className="text-foreground">Withdrawal:</strong> Burn LP tokens to get back your share of both tokens</p>
                        <p className="text-sm"><strong className="text-foreground">Active Pool:</strong> USDC/EURC (50/50 ratio)</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Step-by-Step Guide</h3>
                    <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                        <li>
                            <strong className="text-foreground">Navigate to Pools:</strong> Go to the Pools page
                        </li>
                        <li>
                            <strong className="text-foreground">Enter Amounts:</strong> Enter the amount of USDC and EURC you want to provide. 
                            The ratio must be approximately 50/50
                        </li>
                        <li>
                            <strong className="text-foreground">Approve Tokens:</strong> Approve both USDC and EURC for the swap contract
                        </li>
                        <li>
                            <strong className="text-foreground">Add Liquidity:</strong> Click "Add Liquidity" and confirm the transaction
                        </li>
                        <li>
                            <strong className="text-foreground">Receive LP Tokens:</strong> You'll receive LP tokens representing your share
                        </li>
                    </ol>
                </CardContent>
            </Card>

            <Card className="bg-card border-amber-500/30">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        Understanding Impermanent Loss
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Impermanent loss occurs when the price ratio of the two tokens in the pool changes. 
                        For stablecoin pairs like USDC/EURC, this risk is minimal since both tokens maintain a relatively stable ratio.
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                        <p className="text-sm text-amber-200">
                            <strong>⚠️ Note:</strong> While stablecoin pairs have lower impermanent loss risk, 
                            always understand the risks before providing liquidity.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function PaymentsSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Payments</h1>
                <p className="text-xl text-muted-foreground">Send stablecoins with on-chain memos</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Features</h3>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• Send USDC or EURC to any address on Arc Network</li>
                        <li>• Add optional memo (stored on-chain, max 256 characters)</li>
                        <li>• View payment history in the History page</li>
                        <li>• Track sent and received payments</li>
                        <li>• Low fees: 0.05 USDC per payment</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Step-by-Step Guide</h3>
                    <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                        <li>
                            <strong className="text-foreground">Navigate to Payments:</strong> Go to the Payments page
                        </li>
                        <li>
                            <strong className="text-foreground">Select Token:</strong> Choose USDC or EURC
                        </li>
                        <li>
                            <strong className="text-foreground">Enter Recipient:</strong> Paste the recipient's wallet address
                        </li>
                        <li>
                            <strong className="text-foreground">Enter Amount:</strong> Specify the amount to send
                        </li>
                        <li>
                            <strong className="text-foreground">Add Memo (Optional):</strong> Add a message that will be stored on-chain
                        </li>
                        <li>
                            <strong className="text-foreground">Approve & Send:</strong> Approve the token (first time) and send the payment
                        </li>
                    </ol>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Payment Methods</h3>
                    <div className="space-y-3">
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-foreground mb-1">sendPayment</p>
                            <p className="text-sm text-muted-foreground">
                                Sends the specified amount plus the payment fee. The recipient receives the exact amount you specify.
                            </p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-foreground mb-1">sendExactPayment</p>
                            <p className="text-sm text-muted-foreground">
                                Sends an exact amount. The fee is deducted from your balance separately.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function PortfolioSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Portfolio Dashboard</h1>
                <p className="text-xl text-muted-foreground">Track your assets, balances, and portfolio value</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Features</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Portfolio Stats</span>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Total Balance</li>
                                <li>LP Positions</li>
                                <li>Trading Fees Earned</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Charts</span>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>24H Portfolio Evolution</li>
                                <li>7D Portfolio Evolution</li>
                                <li>30D Portfolio Evolution</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Token Balances</span>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>USDC Balance</li>
                                <li>EURC Balance</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">Transactions</span>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Recent Transactions</li>
                                <li>Transaction Classification</li>
                                <li>Explorer Links</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">How it Works</h3>
                    <p className="text-muted-foreground">
                        The Portfolio dashboard reads your on-chain balances in real-time using wagmi hooks. 
                        Transaction history is fetched from the ArcScan Explorer API and automatically classified 
                        into categories (Swaps, Bridge, Liquidity, Transfers).
                    </p>
                    <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">Note:</strong> Portfolio values are estimated based on 
                            off-chain price data. All estimated values are labeled as such for transparency.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function HistorySection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Transaction History</h1>
                <p className="text-xl text-muted-foreground">View and track all your on-chain transactions</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Features</h3>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• View all transactions for your connected wallet</li>
                        <li>• Automatic transaction classification (Swap, Bridge, Liquidity, Transfer)</li>
                        <li>• Direct links to ArcScan Explorer</li>
                        <li>• Transaction details including amounts, fees, and status</li>
                        <li>• Filter by transaction type</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Transaction Types</h3>
                    <div className="space-y-3">
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-foreground mb-1">Swap Transactions</p>
                            <p className="text-sm text-muted-foreground">
                                Interactions with the ArcDexSwap contract for token exchanges
                            </p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-foreground mb-1">Bridge Transactions</p>
                            <p className="text-sm text-muted-foreground">
                                Cross-chain USDC deposits and withdrawals via CCTP v2
                            </p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-foreground mb-1">Liquidity Transactions</p>
                            <p className="text-sm text-muted-foreground">
                                Adding or removing liquidity from pools
                            </p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-foreground mb-1">Transfer Transactions</p>
                            <p className="text-sm text-muted-foreground">
                                Standard ERC-20 token transfers
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function ContractsSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Smart Contracts</h1>
                <p className="text-xl text-muted-foreground">Verified contract addresses on {NETWORK_LABEL}</p>
            </div>

            <div className="space-y-3">
                <ContractCard
                    name="ArcDexSwap"
                    address={ARCDEX.Swap}
                    desc="Automated Market Maker for USDC/EURC swaps using constant product formula (x * y = k)"
                    functions={["swap", "addLiquidity", "removeLiquidity", "getReserves", "getAmountOut"]}
                />
                <ContractCard
                    name="ArcDexLP"
                    address={ARCDEX.LP}
                    desc="ERC-20 Liquidity Provider tokens representing pool shares for USDC/EURC pool"
                    functions={["balanceOf", "totalSupply", "transfer", "approve", "mint", "burn"]}
                />
                <ContractCard
                    name="ArcDexPayments"
                    address={ARCDEX.Payments}
                    desc="P2P payment system with on-chain memo support (0.05 USDC fee per payment)"
                    functions={["sendPayment", "sendExactPayment", "paymentFee"]}
                />
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Security Features</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• <strong className="text-foreground">ReentrancyGuard:</strong> All state-changing functions protected</p>
                        <p>• <strong className="text-foreground">SafeERC20:</strong> Safe token transfers using OpenZeppelin</p>
                        <p>• <strong className="text-foreground">Ownable:</strong> Admin functions restricted to contract owner</p>
                        <p>• <strong className="text-foreground">Input Validation:</strong> All inputs validated before execution</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function TokensSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Supported Tokens</h1>
                <p className="text-xl text-muted-foreground">ERC20 tokens available on {NETWORK_LABEL}</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border border-border rounded-lg overflow-hidden">
                    <thead className="bg-muted">
                        <tr>
                            <th className="p-4 font-medium">Token</th>
                            <th className="p-4 font-medium">Address</th>
                            <th className="p-4 font-medium">Decimals</th>
                            <th className="p-4 font-medium">Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        <TokenRow symbol="USDC" address={TOKENS.USDC} decimals={6} type="Native Gas Token" />
                        <TokenRow symbol="EURC" address={TOKENS.EURC} decimals={6} type="Stablecoin" />
                    </tbody>
                </table>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Token Details</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">USDC (USD Coin)</h4>
                            <p className="text-sm text-muted-foreground">
                                USDC is the native EVM asset on Arc Network and is used for gas fees. 
                                It has an optional ERC-20 interface for DeFi interactions. Native balance uses 18 decimals, 
                                while ERC-20 interface uses 6 decimals.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">EURC (Euro Coin)</h4>
                            <p className="text-sm text-muted-foreground">
                                EURC is the euro-denominated stablecoin issued by Circle. It uses 6 decimals 
                                and is fully supported for swaps, pools, and payments.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function NetworkSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Network Configuration</h1>
                <p className="text-xl text-muted-foreground">Add {NETWORK_LABEL} to your wallet</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span className="text-muted-foreground text-sm">Network Name</span>
                            <p className="font-semibold">{CHAIN_CONFIG.name}</p>
                        </div>
                        <div className="space-y-2">
                            <span className="text-muted-foreground text-sm">Chain ID</span>
                            <p className="font-mono">{CHAIN_CONFIG.id}</p>
                        </div>
                        <div className="space-y-2">
                            <span className="text-muted-foreground text-sm">RPC URL</span>
                            <div className="flex items-center gap-2">
                                <p className="font-mono text-sm bg-muted p-2 rounded flex-1">{RPC_URLS[0]}</p>
                                <CopyButton text={RPC_URLS[0]} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-muted-foreground text-sm">Currency Symbol</span>
                            <p className="font-semibold">USDC</p>
                        </div>
                        <div className="space-y-2">
                            <span className="text-muted-foreground text-sm">Block Explorer</span>
                            <a href={ARCSCAN_URL} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                {ARCSCAN_URL.replace(/^https:\/\//, "")} <ExternalLink size={14} />
                            </a>
                        </div>
                        {FAUCET_URL && (
                            <div className="space-y-2">
                                <span className="text-muted-foreground text-sm">Faucet</span>
                                <a href={FAUCET_URL} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                    faucet.circle.com <ExternalLink size={14} />
                                </a>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Adding Network to MetaMask</h3>
                    <ol className="space-y-2 list-decimal list-inside text-muted-foreground text-sm">
                        <li>Open MetaMask and click the network dropdown</li>
                        <li>Click "Add Network" or "Add Network Manually"</li>
                        <li>Enter the network details from above</li>
                        <li>Click "Save" to add the network</li>
                        <li>Switch to {NETWORK_LABEL} to start using ARCDex</li>
                    </ol>
                </CardContent>
            </Card>
        </div>
    )
}

function APIReferenceSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">API Reference</h1>
                <p className="text-xl text-muted-foreground">Contract functions and hooks reference</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">React Hooks</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        ARCDex provides custom React hooks for interacting with contracts. All hooks are available in <code className="bg-muted px-1 rounded">hooks/use-contracts.ts</code>
                    </p>
                    <div className="space-y-3">
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">useTokenBalance(token)</p>
                            <p className="text-xs text-muted-foreground">Get ERC-20 token balance for connected wallet</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">useTokenAllowance(token, spender)</p>
                            <p className="text-xs text-muted-foreground">Check token allowance for a spender address</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">useSwapReserves()</p>
                            <p className="text-xs text-muted-foreground">Get current pool reserves (USDC and EURC)</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">useGetAmountOut(tokenIn, amountIn)</p>
                            <p className="text-xs text-muted-foreground">Calculate output amount for a swap</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Contract Functions</h3>
                    <div className="space-y-3">
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">ArcDexSwap.swap(tokenIn, amountIn, minAmountOut)</p>
                            <p className="text-xs text-muted-foreground">Swap tokens with slippage protection</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm font-semibold text-foreground mb-1">ArcDexPayments.sendPayment(token, recipient, amount, memo)</p>
                            <p className="text-xs text-muted-foreground">Send payment with optional memo</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function ErrorCodesSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Error Codes</h1>
                <p className="text-xl text-muted-foreground">Common errors and how to resolve them</p>
            </div>

            <div className="space-y-3">
                <ErrorCard
                    code="ERC20: transfer amount exceeds allowance"
                    title="Insufficient Allowance"
                    description="The contract doesn't have permission to spend your tokens"
                    solution="Click 'Approve' button to grant permission. You only need to do this once per token."
                />
                <ErrorCard
                    code="ERC20: transfer amount exceeds balance"
                    title="Insufficient Balance"
                    description="You don't have enough tokens to complete the transaction"
                    solution="Check your balance and reduce the amount, or get more tokens from the faucet."
                />
                <ErrorCard
                    code="InsufficientOutputAmount"
                    title="Slippage Too High"
                    description="The price moved too much during the transaction"
                    solution="Increase your slippage tolerance in settings, or try again with a smaller amount."
                />
                <ErrorCard
                    code="User rejected the request"
                    title="Transaction Rejected"
                    description="You rejected the transaction in your wallet"
                    solution="Approve the transaction in your wallet to proceed."
                />
                <ErrorCard
                    code="Network error"
                    title="Network Connection Issue"
                    description="Unable to connect to Arc Network"
                    solution={`Check your internet connection and ensure you're connected to ${NETWORK_LABEL} in your wallet.`}
                />
            </div>
        </div>
    )
}

function TroubleshootingSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Troubleshooting</h1>
                <p className="text-xl text-muted-foreground">Common issues and solutions</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Wallet Connection Issues</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="font-semibold text-foreground mb-1">Wallet not connecting</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Refresh the page and try again</li>
                                <li>Ensure your wallet extension is unlocked</li>
                                <li>Try disconnecting and reconnecting</li>
                                <li>Check if your wallet supports WalletConnect</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground mb-1">Wrong network</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Switch to {NETWORK_LABEL} in your wallet</li>
                                <li>Add {NETWORK_LABEL} if it's not in your network list</li>
                                <li>Check the network configuration in the docs</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Transaction Issues</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="font-semibold text-foreground mb-1">Transaction stuck or pending</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Wait a few seconds - Arc Network has fast finality</li>
                                <li>Check the transaction on ArcScan Explorer</li>
                                <li>Try increasing gas limit if available</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground mb-1">Transaction failed</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Check the error message for details</li>
                                <li>Verify you have sufficient balance and allowance</li>
                                <li>Check if slippage tolerance is too low</li>
                                <li>View the transaction on ArcScan for more details</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Balance Issues</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="font-semibold text-foreground mb-1">Balance not updating</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Wait a few seconds for the blockchain to update</li>
                                <li>Refresh the page</li>
                                <li>Check the transaction on ArcScan to confirm it succeeded</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground mb-1">Zero balance showing</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>{IS_MAINNET ? "Top up USDC via the bridge" : "Get testnet tokens from the faucet"}</li>
                                <li>Ensure you're on {NETWORK_LABEL}</li>
                                <li>Check your wallet address is correct</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function BestPracticesSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Best Practices</h1>
                <p className="text-xl text-muted-foreground">Tips for safe and efficient usage</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Security</h3>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• <strong className="text-foreground">Verify addresses:</strong> Always double-check contract addresses before interacting</li>
                        <li>• <strong className="text-foreground">Start small:</strong> Test with small amounts first</li>
                        <li>• <strong className="text-foreground">Check transactions:</strong> Review transaction details before confirming</li>
                        <li>• <strong className="text-foreground">Use official links:</strong> Only access ARCDex through official channels</li>
                        <li>• <strong className="text-foreground">Keep private keys safe:</strong> Never share your private keys or seed phrases</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Trading</h3>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• <strong className="text-foreground">Check slippage:</strong> For stablecoin swaps, 0.5% is usually sufficient</li>
                        <li>• <strong className="text-foreground">Monitor reserves:</strong> Larger pools have better liquidity and lower slippage</li>
                        <li>• <strong className="text-foreground">Approve wisely:</strong> Only approve the amount you need, or use max approval for convenience</li>
                        <li>• <strong className="text-foreground">Gas optimization:</strong> Batch multiple operations when possible</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Liquidity Provision</h3>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• <strong className="text-foreground">Understand impermanent loss:</strong> Research before providing liquidity</li>
                        <li>• <strong className="text-foreground">Stable pairs:</strong> USDC/EURC pairs have minimal impermanent loss risk</li>
                        <li>• <strong className="text-foreground">Monitor pool health:</strong> Check pool reserves and trading volume</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}

function FAQSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
                <p className="text-xl text-muted-foreground">Common questions about ARCDex</p>
            </div>

            <div className="space-y-4">
                <FAQItem
                    question="Is ARCDex safe to use?"
                    answer="ARCDex smart contracts use OpenZeppelin libraries and include security features like ReentrancyGuard. However, this is testnet software - always do your own research and never use real funds on testnet."
                />
                <FAQItem
                    question={IS_MAINNET ? "How do I fund my wallet?" : "How do I get testnet tokens?"}
                    answer={IS_MAINNET ? "Bridge USDC into Arc with Circle CCTP v2 from the Bridge page, or deposit from an exchange that supports Arc. You'll need USDC for gas fees." : "Visit the Circle Faucet at faucet.circle.com, select Arc Testnet as the network, and request USDC or EURC. You'll need USDC for gas fees."}
                />
                <FAQItem
                    question="Why do I need to approve tokens?"
                    answer="Token approval is an ERC-20 security feature. It allows a contract to spend your tokens up to a certain amount. You only need to approve once per token per contract."
                />
                <FAQItem
                    question="What is slippage?"
                    answer="Slippage is the difference between the expected price and the actual execution price. For stablecoin pairs, slippage is typically very low (under 0.5%)."
                />
                <FAQItem
                    question="What happens if a transaction fails?"
                    answer="If a transaction fails, you won't lose any tokens. The transaction will revert and your balance will remain unchanged. Check the error message for details on why it failed."
                />
                <FAQItem
                    question="Is ARCDex open source?"
                    answer="Yes, ARCDex is open source and available on GitHub. The smart contracts and frontend code are MIT licensed."
                />
            </div>
        </div>
    )
}

// Helper Components
function StepCard({ step, title, children }: { step: number, title: string, children: React.ReactNode }) {
    return (
        <Card className="bg-card border-border">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                        {step}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                        {children}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ContractCard({ name, address, desc, functions }: { name: string, address: string, desc: string, functions?: string[] }) {
    return (
        <Card className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
                            {name}
                            <Badge variant="outline" className="text-xs font-normal">Contract</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">{desc}</p>
                        <div className="flex items-center gap-2 bg-muted p-2 rounded font-mono text-xs mb-3">
                            <span className="truncate flex-1">{address}</span>
                            <CopyButton text={address} />
                            <a 
                                href={`${ARCSCAN_URL}/address/${address}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:text-primary/80"
                            >
                                <ExternalLink size={14} />
                            </a>
                        </div>
                        {functions && (
                            <div className="mt-3">
                                <p className="text-xs font-semibold text-muted-foreground mb-2">Key Functions:</p>
                                <div className="flex flex-wrap gap-1">
                                    {functions.map((func) => (
                                        <Badge key={func} variant="secondary" className="text-xs">
                                            {func}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function TokenRow({ symbol, address, decimals = 6, type }: { symbol: string, address: string, decimals?: number, type?: string }) {
    return (
        <tr className="border-t border-border hover:bg-muted/50 transition-colors">
            <td className="p-4 font-semibold">{symbol}</td>
            <td className="p-4 font-mono text-sm text-muted-foreground">{address}</td>
            <td className="p-4">{decimals}</td>
            <td className="p-4 text-sm text-muted-foreground">{type || "ERC-20"}</td>
        </tr>
    )
}

function ErrorCard({ code, title, description, solution }: { code: string, title: string, description: string, solution: string }) {
    return (
        <Card className="bg-card border-red-500/30">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{description}</p>
                        <div className="bg-muted p-2 rounded font-mono text-xs text-muted-foreground mb-2">{code}</div>
                        <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                            <p className="text-xs text-green-200">
                                <strong>Solution:</strong> {solution}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    return (
        <Card className="bg-card border-border">
            <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2">{question}</h3>
                <p className="text-sm text-muted-foreground">{answer}</p>
            </CardContent>
        </Card>
    )
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button onClick={handleCopy} className="text-muted-foreground hover:text-primary transition-colors">
            {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
    )
}
