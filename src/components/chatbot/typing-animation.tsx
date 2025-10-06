"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface TypingAnimationProps {
  content: string;
  isComplete: boolean;
  onComplete: () => void;
  className?: string;
}

export function TypingAnimation({ 
  content, 
  isComplete, 
  onComplete,
  className 
}: TypingAnimationProps) {
  const [visibleContent, setVisibleContent] = useState<string>("")
  const [isTyping, setIsTyping] = useState<boolean>(true)
  
  // Speed settings
  const typingSpeed = 30 // ms per character
  const minTypingTime = 500 // minimum time to show typing animation
  const maxTypingTime = 2000 // maximum time regardless of content length
  
  useEffect(() => {
    if (isComplete) {
      // If marked as complete, show full content immediately
      setVisibleContent(content)
      setIsTyping(false)
      onComplete()
      return
    }
    
    // Calculate typing duration based on content length
    const contentLength = content.length
    const calculatedDuration = Math.min(
      Math.max(contentLength * typingSpeed, minTypingTime),
      maxTypingTime
    )
    
    // Start typing animation
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= contentLength) {
        setVisibleContent(content.substring(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
        setIsTyping(false)
        onComplete()
      }
    }, calculatedDuration / contentLength)
    
    return () => {
      clearInterval(typingInterval)
    }
  }, [content, isComplete, onComplete])
  
  return (
    <div className={cn("relative", className)}>
      {/* Render the visible content */}
      <div className="whitespace-pre-wrap">{visibleContent}</div>
      
      {/* Show blinking cursor while typing */}
      {isTyping && (
        <span className="inline-block h-4 w-2 bg-current animate-pulse ml-0.5" />
      )}
    </div>
  )
}
