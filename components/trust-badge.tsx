"use client"

import { FileText, Lock, Link2Off } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/context"

interface TrustBadgeProps {
  variant?: "default" | "compact"
  className?: string
}

export function TrustBadge({ variant = "default", className }: TrustBadgeProps) {
  const { t } = useI18n()

  const badges = [
    { icon: FileText, label: t.extensiveReport },
    { icon: Lock, label: t.secureCheckout },
    { icon: Link2Off, label: t.privacyProtected },
  ]

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        {badges.map((badge) => (
          <div key={badge.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <badge.icon className="h-3.5 w-3.5" />
            <span>{badge.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3 sm:gap-4", className)}>
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <badge.icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{badge.label}</span>
        </div>
      ))}
    </div>
  )
}

export function TrustNote() {
  const { t } = useI18n()

  return <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">{t.trustNote}</p>
}

export function SourcesLine() {
  return (
    <p className="text-xs text-muted-foreground/70 font-medium tracking-wide">
      Sources: NMVTIS • NHTSA • Auctions • Insurance
    </p>
  )
}
