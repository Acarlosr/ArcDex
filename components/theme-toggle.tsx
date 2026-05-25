"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

export function ThemeToggle() {
  const { t } = useI18n()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <div className="h-4 w-4" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-9 w-9 rounded-lg border border-border hover:bg-muted hover:border-primary/30 transition-all"
      title={isDark ? t("theme.toLight") : t("theme.toDark")}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-yellow-500 transition-transform hover:rotate-12" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-transform hover:-rotate-12" />
      )}
      <span className="sr-only">{t("theme.toggle")}</span>
    </Button>
  )
}
