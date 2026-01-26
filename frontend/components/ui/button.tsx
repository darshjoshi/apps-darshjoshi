import * as React from "react"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 pointer-events-auto cursor-pointer font-mono tracking-wider",
                    {
                        "bg-white text-black hover:bg-white/90 glow-on-hover border border-white":
                            variant === "default",
                        "border border-white/20 bg-black text-white hover:bg-white/10 hover:border-white/40":
                            variant === "outline",
                        "hover:bg-white/10 hover:text-white text-white/60":
                            variant === "ghost",
                        "text-white underline-offset-4 hover:underline":
                            variant === "link",
                        "h-10 px-6 py-2": size === "default",
                        "h-9 px-4": size === "sm",
                        "h-12 px-8": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
