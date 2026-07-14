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
      {/* Logo Icon — simbolo Arc com gradiente roxo, magenta e azul */}
      <div className={`${sizes[size].box} rounded-lg overflow-hidden shrink-0`}>
        <svg
          viewBox="0 0 192 192"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="arcLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7B16D8" />
              <stop offset="55%" stopColor="#E72FAE" />
              <stop offset="100%" stopColor="#3195FF" />
            </linearGradient>
          </defs>
          <rect width="192" height="192" rx="36" fill="url(#arcLogoGrad)" />
          <g transform="translate(20, 20) scale(0.79)">
            <path
              d="M101.141 53H136.632C151.023 53 162.689 64.6662 162.689 79.0573V112.904H148.112V79.0573C148.112 78.7105 148.098 78.3662 148.072 78.0251L112.581 112.898C112.701 112.902 112.821 112.904 112.941 112.904H148.112V126.672H112.941C98.5504 126.672 86.5638 114.891 86.5638 100.5V66.7434H101.141V100.5C101.141 101.15 101.191 101.792 101.289 102.422L137.56 66.7816C137.255 66.7563 136.945 66.7434 136.632 66.7434H101.141V53Z"
              fill="white"
            />
            <path
              d="M65.2926 124.136L14 66.7372H34.6355L64.7495 100.436V66.7372H80.1365V118.47C80.1365 126.278 70.4953 129.958 65.2926 124.136Z"
              fill="white"
            />
          </g>
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
    <div className="w-8 h-8 rounded-lg overflow-hidden">
      <svg viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="arcLogoMiniGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7B16D8" />
            <stop offset="55%" stopColor="#E72FAE" />
            <stop offset="100%" stopColor="#3195FF" />
          </linearGradient>
        </defs>
        <rect width="192" height="192" rx="36" fill="url(#arcLogoMiniGrad)" />
        <g transform="translate(20, 20) scale(0.79)">
          <path d="M101.141 53H136.632C151.023 53 162.689 64.6662 162.689 79.0573V112.904H148.112V79.0573C148.112 78.7105 148.098 78.3662 148.072 78.0251L112.581 112.898C112.701 112.902 112.821 112.904 112.941 112.904H148.112V126.672H112.941C98.5504 126.672 86.5638 114.891 86.5638 100.5V66.7434H101.141V100.5C101.141 101.15 101.191 101.792 101.289 102.422L137.56 66.7816C137.255 66.7563 136.945 66.7434 136.632 66.7434H101.141V53Z" fill="white"/>
          <path d="M65.2926 124.136L14 66.7372H34.6355L64.7495 100.436V66.7372H80.1365V118.47C80.1365 126.278 70.4953 129.958 65.2926 124.136Z" fill="white"/>
        </g>
      </svg>
    </div>
  )
}
