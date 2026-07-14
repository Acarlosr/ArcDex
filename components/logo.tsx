"use client"

import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  href?: string
}

export function Logo({ size = "md", showText = true, href = "/" }: LogoProps) {
  const sizes = {
    sm: { box: "w-7 h-7", text: "text-base" },
    md: { box: "w-8 h-8", text: "text-lg" },
    lg: { box: "w-10 h-10", text: "text-xl" },
  }

  const LogoContent = () => (
    <div className="flex items-center gap-2.5">
      {/* Logo ArcDex — monograma AD com órbita multi-chain */}
      <div className={`${sizes[size].box} rounded-lg overflow-hidden shrink-0 shadow-[0_0_24px_rgba(168,85,247,0.22)]`}>
        <svg
          viewBox="0 0 192 192"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <radialGradient id="arcDexLogoGlow" cx="35%" cy="20%" r="85%">
              <stop offset="0%" stopColor="#FF3BD5" />
              <stop offset="52%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#06121F" />
            </radialGradient>
            <linearGradient id="arcDexLogoStroke" x1="34" y1="40" x2="158" y2="152" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F43FCE" />
              <stop offset="48%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="arcDexLogoMark" x1="50" y1="52" x2="139" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#F5D0FE" />
              <stop offset="100%" stopColor="#BAE6FD" />
            </linearGradient>
          </defs>
          <rect width="192" height="192" rx="44" fill="#07030D" />
          <rect x="10" y="10" width="172" height="172" rx="38" fill="url(#arcDexLogoGlow)" />
          <path d="M37 111C55 57 132 42 157 86" stroke="url(#arcDexLogoStroke)" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
          <path d="M155 81L160 102L139 97" stroke="#38BDF8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
          <path d="M154 122C119 158 58 146 38 99" stroke="#F43FCE" strokeWidth="5" strokeLinecap="round" strokeDasharray="10 12" opacity="0.65" />
          <circle cx="45" cy="91" r="6" fill="#38BDF8" />
          <circle cx="147" cy="121" r="5" fill="#F43FCE" />
          <path d="M50 136L79 54H95L124 136H105L99 118H75L69 136H50ZM80 102H94L87 80L80 102Z" fill="url(#arcDexLogoMark)" />
          <path d="M118 60H139C155 60 166 72 166 96C166 120 155 132 139 132H118V116H138C145 116 150 109 150 96C150 83 145 76 138 76H134V132H118V60Z" fill="url(#arcDexLogoMark)" />
          <path d="M61 148H132" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.72" />
        </svg>
      </div>

      {showText && (
        <span className={`${sizes[size].text} font-bold tracking-tight text-foreground`}>
          ARC<span className="arc-text-gradient">Dex</span>
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-85 transition-opacity" prefetch={false}>
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}

export function LogoMini() {
  return (
    <div className="w-8 h-8 rounded-lg overflow-hidden shadow-[0_0_24px_rgba(168,85,247,0.22)]">
      <svg viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="arcDexLogoMiniGlow" cx="35%" cy="20%" r="85%">
            <stop offset="0%" stopColor="#FF3BD5" />
            <stop offset="52%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#06121F" />
          </radialGradient>
          <linearGradient id="arcDexLogoMiniStroke" x1="34" y1="40" x2="158" y2="152" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F43FCE" />
            <stop offset="48%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="arcDexLogoMiniMark" x1="50" y1="52" x2="139" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F5D0FE" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
        </defs>
        <rect width="192" height="192" rx="44" fill="#07030D" />
        <rect x="10" y="10" width="172" height="172" rx="38" fill="url(#arcDexLogoMiniGlow)" />
        <path d="M37 111C55 57 132 42 157 86" stroke="url(#arcDexLogoMiniStroke)" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
        <path d="M155 81L160 102L139 97" stroke="#38BDF8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
        <path d="M154 122C119 158 58 146 38 99" stroke="#F43FCE" strokeWidth="5" strokeLinecap="round" strokeDasharray="10 12" opacity="0.65" />
        <circle cx="45" cy="91" r="6" fill="#38BDF8" />
        <circle cx="147" cy="121" r="5" fill="#F43FCE" />
        <path d="M50 136L79 54H95L124 136H105L99 118H75L69 136H50ZM80 102H94L87 80L80 102Z" fill="url(#arcDexLogoMiniMark)" />
        <path d="M118 60H139C155 60 166 72 166 96C166 120 155 132 139 132H118V116H138C145 116 150 109 150 96C150 83 145 76 138 76H134V132H118V60Z" fill="url(#arcDexLogoMiniMark)" />
        <path d="M61 148H132" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.72" />
      </svg>
    </div>
  )
}
