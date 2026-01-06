"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { VinInput } from "@/components/vin-input"
import { TrustBadge, SourcesLine } from "@/components/trust-badge"
import { useI18n } from "@/lib/i18n/context"

export function HeroSection() {
  const { t } = useI18n()
  const [mode, setMode] = useState<"vin" | "plate">("vin")

  const handleModeChange = useCallback((newMode: "vin" | "plate") => {
    setMode(newMode)
  }, [])

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-4 pb-6 sm:px-6 sm:pt-8 sm:pb-10 lg:px-8 lg:pt-10 lg:pb-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">{t.proVehicleHistory}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight leading-[1.1] sm:text-4xl lg:text-5xl mx-auto [text-wrap:balance] min-h-[2.5em] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={mode}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="block"
                >
                  {mode === "vin" ? t.knowBeforeYouBuy : t.knowBeforeYouBuyPlate}
                </motion.span>
              </AnimatePresence>
            </h1>
            <p className="mt-2 text-lg text-foreground/80 text-balance sm:text-xl font-medium">{t.heroSubtitle}</p>
          </div>

          <div className="mt-2 sm:mt-6 lg:mt-6 flex justify-center">
            <VinInput onModeChange={handleModeChange} />
          </div>

          <div className="mt-3 space-y-2">
            <TrustBadge />
            <SourcesLine />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/3 blur-3xl" />
      </div>
    </section>
  )
}
