"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ExternalLink, Copy, Check, BookOpen, Zap, Coins, TrendingUp, 
  Droplets, Send, FileCode, Settings, Shield, HelpCircle,
  ChevronRight, Wallet, ArrowRightLeft, PiggyBank, Users,
  Globe, Terminal, AlertTriangle, CheckCircle2, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

// Sidebar menu items
const menuSections = [
  {
    title: "Getting Started",
    items: [
      { id: "introduction", label: "Introduction", icon: BookOpen },
      { id: "why-arcdex", label: "Why ARCDex", icon: Sparkles },
      { id: "quick-start", label: "Quick Start", icon: Zap },
    ]
  },
  {
    title: "Features",
    items: [
      { id: "swap", label: "Swap Tokens", icon: ArrowRightLeft },
      { id: "stake", label: "Staking", icon: TrendingUp },
      { id: "pools", label: "Liquidity Pools", icon: Droplets },
      { id: "payments", label: "Payments", icon: Send },
    ]
  },
  {
    title: "Technical",
    items: [
      { id: "contracts", label: "Smart Contracts", icon: FileCode },
      { id: "tokens", label: "Supported Tokens", icon: Coins },
      { id: "network", label: "Network Config", icon: Globe },
    ]
  },
  {
    title: "Resources",
    items: [
      { id: "security", label: "Security", icon: Shield },
      { id: "faq", label: "FAQ", icon: HelpCircle },
    ]
  }
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction")

  return (
    <div className="flex min-h-[calc(100vh-120px)] -mx-6 -my-8">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 p-4 hidden lg:block sticky top-0 h-[calc(100vh-120px)] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Documentation
          </h2>
          <p className="text-xs text-muted-foreground mt-1">ARCDex V2 Guide</p>
        </div>

        <nav className="space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all",
                          isActive 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                        {item.id === "stake" && (
                          <Badge className="ml-auto text-[10px] bg-primary/20 text-primary border-0">
                            25% APY
                          </Badge>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* External Links */}
        <div className="mt-8 pt-6 border-t border-border space-y-2">
          <a 
            href="https://testnet.arcscan.app" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            ArcScan Explorer
          </a>
          <a 
            href="https://faucet.circle.com" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            USDC Faucet
          </a>
          <a 
            href="https://docs.arc.network" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Arc Network Docs
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl">
          {/* Mobile Menu */}
          <div className="lg:hidden mb-6">
            <select 
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="w-full bg-card border border-border rounded-lg p-3 text-foreground"
            >
              {menuSections.map((section) => (
                <optgroup key={section.title} label={section.title}>
                  {section.items.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Dynamic Content */}
          <DocContent section={activeSection} />
        </div>
      </main>
    </div>
  )
}

function DocContent({ section }: { section: string }) {
  switch (section) {
    case "introduction":
      return <IntroductionSection />
    case "why-arcdex":
      return <WhyARCDexSection />
    case "quick-start":
      return <QuickStartSection />
    case "swap":
      return <SwapSection />
    case "stake":
      return <StakeSection />
    case "pools":
      return <PoolsSection />
    case "payments":
      return <PaymentsSection />
    case "contracts":
      return <ContractsSection />
    case "tokens":
      return <TokensSection />
    case "network":
      return <NetworkSection />
    case "security":
      return <SecuritySection />
    case "faq":
      return <FAQSection />
    default:
      return <IntroductionSection />
  }
}

function IntroductionSection() {
  return (
    <div className="space-y-6">
      <div>
        <Badge className="mb-4 bg-primary/20 text-primary border-0">Documentation</Badge>
        <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to ARCDex</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          ARCDex is a decentralized exchange (DEX) built on Arc Network Testnet. 
          Trade stablecoins, earn yield through staking, provide liquidity, and send 
          fast payments — all in one platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FeatureHighlight 
          icon={ArrowRightLeft} 
          title="Swap" 
          desc="Exchange USDC ↔ EURC instantly"
        />
        <FeatureHighlight 
          icon={TrendingUp} 
          title="Stake" 
          desc="Earn up to 25% APY on stablecoins"
        />
        <FeatureHighlight 
          icon={Droplets} 
          title="Pools" 
          desc="Provide liquidity, earn trading fees"
        />
        <FeatureHighlight 
          icon={Send} 
          title="Payments" 
          desc="Send stablecoins globally"
        />
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Testnet Notice</h3>
              <p className="text-sm text-muted-foreground">
                ARCDex is currently deployed on Arc Network Testnet. All tokens are test tokens 
                with no real value. Do not send real funds to these contracts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function WhyARCDexSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Why ARCDex?</h1>
        <p className="text-muted-foreground leading-relaxed">
          ARCDex combines the best of DeFi into a single, easy-to-use platform on Arc Network.
        </p>
      </div>

      <div className="space-y-4">
        <BenefitCard 
          title="Built on Arc Network"
          desc="Leverage Arc's fast, low-cost infrastructure designed for stablecoin transactions."
        />
        <BenefitCard 
          title="Stablecoin Focus"
          desc="Optimized for USDC and EURC trading with minimal slippage and competitive rates."
        />
        <BenefitCard 
          title="Earn Yield"
          desc="Multiple ways to earn: staking rewards, liquidity provider fees, and more."
        />
        <BenefitCard 
          title="Simple UX"
          desc="Clean interface designed for both beginners and experienced DeFi users."
        />
        <BenefitCard 
          title="Transparent"
          desc="All smart contracts are verified and open for inspection on ArcScan."
        />
      </div>
    </div>
  )
}

function QuickStartSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Quick Start Guide</h1>
        <p className="text-muted-foreground">Get started with ARCDex in 5 minutes.</p>
      </div>

      <div className="space-y-4">
        <StepCard 
          step={1} 
          title="Connect Your Wallet"
          desc="Click 'Connect Wallet' and use MetaMask or WalletConnect. The app will automatically prompt you to add Arc Testnet."
        />
        <StepCard 
          step={2} 
          title="Get Testnet USDC"
          desc="Visit the Circle Faucet to get free testnet USDC. You'll need this for gas fees and trading."
          link={{ url: "https://faucet.circle.com", label: "Circle Faucet" }}
        />
        <StepCard 
          step={3} 
          title="Start Trading"
          desc="Navigate to Swap to exchange tokens, Stake to earn yield, or Pools to provide liquidity."
        />
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            Network Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock code={`Network: Arc Testnet
Chain ID: 5042002
RPC: https://rpc.testnet.arc.network
Symbol: USDC
Explorer: https://testnet.arcscan.app`} />
        </CardContent>
      </Card>
    </div>
  )
}

function SwapSection() {
  return (
    <div className="space-y-6">
      <div>
        <Badge className="mb-4 bg-primary/20 text-primary border-0">Feature</Badge>
        <h1 className="text-3xl font-bold text-foreground mb-4">Swap Tokens</h1>
        <p className="text-muted-foreground leading-relaxed">
          Exchange stablecoins instantly using our automated market maker (AMM).
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">How Swaps Work</h3>
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center flex-shrink-0">1</span>
              <span>Select the token you want to swap FROM (USDC or EURC)</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center flex-shrink-0">2</span>
              <span>Enter the amount you want to swap</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center flex-shrink-0">3</span>
              <span>Review the output amount (includes 0.3% fee)</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center flex-shrink-0">4</span>
              <span>Approve the token (first time only) then confirm swap</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Swap Fee" value="0.3%" desc="Goes to liquidity providers" />
        <InfoCard title="Slippage" value="0.5%" desc="Maximum price movement" />
      </div>
    </div>
  )
}

function StakeSection() {
  return (
    <div className="space-y-6">
      <div>
        <Badge className="mb-4 bg-green-500/20 text-green-500 border-0">Popular</Badge>
        <h1 className="text-3xl font-bold text-foreground mb-4">Staking</h1>
        <p className="text-muted-foreground leading-relaxed">
          Earn passive income by staking your stablecoins in our secure vaults.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">12.5%</p>
              <p className="text-sm text-muted-foreground">USDC APY</p>
              <p className="text-xs text-muted-foreground mt-1">8% Base + 4.5% Boost</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">10%</p>
              <p className="text-sm text-muted-foreground">EURC APY</p>
              <p className="text-xs text-muted-foreground mt-1">6% Base + 4% Boost</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Staking Features</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              No lock-up period — unstake anytime
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Rewards accumulate in real-time
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Claim rewards at any time
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Compound manually or auto-compound
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function PoolsSection() {
  return (
    <div className="space-y-6">
      <div>
        <Badge className="mb-4 bg-primary/20 text-primary border-0">Feature</Badge>
        <h1 className="text-3xl font-bold text-foreground mb-4">Liquidity Pools</h1>
        <p className="text-muted-foreground leading-relaxed">
          Provide liquidity to earn a share of trading fees from every swap.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Available Pools</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">LP</div>
                <div>
                  <p className="font-medium text-foreground">USDC / EURC</p>
                  <p className="text-xs text-muted-foreground">Stablecoin pair</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-500 border-0">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">LP</div>
                <div>
                  <p className="font-medium text-foreground">USDC / USYC</p>
                  <p className="text-xs text-muted-foreground">Yield-bearing pair</p>
                </div>
              </div>
              <Badge variant="outline" className="text-muted-foreground">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-3">LP Token Rewards</h3>
          <p className="text-muted-foreground text-sm">
            When you add liquidity, you receive LP tokens representing your share of the pool. 
            These tokens accrue value as trading fees are collected (0.3% of each swap).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function PaymentsSection() {
  return (
    <div className="space-y-6">
      <div>
        <Badge className="mb-4 bg-primary/20 text-primary border-0">Feature</Badge>
        <h1 className="text-3xl font-bold text-foreground mb-4">Payments</h1>
        <p className="text-muted-foreground leading-relaxed">
          Send stablecoins to any address with optional on-chain memos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard title="Fee" value="0.05 USDC" desc="Per transaction" />
        <InfoCard title="Speed" value="~3 sec" desc="Confirmation time" />
        <InfoCard title="Memo" value="Optional" desc="On-chain message" />
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Use Cases</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              Send payments to friends and family
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              Pay for goods and services
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              Cross-border remittances
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              Invoice payments with memo reference
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function ContractsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Smart Contracts</h1>
        <p className="text-muted-foreground">All contracts deployed on Arc Testnet (Chain ID: 5042002)</p>
      </div>

      <div className="space-y-3">
        <ContractCard 
          name="ArcDexSwap" 
          address="0x6e25a59770b243113efd205b8722fe2aa942ba21"
          desc="AMM for USDC/EURC swaps with 0.3% fee"
        />
        <ContractCard 
          name="ArcDexStaking" 
          address="0xe58b6a269ab1c65e62203bd131ef5935214ce726"
          desc="Staking vault with APR rewards"
        />
        <ContractCard 
          name="ArcDexLP" 
          address="0x823f387a392bdc1ef57bc30cc005be7e6d067f13"
          desc="ERC-20 LP token for liquidity providers"
        />
        <ContractCard 
          name="ArcDexPayments" 
          address="0x9dd9ce65012b595a9dae8014ea6d1f4a8cc21a68"
          desc="P2P payment contract with memo support"
        />
      </div>
    </div>
  )
}

function TokensSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Supported Tokens</h1>
        <p className="text-muted-foreground">Tokens available on ARCDex</p>
      </div>

      <div className="space-y-3">
        <TokenCard 
          symbol="USDC" 
          name="USD Coin"
          address="0x3600000000000000000000000000000000000000"
          desc="Native stablecoin on Arc (also used for gas)"
        />
        <TokenCard 
          symbol="EURC" 
          name="Euro Coin"
          address="0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a"
          desc="Euro-denominated stablecoin by Circle"
        />
        <TokenCard 
          symbol="USYC" 
          name="Hashnote USYC"
          address="0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C"
          desc="Yield-bearing tokenized money market fund"
          badge="Coming Soon"
        />
      </div>
    </div>
  )
}

function NetworkSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Network Configuration</h1>
        <p className="text-muted-foreground">Add Arc Testnet to your wallet</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Network Name</p>
              <p className="font-medium text-foreground">Arc Testnet</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Chain ID</p>
              <p className="font-mono text-foreground">5042002</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Currency Symbol</p>
              <p className="font-medium text-foreground">USDC</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Decimals</p>
              <p className="font-mono text-foreground">6</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">RPC Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CodeBlock code="https://rpc.testnet.arc.network" copyable />
          <p className="text-xs text-muted-foreground">Alternative: wss://ws.testnet.arc.network (WebSocket)</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Block Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          <a 
            href="https://testnet.arcscan.app" 
            target="_blank" 
            rel="noreferrer"
            className="text-primary hover:underline flex items-center gap-2"
          >
            https://testnet.arcscan.app
            <ExternalLink className="w-4 h-4" />
          </a>
        </CardContent>
      </Card>
    </div>
  )
}

function SecuritySection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Security</h1>
        <p className="text-muted-foreground">Important security information</p>
      </div>

      <Card className="bg-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Testnet Only</h3>
              <p className="text-sm text-muted-foreground">
                ARCDex is currently deployed on Arc Testnet. These contracts have NOT been audited. 
                Do not send real funds or mainnet tokens to these addresses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Best Practices</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Always verify contract addresses before interacting
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Use a dedicated testnet wallet
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Check transaction details before confirming
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Report any issues on Discord
            </li>
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
        <h1 className="text-3xl font-bold text-foreground mb-4">FAQ</h1>
        <p className="text-muted-foreground">Frequently asked questions</p>
      </div>

      <div className="space-y-4">
        <FAQItem 
          q="How do I get testnet USDC?" 
          a="Visit the Circle Faucet at faucet.circle.com and connect your wallet. You can request testnet USDC for free."
        />
        <FAQItem 
          q="Why can't I swap to USYC?" 
          a="USYC swap pairs are coming soon. Currently only USDC ↔ EURC swaps are available."
        />
        <FAQItem 
          q="How are staking rewards calculated?" 
          a="Rewards accumulate based on the APR rate and your staked amount. The current rates are 12.5% for USDC and 10% for EURC."
        />
        <FAQItem 
          q="What happens to my LP tokens?" 
          a="LP tokens represent your share of the liquidity pool. When you remove liquidity, you burn LP tokens and receive your proportional share of the pool."
        />
        <FAQItem 
          q="Is this safe to use?" 
          a="ARCDex is on testnet and has not been audited. Use only testnet tokens for testing. Never send real funds."
        />
      </div>
    </div>
  )
}

// Helper Components
function FeatureHighlight({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}

function BenefitCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}

function StepCard({ step, title, desc, link }: { step: number, title: string, desc: string, link?: { url: string, label: string } }) {
  return (
    <div className="flex gap-4 p-4 bg-card rounded-lg border border-border">
      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
        {step}
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
        {link && (
          <a href={link.url} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline inline-flex items-center gap-1 mt-2">
            {link.label} <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}

function InfoCard({ title, value, desc }: { title: string, value: string, desc: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-primary my-1">{value}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  )
}

function ContractCard({ name, address, desc }: { name: string, address: string, desc: string }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              {name}
              <Badge variant="outline" className="text-xs">Contract</Badge>
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{desc}</p>
          </div>
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Copy address"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
        <div className="mt-3 p-2 bg-muted rounded text-xs font-mono text-muted-foreground truncate">
          {address}
        </div>
      </CardContent>
    </Card>
  )
}

function TokenCard({ symbol, name, address, desc, badge }: { symbol: string, name: string, address: string, desc: string, badge?: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-bold text-primary">{symbol}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{name}</h3>
              <Badge variant="outline" className="text-xs">{symbol}</Badge>
              {badge && <Badge className="bg-yellow-500/20 text-yellow-500 border-0 text-xs">{badge}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{desc}</p>
            <p className="text-xs font-mono text-muted-foreground mt-1 truncate">{address}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FAQItem({ q, a }: { q: string, a: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-2">{q}</h3>
        <p className="text-sm text-muted-foreground">{a}</p>
      </CardContent>
    </Card>
  )
}

function CodeBlock({ code, copyable }: { code: string, copyable?: boolean }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-lg text-sm font-mono text-muted-foreground overflow-x-auto">
        {code}
      </pre>
      {copyable && (
        <button 
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 hover:bg-card rounded transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
        </button>
      )}
    </div>
  )
}
