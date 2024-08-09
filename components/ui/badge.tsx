import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate text-slate-foreground hover:bg-slate/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        borderBlue: "text-foreground border-blue-300",
        borderRed: "text-foreground border-red-300",
        borderGreen: "text-foreground border-green-300",
        borderPurple: "text-foreground border-slate-500",
        borderYellow: "text-foreground border-yellow-300",
        borderIndigo: "text-foreground border-indigo-300",
        bgGreen: "border-transparent text-foreground bg-green-400",
        bgBlue: "border-transparent text-foreground bg-blue",
        bgRed: "border-transparent text-foreground bg-red-400",
        bgPurple: "border-transparent text-foreground bg-slate-500",
        bgOrange: "border-transparent text-foreground bg-amber-500",
        bgIndigo: "border-transparent text-foreground bg-indigo-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
