"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useSession } from "@/contexts/session-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

export function InactivityWarningDialog() {
  const { isInactivityWarningVisible, remainingTime, dismissWarning } = useSession()
  const [formattedTime, setFormattedTime] = useState<string>("1:00")
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  
  // Format the remaining time as MM:SS
  useEffect(() => {
    if (!isInactivityWarningVisible) return
    
    const minutes = Math.floor(remainingTime / 60000)
    const seconds = Math.floor((remainingTime % 60000) / 1000)
    setFormattedTime(`${minutes}:${seconds.toString().padStart(2, "0")}`)
  }, [remainingTime, isInactivityWarningVisible])
  
  const handleDismissWarning = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    try {
      dismissWarning()
    } finally {
      // Small delay to prevent rapid re-triggering
      setTimeout(() => setIsProcessing(false), 1000)
    }
  }

  return (
    <Dialog
      open={isInactivityWarningVisible && !isProcessing}
      onOpenChange={(open) => {
        if (!open && !isProcessing) {
          handleDismissWarning()
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Session Timeout Warning
          </DialogTitle>
          <DialogDescription>
            Your session is about to expire due to inactivity.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-center text-muted-foreground">
            You will be logged out in:
          </p>
          <div className="text-center text-2xl font-bold my-4 text-amber-600">
            {formattedTime}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Click &quot;Continue Session&quot; to stay logged in.
          </p>
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleDismissWarning}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            {isProcessing ? "Processing..." : "Continue Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
