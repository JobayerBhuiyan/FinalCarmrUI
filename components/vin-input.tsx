"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Camera, CheckCircle, XCircle, Loader2, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/context"

import { normalizeVin, normalizePlate, normalizeState, formatVinDisplay } from "@/lib/input-safety"
import Link from "next/link"

interface VinInputProps {
  className?: string
  onModeChange?: (mode: "vin" | "plate") => void
}



export function VinInput({ className, onModeChange }: VinInputProps) {
  const router = useRouter()
  const { t } = useI18n()
  const [vin, setVin] = useState("")
  const [vinError, setVinError] = useState<string | undefined>(undefined)
  const [plate, setPlate] = useState("")
  const [plateError, setPlateError] = useState<string | undefined>(undefined)
  const [plateState, setPlateState] = useState("")
  const [stateError, setStateError] = useState<string | undefined>(undefined)

  const [isLoading, setIsLoading] = useState(false)
  const [isPlateLoading, setIsPlateLoading] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [vinHelpOpen, setVinHelpOpen] = useState(false)
  const [currentMode, setCurrentMode] = useState<"vin" | "plate">("vin")
  const inputRef = useRef<HTMLInputElement>(null)

  // Real-time validation status for UI feedback
  const vinValidation = normalizeVin(vin)
  const isVinValid = vinValidation.isValid
  const showVinValidation = vin.length > 0

  useEffect(() => {
    onModeChange?.(currentMode)
  }, [currentMode, onModeChange])

  const handleTabChange = useCallback((value: string) => {
    setCurrentMode(value as "vin" | "plate")
  }, [])

  const handleVinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Just update the raw value for typing feel, but specific cleaning checks validation
    // Use the formatter to keep the display clean
    const formatted = formatVinDisplay(raw)
    setVin(raw.toUpperCase()) // Store uppercase roughly but validate strictly

    // Only clear error on change, let submit handle validation triggers to avoid aggressive feedback
    if (vinError) setVinError(undefined)
  }, [vinError])

  const handlePlateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setPlate(raw.toUpperCase())
    const check = normalizePlate(raw)
    setPlateError(check.isValid ? undefined : check.reason)
  }, [])

  const handleStateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setPlateState(raw.toUpperCase().slice(0, 2))
    const check = normalizeState(raw)
    setStateError(check.isValid ? undefined : check.reason)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (isLoading) return // Prevent double submit

    const validation = normalizeVin(vin)
    if (!validation.isValid) {
      setVinError(validation.reason || "Invalid VIN")
      return
    }

    setIsLoading(true)
    // 2-3s UI cooldown
    await new Promise((resolve) => setTimeout(resolve, 2500))

    router.push(`/report/${validation.value}`)
  }, [vin, isLoading, router])

  const handlePlateSubmit = useCallback(async () => {
    if (isPlateLoading) return // Prevent double submit

    const pVal = normalizePlate(plate)
    const sVal = normalizeState(plateState)

    if (!pVal.isValid) {
      setPlateError(pVal.reason)
      return
    }
    if (!sVal.isValid) {
      setStateError(sVal.reason)
      return
    }

    setIsPlateLoading(true)
    // 2-3s UI cooldown
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // For demo, navigate to sample report
    router.push(`/report/1HGBH41JXMN109186`)
  }, [plate, plateState, isPlateLoading, router])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  const handlePlateKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handlePlateSubmit()
      }
    },
    [handlePlateSubmit],
  )

  return (
    <div className={cn("w-full max-w-xl", className)}>
      <Tabs defaultValue="vin" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1 h-12 rounded-2xl">
          <TabsTrigger
            value="vin"
            className="h-10 rounded-xl bg-transparent border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
          >
            {t.byVin}
          </TabsTrigger>
          <TabsTrigger
            value="plate"
            className="h-10 rounded-xl bg-transparent border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
          >
            {t.byUsPlate}
          </TabsTrigger>
        </TabsList>

        <div className="min-h-[220px]">
          <TabsContent value="vin" className="mt-0 space-y-3">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder={t.enterVin}
                value={formatVinDisplay(vin)}
                onChange={handleVinChange}
                onKeyDown={handleKeyDown}
                className={cn(
                  "h-14 pr-24 text-base font-mono tracking-wider rounded-2xl",
                  vinError && "border-destructive focus-visible:ring-destructive",
                )}
                aria-label="Vehicle Identification Number"
                aria-describedby="vin-validation vin-helper"
                aria-invalid={!!vinError}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {showVinValidation &&
                  (isVinValid ? (
                    <CheckCircle className="h-5 w-5 text-success" aria-hidden="true" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
                  ))}
              </div>
            </div>

            <div
              id="vin-helper"
              className="mt-1 flex items-center justify-between h-5 sm:h-auto text-xs sm:text-sm text-muted-foreground px-1"
            >
              <p className="truncate">17 characters (no I, O, Q)</p>
              <button
                type="button"
                onClick={() => setVinHelpOpen(true)}
                className="ml-2 whitespace-nowrap text-primary hover:underline underline-offset-2 transition-colors flex items-center gap-1"
              >
                <HelpCircle className="h-3 w-3" />
                Where to find the VIN?
              </button>
            </div>

            <div className="h-6" aria-live="polite">
              {(vinError) && (
                <p id="vin-validation" className="text-sm text-destructive flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" />
                  {vinError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 h-12 rounded-2xl" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    {t.checkVin}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setScannerOpen(true)} className="h-12 rounded-2xl bg-background text-foreground border-input dark:bg-zinc-950 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground hover:border-input transition-colors" size="lg">
                <Camera className="mr-2 h-4 w-4" />
                {t.scanBarcode}
              </Button>
            </div>

          </TabsContent>

          <TabsContent value="plate" className="mt-0 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Input
                type="text"
                placeholder={t.plateNumber}
                value={plate}
                onChange={handlePlateChange}
                onKeyDown={handlePlateKeyDown}
                className={cn(
                  "col-span-2 h-14 text-base font-mono tracking-wider rounded-2xl",
                  plateError && "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={!!plateError}
              />
              <Input
                type="text"
                placeholder={t.state}
                value={plateState}
                onChange={handleStateChange}
                onKeyDown={handlePlateKeyDown}
                className={cn(
                  "h-14 text-base font-mono tracking-wider text-center rounded-2xl",
                  stateError && "border-destructive focus-visible:ring-destructive"
                )}
                maxLength={2}
                aria-invalid={!!stateError}
              />
            </div>

            <div className="mt-1 flex items-center justify-between h-5 sm:h-auto text-xs sm:text-sm text-muted-foreground px-1">
              <p className="truncate">
                <span className="sm:hidden">2–8 chars + state</span>
                <span className="hidden sm:inline">2–8 characters + 2-letter state code</span>
              </p>
              <button
                type="button"
                onClick={() => setVinHelpOpen(true)}
                className="ml-2 whitespace-nowrap text-primary hover:underline underline-offset-2 transition-colors flex items-center gap-1"
              >
                <HelpCircle className="h-3 w-3" />
                Where to find the plate?
              </button>
            </div>

            <div className="h-6" aria-live="polite">
              {(plateError || stateError) && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" />
                  {plateError || stateError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 h-12 rounded-2xl"
                size="lg"
                onClick={handlePlateSubmit}
                disabled={isPlateLoading}
              >
                {isPlateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    {t.lookUpPlate}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setScannerOpen(true)} className="h-12 rounded-2xl bg-background text-foreground border-input dark:bg-zinc-950 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground hover:border-input transition-colors" size="lg">
                <Camera className="mr-2 h-4 w-4" />
                {t.scanBarcode}
              </Button>
            </div>


          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>{currentMode === "vin" ? t.scanVinBarcode : t.scanLicensePlate}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">{t.cameraPreview}</p>
                </div>
              </div>
              <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-primary animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {currentMode === "vin" ? t.scanningInstructions : t.scanPlateInstructions}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>{t.scanning}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={vinHelpOpen} onOpenChange={setVinHelpOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {currentMode === "vin" ? "Where to Find Your VIN" : "Where to Find Your License Plate"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {currentMode === "vin"
                ? "The Vehicle Identification Number (VIN) is a unique 17-character code assigned to every vehicle."
                : "Your license plate number is the alphanumeric code displayed on your vehicle's plates, issued by your state DMV."}
            </p>
            <div className="space-y-3">
              {currentMode === "vin" ? (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-sm">Driver's Side Dashboard</p>
                      <p className="text-xs text-muted-foreground">
                        Look through the windshield at the lower left corner of the dashboard.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-sm">Driver's Side Door Jamb</p>
                      <p className="text-xs text-muted-foreground">
                        Open the driver's door and look at the sticker on the door jamb.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-sm">Vehicle Documents</p>
                      <p className="text-xs text-muted-foreground">
                        Check your registration, title, or insurance card.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-sm">Front or Rear of Vehicle</p>
                      <p className="text-xs text-muted-foreground">
                        Check the front bumper area or rear of your vehicle where the plate is mounted.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-sm">Vehicle Registration Card</p>
                      <p className="text-xs text-muted-foreground">
                        Your plate number is printed on your state registration document.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-sm">Insurance Documents</p>
                      <p className="text-xs text-muted-foreground">
                        Your insurance card or policy documents also list your plate number.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {currentMode === "vin" ? (
                  <>
                    <strong>Note:</strong> VINs never contain the letters I, O, or Q to avoid confusion with 1 and 0.
                  </>
                ) : (
                  <>
                    <strong>Note:</strong> Enter your plate exactly as shown (letters and numbers). Select your 2-letter
                    state code from the dropdown.
                  </>
                )}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
