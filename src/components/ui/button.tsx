import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95",
    {
        variants: {
            variant: {
                default: "gradient-primary text-white shadow-md hover:shadow-lg",
                destructive:
                    "gradient-danger text-white shadow-md hover:shadow-lg",
                outline:
                    "border-2 border-purple-200 bg-white hover:bg-purple-50 hover:border-purple-400 text-purple-700",
                secondary:
                    "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300 shadow-sm",
                ghost: "hover:bg-purple-100 hover:text-purple-700 transition-colors",
                link: "text-purple-600 underline-offset-4 hover:underline hover:text-purple-800",
                success: "gradient-success text-white shadow-md hover:shadow-lg",
                warning: "gradient-warning text-white shadow-md hover:shadow-lg",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
