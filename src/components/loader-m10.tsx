"use client"

export function LoaderM10({ size = 24, color = "#6EDCB6" }: { size?: number; color?: string }) {
    return (
        <div className="flex items-center justify-center pointer-events-none">
            <div
                style={{
                    width: size,
                    height: size,
                    border: `2.5px solid ${color}20`,
                    borderTopColor: color,
                    borderRadius: "50%",
                }}
                className="animate-spin"
            />
        </div>
    )
}
