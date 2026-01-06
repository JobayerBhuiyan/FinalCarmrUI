"use client"

import { Check, X } from "lucide-react"

interface PasswordScore {
    score: number
    requirements: {
        minLength: boolean
        hasUppercase: boolean
        hasLowercase: boolean
        hasNumber: boolean
    }
}

interface PasswordStrengthProps {
    password?: string
}

export function checkPasswordStrength(password: string): PasswordScore {
    const requirements = {
        minLength: password.length >= 10,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
    }

    let score = 0
    if (requirements.minLength) score += 1
    if (requirements.hasUppercase) score += 1
    if (requirements.hasLowercase) score += 1
    if (requirements.hasNumber) score += 1
    // Scale to 0-4

    return { score, requirements }
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
    const { score, requirements } = checkPasswordStrength(password)

    // Colors based on score (0-4)
    const colors = ["bg-border", "bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-green-500"]

    // Requirement label helper
    const Requirement = ({ met, text }: { met: boolean; text: string }) => (
        <div className="flex items-center space-x-2 text-xs">
            {met ? (
                <Check className="h-3 w-3 text-green-500" />
            ) : (
                <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            )}
            <span className={met ? "text-green-500" : "text-muted-foreground"}>{text}</span>
        </div>
    )

    return (
        <div className="space-y-1.5">
            <div className="flex gap-1 h-1 w-full overflow-hidden rounded-full bg-muted/30">
                {[0, 1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className={`h-full flex-1 transition-all duration-300 ${index < score ? colors[score] : "bg-transparent"
                            }`}
                    />
                ))}
            </div>

            <div className="space-y-0.5">
                <label className="text-[10px] font-medium text-foreground">Password requirements:</label>
                <div className="grid grid-cols-2 gap-1">
                    <Requirement met={requirements.minLength} text="10+ characters" />
                    <Requirement met={requirements.hasUppercase} text="Uppercase letter" />
                    <Requirement met={requirements.hasLowercase} text="Lowercase letter" />
                    <Requirement met={requirements.hasNumber} text="Number" />
                </div>
            </div>
        </div>
    )
}
