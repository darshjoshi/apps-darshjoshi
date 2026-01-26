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
                    "inline-flex items-center justify-center whitespace-nowrap text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 pointer-events-auto cursor-pointer font-mono tracking-wider font-bold",
                    {
                        "bg-black text-white hover:bg-gray-800 border-2 border-black glow-on-hover":
                            variant === "default",
                        "border-2 border-black bg-white text-black hover:bg-gray-50":
                            variant === "outline",
                        "hover:bg-gray-100 text-black":
                            variant === "ghost",
                        "text-black underline-offset-4 hover:underline":
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
