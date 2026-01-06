"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, ShieldCheck } from "lucide-react"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { AuthCard } from "@/components/auth/auth-card"
import { PasswordInput } from "@/components/auth/password-input"
import { PasswordStrength, checkPasswordStrength } from "@/components/auth/password-strength"
import { useAuth } from "@/lib/auth/context"
import { useI18n } from "@/lib/i18n/context"

// Zod schema for strong password validation
const signUpSchema = z
  .object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(10, { message: "Password must be at least 10 characters long" }),
    confirmPassword: z.string(),
    marketingConsent: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      // Enforce complexity if needed, though strength meter guides user
      const { score } = checkPasswordStrength(data.password)
      return score >= 3 // Require at least a decent score
    },
    {
      message: "Please choose a stronger password",
      path: ["password"],
    },
  )

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const { t } = useI18n()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      marketingConsent: false,
    },
    mode: "onChange",
  })

  // Watch password for strength meter
  const passwordValue = form.watch("password")

  async function onSubmit(data: SignUpFormValues) {
    setServerError(null)

    startTransition(async () => {
      try {
        const result = await signUp(data.email, data.password, data.fullName || "")

        if (result.success) {
          router.push("/")
        } else {
          setServerError(result.error || "Failed to create account. Please try again.")
        }
      } catch (err) {
        setServerError("An unexpected error occurred. Please try again.")
      }
    })
  }

  return (
    <AuthCard
      title={t.signUpTitle}
      description={t.signUpDesc}
      breadcrumb={t.getStarted}
      footer={
        <div className="text-center">
          {t.alreadyHaveAccount}{" "}
          <Link href="/sign-in" className="font-semibold text-primary hover:underline">
            {t.signIn}
          </Link>
        </div>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
        {serverError && (
          <div className="mb-2 w-full rounded-md bg-destructive/15 p-1.5 text-[10px] text-destructive font-medium border border-destructive/20 text-center">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            type="button"
            className="w-full h-8 text-xs font-medium bg-background text-foreground border-input dark:bg-zinc-950 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground hover:border-input transition-colors"
            disabled={isPending}
          >
            <Icons.google className="mr-2 h-3.5 w-3.5" />
            {t.continueWithGoogle}
          </Button>
          <Button
            variant="outline"
            type="button"
            className="w-full h-8 text-xs font-medium bg-background text-foreground border-input dark:bg-zinc-950 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground hover:border-input transition-colors"
            disabled={isPending}
          >
            <Icons.apple className="mr-2 h-3.5 w-3.5" />
            {t.continueWithApple}
          </Button>
        </div>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-background px-2 text-muted-foreground">{t.orContinueWith}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pb-1">
          <div className="space-y-1">
            <Label htmlFor="fullName" className="text-xs">Username</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              className={`h-10 text-sm ${form.formState.errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}`}
              disabled={isPending}
              {...form.register("fullName")}
            />
            <div className="min-h-[14px] px-0.5">
              {form.formState.errors.fullName && (
                <p className="text-[10px] text-destructive leading-tight">{form.formState.errors.fullName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="username"
              disabled={isPending}
              className={`h-10 text-sm ${form.formState.errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
              {...form.register("email")}
            />
            <div className="min-h-[14px] px-0.5">
              {form.formState.errors.email && (
                <p className="text-[10px] text-destructive leading-tight">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="password" className="text-xs">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="••••••••••"
            disabled={isPending}
            className="h-10 text-sm"
            error={!!form.formState.errors.password}
            {...form.register("password")}
          />
          <div className="min-h-[14px] py-0.5">
            <PasswordStrength password={passwordValue} />
          </div>

          <div className="min-h-[14px] px-0.5">
            {form.formState.errors.password && !passwordValue && (
              <p className="text-[10px] text-destructive leading-tight">{form.formState.errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="confirmPassword" className="text-xs">Confirm Password</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••••"
            disabled={isPending}
            className="h-10 text-sm"
            error={!!form.formState.errors.confirmPassword}
            {...form.register("confirmPassword")}
          />
          <div className="min-h-[14px] px-0.5">
            {form.formState.errors.confirmPassword && (
              <p className="text-[10px] text-destructive leading-tight">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full h-10 text-sm mt-0.5 mb-1" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Creating account...
            </>
          ) : (
            t.createAccount
          )}
        </Button>

        <div className="space-y-0.5 pt-0.5">
          <p className="text-[9px] text-center text-muted-foreground px-0 leading-tight">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground font-medium">Terms of Service</Link>,{" "}
            <Link href="/privacy" className="underline hover:text-foreground font-medium">Privacy Policy</Link>, and{" "}
            <Link href="/refund-policy" className="underline hover:text-foreground font-medium">Refund Policy</Link>.
          </p>

          <div className="flex items-center justify-center gap-2 text-[9px] text-muted-foreground bg-muted/30 py-0.5 rounded-lg border border-border/40">
            <ShieldCheck className="h-2.5 w-2.5 text-green-600" />
            <span>{t.neverSellData}</span>
          </div>
        </div>
      </form>
    </AuthCard>
  )
}
