"use client"

import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  href?: string
}

export function Logo({ size = "md", showText = true, href = "/" }: LogoProps) {
  const sizes = {
    sm: { icon: "w-7 h-7", text: "text-base" },
    md: { icon: "w-8 h-8", text: "text-lg" },
    lg: { icon: "w-10 h-10", text: "text-xl" },
  }

  const LogoContent = () => (
    <div className="flex items-center gap-2.5">
      {/* Logo Icon - Abstract Arc/Exchange Symbol */}
      <div className={`${sizes[size].icon} rounded-lg bg-primary flex items-center justify-center relative overflow-hidden`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Arc symbol - stylized A with exchange arrows */}
          <path
            d="M16 4L6 28H10L12 23H20L22 28H26L16 4ZM14 19L16 13L18 19H14Z"
            fill="currentColor"
            className="text-primary-foreground"
          />
          {/* Subtle exchange indicator */}
          <path
            d="M8 10L4 14L8 18"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-foreground/60"
          />
          <path
            d="M24 14L28 10L24 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-foreground/60"
          />
        </svg>
      </div>
      {showText && (
        <span className={`${sizes[size].text} font-bold text-foreground tracking-tight`}>
          ARC<span className="text-primary">Dex</span>
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity" prefetch={true}>
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}

// Alternative minimal logo for very small spaces
export function LogoMini() {
  return (
    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 4L6 28H10L12 23H20L22 28H26L16 4ZM14 19L16 13L18 19H14Z"
          fill="currentColor"
          className="text-primary-foreground"
        />
      </svg>
    </div>
  )
}
