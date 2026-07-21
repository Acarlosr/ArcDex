"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Globe2 } from "lucide-react"
import { useI18n, type Language } from "@/lib/i18n"

const LANGUAGES: Array<{ flag: string; labelKey: "language.en" | "language.pt" | "language.es"; value: Language }> = [
  { flag: "🇺🇸", labelKey: "language.en", value: "en" },
  { flag: "🇧🇷", labelKey: "language.pt", value: "pt-BR" },
  { flag: "🇪🇸", labelKey: "language.es", value: "es" },
]

export function LanguageToggle() {
  const { language, setLanguage, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentLanguage = LANGUAGES.find((item) => item.value === language) ?? LANGUAGES[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(nextLanguage: Language) {
    setLanguage(nextLanguage)
    setIsOpen(false)
  }

  return (
    <div
      ref={containerRef}
      className="relative inline-flex"
    >
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm transition-colors hover:bg-muted"
        aria-label={t("language.switch")}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title={t("language.switch")}
      >
        <Globe2 className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="text-lg leading-none" aria-hidden="true">
          {currentLanguage.flag}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-11 z-50 grid min-w-14 gap-1 rounded-xl border border-border bg-popover p-1 shadow-xl"
          role="menu"
          aria-label={t("language.label")}
        >
          {LANGUAGES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleSelect(item.value)}
              className={`flex h-9 w-12 items-center justify-center rounded-lg text-xl transition-colors ${
                language === item.value
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
              role="menuitemradio"
              aria-checked={language === item.value}
              aria-label={t(item.labelKey)}
              title={t(item.labelKey)}
            >
              <span aria-hidden="true">{item.flag}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
