"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"
import { authEndpoints } from "@/lib/api/endpoints/auth"

// Configuration for session management
const SESSION_CONFIG = {
  // Inactivity timeout in milliseconds (15 minutes)
  INACTIVITY_TIMEOUT: 15 * 60 * 1000,
  // Warning before timeout in milliseconds (1 minute before timeout)
  WARNING_BEFORE_TIMEOUT: 60 * 1000,
  // Token refresh interval in milliseconds (every 30 minutes)
  TOKEN_REFRESH_INTERVAL: 30 * 60 * 1000,
  // Events that reset the inactivity timer
  ACTIVITY_EVENTS: ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"],
}

interface SessionContextType {
  isInactivityWarningVisible: boolean
  remainingTime: number
  dismissWarning: () => void
  resetInactivityTimer: () => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const { logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const [isInactivityWarningVisible, setIsInactivityWarningVisible] = useState<boolean>(false)
  const [remainingTime, setRemainingTime] = useState<number>(SESSION_CONFIG.INACTIVITY_TIMEOUT)
  const [warningTimeout, setWarningTimeout] = useState<NodeJS.Timeout | null>(null)
  const [logoutTimeout, setLogoutTimeout] = useState<NodeJS.Timeout | null>(null)
  const [tokenRefreshInterval, setTokenRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [isWarningDismissed, setIsWarningDismissed] = useState<boolean>(false)

  // Function to reset the inactivity timer
  const resetInactivityTimer = () => {
    setLastActivity(Date.now())
    setIsInactivityWarningVisible(false)
    setIsWarningDismissed(false)
    
    // Clear existing timeouts
    if (warningTimeout) clearTimeout(warningTimeout)
    if (logoutTimeout) clearTimeout(logoutTimeout)
    
    // Set new timeouts
    const newWarningTimeout = setTimeout(() => {
      if (!isWarningDismissed) {
        setIsInactivityWarningVisible(true)
      }
    }, SESSION_CONFIG.INACTIVITY_TIMEOUT - SESSION_CONFIG.WARNING_BEFORE_TIMEOUT)
    
    const newLogoutTimeout = setTimeout(() => {
      handleInactivityLogout()
    }, SESSION_CONFIG.INACTIVITY_TIMEOUT)
    
    setWarningTimeout(newWarningTimeout)
    setLogoutTimeout(newLogoutTimeout)
  }

  // Function to dismiss the warning
  const dismissWarning = () => {
    setIsInactivityWarningVisible(false)
    setIsWarningDismissed(true)
    
    // Clear existing timeouts to prevent conflicts
    if (warningTimeout) clearTimeout(warningTimeout)
    if (logoutTimeout) clearTimeout(logoutTimeout)
    
    // Reset the timer with fresh activity
    resetInactivityTimer()
  }

  // Function to handle inactivity logout
  const handleInactivityLogout = () => {
    if (isAuthenticated) {
      logout()
      router.push("/")
    }
  }

  // Function to refresh token
  const refreshToken = async () => {
    try {
      // Use the authEndpoints.refreshToken function to refresh the token
      const refreshToken = localStorage.getItem("refresh_token")
      if (!refreshToken) {
        console.log("No refresh token available, skipping refresh")
        return
      }
      
      // Call the auth endpoint to refresh the token
      await authEndpoints.refreshToken()
      console.log("Token refreshed successfully")
      
      // Reset activity timer after successful token refresh
      resetInactivityTimer()
      
    } catch (error: any) {
      console.error("Token refresh failed:", error)
      // Only logout if it's a critical auth error, not network issues
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        logout()
        router.push("/")
      }
    }
  }

  // Set up event listeners for user activity
  useEffect(() => {
    if (!isAuthenticated) return
    
    // Function to handle user activity
    const handleUserActivity = () => {
      resetInactivityTimer()
    }
    
    // Add event listeners for user activity
    SESSION_CONFIG.ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleUserActivity)
    })
    
    // Set up initial timers
    resetInactivityTimer()
    
    // Set up token refresh interval
    const refreshIntervalId = setInterval(refreshToken, SESSION_CONFIG.TOKEN_REFRESH_INTERVAL)
    setTokenRefreshInterval(refreshIntervalId)
    
    // Clean up event listeners and intervals on unmount
    return () => {
      SESSION_CONFIG.ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleUserActivity)
      })
      
      if (warningTimeout) clearTimeout(warningTimeout)
      if (logoutTimeout) clearTimeout(logoutTimeout)
      if (tokenRefreshInterval) clearInterval(tokenRefreshInterval)
    }
  }, [isAuthenticated])
  
  // Update remaining time when warning is visible
  useEffect(() => {
    if (!isInactivityWarningVisible || isWarningDismissed) return
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity
      const remaining = Math.max(0, SESSION_CONFIG.INACTIVITY_TIMEOUT - elapsed)
      setRemainingTime(remaining)
      
      if (remaining <= 0) {
        clearInterval(interval)
        handleInactivityLogout()
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isInactivityWarningVisible, lastActivity, isWarningDismissed])

  const value = {
    isInactivityWarningVisible,
    remainingTime,
    dismissWarning,
    resetInactivityTimer
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}
