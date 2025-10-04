"use client"
import { FloatingChat } from "@/components/chatbot/floating-chat"
// LoadingOverlay removed to prevent page overlay
import { Toaster } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SharedLayout } from "@/components/layout/shared-layout"
import ApplicationWrapper from "@/components/layout/ApplicationWrapper"
import { ApplicationProvider } from "@/contexts/application-context"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])
  
  return (
    <SharedLayout>
      <ApplicationProvider>
        <ApplicationWrapper>
          {children}
        </ApplicationWrapper>
      </ApplicationProvider>
      <FloatingChat />
      {/* LoadingOverlay removed to use button spinners instead */}
      <Toaster position="top-right" richColors closeButton />
    </SharedLayout>
  )
}
