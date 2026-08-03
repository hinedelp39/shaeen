import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.SVGAttributes<SVGElement> { }

export function Spinner({ className, ...props }: SpinnerProps) {
    return (
        <Loader2 className={cn("animate-spin", className)} {...props} />
    )
}
