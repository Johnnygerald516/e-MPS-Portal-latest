"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getToastIcon = (variant: string | undefined) => {
    switch (variant) {
      case "success":
      case "outline-green":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />
      case "error":
      case "destructive":
      case "outline-red":
      case "thin-error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "info":
      case "outline-blue":
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return null
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const icon = variant ? getToastIcon(variant) : null
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-center gap-2 p-2 pr-6">
              {icon && <div className="flex-shrink-0">{icon}</div>}
              <div className="flex-1">
                {description && (
                  <ToastDescription className="text-sm">{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className="absolute right-1 top-1 p-0.5" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
