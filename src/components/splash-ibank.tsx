"use client"

import { useEffect, useState } from "react"

const BIRBANK_LOGO = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyOC4zLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCA2ODUgMjQ4LjIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDY4NSAyNDguMjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuc3Qwe2ZpbGw6I0ZGMDAzOTt9DQo8L3N0eWxlPg0KPGc+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTU5LjgsMzkuNWMwLTMuNi0yLTQuMy00LjQtMi45TDcuNyw2NC4yYy0zLjIsMS44LTQuNCw0LjktNC40LDcuOXYxMzYuNmMwLDMuNiwyLDQuMyw0LjQsMi45TDU1LjQsMTg0DQoJCWMzLjItMS44LDQuNC00LjksNC40LTcuOVYzOS41eiIvPg0KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMTYuMiwxMjguOXYtNzRoMTcuOXYzOS45YzUuOS03LjMsMTUuNS0xMi4yLDI2LjktMTIuMmMyMS44LDAsMzkuMywxNy4zLDM5LjMsNDEuNnY1LjQNCgkJYzAsMjQtMTcuOCw0MS40LTQyLjQsNDEuNEMxMzQuNiwxNzAuOSwxMTYuMiwxNTUuMywxMTYuMiwxMjguOUwxMTYuMiwxMjguOXogTTE4Mi4zLDEyOS4ydi00LjRjMC0xNi05LjUtMjYuMi0yNC4xLTI2LjINCgkJYy0xNC43LDAtMjQuMSwxMC4zLTI0LjEsMjYuMnY0LjRjMCwxNS43LDkuNSwyNS43LDI0LjEsMjUuN0MxNzIuOSwxNTUsMTgyLjMsMTQ0LjUsMTgyLjMsMTI5LjJ6Ii8+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTIyMy45LDUyLjljNi41LDAsMTEuNCw0LjEsMTEuNCwxMC4zdjEuMWMwLDYuMi00LjksMTAuMy0xMS40LDEwLjNzLTExLjYtNC4xLTExLjYtMTAuM3YtMS4xDQoJCUMyMTIuMyw1NywyMTcuNCw1Mi45LDIyMy45LDUyLjl6IE0yMzIuOSwxNjlIMjE1Vjg0LjZoMTcuOVYxNjl6Ii8+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTMxMy44LDEyOC45di03NGgxNy45djM5LjljNS45LTcuMywxNS41LTEyLjIsMjYuOS0xMi4yYzIxLjgsMCwzOS4zLDE3LjMsMzkuMyw0MS42djUuNA0KCQljMCwyNC0xNy44LDQxLjQtNDIuNCw0MS40QzMzMi4yLDE3MC45LDMxMy44LDE1NS4zLDMxMy44LDEyOC45TDMxMy44LDEyOC45eiBNMzc5LjksMTI5LjJ2LTQuNGMwLTE2LTkuNS0yNi4yLTI0LjEtMjYuMg0KCQljLTE0LjcsMC0yNC4xLDEwLjMtMjQuMSwyNi4ydjQuNGMwLDE1LjcsOS41LDI1LjcsMjQuMSwyNS43QzM3MC41LDE1NSwzNzkuOSwxNDQuNSwzNzkuOSwxMjkuMnoiLz4NCgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzAzLjYsODZsLTQuMiwxNi4zYy0zLjMtMS41LTYuNS0yLjQtMTAuMS0yLjRjLTYuOSwwLTEzLjMsNC42LTE3LjMsMTAuN1YxNjloLTE3LjlWODQuNmgxNS44bDEuNiwxMi4yDQoJCWM0LjYtOC4yLDEyLjktMTQuMiwyMi45LTE0LjJDMjk4LjMsODIuNSwzMDEuNCw4My43LDMwMy42LDg2eiIvPg0KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00OTguOSw4Ni4xbC00LjIsMTYuM2MtMy4zLTEuNS02LjUtMi40LTEwLjEtMi40Yy02LjksMC0xMy4zLDQuNi0xNy4zLDEwLjdWMTY5SDQ0OS40Vjg0LjZoMTUuOGwxLjYsMTIuMg0KCQljNC42LTguMiwxMi45LTE0LjIsMjIuOS0xNC4yQzQ5My42LDgyLjUsNDk2LjcsODMuOCw0OTguOSw4Ni4xeiIvPg0KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik01MDguNCwxMjguOXYtNS40YzAtMjQuMywxOC0zOS4xLDM5LjItMzkuMWMyMi42LDAsMzguMywyMC4yLDM3LjYsNDcuN2gtNTguOWMxLjEsMTMsMTAuMiwyMi45LDI1LjEsMjIuOQ0KCQljOS41LDAsMTcuNy00LjEsMjEuMi04LjlsOC40LDExLjVjLTcuMSw2LjktMTkuMywxMy4yLTMyLjYsMTMuMkM1MjMuNywxNzAuOSw1MDguNCwxNTUuMyw1MDguNCwxMjguOXogTTU2Ny40LDExOS43DQoJCWMtMC41LTEyLjItOC40LTIyLTIwLjItMjJjLTEyLjQsMC0yMC41LDkuOC0yMSwyMkg1NjcuNHoiLz4NCgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNjAyLDEyOC45di01LjRjMC0yNC4zLDE4LTM5LjEsMzkuMi0zOS4xYzIyLjYsMCwzOC4zLDIwLjIsMzcuNiw0Ny43aC01OC45YzEuMSwxMywxMC4yLDIyLjksMjUuMSwyMi45DQoJCWM5LjUsMCwxNy43LTQuMSwyMS4yLTguOWw4LjQsMTEuNWMtNy4xLDYuOS0xOS4zLDEzLjItMzIuNiwxMy4yQzYxNy4zLDE3MC45LDYwMiwxNTUuMyw2MDIsMTI4Ljl6IE02NjEuMSwxMTkuNw0KCQljLTAuNS0xMi4yLTguNC0yMi0yMC4yLTIyYy0xMi40LDAtMjAuNSw5LjgtMjEsMjJINjYxLjF6Ii8+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTQwOC4zLDU0LjloMTguMXYxMDEuM2MwLDMxLjUtMTkuNSw0My41LTQ1LjgsNDMuNWMtMTIuOSwwLTI1LjEtNC40LTMyLjYtMTEuOWwxMC4xLTEyLjINCgkJYzUuMiw1LjIsMTIuNCw4LjgsMjEuMiw4LjhjMTUuOSwwLDI5LjEtOC44LDI5LjEtMjguMlY1NC45eiIvPg0KPC9nPg0KPC9zdmc+"

interface SplashScreenProps {
    onFinished: () => void
}

export function SplashScreen({ onFinished }: SplashScreenProps) {
    const [fadeOut, setFadeOut] = useState(false)

    useEffect(() => {
        const fadeTimer = setTimeout(() => {
            setFadeOut(true)
        }, 4500)

        const finishTimer = setTimeout(() => {
            onFinished()
        }, 5000)

        return () => {
            clearTimeout(fadeTimer)
            clearTimeout(finishTimer)
        }
    }, [onFinished])

    return (
        <div
            className={`absolute inset-0 z-50 flex items-center justify-center bg-card transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"
                }`}
        >
            <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={BIRBANK_LOGO}
                    alt="Birbank"
                    className="w-52 h-auto"
                />
            </div>
        </div>
    )
}
