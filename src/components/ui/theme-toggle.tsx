"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "../theme-provider"

export function ThemeToggle({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { theme, setTheme } = useTheme()

  return (
    <div className={className}>
      <div className="relative inline-flex items-center">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" />
          )}
        </button>
      </div>
    </div>
  )
}
