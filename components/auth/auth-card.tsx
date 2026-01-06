import Link from "next/link"
import Image from "next/image"
import { ChevronLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AuthCardProps {
    title: string
    description?: string
    children: React.ReactNode
    footer?: React.ReactNode
    showLogo?: boolean
    breadcrumb?: string
}

export function AuthCard({ title, description, children, footer, showLogo = true, breadcrumb }: AuthCardProps) {
    return (
        <div className="min-h-[100dvh] bg-background flex flex-col justify-center">
            {/* Breadcrumb removed to save vertical space */}

            <div className="w-full max-w-[500px] mx-auto p-4">
                <div className="w-full max-w-[500px] space-y-2">
                    {showLogo && (
                        <div className="flex justify-center">
                            <Link href="/">
                                <Image
                                    src="/images/carMR-logo-cropped.png"
                                    alt="CarMR"
                                    width={130}
                                    height={26}
                                    className="h-6 w-auto"
                                    priority
                                />
                            </Link>
                        </div>
                    )}

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="space-y-1 text-center py-3">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            {description && <CardDescription>{description}</CardDescription>}
                        </CardHeader>
                        <CardContent className="px-5 pb-3">{children}</CardContent>
                        {footer && <div className="px-4 pb-4 pt-2 text-center text-xs text-muted-foreground">{footer}</div>}
                    </Card>
                </div>
            </div>
        </div>
    )
}
