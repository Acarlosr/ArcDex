"use client"

import { Globe2 } from "lucide-react"
import { useI18n, type Language } from "@/lib/i18n"

const LANGUAGES: Array<{ label: string; value: Language }> = [
  { label: "EN", value: "en" },
  { label: "PT-BR", value: "pt-BR" },
]

export function LanguageToggle() {
  const { language, setLanguage, t } = useI18n()

  return (
    <div
      className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background p-1"
      aria-label={t("language.label")}
      title={t("language.switch")}
    >
      <Globe2 className="ml-1 h-4 w-4 text-primary" aria-hidden="true" />
      {LANGUAGES.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => setLanguage(item.value)}
          className={`h-7 rounded-md px-2 text-xs font-semibold transition-colors ${
            language === item.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          aria-pressed={language === item.value}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
